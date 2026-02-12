# Next.js 16 마이그레이션 가이드

> **현재 상태**: Next.js 15 → Next.js 16으로 업그레이드
> **마이그레이션 난이도**: ⭐ 쉬움 (이미 대부분 호환 코드 사용 중)

## 1. 업그레이드 개요

### 주요 변경사항
- ✅ **Turbopack 기본 활성화**: 빌드 성능 50% 향상
- ✅ **Async Request APIs**: 이미 사용 중
- ✅ **React 19.2**: View Transitions, useEffectEvent 지원
- ✅ **새 캐싱 API**: updateTag, refresh 추가

### 현재 프로젝트 상태
- ✅ `params`를 이미 `Promise<>` 타입으로 사용 중
- ✅ `cookies()`를 이미 `await`로 호출 중
- ✅ middleware 파일 없음 (마이그레이션 불필요)
- ✅ Turbopack 이미 사용 중

## 2. 단계별 마이그레이션

### Step 1: 의존성 업데이트

```bash
# 루트에서 실행
pnpm add next@latest react@latest react-dom@latest -w

# blog 앱 타입 업데이트
cd apps/blog
pnpm add -D @types/react@latest @types/react-dom@latest
```

**예상 버전**:
- `next`: ^16.1
- `react`: ^19.2
- `react-dom`: ^19.2
- `@types/react`: ^19.2
- `@types/react-dom`: ^19.2

### Step 2: package.json 스크립트 수정

현재 `--turbopack` 플래그가 있다면 제거합니다.

```json
// apps/blog/package.json
{
  "scripts": {
    "dev": "next dev",        // --turbopack 제거
    "build": "next build",    // --turbopack 제거
    "start": "next start",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit"
  }
}
```

### Step 3: next.config.ts 업데이트

현재 설정은 변경 불필요하지만, Turbopack 옵션 추가 가능:

```ts
// apps/blog/next.config.ts
import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname, "../../"),
  transpilePackages: ["@repo/ui", "@repo/database", "@repo/types"],

  // (선택) Turbopack 파일시스템 캐싱 (Beta)
  experimental: {
    turbopackFileSystemCacheForDev: true, // 개발 서버 재시작 속도 향상
  },
};

export default nextConfig;
```

### Step 4: 빌드 및 테스트

```bash
# 전체 빌드
pnpm build

# 타입 체크
pnpm typecheck

# 개발 서버 실행 (Turbopack 기본 활성화 확인)
pnpm dev:blog
```

## 3. 새로운 기능 활용 (선택)

### React Compiler 활성화

자동 메모이제이션으로 리렌더링 최적화:

```ts
// next.config.ts
const nextConfig: NextConfig = {
  reactCompiler: true, // 자동 메모이제이션
};
```

```bash
# React Compiler 플러그인 설치
pnpm add -D babel-plugin-react-compiler
```

### 새 캐싱 API 활용

```ts
// app/actions.ts
'use server'

import { updateTag, revalidateTag, refresh } from 'next/cache'

// 즉시 업데이트 (사용자가 변경사항 즉시 확인)
export async function updateUserProfile(userId: string, profile: Profile) {
  await db.users.update(userId, profile)
  updateTag(`user-${userId}`) // read-your-writes
}

// 백그라운드 재검증 (약간의 지연 허용)
export async function updateArticle(articleId: string) {
  await db.articles.update(articleId)
  revalidateTag(`article-${articleId}`, 'max') // stale-while-revalidate
}

// 라우터 새로고침
export async function markNotificationAsRead(notificationId: string) {
  await db.notifications.markAsRead(notificationId)
  refresh() // 클라이언트 라우터 새로고침
}
```

### React 19.2 기능 활용

```tsx
// View Transitions 활용
'use client'

import { useTransition } from 'react'

export function MyComponent() {
  const [isPending, startTransition] = useTransition()

  const handleUpdate = () => {
    startTransition(async () => {
      // 애니메이션과 함께 UI 업데이트
      await updateData()
    })
  }
}
```

## 4. 체크리스트

### 필수
- [ ] `next`, `react`, `react-dom` 업데이트
- [ ] `@types/react`, `@types/react-dom` 업데이트
- [ ] `package.json` scripts에서 `--turbopack` 플래그 제거
- [ ] `pnpm build` 성공 확인
- [ ] `pnpm dev` 실행 확인 (Turbopack 기본 활성화)
- [ ] 타입 체크 통과 확인

### 선택
- [ ] React Compiler 활성화 (빌드 시간 증가 고려)
- [ ] Turbopack 파일시스템 캐싱 활성화
- [ ] 새 캐싱 API (`updateTag`, `refresh`) 활용
- [ ] React 19.2 기능 활용

## 5. 예상 문제 및 해결

### 문제 1: Webpack 설정이 있는 플러그인

**증상**: `next build` 실패, webpack 설정 감지

**해결**:
```json
// package.json
{
  "scripts": {
    "build": "next build --webpack" // Webpack 강제 사용
  }
}
```

### 문제 2: Sass tilde (~) import

**증상**: Sass import 실패

**해결**:
```scss
// 변경 전
@import '~bootstrap/dist/css/bootstrap.min.css';

// 변경 후
@import 'bootstrap/dist/css/bootstrap.min.css';
```

### 문제 3: 빌드 시간 증가 (React Compiler 사용 시)

**증상**: 개발/빌드 시간 증가

**해결**: React Compiler 비활성화
```ts
// next.config.ts
const nextConfig: NextConfig = {
  reactCompiler: false, // 또는 제거
};
```

## 6. 성능 개선 확인

마이그레이션 후 기대 효과:

- ✅ **빌드 시간**: 50% 향상 (Turbopack)
- ✅ **개발 서버**: HMR 속도 향상
- ✅ **번들 크기**: Layout deduplication으로 감소
- ✅ **Prefetch**: Incremental prefetching으로 네트워크 최적화

```bash
# 빌드 시간 측정
time pnpm build

# 개발 서버 시작 시간 측정
time pnpm dev:blog
```

## 7. 참고 자료

- [Next.js 16 Release Notes](https://nextjs.org/blog/next-16)
- [Next.js 16 Upgrade Guide](https://nextjs.org/docs/app/guides/upgrading/version-16)
- [React 19.2 Release](https://react.dev/blog/2025/10/01/react-19-2)
- [Turbopack Documentation](https://nextjs.org/docs/app/api-reference/config/next-config-js/turbopack)
