# Vercel 배포 전략

> **목표**: Turborepo 모노레포에서 Blog (Next.js)와 Admin (Vite SPA) 모두 Vercel에 배포

## 1. 배포 아키텍처

```
devlog-renewal (Monorepo)
├── apps/
│   ├── blog/     → Vercel Project: devlog-blog (Production)
│   └── admin/    → Vercel Project: devlog-admin (Production)
└── packages/     → 공유 패키지 (배포 제외)
```

### 도메인 구조

| 앱 | Vercel 프로젝트 | 도메인 | 용도 |
|---|---|---|---|
| blog | devlog-blog | `devlog.dev` | 블로그 (프론트)
| admin | devlog-admin | `admin.devlog.dev` | 어드민 패널 (백오피스)

## 2. Vercel 설정 파일

### 루트 설정 (전역)

```json
// vercel.json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "version": 2,
  "buildCommand": "pnpm turbo build --filter={apps/*}...",
  "installCommand": "pnpm install"
}
```

### Blog 앱 설정

```json
// apps/blog/vercel.json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "version": 2,
  "framework": "nextjs",
  "buildCommand": "cd ../.. && pnpm turbo build --filter=blog...",
  "outputDirectory": ".next",
  "installCommand": "cd ../.. && pnpm install",
  "ignoreCommand": "git diff --quiet HEAD^ HEAD apps/blog/ packages/",
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase-url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase-anon-key"
  },
  "build": {
    "env": {
      "NODE_ENV": "production"
    }
  },
  "functions": {
    "app/api/**": {
      "memory": 1024,
      "maxDuration": 10
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    }
  ]
}
```

### Admin 앱 설정

```json
// apps/admin/vercel.json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "version": 2,
  "framework": null,
  "buildCommand": "cd ../.. && pnpm turbo build --filter=admin...",
  "outputDirectory": "dist",
  "installCommand": "cd ../.. && pnpm install",
  "ignoreCommand": "git diff --quiet HEAD^ HEAD apps/admin/ packages/",
  "env": {
    "VITE_SUPABASE_URL": "@supabase-url",
    "VITE_SUPABASE_ANON_KEY": "@supabase-anon-key"
  },
  "build": {
    "env": {
      "NODE_ENV": "production"
    }
  },
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    },
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

## 3. Vercel 프로젝트 생성

### Blog 프로젝트 생성

```bash
# Vercel CLI 설치
pnpm add -g vercel

# Blog 프로젝트 배포
cd apps/blog
vercel

# 프로젝트 설정
# - Project Name: devlog-blog
# - Framework Preset: Next.js
# - Root Directory: ./
# - Build Command: cd ../.. && pnpm turbo build --filter=blog...
# - Output Directory: .next
# - Install Command: cd ../.. && pnpm install
```

### Admin 프로젝트 생성

```bash
# Admin 프로젝트 배포
cd apps/admin
vercel

# 프로젝트 설정
# - Project Name: devlog-admin
# - Framework Preset: Other (Vite)
# - Root Directory: ./
# - Build Command: cd ../.. && pnpm turbo build --filter=admin...
# - Output Directory: dist
# - Install Command: cd ../.. && pnpm install
```

## 4. 환경 변수 설정

### Vercel 대시보드에서 설정

#### Blog 프로젝트 환경 변수

```env
# Production
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...

# Preview (선택)
NEXT_PUBLIC_SUPABASE_URL=https://xxx-staging.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
```

#### Admin 프로젝트 환경 변수

```env
# Production
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxx...

# Preview (선택)
VITE_SUPABASE_URL=https://xxx-staging.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxx...
```

### CLI로 환경 변수 설정

```bash
# Blog 환경 변수
cd apps/blog
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production

# Admin 환경 변수
cd apps/admin
vercel env add VITE_SUPABASE_URL production
vercel env add VITE_SUPABASE_ANON_KEY production
```

## 5. 도메인 설정

### Blog 도메인

```bash
# 커스텀 도메인 추가
vercel domains add devlog.dev --project=devlog-blog

# DNS 설정 (도메인 등록업체에서)
# A 레코드: @ → 76.76.21.21
# CNAME: www → cname.vercel-dns.com
```

### Admin 도메인

```bash
# 서브도메인 추가
vercel domains add admin.devlog.dev --project=devlog-admin

# DNS 설정
# CNAME: admin → cname.vercel-dns.com
```

## 6. Git 연동 및 자동 배포

### GitHub 연동

1. Vercel 대시보드 → Settings → Git
2. GitHub 리포지토리 연동
3. **중요**: Root Directory 설정 제거 (모노레포이므로)
4. Ignored Build Step 설정:
   ```bash
   # Blog
   git diff --quiet HEAD^ HEAD apps/blog/ packages/

   # Admin
   git diff --quiet HEAD^ HEAD apps/admin/ packages/
   ```

### 브랜치 배포 전략

| 브랜치 | 환경 | 자동 배포 |
|---|---|---|
| `main` | Production | ✅ 자동 |
| `dev` | Preview | ✅ 자동 |
| `feature/*` | Preview | ✅ 자동 |

## 7. 빌드 최적화

### Turbo 캐시 활성화

```json
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "remoteCache": {
    "signature": true
  }
}
```

```bash
# Vercel Remote Cache 연결
vercel link
```

### pnpm 캐시 최적화

```json
// .npmrc
store-dir=~/.pnpm-store
shamefully-hoist=true
strict-peer-dependencies=false
```

## 8. 모니터링 및 분석

### Vercel Analytics 활성화

```bash
# Blog에 Vercel Analytics 추가
cd apps/blog
pnpm add @vercel/analytics

# Admin에 Vercel Analytics 추가
cd apps/admin
pnpm add @vercel/analytics
```

```tsx
// apps/blog/src/app/layout.tsx
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

```tsx
// apps/admin/src/App.tsx
import { Analytics } from '@vercel/analytics/react'

export default function App() {
  return (
    <>
      {/* 앱 컴포넌트 */}
      <Analytics />
    </>
  )
}
```

### Vercel Speed Insights

```bash
# Speed Insights 추가
pnpm add @vercel/speed-insights
```

```tsx
// Blog
import { SpeedInsights } from '@vercel/speed-insights/next'

// Admin (React)
import { SpeedInsights } from '@vercel/speed-insights/react'
```

## 9. 배포 체크리스트

### 배포 전
- [ ] Next.js 16 마이그레이션 완료
- [ ] 전체 빌드 성공 (`pnpm build`)
- [ ] 타입 체크 통과 (`pnpm typecheck`)
- [ ] 로컬 환경 테스트 완료
- [ ] Supabase 프로덕션 환경 준비

### Vercel 설정
- [ ] Blog 프로젝트 생성 및 설정
- [ ] Admin 프로젝트 생성 및 설정
- [ ] 환경 변수 설정 (Production + Preview)
- [ ] 도메인 연결 및 DNS 설정
- [ ] GitHub 연동 및 Ignored Build Step 설정

### 배포 후
- [ ] Production 배포 성공 확인
- [ ] 도메인 접속 확인
- [ ] SSL 인증서 활성화 확인
- [ ] Supabase 연동 테스트
- [ ] Analytics 작동 확인
- [ ] Speed Insights 작동 확인

## 10. 배포 명령어 요약

```bash
# 로컬 빌드 테스트
pnpm build

# Blog 프로덕션 배포
cd apps/blog
vercel --prod

# Admin 프로덕션 배포
cd apps/admin
vercel --prod

# Preview 배포 (자동)
git push origin dev

# Production 배포 (자동)
git push origin main

# 배포 로그 확인
vercel logs [deployment-url]

# 도메인 상태 확인
vercel domains ls
```

## 11. 예상 문제 및 해결

### 문제 1: 모노레포 빌드 실패

**증상**: 의존성 찾을 수 없음

**해결**:
```json
// vercel.json
{
  "installCommand": "cd ../.. && pnpm install",
  "buildCommand": "cd ../.. && pnpm turbo build --filter=blog..."
}
```

### 문제 2: 환경 변수 접근 불가

**증상**: Supabase 클라이언트 생성 실패

**해결**: Vercel 대시보드에서 환경 변수 재설정
```bash
vercel env pull .env.local
```

### 문제 3: Vite 빌드 후 라우팅 404

**증상**: SPA 새로고침 시 404

**해결**: `vercel.json`에 rewrite 규칙 추가
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### 문제 4: 빌드 캐시 문제

**증상**: 최신 코드가 반영되지 않음

**해결**:
```bash
# Vercel 빌드 캐시 삭제
vercel --force

# 또는 대시보드에서 "Redeploy" → "Clear cache and redeploy"
```

## 12. 비용 최적화

### Vercel Pro 플랜 고려사항

| 항목 | Hobby (Free) | Pro ($20/mo) |
|---|---|---|
| 대역폭 | 100GB | 1TB |
| 빌드 시간 | 6,000분 | 24,000분 |
| 서버리스 함수 실행 | 100GB-시간 | 1,000GB-시간 |
| 동시 빌드 | 1 | 12 |

**권장**: 초기에는 Hobby 플랜 사용, 트래픽 증가 시 Pro 전환

## 13. 참고 자료

- [Vercel Monorepo Guide](https://vercel.com/docs/monorepos)
- [Turborepo with Vercel](https://turbo.build/repo/docs/handbook/deploying-with-vercel)
- [Next.js on Vercel](https://vercel.com/docs/frameworks/nextjs)
- [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables)
