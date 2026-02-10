# Tech Stack Reference

> 프로젝트 전체 기술 스택, 의존성, 버전 정리

## Core Stack

| 기술 | 버전 | 용도 |
|------|------|------|
| Turborepo | latest | 모노레포 빌드 오케스트레이션 |
| pnpm | latest | 패키지 매니저 (workspace) |
| TypeScript | 5.1+ | 타입 시스템 (strict 모드) |
| Node.js | 20.9+ LTS | 런타임 |

## Blog App (`apps/blog`)

| 패키지 | 버전 | 용도 |
|--------|------|------|
| next | 16 | 프레임워크 (Turbopack 기본) |
| react / react-dom | 19 | UI (React Compiler 포함) |
| @supabase/ssr | latest | 서버사이드 Supabase 클라이언트 |
| next-mdx-remote | latest | DB 마크다운 → MDX 서버 렌더링 |
| rehype-pretty-code | latest | 코드 하이라이팅 (shiki 내장) |
| next-themes | latest | 다크모드 토글 |
| tailwindcss | 4 | 스타일링 |
| dayjs | latest | 날짜 포맷팅 |

### Blog 핵심 패턴
- **캐싱**: `"use cache"` + `cacheLife()` + `cacheTag()`
- **params**: 비동기 (`params: Promise<{...}>`, `await params`)
- **컴포넌트**: Server Component 기본, 필요 시 `"use client"`
- **데이터**: `lib/posts.ts` → Supabase 직접 쿼리

## Admin App (`apps/admin`)

| 패키지 | 버전 | 용도 |
|--------|------|------|
| react / react-dom | 19 | UI |
| vite | latest | 빌드 도구 + HMR |
| react-router | 7 | SPA 라우팅 |
| @tanstack/react-query | latest | 서버 상태 관리 + 캐싱 |
| @supabase/supabase-js | latest | Supabase 클라이언트 (브라우저) |
| @uiw/react-md-editor | latest | 마크다운 에디터 + 프리뷰 |
| react-hook-form | latest | 폼 상태 관리 |
| zod | latest | 스키마 기반 폼 검증 |
| tailwindcss | 4 | 스타일링 |
| dayjs | latest | 날짜 포맷팅 |

### Admin 핵심 패턴
- **상태**: TanStack Query (서버 상태), React state (로컬)
- **폼**: react-hook-form + zod resolver
- **인증**: Supabase Auth → RLS 기반 접근 제어
- **라우팅**: React Router v7 + ProtectedRoute 가드

## Shared Packages

| 패키지 | 내부 이름 | 내용 |
|--------|-----------|------|
| `packages/database` | `@repo/database` | Supabase 클라이언트 (server.ts, client.ts, types.ts) |
| `packages/types` | `@repo/types` | Post, Comment, Contact, Category, Tag 타입 |
| `packages/ui` | `@repo/ui` | shadcn/ui 기반 공유 컴포넌트 (Button, Input, Dialog 등) |
| `packages/typescript-config` | `@repo/typescript-config` | 공유 tsconfig (base, nextjs, react-vite) |
| `packages/eslint-config` | `@repo/eslint-config` | 공유 ESLint (base, nextjs, react) |

## Infrastructure

| 서비스 | 용도 | 환경 |
|--------|------|------|
| Supabase | Auth + PostgreSQL + Storage + RLS | 로컬(dev) + Cloud(prod) |
| Vercel | Blog 배포 (SSR/Edge) + Admin 배포 (Static) | prod |

## v1에서 제거된 의존성

| 패키지 | 제거 이유 |
|--------|-----------|
| framer-motion | React 19 View Transitions 대체 |
| zustand | 블로그 불필요, 어드민은 TanStack Query |
| gray-matter | Supabase DB로 전환 (MDX frontmatter 불필요) |
| sharp | Next.js 16 내장 이미지 최적화 |
| shikiji | rehype-pretty-code 내장 shiki |
| path (npm) | Node.js 내장 모듈 |

## Environment Variables

### Blog (`apps/blog/.env.local`)
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_GA_ID=
NEXT_PUBLIC_SITE_URL=
```

### Admin (`apps/admin/.env.local`)
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

### Root (`.env.example`)
```
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GA_ID=
```
