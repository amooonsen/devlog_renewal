# Coding Conventions

> 프로젝트 전반의 네이밍, 패턴, 파일 조직 규칙

## Language & Communication

- 코드 주석: 한국어
- 커밋 메시지: 한국어 (Conventional Commits 형식)
- 변수/함수명: 영어 (camelCase)
- 파일명: 컴포넌트 PascalCase, 유틸/훅 camelCase

## File Naming

| 유형 | 패턴 | 예시 |
|------|------|------|
| React 컴포넌트 | PascalCase.tsx | `PostCard.tsx`, `Header.tsx` |
| 페이지 (Next.js) | page.tsx, layout.tsx | `app/post/page.tsx` |
| 훅 | use*.ts | `useAuth.ts`, `usePosts.ts` |
| 유틸리티 | camelCase.ts | `posts.ts`, `mdx.ts`, `utils.ts` |
| 타입 | camelCase.ts | `post.ts`, `comment.ts` |
| 상수/설정 | camelCase.ts | `site.ts`, `navigation.ts` |
| 테스트 | *.test.ts(x) | `posts.test.ts` |

## Directory Organization

### Blog (`apps/blog/src/`)
```
app/           # App Router 페이지만
components/    # 컴포넌트 (도메인별 하위 폴더)
  layout/      #   Header, Footer, ThemeToggle
  post/        #   PostCard, PostList, PostDetail, PostHead, PostBody, PostFooter
  comment/     #   CommentList, CommentItem, CommentForm
  mdx/         #   MDXComponents, CodeBlock, Callout, MDXImage
  common/      #   SearchPost, CategoryFilter, TagFilter
  contact/     #   ContactForm
lib/           # 유틸리티 (posts.ts, mdx.ts, utils.ts)
hooks/         # 커스텀 훅
config/        # 사이트 설정 (site.ts, navigation.ts)
```

### Admin (`apps/admin/src/`)
```
pages/         # 라우트 페이지 (Page suffix)
components/    # 컴포넌트 (도메인별 하위 폴더)
  layout/      #   AdminLayout, Sidebar, AdminHeader
  post/        #   PostTable, PostEditor, PostMetaForm, ThumbnailUploader
  comment/     #   CommentTable, CommentActions
  contact/     #   ContactTable, ContactDetail
  common/      #   DataTable, StatusBadge, ConfirmDialog
hooks/         # TanStack Query 훅 (useAuth, usePosts, useComments, useContacts)
lib/           # 유틸리티 (auth.ts, api.ts)
config/        # 설정
```

## Component Patterns

### Server Component (기본)
```tsx
// app/post/page.tsx
"use cache";
import { cacheLife } from 'next/cache';

export default async function PostListPage() {
  cacheLife('hours');
  const posts = await getPublishedPosts();
  return <PostList posts={posts} />;
}
```

### Client Component (필요 시)
```tsx
// components/comment/CommentForm.tsx
"use client";

export default function CommentForm({ postId }: { postId: string }) {
  // 사용자 인터랙션이 필요한 경우만
}
```

### Page Component Props (Next.js 16)
```tsx
// 비동기 params 필수
export default async function Page({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const { category, slug } = await params;
}
```

## Data Fetching Patterns

### Blog: Supabase Server Client
```tsx
// lib/posts.ts
import { createClient } from '@repo/database/server';

export async function getPublishedPosts(options?: { category?: string }) {
  const supabase = await createClient();
  let query = supabase
    .from('posts')
    .select(`*, categories(*), post_tags(tags(*))`)
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  if (options?.category) {
    query = query.eq('categories.slug', options.category);
  }
  return query;
}
```

### Admin: TanStack Query
```tsx
// hooks/usePosts.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function usePosts(filter?: PostFilter) {
  return useQuery({
    queryKey: ['posts', filter],
    queryFn: () => fetchPosts(filter),
  });
}
```

## Import Conventions

```tsx
// 1. React/Framework
import { useState } from 'react';
import Link from 'next/link';

// 2. 외부 라이브러리
import dayjs from 'dayjs';

// 3. 내부 패키지 (@repo/*)
import { Button } from '@repo/ui';
import type { Post } from '@repo/types';
import { createClient } from '@repo/database/server';

// 4. 프로젝트 내부
import { getPublishedPosts } from '@/lib/posts';
import PostCard from '@/components/post/PostCard';
```

## TypeScript Rules

- `strict: true` (모든 패키지)
- `any` 사용 금지 → `unknown` + 타입 가드
- 모든 함수 반환 타입 명시 (간단한 경우 추론 허용)
- Supabase 자동 생성 타입 활용 (`@repo/database/types`)
- 비즈니스 타입은 `@repo/types`에서 관리

## Styling

- Tailwind v4 CSS-first configuration
- 다크모드: `next-themes` + Tailwind `dark:` 접두사
- 공유 디자인 토큰: `@repo/ui`의 tailwind 설정에서 관리
- 컴포넌트 라이브러리: shadcn/ui (필요한 것만 설치)

## Error Handling

- API Route: try-catch + 적절한 HTTP 상태 코드
- 페이지: `error.tsx` 바운더리
- 폼: zod 스키마 검증 (어드민), 서버 사이드 검증 (블로그 API)
- Supabase 에러: error 객체 확인 후 사용자 친화적 메시지

## Git Conventions

```
feat: 새 기능 추가
fix: 버그 수정
refactor: 리팩토링
style: 스타일/포맷팅
docs: 문서 수정
chore: 빌드/설정 변경
```

- 작업 브랜치: `dev`
- 배포 브랜치: `main`
- Feature 브랜치: `feature/{기능명}` (필요 시)
