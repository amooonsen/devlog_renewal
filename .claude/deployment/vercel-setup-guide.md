# Vercel 배포 실행 가이드

> **목표**: GitHub 연동을 통한 Blog와 Admin 앱 자동 배포 설정

## ⚠️ 중요: 모노레포 배포 방식 이해하기

### Vercel 프로젝트 구조

**핵심 개념**: 하나의 GitHub 리포지토리에서 **2개의 별도 Vercel 프로젝트**를 만듭니다.

```
📦 GitHub 리포지토리: devlog_renewal (1개)
    ├── apps/
    │   ├── blog/    ──┐
    │   └── admin/   ──┤
    └── packages/      │
                       │
    ┌──────────────────┘
    │
    ▼
🚀 Vercel 프로젝트 (2개)

    프로젝트 1: devlog-blog
    ├── GitHub Repo: devlog_renewal
    ├── Root Directory: apps/blog  ← 핵심!
    ├── URL: devlog-blog.vercel.app
    └── Domain: devlog.dev

    프로젝트 2: devlog-admin
    ├── GitHub Repo: devlog_renewal  ← 동일한 리포지토리
    ├── Root Directory: apps/admin   ← 다른 경로!
    ├── URL: devlog-admin.vercel.app
    └── Domain: admin.devlog.dev
```

### Q&A

**Q: 프로젝트를 2개 만들어야 하나요?**
A: 네, **FO(Blog)와 BO(Admin)를 각각 배포하려면 2개의 Vercel 프로젝트**가 필요합니다.

**Q: GitHub 리포지토리를 2번 Import 하나요?**
A: 네, **동일한 리포지토리를 2번 Import**하되, **Root Directory를 다르게** 설정합니다.
   - 첫 번째 Import: `apps/blog` (Blog 프로젝트)
   - 두 번째 Import: `apps/admin` (Admin 프로젝트)

**Q: 왜 하나의 프로젝트로 안 되나요?**
A: Vercel은 한 프로젝트 = 하나의 앱 = 하나의 도메인 구조입니다. Blog와 Admin을 별도 도메인으로 배포하려면 2개 프로젝트가 필요합니다.

**Q: 배포 URL은 어떻게 되나요?**
A:
   - Blog: `devlog-blog.vercel.app` → 커스텀 도메인: `devlog.dev`
   - Admin: `devlog-admin.vercel.app` → 커스텀 도메인: `admin.devlog.dev`

**Q: 빌드는 어떻게 되나요?**
A: 각 프로젝트는 독립적으로 빌드됩니다.
   - Blog 변경 → devlog-blog 프로젝트만 재빌드
   - Admin 변경 → devlog-admin 프로젝트만 재빌드
   - packages 변경 → 둘 다 재빌드 (Ignored Build Step으로 제어)

---

## 사전 준비

### 1. Vercel 계정 준비
- ✅ [Vercel 계정](https://vercel.com/signup) 생성 (GitHub 계정 연동 권장)
- ✅ GitHub 리포지토리 푸시 완료

### 2. Supabase 환경 변수 준비

#### Production 환경 변수
```env
# Supabase 대시보드 > Settings > API에서 확인
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...

# Admin도 동일
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

## Step 1: GitHub 리포지토리 푸시

```bash
# 변경사항 커밋
git add .
git commit -m "feat: Next.js 16 마이그레이션 및 Vercel 배포 설정"

# dev 브랜치에 푸시
git push origin dev

# (선택) main 브랜치로 병합 후 푸시
git checkout main
git merge dev
git push origin main
```

## Step 2: Vercel 프로젝트 1 - Blog 앱 배포

> **목표**: `apps/blog`를 `devlog-blog` 프로젝트로 배포

### 2.1 프로젝트 Import (1번째)

1. [Vercel 대시보드](https://vercel.com/dashboard) 접속
2. **"Add New..."** → **"Project"** 클릭
3. GitHub 리포지토리 목록에서 `devlog_renewal` 찾기
4. **"Import"** 버튼 클릭

### 2.2 프로젝트 설정 (Blog)

**📌 중요**: Root Directory를 `apps/blog`로 설정!

```yaml
Project Name: devlog-blog
Framework Preset: Next.js
Root Directory: apps/blog
Build Command: cd ../.. && pnpm turbo build --filter=blog...
Output Directory: .next
Install Command: cd ../.. && pnpm install
```

#### 환경 변수 설정

**Environment Variables** 섹션에서 추가:

| Name | Value | Environment |
|------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxx.supabase.co` | Production, Preview |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGc...` | Production, Preview |

#### 고급 설정

**Build & Development Settings** 클릭:

- ✅ **Ignored Build Step**: 입력
  ```bash
  git diff --quiet HEAD^ HEAD apps/blog/ packages/
  ```
  → Blog나 공유 패키지 변경 시에만 빌드

**Deploy** 버튼 클릭!

## Step 3: Vercel 프로젝트 2 - Admin 앱 배포

> **목표**: `apps/admin`을 `devlog-admin` 프로젝트로 배포

### 3.1 새 프로젝트 추가 (2번째)

**📌 핵심**: 같은 GitHub 리포지토리를 **다시 한 번** Import 합니다!

1. Vercel 대시보드 홈으로 돌아가기
2. **"Add New..."** → **"Project"** 클릭
3. **동일한 GitHub 리포지토리** 선택: `devlog_renewal`
   - ⚠️ 이미 Import 했지만 다시 선택하는 것이 맞습니다!
4. **"Import"** 버튼 클릭

### 3.2 프로젝트 설정 (Admin)

**📌 중요**: Root Directory를 `apps/admin`으로 설정! (Blog와 다름)

```yaml
Project Name: devlog-admin
Framework Preset: Other (Vite)
Root Directory: apps/admin
Build Command: cd ../.. && pnpm turbo build --filter=admin...
Output Directory: dist
Install Command: cd ../.. && pnpm install
```

#### 환경 변수 설정

**Environment Variables** 섹션에서 추가:

| Name | Value | Environment |
|------|-------|-------------|
| `VITE_SUPABASE_URL` | `https://xxx.supabase.co` | Production, Preview |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGc...` | Production, Preview |

#### 고급 설정

**Build & Development Settings** 클릭:

- ✅ **Ignored Build Step**: 입력
  ```bash
  git diff --quiet HEAD^ HEAD apps/admin/ packages/
  ```

**Deploy** 버튼 클릭!

## Step 4: 도메인 설정

### 4.1 Blog 도메인 설정

1. **devlog-blog** 프로젝트 → **Settings** → **Domains**
2. **Add Domain** 클릭
3. 도메인 입력: `devlog.dev` (또는 원하는 도메인)
4. DNS 설정:
   ```
   Type: A
   Name: @
   Value: 76.76.21.21

   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

### 4.2 Admin 도메인 설정

1. **devlog-admin** 프로젝트 → **Settings** → **Domains**
2. **Add Domain** 클릭
3. 서브도메인 입력: `admin.devlog.dev`
4. DNS 설정:
   ```
   Type: CNAME
   Name: admin
   Value: cname.vercel-dns.com
   ```

## Step 5: GitHub 자동 배포 설정

### 5.1 Production 배포 (main 브랜치)

기본 설정으로 `main` 브랜치 푸시 시 자동 배포됩니다.

```bash
git checkout main
git merge dev
git push origin main
# → 자동으로 Production 배포 트리거
```

### 5.2 Preview 배포 (dev 브랜치)

`dev` 브랜치나 Pull Request 생성 시 Preview 배포가 자동으로 생성됩니다.

```bash
git checkout dev
git push origin dev
# → Preview URL 생성 (예: devlog-blog-git-dev-username.vercel.app)
```

## Step 6: 배포 확인

### 6.1 배포 로그 확인

1. Vercel 대시보드 → **Deployments** 탭
2. 최신 배포 클릭 → **Building** 로그 확인
3. 빌드 성공 시 **Visit** 버튼으로 사이트 확인

### 6.2 배포 URL

- **Blog (Production)**: `https://devlog.dev` 또는 `https://devlog-blog.vercel.app`
- **Admin (Production)**: `https://admin.devlog.dev` 또는 `https://devlog-admin.vercel.app`
- **Preview**: `https://devlog-blog-git-dev-username.vercel.app`

### 6.3 배포 상태 확인

```bash
# Vercel CLI로 배포 상태 확인
pnpm add -g vercel
vercel login

# Blog 배포 상태
cd apps/blog
vercel ls

# Admin 배포 상태
cd apps/admin
vercel ls
```

## Step 7: 모니터링 및 분석 설정 (선택)

### 7.1 Vercel Analytics 활성화

1. **devlog-blog** 프로젝트 → **Analytics** 탭
2. **Enable Analytics** 클릭
3. **devlog-admin** 프로젝트도 동일하게 설정

### 7.2 Speed Insights 활성화

1. **Settings** → **Speed Insights**
2. **Enable Speed Insights** 클릭

## Step 8: CI/CD 워크플로우 설정 완료

### 자동 배포 플로우

```
1. 로컬에서 코드 변경
   ↓
2. git commit & push
   ↓
3. GitHub 리포지토리 업데이트
   ↓
4. Vercel이 변경사항 감지
   ↓
5. Ignored Build Step 검사
   - Blog/Admin/packages 변경 → 빌드 진행
   - 다른 파일 변경 → 빌드 스킵
   ↓
6. 자동 빌드 및 배포
   ↓
7. 배포 완료 알림 (이메일, Slack 등)
```

## 문제 해결

### 문제 1: 빌드 실패 (의존성 에러)

**증상**: `Cannot find module '@repo/ui'`

**해결**:
```bash
# Vercel 프로젝트 Settings → General → Build & Development Settings
Install Command: cd ../.. && pnpm install --frozen-lockfile
```

### 문제 2: 환경 변수 접근 불가

**증상**: Supabase 클라이언트 생성 실패

**해결**:
1. Vercel 대시보드 → **Settings** → **Environment Variables**
2. 환경 변수 재확인 및 재배포
3. 또는 CLI로 확인:
   ```bash
   vercel env pull .env.local
   ```

### 문제 3: 모노레포 빌드 경로 문제

**증상**: `Cannot find package.json`

**해결**:
```bash
# Build Command 수정
cd ../.. && pnpm turbo build --filter=blog...
```

### 문제 4: Vite SPA 라우팅 404

**증상**: Admin 앱 새로고침 시 404

**해결**: `apps/admin/vercel.json`에 이미 설정되어 있음
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

## 배포 체크리스트

### 배포 전
- [ ] Next.js 16 마이그레이션 완료
- [ ] 로컬 빌드 성공 (`pnpm build`)
- [ ] 환경 변수 준비 (Supabase URL, Anon Key)
- [ ] Git 커밋 및 푸시 완료

### Vercel 설정
- [ ] Blog 프로젝트 생성
- [ ] Blog 환경 변수 설정
- [ ] Blog Ignored Build Step 설정
- [ ] Admin 프로젝트 생성
- [ ] Admin 환경 변수 설정
- [ ] Admin Ignored Build Step 설정

### 도메인 설정 (선택)
- [ ] 도메인 DNS 설정
- [ ] Blog 도메인 연결
- [ ] Admin 서브도메인 연결
- [ ] SSL 인증서 활성화 확인

### 배포 후
- [ ] Production 배포 성공 확인
- [ ] Blog 사이트 접속 테스트
- [ ] Admin 사이트 접속 테스트
- [ ] Supabase 연동 테스트
- [ ] Analytics 작동 확인

## 유용한 명령어

```bash
# Vercel CLI 설치 및 로그인
pnpm add -g vercel
vercel login

# 프로젝트 연결
vercel link

# 환경 변수 가져오기
vercel env pull .env.local

# 로컬에서 배포 테스트 (프로덕션 빌드)
vercel build

# 수동 배포
vercel --prod

# 배포 로그 확인
vercel logs [deployment-url]

# 도메인 목록 확인
vercel domains ls

# 프로젝트 목록 확인
vercel ls
```

## 참고 자료

- [Vercel 모노레포 가이드](https://vercel.com/docs/monorepos)
- [Turborepo with Vercel](https://turbo.build/repo/docs/handbook/deploying-with-vercel)
- [Vercel CLI 문서](https://vercel.com/docs/cli)
- [Vercel 환경 변수](https://vercel.com/docs/projects/environment-variables)

## 프로젝트 설정 비교표

배포 시 참고하세요:

| 항목 | Blog 프로젝트 | Admin 프로젝트 |
|------|---------------|----------------|
| **Project Name** | `devlog-blog` | `devlog-admin` |
| **GitHub Repo** | `devlog_renewal` | `devlog_renewal` (동일) |
| **Root Directory** | `apps/blog` | `apps/admin` |
| **Framework** | Next.js | Other (Vite) |
| **Build Command** | `cd ../.. && pnpm turbo build --filter=blog...` | `cd ../.. && pnpm turbo build --filter=admin...` |
| **Output Directory** | `.next` | `dist` |
| **Install Command** | `cd ../.. && pnpm install` | `cd ../.. && pnpm install` (동일) |
| **Ignored Build Step** | `git diff --quiet HEAD^ HEAD apps/blog/ packages/` | `git diff --quiet HEAD^ HEAD apps/admin/ packages/` |
| **환경 변수 접두사** | `NEXT_PUBLIC_` | `VITE_` |
| **Production URL** | `devlog-blog.vercel.app` | `devlog-admin.vercel.app` |
| **커스텀 도메인** | `devlog.dev` | `admin.devlog.dev` |

## 자주 묻는 질문 (FAQ)

### Q1: GitHub 리포지토리를 정말 2번 Import 해야 하나요?

**A**: 네, 맞습니다. Vercel에서는 다음과 같이 작동합니다:

```
1차 Import
  → GitHub Repo: devlog_renewal
  → Root Directory: apps/blog
  → Vercel 프로젝트: devlog-blog 생성

2차 Import (동일한 리포지토리)
  → GitHub Repo: devlog_renewal (같은 리포)
  → Root Directory: apps/admin (다른 경로)
  → Vercel 프로젝트: devlog-admin 생성
```

### Q2: 하나의 Vercel 프로젝트로 Blog와 Admin을 함께 배포할 수 없나요?

**A**: 기술적으로는 가능하지만 권장하지 않습니다:

| 방식 | 장점 | 단점 |
|------|------|------|
| **2개 프로젝트** (권장) | • 독립적인 배포<br>• 별도 도메인<br>• 독립적인 환경 변수<br>• 빌드 최적화 | • 초기 설정 2번 |
| **1개 프로젝트** | • 설정 1번 | • 하나의 도메인만 가능<br>• 빌드 시간 증가<br>• 배포 관리 복잡 |

### Q3: 코드를 변경하면 둘 다 재배포되나요?

**A**: Ignored Build Step 설정으로 제어됩니다:

- **Blog 코드 변경** (`apps/blog/`) → Blog만 재배포
- **Admin 코드 변경** (`apps/admin/`) → Admin만 재배포
- **공유 패키지 변경** (`packages/`) → **둘 다 재배포**
- **기타 파일 변경** (README 등) → 둘 다 빌드 스킵

### Q4: 비용은 어떻게 청구되나요?

**A**: Vercel 프로젝트별로 독립적으로 계산됩니다:

**Hobby 플랜 (무료)**:
- Blog 프로젝트: 대역폭 100GB, 빌드 6,000분
- Admin 프로젝트: 대역폭 100GB, 빌드 6,000분
- **각각 별도 할당**

**Pro 플랜 ($20/month)**:
- 계정 전체에 대해 월 $20
- 프로젝트 개수 무제한
- 대역폭 1TB, 빌드 24,000분 (전체 공유)

### Q5: 환경 변수는 각각 설정해야 하나요?

**A**: 네, 각 프로젝트마다 별도로 설정합니다:

```
devlog-blog 프로젝트
├── NEXT_PUBLIC_SUPABASE_URL
└── NEXT_PUBLIC_SUPABASE_ANON_KEY

devlog-admin 프로젝트
├── VITE_SUPABASE_URL
└── VITE_SUPABASE_ANON_KEY
```

같은 Supabase 프로젝트를 사용하므로 값은 동일하지만, 접두사가 다릅니다.

### Q6: Preview 배포는 어떻게 되나요?

**A**: 각 프로젝트마다 독립적으로 Preview가 생성됩니다:

```bash
# dev 브랜치에 푸시
git push origin dev

# 생성되는 Preview URL
devlog-blog-git-dev-username.vercel.app   (Blog)
devlog-admin-git-dev-username.vercel.app  (Admin)
```

### Q7: Vercel CLI로 배포하려면 어떻게 하나요?

**A**: 각 앱 디렉토리에서 개별적으로 실행합니다:

```bash
# Blog 배포
cd apps/blog
vercel --prod

# Admin 배포
cd apps/admin
vercel --prod
```

## 배포 플로우 요약

```
┌─────────────────────────────────────────────────┐
│  Step 1: Git 푸시                               │
│  git push origin main                           │
└─────────────┬───────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────┐
│  Step 2: GitHub 리포지토리 업데이트             │
│  devlog_renewal                                 │
└─────────────┬───────────────────────────────────┘
              │
              ├─────────────────┬─────────────────┐
              ▼                 ▼                 ▼
      ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
      │ Vercel 감지  │  │ Vercel 감지  │  │ Vercel 감지  │
      │ (Blog)       │  │ (Admin)      │  │ (Other)      │
      └──────┬───────┘  └──────┬───────┘  └──────┬───────┘
             │                 │                 │
             ▼                 ▼                 ▼
      ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
      │ Build Check  │  │ Build Check  │  │ Build Skip   │
      │ apps/blog/   │  │ apps/admin/  │  │              │
      │ changed? ✓   │  │ changed? ✓   │  │              │
      └──────┬───────┘  └──────┬───────┘  └──────────────┘
             │                 │
             ▼                 ▼
      ┌──────────────┐  ┌──────────────┐
      │ Build Blog   │  │ Build Admin  │
      │ Next.js 16   │  │ Vite 6       │
      └──────┬───────┘  └──────┬───────┘
             │                 │
             ▼                 ▼
      ┌──────────────┐  ┌──────────────┐
      │ Deploy       │  │ Deploy       │
      │ devlog.dev   │  │ admin.dev    │
      └──────────────┘  └──────────────┘
```

## 다음 단계

배포가 완료되면:
1. ✅ Blog와 Admin 사이트 테스트
2. ✅ Supabase RLS 정책 확인
3. ✅ 성능 모니터링 (Analytics, Speed Insights)
4. ✅ 커스텀 도메인 설정 (선택)
5. ✅ 팀원 초대 (선택)
