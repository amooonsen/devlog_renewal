-- =============================================================
-- Seed Data for Development
-- =============================================================

-- =============================================================
-- Admin 유저 생성 (로컬 개발 전용)
-- Email: admin@devlog.local / Password: admin123
-- app_metadata.role = 'admin' → RLS is_admin() 함수에서 사용
-- =============================================================
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token,
  email_change, email_change_token_new, recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'a0000000-0000-0000-0000-000000000001',
  'authenticated',
  'authenticated',
  'admin@devlog.local',
  crypt('admin123', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"],"role":"admin"}'::jsonb,
  '{"name":"Admin"}'::jsonb,
  now(), now(), '', '', '', ''
) ON CONFLICT (id) DO NOTHING;

-- auth.identities 엔트리 (Supabase Auth 로그인에 필요)
INSERT INTO auth.identities (
  id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at
) VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000001',
  'admin@devlog.local',
  '{"sub":"a0000000-0000-0000-0000-000000000001","email":"admin@devlog.local"}'::jsonb,
  'email',
  now(), now(), now()
) ON CONFLICT (id, provider) DO NOTHING;

-- 기존 admin 유저가 있으면 app_metadata에 role 추가
-- (Supabase Dashboard에서 유저를 생성한 경우)
UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'admin@devlog.local'
  AND NOT (raw_app_meta_data ? 'role');

-- =============================================================
-- 프로덕션 Admin 계정 권한 부여
-- newabekar@naver.com에 admin role 부여
-- Supabase Dashboard 또는 Auth로 가입한 유저에 대해 role 추가
-- =============================================================
UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'newabekar@naver.com'
  AND (NOT (raw_app_meta_data ? 'role') OR raw_app_meta_data ->> 'role' != 'admin');

-- Categories
INSERT INTO categories (name, slug, description, sort_order) VALUES
  ('Tech', 'tech', '기술 관련 포스트', 1),
  ('Life', 'life', '일상 이야기', 2),
  ('Dev', 'dev', '개발 이야기', 3)
ON CONFLICT (slug) DO NOTHING;

-- Tags
INSERT INTO tags (name, slug) VALUES
  ('JavaScript', 'javascript'),
  ('TypeScript', 'typescript'),
  ('React', 'react'),
  ('Next.js', 'nextjs'),
  ('Supabase', 'supabase'),
  ('CSS', 'css'),
  ('Node.js', 'nodejs'),
  ('DevOps', 'devops')
ON CONFLICT (slug) DO NOTHING;

-- Sample Posts
INSERT INTO posts (title, category_id, slug, content, excerpt, status, is_featured, published_at) VALUES
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

앞으로 다양한 개발 이야기를 공유하겠습니다!',
    'DevLog 블로그를 Turborepo + Next.js 16 + Supabase 기반으로 새롭게 시작합니다.',
    'published',
    true,
    now()
  ),
  (
    'Next.js 16에서 달라진 점들',
    (SELECT id FROM categories WHERE slug = 'tech'),
    'nextjs-16-changes',
    '# Next.js 16에서 달라진 점들

Next.js 16은 많은 변화를 가져왔습니다.

## 주요 변경사항

### 1. Turbopack 기본 적용
Webpack 대신 Turbopack이 기본 번들러로 설정됩니다.

### 2. 비동기 params
```typescript
// Before
export default function Page({ params }: { params: { slug: string } }) {
  const { slug } = params;
}

// After
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
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
  // ...
}
```',
    'Next.js 16의 주요 변경사항: Turbopack 기본 적용, 비동기 params, use cache 지시어 등',
    'published',
    false,
    now() - interval '1 day'
  ),
  (
    'Supabase RLS 완벽 가이드',
    (SELECT id FROM categories WHERE slug = 'tech'),
    'supabase-rls-guide',
    '# Supabase RLS 완벽 가이드

Row Level Security(RLS)는 Supabase의 핵심 보안 기능입니다.

## RLS란?

데이터베이스 레벨에서 행 단위 접근 제어를 제공합니다.

## 기본 사용법

```sql
-- RLS 활성화
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- 정책 생성
CREATE POLICY "public_read"
  ON posts FOR SELECT
  USING (status = ''published'');
```

RLS를 활용하면 애플리케이션 코드에서 별도의 권한 체크 없이도 데이터 보안을 유지할 수 있습니다.',
    'Supabase Row Level Security(RLS)의 개념과 실전 사용법을 알아봅니다.',
    'draft',
    false,
    NULL
  );

-- Post-Tags associations
INSERT INTO post_tags (post_id, tag_id)
SELECT p.id, t.id FROM posts p, tags t
WHERE p.slug = 'hello-devlog' AND t.slug IN ('nextjs', 'supabase', 'react');

INSERT INTO post_tags (post_id, tag_id)
SELECT p.id, t.id FROM posts p, tags t
WHERE p.slug = 'nextjs-16-changes' AND t.slug IN ('nextjs', 'typescript', 'react');

INSERT INTO post_tags (post_id, tag_id)
SELECT p.id, t.id FROM posts p, tags t
WHERE p.slug = 'supabase-rls-guide' AND t.slug IN ('supabase', 'devops');

-- Sample Comments
INSERT INTO comments (post_id, author_name, content, password, is_approved) VALUES
  (
    (SELECT id FROM posts WHERE slug = 'hello-devlog'),
    '방문자',
    '새 블로그 기대됩니다! 응원합니다.',
    '$2a$10$placeholder_hash_for_dev_seed',
    true
  );

-- Sample Contact
INSERT INTO contacts (name, email, subject, message) VALUES
  ('김개발', 'dev@example.com', '협업 문의', '안녕하세요, 블로그 잘 보고 있습니다. 협업 관련 문의드립니다.');
