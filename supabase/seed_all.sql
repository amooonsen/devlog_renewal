-- =============================================================
-- Complete Seed Data for DevLog
-- 카테고리 3개 + 포스트 3개 + 각 포스트당 댓글 3개
-- =============================================================

-- 기존 데이터 삭제 (재실행 가능하도록)
TRUNCATE TABLE comments CASCADE;
TRUNCATE TABLE post_tags CASCADE;
TRUNCATE TABLE posts CASCADE;
TRUNCATE TABLE tags CASCADE;
TRUNCATE TABLE categories CASCADE;
TRUNCATE TABLE contacts CASCADE;

-- =============================================================
-- 1. Categories (3개)
-- =============================================================
INSERT INTO categories (name, slug, description, sort_order) VALUES
  ('Tech', 'tech', '기술 관련 포스트', 1),
  ('Life', 'life', '일상 이야기', 2),
  ('Dev', 'dev', '개발 이야기', 3);

-- =============================================================
-- 2. Tags (8개)
-- =============================================================
INSERT INTO tags (name, slug) VALUES
  ('JavaScript', 'javascript'),
  ('TypeScript', 'typescript'),
  ('React', 'react'),
  ('Next.js', 'nextjs'),
  ('Supabase', 'supabase'),
  ('CSS', 'css'),
  ('Node.js', 'nodejs'),
  ('DevOps', 'devops');

-- =============================================================
-- 3. Posts (3개)
-- =============================================================
INSERT INTO posts (title, category_id, slug, content, excerpt, status, is_featured, view_count, published_at) VALUES
  -- Post 1: Hello DevLog
  (
    'DevLog 블로그를 새롭게 시작합니다',
    (SELECT id FROM categories WHERE slug = 'dev'),
    'hello-devlog',
    '# DevLog 블로그를 새롭게 시작합니다

안녕하세요! 새로운 DevLog 블로그에 오신 것을 환영합니다.

## 왜 새로 만들었나요?

이전 버전의 블로그에서 몇 가지 개선할 점을 발견하고, Next.js 16과 Supabase를 활용하여 더 나은 블로그를 만들기로 했습니다.

## 기술 스택

- **Frontend**: Next.js 16 + React 19
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Admin**: React 19 + Vite
- **Monorepo**: Turborepo
- **Styling**: Tailwind CSS v4
- **Deployment**: Vercel

## 주요 특징

### 1. 빠른 성능
Turbopack 기본 적용으로 개발 및 빌드 속도가 50% 향상되었습니다.

### 2. 보안
Supabase RLS(Row Level Security)로 데이터베이스 레벨의 보안을 구현했습니다.

### 3. 관리자 패널
별도의 Admin 앱으로 포스트 작성 및 관리가 편리합니다.

앞으로 다양한 개발 이야기를 공유하겠습니다!',
    'DevLog 블로그를 Turborepo + Next.js 16 + Supabase 기반으로 새롭게 시작합니다.',
    'published',
    true,
    156,
    now()
  ),

  -- Post 2: Next.js 16
  (
    'Next.js 16에서 달라진 점들',
    (SELECT id FROM categories WHERE slug = 'tech'),
    'nextjs-16-changes',
    '# Next.js 16에서 달라진 점들

Next.js 16은 많은 변화를 가져왔습니다. 주요 변경사항을 정리해봤습니다.

## 주요 변경사항

### 1. Turbopack 기본 적용

Webpack 대신 Turbopack이 기본 번들러로 설정됩니다.

```json
// Before (Next.js 15)
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build"
  }
}

// After (Next.js 16)
{
  "scripts": {
    "dev": "next dev",
    "build": "next build"
  }
}
```

### 2. 비동기 Request APIs

`params`, `searchParams`, `cookies()`, `headers()` 등이 모두 비동기로 변경되었습니다.

```typescript
// Before (Next.js 15)
export default function Page({ params }: { params: { slug: string } }) {
  const { slug } = params;
}

// After (Next.js 16)
export default async function Page({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params;
}
```

### 3. "use cache" 지시어

명시적 캐싱으로 전환되었습니다.

```typescript
"use cache";
import { cacheLife } from "next/cache";

export default async function Page() {
  cacheLife("hours");
  const data = await fetchData();
  return <div>{data}</div>;
}
```

### 4. middleware → proxy

`middleware.ts` 파일명이 `proxy.ts`로 변경되었습니다.

```typescript
// proxy.ts
export function proxy(request: Request) {
  // proxy logic
}
```

## 마이그레이션 팁

1. Codemod 사용: `npx @next/codemod@canary upgrade latest`
2. TypeScript 타입 업데이트
3. 점진적 마이그레이션 (비동기 API부터)

자세한 내용은 [공식 문서](https://nextjs.org/docs)를 참고하세요!',
    'Next.js 16의 주요 변경사항: Turbopack 기본 적용, 비동기 params, use cache 지시어 등',
    'published',
    false,
    89,
    now() - interval '1 day'
  ),

  -- Post 3: Supabase RLS
  (
    'Supabase RLS 완벽 가이드',
    (SELECT id FROM categories WHERE slug = 'tech'),
    'supabase-rls-guide',
    '# Supabase RLS 완벽 가이드

Row Level Security(RLS)는 Supabase의 핵심 보안 기능입니다.

## RLS란?

PostgreSQL의 기능으로, 데이터베이스 레벨에서 **행 단위 접근 제어**를 제공합니다.

## 왜 RLS가 필요한가?

### 기존 방식의 문제점

```typescript
// ❌ 애플리케이션 코드에서 권한 체크
async function getPosts(userId: string) {
  if (!userId) throw new Error("Unauthorized");
  return db.posts.where({ user_id: userId });
}
```

문제:
- 코드에서 권한 체크를 깜빡할 수 있음
- 모든 API에 일일이 권한 체크 코드 작성
- 보안 로직이 분산됨

### RLS 방식

```sql
-- ✅ 데이터베이스 레벨에서 권한 제어
CREATE POLICY "user_read_own"
  ON posts FOR SELECT
  USING (auth.uid() = user_id);
```

장점:
- 데이터베이스가 자동으로 권한 체크
- 코드 간소화
- 보안 정책 중앙 관리

## 기본 사용법

### 1. RLS 활성화

```sql
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
```

### 2. 정책 생성

```sql
-- 공개 포스트 읽기
CREATE POLICY "public_read_published"
  ON posts FOR SELECT
  USING (status = ''published'');

-- 본인 포스트 수정
CREATE POLICY "user_update_own"
  ON posts FOR UPDATE
  USING (auth.uid() = user_id);
```

### 3. 클라이언트 코드

```typescript
// RLS가 자동으로 권한 체크
const { data } = await supabase
  .from("posts")
  .select("*");
  // 권한 체크 코드 불필요!
```

## 실전 예제

### 블로그 포스트 RLS

```sql
-- 1. 누구나 published 포스트 읽기
CREATE POLICY "anyone_read_published"
  ON posts FOR SELECT
  USING (status = ''published'');

-- 2. Admin만 모든 포스트 읽기
CREATE POLICY "admin_read_all"
  ON posts FOR SELECT
  USING (
    auth.jwt() ->> ''role'' = ''admin''
  );

-- 3. Admin만 포스트 생성/수정/삭제
CREATE POLICY "admin_manage"
  ON posts FOR ALL
  USING (
    auth.jwt() ->> ''role'' = ''admin''
  );
```

## 주의사항

1. **기본적으로 모두 거부**: RLS 활성화 시 모든 접근이 차단됨
2. **정책 순서**: OR 연산으로 동작 (하나라도 통과하면 OK)
3. **성능**: 인덱스 활용 필수

RLS를 활용하면 안전하고 깔끔한 코드를 작성할 수 있습니다!',
    'Supabase Row Level Security(RLS)의 개념과 실전 사용법을 알아봅니다.',
    'published',
    false,
    42,
    now() - interval '2 days'
  );

-- =============================================================
-- 4. Post-Tags 연결
-- =============================================================
INSERT INTO post_tags (post_id, tag_id)
SELECT p.id, t.id FROM posts p, tags t
WHERE p.slug = 'hello-devlog' AND t.slug IN ('nextjs', 'supabase', 'react');

INSERT INTO post_tags (post_id, tag_id)
SELECT p.id, t.id FROM posts p, tags t
WHERE p.slug = 'nextjs-16-changes' AND t.slug IN ('nextjs', 'typescript', 'react');

INSERT INTO post_tags (post_id, tag_id)
SELECT p.id, t.id FROM posts p, tags t
WHERE p.slug = 'supabase-rls-guide' AND t.slug IN ('supabase', 'devops');

-- =============================================================
-- 5. Comments (각 포스트당 3개씩, 총 9개)
-- =============================================================

-- Post 1: hello-devlog (3개)
INSERT INTO comments (post_id, author_name, content, password, is_approved, created_at)
SELECT
  p.id,
  v.author_name,
  v.content,
  '$2a$10$placeholder_hash_for_dev_seed',
  true,
  v.created_at
FROM posts p, (VALUES
  ('방문자', '새 블로그 기대됩니다! 응원합니다.', now() - interval '1 hour'),
  ('이현수', 'Next.js 16 + Supabase 조합 정말 좋네요! 저도 따라서 만들어보고 싶습니다.', now() - interval '2 hours'),
  ('박지은', 'Turborepo 모노레포 구조도 궁금합니다. 다음 포스트 기대할게요!', now() - interval '5 hours')
) AS v(author_name, content, created_at)
WHERE p.slug = 'hello-devlog';

-- Post 2: nextjs-16-changes (3개)
INSERT INTO comments (post_id, author_name, content, password, is_approved, created_at)
SELECT
  p.id,
  v.author_name,
  v.content,
  '$2a$10$placeholder_hash_for_dev_seed',
  true,
  v.created_at
FROM posts p, (VALUES
  ('김태현', 'Turbopack 정말 빠르네요! 개발 경험이 확실히 좋아졌습니다.', now() - interval '3 hours'),
  ('정민지', '비동기 params가 처음엔 헷갈렸는데, 익숙해지니 더 명확한 것 같아요.', now() - interval '6 hours'),
  ('최승환', 'use cache 지시어 관련해서 더 자세한 설명 부탁드립니다!', now() - interval '1 day')
) AS v(author_name, content, created_at)
WHERE p.slug = 'nextjs-16-changes';

-- Post 3: supabase-rls-guide (3개)
INSERT INTO comments (post_id, author_name, content, password, is_approved, created_at)
SELECT
  p.id,
  v.author_name,
  v.content,
  '$2a$10$placeholder_hash_for_dev_seed',
  true,
  v.created_at
FROM posts p, (VALUES
  ('윤서준', 'RLS 정책 설정이 생각보다 복잡하네요. 좋은 자료 감사합니다!', now() - interval '4 hours'),
  ('장하은', 'JWT role 기반 RLS 정책도 알려주시면 좋을 것 같습니다.', now() - interval '8 hours'),
  ('강민석', '실전 프로젝트에서 RLS 적용하니 보안이 확실히 좋아졌어요. 추천합니다!', now() - interval '2 days')
) AS v(author_name, content, created_at)
WHERE p.slug = 'supabase-rls-guide';

-- =============================================================
-- 6. Sample Contacts (3개)
-- =============================================================
INSERT INTO contacts (name, email, subject, message, created_at) VALUES
  (
    '김개발',
    'dev@example.com',
    '협업 문의',
    '안녕하세요, 블로그 잘 보고 있습니다. 협업 관련 문의드립니다.',
    now() - interval '1 hour'
  ),
  (
    '이지훈',
    'jihun.lee@example.com',
    '블로그 디자인 문의',
    '안녕하세요. 블로그 디자인이 깔끔하네요. 어떤 UI 라이브러리를 사용하셨는지 궁금합니다.',
    now() - interval '1 day'
  ),
  (
    '박소연',
    'soyeon.park@example.com',
    '기술 스택 질문',
    'Turborepo 모노레포 구조에 대해 더 알고 싶습니다. 관련 포스트 작성 계획이 있으신가요?',
    now() - interval '2 days'
  );

-- =============================================================
-- 완료 메시지
-- =============================================================
DO $$
BEGIN
  RAISE NOTICE '✅ Seed data inserted successfully!';
  RAISE NOTICE '📊 Summary:';
  RAISE NOTICE '   - Categories: 3';
  RAISE NOTICE '   - Tags: 8';
  RAISE NOTICE '   - Posts: 3 (all published)';
  RAISE NOTICE '   - Comments: 9 (3 per post)';
  RAISE NOTICE '   - Contacts: 3';
END $$;
