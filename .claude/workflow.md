# Implementation Workflow

> 구현 단계별 작업 목록 및 진행 상태 추적

## Phase Overview

| Phase | 이름 | 예상 기간 | 상태 |
|-------|------|-----------|------|
| 0 | 사전 준비 (분석/설계) | - | ✅ 완료 |
| 1 | 프로젝트 초기화 | 1일 | ⏳ 대기 |
| 2 | Blog 앱 기본 구조 | 2-3일 | ⏳ 대기 |
| 3 | Admin 앱 | 2-3일 | ⏳ 대기 |
| 4 | 마무리 및 배포 | 1-2일 | ⏳ 대기 |

---

## Phase 0: 사전 준비 ✅

- [x] 이전 버전(v1) 프로젝트 분석 → `PROJECT_ANALYSIS.md`
- [x] 시스템 설계 문서 작성 → `DESIGN.md`
- [x] 기술 스택 결정
- [x] DB 스키마 설계

---

## Phase 1: 프로젝트 초기화 ⏳

### 1.1 Turborepo 모노레포 세팅
- [ ] pnpm workspace 초기화 (`pnpm-workspace.yaml`)
- [ ] `turbo.json` 파이프라인 설정
- [ ] 루트 `package.json` 스크립트 설정
- [ ] `.gitignore`, `.env.example` 작성

### 1.2 공유 설정 패키지
- [ ] `packages/typescript-config/` - 공유 tsconfig (base, nextjs, react-vite)
- [ ] `packages/eslint-config/` - 공유 ESLint 설정 (base, nextjs, react)

### 1.3 공유 패키지 초기화
- [ ] `packages/types/` - 공유 TypeScript 타입 (Post, Comment, Contact, Category, Tag)
- [ ] `packages/database/` - Supabase 클라이언트 (client.ts, server.ts, types.ts)
- [ ] `packages/ui/` - 공유 UI 컴포넌트 (shadcn/ui 기반 Button, Input 등)

### 1.4 Supabase 프로젝트 설정
- [ ] `supabase init` 로컬 설정
- [ ] DB 마이그레이션 파일 작성 (categories, posts, tags, post_tags, comments, contacts)
- [ ] RLS 정책 설정
- [ ] 인덱스 생성
- [ ] 시드 데이터 작성 (`seed.sql`)

### 1.5 앱 스캐폴딩
- [ ] `apps/blog/` - Next.js 16 프로젝트 생성
- [ ] `apps/admin/` - Vite + React 19 프로젝트 생성
- [ ] 앱 간 패키지 의존성 연결 확인

**Phase 1 완료 기준**: `pnpm dev` 실행 시 blog/admin 모두 빈 화면이라도 정상 구동

---

## Phase 2: Blog 앱 기본 구조 ⏳

### 2.1 기본 설정
- [ ] Tailwind v4 + 다크모드 설정
- [ ] 루트 레이아웃 (`layout.tsx`) - 메타데이터, 테마, 폰트
- [ ] `globals.css` 기본 스타일
- [ ] `not-found.tsx`, `error.tsx`

### 2.2 레이아웃 컴포넌트
- [ ] Header (네비게이션)
- [ ] Footer
- [ ] ThemeToggle (다크모드)

### 2.3 메인 페이지 (`/`)
- [ ] Featured 포스트 섹션
- [ ] 최신 포스트 목록

### 2.4 포스트 목록/상세
- [ ] `/post` - 전체 포스트 목록 페이지
- [ ] `/post/[category]` - 카테고리별 필터링
- [ ] `/post/[category]/[slug]` - 포스트 상세
- [ ] MDX 렌더링 (`next-mdx-remote` + `rehype-pretty-code`)
- [ ] SEO 메타데이터 (`generateMetadata`)
- [ ] `"use cache"` 캐싱 적용

### 2.5 데이터 레이어
- [ ] `lib/posts.ts` - Supabase 쿼리 함수 (getPublishedPosts, getPost, getAllPublishedSlugs)
- [ ] `lib/mdx.ts` - MDX 컴파일 설정

### 2.6 댓글 시스템
- [ ] CommentList (트리 구조 대댓글)
- [ ] CommentItem
- [ ] CommentForm (이름 + 비밀번호 + 내용)
- [ ] API Route: `POST /api/comments`, `DELETE /api/comments`

### 2.7 문의하기
- [ ] ContactForm (`/contact`)
- [ ] API Route: `POST /api/contact`

### 2.8 검색 기능
- [ ] SearchPost 컴포넌트 (Supabase full-text search)

### 2.9 추가 기능
- [ ] 조회수 API (`POST /api/views/[postId]`)
- [ ] 사이트맵 (`sitemap.ts`)
- [ ] 카테고리/태그 필터 UI

**Phase 2 완료 기준**: 블로그 모든 페이지 정상 렌더링, 댓글/문의 기능 동작

---

## Phase 3: Admin 앱 ✅

### 3.1 기본 설정
- [x] Vite + React 19 설정
- [x] React Router v7 라우팅
- [x] TanStack Query 설정
- [x] Tailwind v4 + shadcn/ui 기본 컴포넌트

### 3.2 인증
- [x] 로그인 페이지 (`/login`)
- [x] Supabase Auth (email/password)
- [x] ProtectedRoute 가드
- [x] useAuth 훅

### 3.3 레이아웃
- [x] AdminLayout (사이드바 + 헤더)
- [x] Sidebar 네비게이션

### 3.4 대시보드 (`/dashboard`)
- [x] 전체/발행 포스트 수
- [x] 최근 댓글 5개
- [x] 미읽은 문의 수
- [x] 대기 중 댓글 수

### 3.5 포스트 관리
- [x] 포스트 목록 (`/posts`) - 상태 필터, 페이지네이션
- [x] 포스트 작성/수정 (`/posts/new`, `/posts/:id/edit`)
- [x] 마크다운 에디터 (`@uiw/react-md-editor`)
- [x] 썸네일 업로드 (Supabase Storage)
- [x] 발행/초안/보관 상태 관리

### 3.6 댓글 관리 (`/comments`)
- [x] 댓글 목록 (승인/미승인 필터)
- [x] 승인/거부/삭제 액션

### 3.7 문의 관리 (`/contacts`)
- [x] 문의 목록 (읽음/미읽음 필터)
- [x] 상세 보기 + 읽음 처리

**Phase 3 완료 기준**: 어드민에서 포스트 CRUD, 댓글/문의 관리 가능 ✅

---

## Phase 4: 마무리 ⏳

### 4.1 디자인 완성
- [ ] 반응형 디자인 (모바일/태블릿/데스크톱)
- [ ] 다크모드 완성
- [ ] 로딩 스켈레톤 UI

### 4.2 성능 최적화
- [ ] 이미지 최적화 (`next/image` + Supabase Storage)
- [ ] RSS 피드

### 4.3 배포
- [ ] 환경변수 정리
- [ ] Vercel 블로그 배포 설정
- [ ] Vercel Admin 배포 설정 (Static)
- [ ] Supabase 프로덕션 설정

**Phase 4 완료 기준**: 프로덕션 배포 완료, 모든 기능 정상 동작

---

## Task Dependencies

```
Phase 1.1 (Turborepo) → Phase 1.2 (공유 설정)
Phase 1.2 → Phase 1.3 (공유 패키지)
Phase 1.4 (Supabase) ← 독립 작업 (병렬 가능)
Phase 1.3 + 1.4 → Phase 1.5 (앱 스캐폴딩)
Phase 1 전체 → Phase 2 (Blog)
Phase 1 전체 → Phase 3 (Admin) ← Phase 2와 병렬 가능하지만 순차 권장
Phase 2 + 3 → Phase 4 (마무리)
```
