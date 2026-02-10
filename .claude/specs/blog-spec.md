# Blog App Technical Specification

> Next.js 16 블로그 앱의 구현 스펙 - 라우팅, 데이터, 캐싱, SEO, API

## App Router 구조

```
apps/blog/src/app/
├── layout.tsx           # 루트 레이아웃 (메타데이터, 테마, 폰트)
├── page.tsx             # / 메인 페이지
├── globals.css          # Tailwind v4 글로벌 스타일
├── not-found.tsx        # 404
├── error.tsx            # 에러 바운더리
├── post/
│   ├── page.tsx         # /post - 전체 포스트 목록
│   ├── [category]/
│   │   ├── page.tsx     # /post/[category] - 카테고리별 목록
│   │   └── [slug]/
│   │       └── page.tsx # /post/[category]/[slug] - 상세
├── contact/
│   └── page.tsx         # /contact - 문의하기 폼
├── api/
│   ├── comments/
│   │   └── route.ts     # POST: 댓글 작성 / DELETE: 댓글 삭제
│   ├── contact/
│   │   └── route.ts     # POST: 문의 제출
│   └── views/
│       └── [postId]/
│           └── route.ts # POST: 조회수 증가
└── sitemap.ts           # 동적 사이트맵
```

## 페이지별 스펙

### 메인 (`/`) - page.tsx
- Featured 포스트 섹션 (is_featured=true, 최신순)
- 최신 포스트 목록 (published, limit 6-8)
- 캐싱: `"use cache"` + `cacheLife('hours')`

### 포스트 목록 (`/post`) - post/page.tsx
- 전체 published 포스트 (페이지네이션)
- 카테고리/태그 필터 UI
- 캐싱: `"use cache"` + `cacheLife('hours')`

### 카테고리 목록 (`/post/[category]`) - post/[category]/page.tsx
- category slug로 필터링된 포스트
- 캐싱: `"use cache"` + `cacheLife('hours')`

### 포스트 상세 (`/post/[category]/[slug]`) - post/[category]/[slug]/page.tsx
- MDX 렌더링 (본문)
- PostHead (제목, 날짜, 카테고리, 태그)
- PostBody (MDX 콘텐츠)
- PostFooter (관련 포스트, 태그 목록)
- 댓글 섹션 (CommentList + CommentForm)
- 조회수 증가 (클라이언트에서 POST /api/views/[postId])
- 캐싱: `"use cache"` + `cacheTag('post-{slug}')` + `cacheLife('days')`

### 문의하기 (`/contact`) - contact/page.tsx
- ContactForm: 이름, 이메일, 제목, 메시지
- 서버 사이드 검증 → Supabase insert

## 캐싱 전략 코드 패턴

### 포스트 목록
```typescript
"use cache";
import { cacheLife } from 'next/cache';

export default async function PostListPage() {
  cacheLife('hours');
  const posts = await getPublishedPosts();
  return <PostList posts={posts} />;
}
```

### 포스트 상세
```typescript
"use cache";
import { cacheLife, cacheTag } from 'next/cache';

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const { slug, category } = await params;
  cacheTag(`post-${slug}`);
  cacheLife('days');
  const post = await getPost(category, slug);
  return <PostDetail post={post} />;
}
```

## 데이터 페칭 함수 (lib/posts.ts)

### getPublishedPosts
```typescript
import { createClient } from '@repo/database/server';

export async function getPublishedPosts(options?: {
  category?: string;
  tag?: string;
  page?: number;
  limit?: number;
}) {
  const supabase = await createClient();
  let query = supabase
    .from('posts')
    .select(`
      id, title, slug, excerpt, thumbnail_url,
      published_at, view_count, is_featured,
      categories(name, slug),
      post_tags(tags(name, slug))
    `)
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  if (options?.category) {
    query = query.eq('categories.slug', options.category);
  }
  return query;
}
```

### getPost
```typescript
export async function getPost(category: string, slug: string) {
  const supabase = await createClient();
  return supabase
    .from('posts')
    .select(`
      *,
      categories(name, slug),
      post_tags(tags(name, slug))
    `)
    .eq('slug', slug)
    .eq('categories.slug', category)
    .single();
}
```

### getAllPublishedSlugs (사이트맵용)
```typescript
export async function getAllPublishedSlugs() {
  const supabase = await createClient();
  return supabase
    .from('posts')
    .select('slug, updated_at, categories(slug)')
    .eq('status', 'published');
}
```

## MDX 렌더링 (lib/mdx.ts)

```typescript
import { compileMDX } from 'next-mdx-remote/rsc';
import rehypePrettyCode from 'rehype-pretty-code';

export async function renderMDX(source: string) {
  return compileMDX({
    source,
    options: {
      mdxOptions: {
        rehypePlugins: [[rehypePrettyCode, { theme: 'one-dark-pro' }]],
      },
    },
    components: mdxComponents,
  });
}
```

## SEO (generateMetadata)

```typescript
export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}): Promise<Metadata> {
  const { category, slug } = await params;
  const post = await getPost(category, slug);

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.thumbnail_url ? [post.thumbnail_url] : [],
      type: 'article',
      publishedTime: post.published_at,
    },
  };
}
```

## 사이트맵 (sitemap.ts)

```typescript
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getAllPublishedSlugs();
  return posts.map((post) => ({
    url: `${SITE_URL}/post/${post.category_slug}/${post.slug}`,
    lastModified: post.updated_at,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));
}
```

## API Routes

### POST /api/comments
- Body: `{ post_id, author_name, content, password, parent_id? }`
- password → bcrypt hash 후 저장
- 검증: post_id 존재, author_name/content 필수

### DELETE /api/comments
- Body: `{ comment_id, password }`
- bcrypt compare로 본인 확인 후 삭제

### POST /api/contact
- Body: `{ name, email, subject, message }`
- 검증: 모든 필드 필수, email 형식 검증
- Supabase contacts 테이블 insert

### POST /api/views/[postId]
- 조회수 +1 (RPC 또는 직접 update)
- 중복 방지: 쿠키/IP 기반 (선택)

## 컴포넌트 목록

| 컴포넌트 | 위치 | Server/Client | 역할 |
|----------|------|---------------|------|
| Header | layout/ | Server | 네비게이션 헤더 |
| Footer | layout/ | Server | 푸터 |
| ThemeToggle | layout/ | Client | 다크모드 토글 |
| PostCard | post/ | Server | 포스트 카드 (목록용) |
| PostList | post/ | Server | 포스트 목록 |
| PostDetail | post/ | Server | 포스트 상세 레이아웃 |
| PostHead | post/ | Server | 제목, 메타 정보 |
| PostBody | post/ | Server | MDX 렌더링 영역 |
| PostFooter | post/ | Server | 관련 포스트, 태그 |
| CommentList | comment/ | Server | 댓글 목록 (트리) |
| CommentItem | comment/ | Server | 댓글 단일 항목 |
| CommentForm | comment/ | Client | 댓글 작성 폼 |
| MDXComponents | mdx/ | Server | MDX 커스텀 컴포넌트 매핑 |
| CodeBlock | mdx/ | Server | 코드 블록 |
| Callout | mdx/ | Server | 콜아웃 박스 |
| MDXImage | mdx/ | Server | 이미지 (Supabase Storage) |
| SearchPost | common/ | Client | 검색 |
| CategoryFilter | common/ | Client | 카테고리 필터 |
| TagFilter | common/ | Client | 태그 필터 |
| ContactForm | contact/ | Client | 문의하기 폼 |
