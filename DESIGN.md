# DevLog Renewal - System Design Document

> 작성일: 2026-02-10
> 스택: Turborepo + Next.js 16 + React 19 + Supabase + Tailwind CSS v4

---

## 1. 프로젝트 개요

### 1.1 목표
이전 버전(Next.js 14 파일 기반 MDX 블로그)의 문제점을 해소하고, Supabase 기반 어드민 관리 시스템으로 전환한 개발 블로그 v2.

### 1.2 핵심 변경점 (v1 → v2)

| 항목 | v1 (이전) | v2 (신규) |
|------|-----------|-----------|
| 아키텍처 | 단일 Next.js 14 프로젝트 | Turborepo 모노레포 |
| 콘텐츠 관리 | 파일 기반 MDX 직접 등록 | Supabase DB + 어드민 패널 |
| 백엔드 | Next.js API Routes만 | Supabase (Auth, DB, Storage, RLS) |
| 관리자 | 없음 | React 19 SPA (Vite) |
| React | 18 | 19 (React Compiler 포함) |
| 번들러 | Webpack | Turbopack (기본) |
| CSS | Tailwind v3 | Tailwind v4 |
| 캐싱 | 암시적 | `"use cache"` 명시적 캐싱 |
| 타입 안전성 | ignoreBuildErrors: true | 엄격한 TypeScript |

### 1.3 이전 버전 주요 개선 대상
- **제거**: Repository 패턴 오버엔지니어링, 주석 처리된 코드 ~1000줄, 미사용 의존성
- **수정**: TypeScript 빌드 에러 무시, ESLint 규칙 비활성화, 하드코딩된 값들
- **개선**: 3단 라우팅 → 2단 간소화, 데이터 레이어 단일화, 상수 파일 통합

---

## 2. 모노레포 구조

```
devlog_renewal/
├── apps/
│   ├── blog/                        # Next.js 16 - 블로그 (프론트엔드 + API)
│   │   ├── src/
│   │   │   ├── app/                 # App Router
│   │   │   ├── components/          # 블로그 전용 컴포넌트
│   │   │   ├── lib/                 # 블로그 유틸리티
│   │   │   ├── hooks/               # 커스텀 훅
│   │   │   └── config/              # 사이트 설정
│   │   ├── public/                  # 정적 자원
│   │   ├── next.config.ts
│   │   ├── tailwind.config.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── admin/                       # React 19 SPA - 관리자 패널
│       ├── src/
│       │   ├── pages/               # 라우트 페이지
│       │   ├── components/          # 어드민 전용 컴포넌트
│       │   ├── hooks/               # 커스텀 훅
│       │   ├── lib/                 # 유틸리티
│       │   └── config/              # 어드민 설정
│       ├── index.html
│       ├── vite.config.ts
│       ├── tailwind.config.ts
│       ├── tsconfig.json
│       └── package.json
│
├── packages/
│   ├── ui/                          # 공유 UI 컴포넌트
│   │   ├── src/
│   │   │   ├── components/          # 공통 컴포넌트
│   │   │   └── index.ts             # 배럴 export
│   │   ├── tailwind.config.ts       # 기본 Tailwind 설정
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── database/                    # Supabase 클라이언트 + 타입
│   │   ├── src/
│   │   │   ├── client.ts            # 브라우저용 클라이언트
│   │   │   ├── server.ts            # 서버용 클라이언트 (Next.js)
│   │   │   ├── types.ts             # 자동 생성 DB 타입
│   │   │   └── index.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── types/                       # 공유 TypeScript 타입
│   │   ├── src/
│   │   │   ├── post.ts
│   │   │   ├── comment.ts
│   │   │   ├── contact.ts
│   │   │   └── index.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── typescript-config/           # 공유 TypeScript 설정
│   │   ├── base.json
│   │   ├── nextjs.json
│   │   ├── react-vite.json
│   │   └── package.json
│   │
│   └── eslint-config/              # 공유 ESLint 설정
│       ├── base.js
│       ├── nextjs.js
│       ├── react.js
│       └── package.json
│
├── supabase/                        # Supabase 로컬 개발 설정
│   ├── migrations/                  # DB 마이그레이션
│   ├── seed.sql                     # 시드 데이터
│   └── config.toml
│
├── turbo.json                       # Turborepo 파이프라인
├── pnpm-workspace.yaml              # pnpm 워크스페이스
├── package.json                     # 루트 package.json
├── .gitignore
├── .env.example                     # 환경변수 템플릿
└── DESIGN.md                        # 이 문서
```

---

## 3. 데이터베이스 설계 (Supabase)

### 3.1 ERD

```
┌──────────────┐     ┌──────────────────┐     ┌──────────────┐
│  categories  │     │      posts       │     │     tags     │
├──────────────┤     ├──────────────────┤     ├──────────────┤
│ id (PK)      │──┐  │ id (PK, uuid)    │  ┌──│ id (PK)      │
│ name         │  │  │ title            │  │  │ name         │
│ slug         │  └─▶│ category_id (FK) │  │  │ slug         │
│ description  │     │ slug             │  │  │ created_at   │
│ sort_order   │     │ content          │  │  └──────────────┘
│ created_at   │     │ excerpt          │  │
└──────────────┘     │ thumbnail_url    │  │  ┌──────────────┐
                     │ status           │  │  │  post_tags   │
                     │ is_featured      │  │  ├──────────────┤
                     │ view_count       │  └─▶│ post_id (FK) │
                     │ published_at     │  ┌─▶│ tag_id (FK)  │
                     │ created_at       │──┘  └──────────────┘
                     │ updated_at       │
                     └──────────────────┘
                              │
                              │
                     ┌────────┴─────────┐
                     │                  │
              ┌──────────────┐   ┌──────────────┐
              │   comments   │   │   contacts   │
              ├──────────────┤   ├──────────────┤
              │ id (PK)      │   │ id (PK)      │
              │ post_id (FK) │   │ name         │
              │ author_name  │   │ email        │
              │ content      │   │ subject      │
              │ password     │   │ message      │
              │ is_approved  │   │ is_read      │
              │ parent_id    │   │ created_at   │
              │ created_at   │   └──────────────┘
              └──────────────┘
```

### 3.2 테이블 상세

#### `categories`
| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|----------|------|
| id | serial | PK | 자동 증가 ID |
| name | varchar(50) | NOT NULL, UNIQUE | 카테고리명 (예: "Tech", "Life") |
| slug | varchar(50) | NOT NULL, UNIQUE | URL 슬러그 |
| description | text | | 카테고리 설명 |
| sort_order | int | DEFAULT 0 | 정렬 순서 |
| created_at | timestamptz | DEFAULT now() | 생성일 |

#### `posts`
| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|----------|------|
| id | uuid | PK, DEFAULT gen_random_uuid() | 고유 ID |
| title | varchar(200) | NOT NULL | 포스트 제목 |
| category_id | int | FK → categories.id, NOT NULL | 카테고리 |
| slug | varchar(200) | NOT NULL | URL 슬러그 |
| content | text | NOT NULL | 마크다운 본문 |
| excerpt | varchar(500) | | 요약 (목록용) |
| thumbnail_url | text | | 썸네일 이미지 URL (Supabase Storage) |
| status | varchar(20) | DEFAULT 'draft' | 'draft' / 'published' / 'archived' |
| is_featured | boolean | DEFAULT false | 메인 노출 여부 |
| view_count | int | DEFAULT 0 | 조회수 |
| published_at | timestamptz | | 발행일 |
| created_at | timestamptz | DEFAULT now() | 생성일 |
| updated_at | timestamptz | DEFAULT now() | 수정일 |

> **UNIQUE 제약**: (category_id, slug) - 카테고리 내 슬러그 유일

#### `tags`
| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|----------|------|
| id | serial | PK | 자동 증가 ID |
| name | varchar(50) | NOT NULL, UNIQUE | 태그명 |
| slug | varchar(50) | NOT NULL, UNIQUE | URL 슬러그 |
| created_at | timestamptz | DEFAULT now() | 생성일 |

#### `post_tags` (다대다 관계)
| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|----------|------|
| post_id | uuid | FK → posts.id ON DELETE CASCADE | 포스트 |
| tag_id | int | FK → tags.id ON DELETE CASCADE | 태그 |

> **PK**: (post_id, tag_id)

#### `comments`
| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|----------|------|
| id | serial | PK | 자동 증가 ID |
| post_id | uuid | FK → posts.id ON DELETE CASCADE, NOT NULL | 포스트 |
| author_name | varchar(50) | NOT NULL | 작성자명 |
| content | text | NOT NULL | 댓글 내용 |
| password | varchar(255) | NOT NULL | bcrypt 해시 (비회원 댓글 삭제용) |
| is_approved | boolean | DEFAULT true | 승인 여부 (어드민 관리) |
| parent_id | int | FK → comments.id ON DELETE CASCADE | 대댓글 (자기 참조) |
| created_at | timestamptz | DEFAULT now() | 작성일 |

#### `contacts` (문의하기)
| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|----------|------|
| id | serial | PK | 자동 증가 ID |
| name | varchar(100) | NOT NULL | 문의자 이름 |
| email | varchar(255) | NOT NULL | 이메일 |
| subject | varchar(200) | NOT NULL | 제목 |
| message | text | NOT NULL | 내용 |
| is_read | boolean | DEFAULT false | 읽음 여부 |
| created_at | timestamptz | DEFAULT now() | 문의일 |

### 3.3 RLS (Row Level Security) 정책

```sql
-- posts: 발행된 포스트만 공개 조회 / 어드민만 전체 CRUD
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published posts are viewable by everyone"
  ON posts FOR SELECT
  USING (status = 'published');

CREATE POLICY "Admins can do everything"
  ON posts FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- comments: 승인된 댓글만 공개 / 누구나 작성 / 어드민만 관리
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Approved comments are viewable"
  ON comments FOR SELECT
  USING (is_approved = true);

CREATE POLICY "Anyone can create comments"
  ON comments FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can manage comments"
  ON comments FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- contacts: 누구나 작성 / 어드민만 조회
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit contact"
  ON contacts FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can read contacts"
  ON contacts FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin');

-- categories, tags: 공개 조회 / 어드민만 관리
-- (동일 패턴 적용)
```

### 3.4 인덱스

```sql
CREATE INDEX idx_posts_status_published ON posts(status, published_at DESC)
  WHERE status = 'published';
CREATE INDEX idx_posts_category ON posts(category_id);
CREATE INDEX idx_posts_slug ON posts(category_id, slug);
CREATE INDEX idx_posts_featured ON posts(is_featured) WHERE is_featured = true;
CREATE INDEX idx_comments_post ON comments(post_id, created_at);
CREATE INDEX idx_contacts_unread ON contacts(is_read) WHERE is_read = false;
```

---

## 4. Blog App 설계 (Next.js 16)

### 4.1 라우팅 구조

```
src/app/
├── layout.tsx                       # 루트 레이아웃 (메타데이터, 테마, 폰트)
├── page.tsx                         # / 메인 페이지
├── globals.css                      # Tailwind v4 글로벌 스타일
├── not-found.tsx                    # 404
├── error.tsx                        # 에러 바운더리
│
├── post/
│   ├── page.tsx                     # /post - 전체 포스트 목록
│   ├── [category]/
│   │   ├── page.tsx                 # /post/tech - 카테고리별 목록
│   │   └── [slug]/
│   │       └── page.tsx             # /post/tech/my-post - 상세
│
├── contact/
│   └── page.tsx                     # /contact - 문의하기 폼
│
├── api/
│   ├── comments/
│   │   └── route.ts                 # POST: 댓글 작성 / DELETE: 댓글 삭제
│   ├── contact/
│   │   └── route.ts                 # POST: 문의 제출
│   └── views/
│       └── [postId]/
│           └── route.ts             # POST: 조회수 증가
│
└── sitemap.ts                       # 동적 사이트맵 생성
```

### 4.2 주요 설계 결정

**라우팅 간소화**: 이전 3단(`[onedepth]/[category]/[slug]`) → 2단(`[category]/[slug]`)

**캐싱 전략**:
```typescript
// 포스트 목록 - 시간 기반 캐시
"use cache";
import { cacheLife } from 'next/cache';

export default async function PostListPage() {
  cacheLife('hours');
  const posts = await getPublishedPosts();
  return <PostList posts={posts} />;
}

// 포스트 상세 - 태그 기반 캐시 (어드민 수정 시 무효화)
"use cache";
import { cacheLife, cacheTag } from 'next/cache';

export default async function PostDetailPage({ params }) {
  const { slug, category } = await params;
  cacheTag(`post-${slug}`);
  cacheLife('days');
  const post = await getPost(category, slug);
  return <PostDetail post={post} />;
}
```

**비동기 params** (Next.js 16 필수):
```typescript
export default async function Page({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const { category, slug } = await params;
  // ...
}
```

**마크다운 렌더링**: Supabase에 저장된 마크다운 → `next-mdx-remote`로 렌더링
```typescript
// lib/mdx.ts
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

### 4.3 컴포넌트 구조

```
src/components/
├── layout/
│   ├── Header.tsx                   # 네비게이션 헤더
│   ├── Footer.tsx                   # 푸터
│   └── ThemeToggle.tsx              # 다크모드 토글
│
├── post/
│   ├── PostCard.tsx                 # 포스트 카드 (목록용)
│   ├── PostList.tsx                 # 포스트 목록
│   ├── PostDetail.tsx               # 포스트 상세 레이아웃
│   ├── PostHead.tsx                 # 제목, 메타 정보
│   ├── PostBody.tsx                 # MDX 렌더링 영역
│   └── PostFooter.tsx               # 관련 포스트, 태그
│
├── comment/
│   ├── CommentList.tsx              # 댓글 목록 (트리 구조)
│   ├── CommentItem.tsx              # 댓글 단일 항목
│   └── CommentForm.tsx              # 댓글 작성 폼
│
├── mdx/
│   ├── MDXComponents.tsx            # MDX 커스텀 컴포넌트 매핑
│   ├── CodeBlock.tsx                # 코드 블록
│   ├── Callout.tsx                  # 콜아웃 박스
│   └── MDXImage.tsx                 # 이미지 (Supabase Storage)
│
├── common/
│   ├── SearchPost.tsx               # 검색 (실제 구현)
│   ├── CategoryFilter.tsx           # 카테고리 필터
│   └── TagFilter.tsx                # 태그 필터
│
└── contact/
    └── ContactForm.tsx              # 문의하기 폼
```

### 4.4 데이터 페칭

```typescript
// lib/posts.ts - 단일 데이터 접근 모듈 (Repository 패턴 제거)
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

### 4.5 SEO

```typescript
// app/post/[category]/[slug]/page.tsx
export async function generateMetadata({ params }: Props): Promise<Metadata> {
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

// app/sitemap.ts
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getAllPublishedSlugs();
  return posts.map((post) => ({
    url: `https://yourdomain.com/post/${post.category_slug}/${post.slug}`,
    lastModified: post.updated_at,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));
}
```

---

## 5. Admin App 설계 (React 19 + Vite)

### 5.1 기술 스택

| 항목 | 선택 | 이유 |
|------|------|------|
| 프레임워크 | React 19 | 최신 기능 (React Compiler, useOptimistic) |
| 빌드 도구 | Vite | SPA에 최적, 빠른 HMR |
| 라우팅 | React Router v7 | SPA 라우팅 표준 |
| 상태관리 | TanStack Query | 서버 상태 관리 + 캐싱 |
| UI 컴포넌트 | shadcn/ui | 블로그와 일관된 디자인 시스템 |
| 마크다운 에디터 | @uiw/react-md-editor | 마크다운 작성 + 프리뷰 |
| 폼 관리 | React Hook Form + Zod | 타입 안전한 폼 검증 |
| 스타일링 | Tailwind CSS v4 | 블로그와 동일 |

### 5.2 라우팅 구조

```
/login                               # 로그인
/dashboard                           # 대시보드 (요약 통계)
/posts                               # 포스트 목록
/posts/new                           # 포스트 작성
/posts/:id/edit                      # 포스트 수정
/comments                            # 댓글 관리
/contacts                            # 문의 관리
```

### 5.3 페이지별 기능

#### 대시보드 (`/dashboard`)
- 전체 포스트 수 / 발행 포스트 수
- 최근 댓글 5개
- 미읽은 문의 수
- 오늘 총 조회수

#### 포스트 관리 (`/posts`)
- 포스트 목록 (상태 필터: 전체/발행/초안/보관)
- 포스트 작성/수정:
  - 제목, 카테고리 선택, 태그 입력 (자동완성)
  - 마크다운 에디터 (프리뷰 지원)
  - 썸네일 업로드 (Supabase Storage)
  - 요약 입력
  - 발행/초안 저장/예약 발행
- 포스트 삭제 (보관 처리)

#### 댓글 관리 (`/comments`)
- 댓글 목록 (승인/미승인 필터)
- 댓글 승인/거부/삭제
- 포스트별 댓글 보기

#### 문의 관리 (`/contacts`)
- 문의 목록 (읽음/미읽음 필터)
- 문의 상세 보기
- 읽음 처리

### 5.4 인증 흐름

```
1. /login → Supabase Auth (email/password)
2. 로그인 성공 → JWT 토큰 저장 (HTTP-only cookie)
3. 모든 API 요청 → Supabase RLS가 admin role 검증
4. 토큰 만료 → 자동 갱신 또는 재로그인
```

```typescript
// admin/src/lib/auth.ts
import { createClient } from '@repo/database/client';

export async function signIn(email: string, password: string) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

// 라우트 가드
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" />;
  return children;
}
```

### 5.5 컴포넌트 구조

```
src/
├── pages/
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   ├── PostListPage.tsx
│   ├── PostEditorPage.tsx
│   ├── CommentListPage.tsx
│   └── ContactListPage.tsx
│
├── components/
│   ├── layout/
│   │   ├── AdminLayout.tsx          # 사이드바 + 헤더 레이아웃
│   │   ├── Sidebar.tsx              # 좌측 네비게이션
│   │   └── AdminHeader.tsx          # 상단 헤더
│   │
│   ├── post/
│   │   ├── PostTable.tsx            # 포스트 목록 테이블
│   │   ├── PostEditor.tsx           # 마크다운 에디터
│   │   ├── PostMetaForm.tsx         # 메타 정보 폼 (카테고리, 태그, 썸네일)
│   │   └── ThumbnailUploader.tsx    # 썸네일 업로드
│   │
│   ├── comment/
│   │   ├── CommentTable.tsx         # 댓글 목록 테이블
│   │   └── CommentActions.tsx       # 승인/거부/삭제 버튼
│   │
│   ├── contact/
│   │   ├── ContactTable.tsx         # 문의 목록 테이블
│   │   └── ContactDetail.tsx        # 문의 상세 모달
│   │
│   └── common/
│       ├── DataTable.tsx            # 재사용 테이블 컴포넌트
│       ├── StatusBadge.tsx          # 상태 뱃지
│       └── ConfirmDialog.tsx        # 확인 다이얼로그
│
├── hooks/
│   ├── useAuth.ts                   # 인증 상태 관리
│   ├── usePosts.ts                  # 포스트 TanStack Query 훅
│   ├── useComments.ts               # 댓글 TanStack Query 훅
│   └── useContacts.ts               # 문의 TanStack Query 훅
│
└── lib/
    ├── auth.ts                      # 인증 유틸
    └── api.ts                       # Supabase 쿼리 함수
```

---

## 6. 공유 패키지 설계

### 6.1 `@repo/database`

Supabase 클라이언트 설정과 자동 생성 타입을 관리.

```typescript
// packages/database/src/client.ts (브라우저용 - Admin SPA)
import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './types';

export function createClient() {
  return createBrowserClient<Database>(
    process.env.VITE_SUPABASE_URL!,  // Vite 환경변수
    process.env.VITE_SUPABASE_ANON_KEY!,
  );
}

// packages/database/src/server.ts (서버용 - Next.js)
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from './types';

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    },
  );
}
```

타입 자동 생성:
```bash
pnpm supabase gen types typescript --local > packages/database/src/types.ts
```

### 6.2 `@repo/types`

앱 간 공유되는 비즈니스 타입.

```typescript
// packages/types/src/post.ts
export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  thumbnail_url: string | null;
  status: 'draft' | 'published' | 'archived';
  is_featured: boolean;
  view_count: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  category: Category;
  tags: Tag[];
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
}

// packages/types/src/comment.ts
export interface Comment {
  id: number;
  post_id: string;
  author_name: string;
  content: string;
  is_approved: boolean;
  parent_id: number | null;
  created_at: string;
  replies?: Comment[];
}

// packages/types/src/contact.ts
export interface Contact {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
}
```

### 6.3 `@repo/ui`

블로그와 어드민에서 공유하는 기본 UI 컴포넌트. shadcn/ui 기반.

공유 대상:
- Button, Input, Textarea, Select
- Dialog, Dropdown, Toast
- Badge, Skeleton, Spinner
- Tailwind 기본 설정 (색상, 폰트, 간격)

비공유 (앱별 관리):
- 블로그 전용 컴포넌트 (PostCard, MDX 등)
- 어드민 전용 컴포넌트 (DataTable, Sidebar 등)

---

## 7. Turborepo 설정

### 7.1 turbo.json

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "typecheck": {
      "dependsOn": ["^build"]
    },
    "db:generate": {
      "cache": false
    }
  }
}
```

### 7.2 pnpm-workspace.yaml

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

### 7.3 루트 package.json (스크립트)

```json
{
  "scripts": {
    "dev": "turbo dev",
    "dev:blog": "turbo dev --filter=blog",
    "dev:admin": "turbo dev --filter=admin",
    "build": "turbo build",
    "lint": "turbo lint",
    "typecheck": "turbo typecheck",
    "db:start": "supabase start",
    "db:stop": "supabase stop",
    "db:generate": "supabase gen types typescript --local > packages/database/src/types.ts",
    "db:migrate": "supabase db push",
    "db:reset": "supabase db reset"
  }
}
```

---

## 8. 환경변수

### 8.1 블로그 (apps/blog/.env.local)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Analytics
NEXT_PUBLIC_GA_ID=

# Site
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

### 8.2 어드민 (apps/admin/.env.local)

```env
# Supabase
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

### 8.3 .env.example (루트)

```env
# Supabase (로컬 개발용은 supabase start 시 자동 제공)
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Google Analytics
GA_ID=G-XXXXXXXXXX
```

---

## 9. 주요 의존성

### 9.1 Blog (apps/blog)

| 패키지 | 용도 |
|--------|------|
| next@16 | 프레임워크 |
| react@19 / react-dom@19 | UI |
| @supabase/ssr | 서버 사이드 Supabase |
| next-mdx-remote | MDX 렌더링 |
| rehype-pretty-code | 코드 하이라이팅 |
| next-themes | 다크모드 |
| tailwindcss@4 | 스타일링 |
| dayjs | 날짜 포맷 |

### 9.2 Admin (apps/admin)

| 패키지 | 용도 |
|--------|------|
| react@19 / react-dom@19 | UI |
| vite | 빌드 도구 |
| react-router@7 | SPA 라우팅 |
| @tanstack/react-query | 서버 상태 관리 |
| @supabase/supabase-js | Supabase 클라이언트 |
| @uiw/react-md-editor | 마크다운 에디터 |
| react-hook-form + zod | 폼 검증 |
| tailwindcss@4 | 스타일링 |
| dayjs | 날짜 포맷 |

### 9.3 제거된 의존성 (v1 대비)

| 패키지 | 제거 이유 |
|--------|-----------|
| framer-motion | React 19 View Transitions로 대체 가능 |
| zustand | 블로그에 불필요 (어드민은 TanStack Query) |
| gray-matter | Supabase DB 기반으로 전환 |
| sharp | Next.js 16 내장 이미지 최적화 활용 |
| shikiji | rehype-pretty-code 내장 shiki 사용 |
| path (npm) | Node.js 내장 |

---

## 10. 구현 로드맵

### Phase 1: 프로젝트 초기화 (1일)

```
1.1 Turborepo 모노레포 세팅
    - pnpm workspace 초기화
    - turbo.json 설정
    - 공유 TypeScript/ESLint 설정

1.2 Supabase 프로젝트 설정
    - 로컬 Supabase 세팅 (supabase init)
    - DB 마이그레이션 파일 작성 (테이블, RLS, 인덱스)
    - 시드 데이터 작성

1.3 공유 패키지 초기화
    - @repo/database (Supabase 클라이언트)
    - @repo/types (공유 타입)
    - @repo/ui (기본 컴포넌트)
    - @repo/typescript-config
    - @repo/eslint-config
```

### Phase 2: Blog 앱 기본 구조 (2-3일)

```
2.1 Next.js 16 앱 생성 및 기본 설정
    - 라우팅 구조 설정
    - 레이아웃 (Header, Footer, ThemeToggle)
    - Tailwind v4 + 다크모드 설정

2.2 메인 페이지
    - Featured 포스트 섹션
    - 최신 포스트 목록

2.3 포스트 목록/상세 페이지
    - 카테고리별 필터링
    - MDX 렌더링 (코드 하이라이팅)
    - SEO 메타데이터
    - "use cache" 적용

2.4 댓글 시스템
    - 댓글 목록 (대댓글 트리)
    - 댓글 작성 폼 (비회원: 이름 + 비밀번호)
    - 댓글 삭제 (비밀번호 확인)

2.5 문의하기 페이지
    - 폼 UI + 유효성 검증
    - API Route → Supabase insert

2.6 검색 기능
    - 포스트 제목/내용 검색 (Supabase full-text search)
```

### Phase 3: Admin 앱 (2-3일)

```
3.1 Vite + React 19 세팅
    - 라우팅 (React Router v7)
    - TanStack Query 설정
    - 인증 (Supabase Auth)
    - AdminLayout (사이드바 + 헤더)

3.2 포스트 관리
    - 목록 (상태 필터, 페이지네이션)
    - 마크다운 에디터 (작성/수정)
    - 썸네일 업로드 (Supabase Storage)
    - 발행/초안/보관 상태 관리

3.3 댓글 관리
    - 목록 (승인 상태 필터)
    - 승인/거부/삭제 액션

3.4 문의 관리
    - 목록 (읽음/미읽음 필터)
    - 상세 보기 + 읽음 처리
```

### Phase 4: 마무리 (1-2일)

```
4.1 블로그 디자인 완성
    - 반응형 디자인
    - 다크모드 완성
    - 로딩 스켈레톤

4.2 성능 최적화
    - 이미지 최적화 (next/image + Supabase Storage)
    - 사이트맵 생성
    - RSS 피드

4.3 배포 준비
    - 환경변수 정리
    - Vercel (블로그) 배포 설정
    - 어드민 배포 (Vercel 또는 별도)
    - Supabase 프로덕션 설정
```

---

## 11. 배포 전략

| 앱 | 플랫폼 | 이유 |
|----|--------|------|
| Blog (Next.js 16) | Vercel | Next.js 최적 지원, Edge Runtime, ISR |
| Admin (React SPA) | Vercel (Static) | 간단한 SPA 정적 배포 |
| Database | Supabase Cloud | 매니지드 PostgreSQL, Auth, Storage |

Vercel에서 Turborepo 지원으로 하나의 레포에서 두 앱 모두 배포 가능.

---

## 12. 요약

이 설계는 이전 버전의 문제점을 체계적으로 해소합니다:

| 이전 문제 | 해결 방식 |
|-----------|-----------|
| Repository 패턴 오버엔지니어링 | `lib/posts.ts` 단일 모듈 + Supabase 직접 쿼리 |
| 파일 기반 MDX 관리 어려움 | Supabase DB + 어드민 패널 |
| TypeScript 빌드 에러 무시 | 엄격한 TypeScript 설정 (shared config) |
| ESLint 규칙 비활성화 | 공유 ESLint 설정으로 일관된 규칙 |
| 미사용 의존성 다수 | 최소한의 의존성만 포함 |
| 주석 처리된 코드 산재 | 클린 코드로 새로 시작 |
| 3단 라우팅 복잡성 | 2단 라우팅 (`[category]/[slug]`) |
| 검색 미구현 | Supabase full-text search 활용 |
| 댓글/관련 포스트 미완성 | 설계 단계에서 포함 |
