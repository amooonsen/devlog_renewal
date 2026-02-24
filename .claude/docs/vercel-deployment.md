# Vercel 모노레포 독립 배포 가이드

## 구조 개요

```
devlog_renewal/        ← GitHub 단일 레포
├── apps/blog/         ← Vercel 프로젝트 A (blog)
│   └── vercel.json    ← blog 배포 설정
├── apps/admin/        ← Vercel 프로젝트 B (admin)
│   └── vercel.json    ← admin 배포 설정
└── packages/          ← 공유 패키지 (변경 시 양쪽 배포)
```

Vercel에 **두 개의 독립 프로젝트**를 등록하고, 각각 `ignoreCommand`로 관련 경로에 변경이 없으면 빌드를 스킵합니다.

---

## 동작 원리: ignoreCommand

`ignoreCommand`는 종료 코드로 빌드 여부를 결정합니다.

| exit code | 동작 |
|-----------|------|
| `0`       | 빌드 **스킵** |
| `1`       | 빌드 **실행** |

```bash
# apps/blog/vercel.json
"ignoreCommand": "bash -c 'git diff --quiet HEAD~1 HEAD apps/blog/ packages/ 2>/dev/null || exit 1'"

# apps/admin/vercel.json
"ignoreCommand": "bash -c 'git diff --quiet HEAD~1 HEAD apps/admin/ packages/ 2>/dev/null || exit 1'"
```

`git diff --quiet`는 변경이 없으면 exit 0, 있으면 exit 1을 반환합니다.

---

## 시나리오별 배포 결과

| 변경 경로 | blog | admin |
|-----------|------|-------|
| `apps/blog/**` | ✅ 배포 | ❌ 스킵 |
| `apps/admin/**` | ❌ 스킵 | ✅ 배포 |
| `packages/**` | ✅ 배포 | ✅ 배포 |
| `apps/blog/**` + `packages/**` | ✅ 배포 | ✅ 배포 |
| 루트 설정 파일만 변경 | ❌ 스킵 | ❌ 스킵 |

---

## Vercel 프로젝트 초기 설정

각 프로젝트는 **동일한 GitHub 레포**에 연결하되, Root Directory만 다르게 설정합니다.

### blog 프로젝트
- **Root Directory**: `apps/blog`
- **Framework Preset**: Next.js
- **Build Command**: `cd ../.. && pnpm turbo build --filter=blog...`
- **Install Command**: `cd ../.. && pnpm install`
- **Output Directory**: `.next`

### admin 프로젝트
- **Root Directory**: `apps/admin`
- **Framework Preset**: Other (Vite SPA)
- **Build Command**: `cd ../.. && pnpm turbo build --filter=admin...`
- **Install Command**: `cd ../.. && pnpm install`
- **Output Directory**: `dist`

> `vercel.json`에 위 설정이 이미 포함되어 있으므로 Dashboard 설정보다 `vercel.json`이 우선합니다.

---

## 사전 검증 방법

### 1. 로컬 빌드 검증 (가장 확실)

```bash
# 전체 빌드
pnpm build

# 개별 앱만
pnpm dev:blog     # 개발 서버로 동작 확인
pnpm dev:admin

# 타입 체크
pnpm typecheck

# 린트
pnpm lint
```

### 2. Next.js 빌드 에러 상세 디버깅

```bash
# prerender 에러 상세 스택 트레이스
cd apps/blog && pnpm exec next build --debug-prerender

# 일반 프로덕션 빌드 (에러 재현)
cd apps/blog && pnpm build
```

### 3. ignoreCommand 로컬 테스트

특정 커밋이 배포를 트리거하는지 확인:

```bash
# blog가 배포되어야 하는지 확인 (exit 1이면 배포, 0이면 스킵)
git diff --quiet HEAD~1 HEAD apps/blog/ packages/; echo "exit: $?"

# admin이 배포되어야 하는지 확인
git diff --quiet HEAD~1 HEAD apps/admin/ packages/; echo "exit: $?"
```

### 4. Turbo 원격 캐시 미스 확인

```bash
# 캐시 미스 강제 실행 (실제 빌드 재현)
pnpm turbo build --filter=blog... --force
```

---

## 주요 이슈 & 해결책

### cacheComponents + Date.now() 충돌 (Next.js 16)

`nextConfig.cacheComponents: true` 활성화 시, 캐시 경계(`"use cache"`) 밖에서 `Date.now()` 호출 금지.

**금지 패턴:**
```tsx
// ❌ Server Component에서 직접 dayjs/Date 호출
export default async function Page() {
  return <time>{formatKoreanDate(post.published_at)}</time>;
}

// ❌ export const revalidate = 3600; (cacheComponents와 호환 불가)
```

**올바른 패턴:**
```tsx
// ✅ "use client" 컴포넌트로 분리
"use client";
export function FormattedDate({ date }) {
  return <span>{formatKoreanDate(date)}</span>;
}

// ✅ 내부적으로 Date.now()를 호출하는 함수는 "use cache" 경계 안에서 실행
export async function renderMDX(source: string) {
  "use cache";
  cacheLife("days");
  // compileMDX가 shiki/rehype 내부에서 Date.now() 호출 → 캐시 경계 안이므로 허용
  return compileMDX({ source, ... });
}
```

### SUPABASE_SERVICE_ROLE_KEY turbo.json 경고

```json
// turbo.json
"build": {
  "env": ["SUPABASE_SERVICE_ROLE_KEY"]
}
```

추가하지 않으면 이 환경변수가 turbo 캐시 키에 포함되지 않아 캐시가 무효화되지 않을 수 있습니다.

---

## 배포 플로우 요약

```
PR 생성/머지 → GitHub webhook → Vercel
  ├── blog 프로젝트: ignoreCommand 실행
  │     ├── apps/blog/ 또는 packages/ 변경? → 빌드 실행
  │     └── 변경 없음? → 빌드 스킵 (이전 배포 유지)
  └── admin 프로젝트: ignoreCommand 실행
        ├── apps/admin/ 또는 packages/ 변경? → 빌드 실행
        └── 변경 없음? → 빌드 스킵 (이전 배포 유지)
```
