# Database Schema Specification

> Supabase PostgreSQL DDL, RLS, 인덱스, FTS - 구현 시 그대로 사용 가능한 SQL

## DDL (Data Definition Language)

### categories
```sql
CREATE TABLE categories (
  id serial PRIMARY KEY,
  name varchar(50) NOT NULL UNIQUE,
  slug varchar(50) NOT NULL UNIQUE,
  description text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
```

### posts
```sql
CREATE TABLE posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title varchar(200) NOT NULL,
  category_id int NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  slug varchar(200) NOT NULL,
  content text NOT NULL DEFAULT '',
  excerpt varchar(500),
  thumbnail_url text,
  status varchar(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  is_featured boolean NOT NULL DEFAULT false,
  view_count int NOT NULL DEFAULT 0,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  search_vector tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('simple', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(excerpt, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(content, '')), 'C')
  ) STORED,
  UNIQUE (category_id, slug)
);
```

### tags
```sql
CREATE TABLE tags (
  id serial PRIMARY KEY,
  name varchar(50) NOT NULL UNIQUE,
  slug varchar(50) NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);
```

### post_tags
```sql
CREATE TABLE post_tags (
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  tag_id int NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);
```

### comments
```sql
CREATE TABLE comments (
  id serial PRIMARY KEY,
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author_name varchar(50) NOT NULL,
  content text NOT NULL,
  password varchar(255) NOT NULL,
  is_approved boolean NOT NULL DEFAULT true,
  parent_id int REFERENCES comments(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
```

### contacts
```sql
CREATE TABLE contacts (
  id serial PRIMARY KEY,
  name varchar(100) NOT NULL,
  email varchar(255) NOT NULL
    CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  subject varchar(200) NOT NULL,
  message text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
```

## updated_at 자동 갱신 트리거

```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
```

## RPC Functions

### increment_view_count
```sql
CREATE OR REPLACE FUNCTION increment_view_count(p_post_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE posts
  SET view_count = view_count + 1
  WHERE id = p_post_id AND status = 'published';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### search_posts (Full-Text Search)
```sql
-- 'simple' 사전: 한국어 사전 미지원으로 공백 기반 토크나이징 사용
CREATE OR REPLACE FUNCTION search_posts(
  search_query text,
  result_limit int DEFAULT 20
)
RETURNS TABLE (
  id uuid,
  title varchar(200),
  slug varchar(200),
  excerpt varchar(500),
  thumbnail_url text,
  published_at timestamptz,
  view_count int,
  is_featured boolean,
  category_id int,
  rank real
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id, p.title, p.slug, p.excerpt, p.thumbnail_url,
    p.published_at, p.view_count, p.is_featured, p.category_id,
    ts_rank(p.search_vector, plainto_tsquery('simple', search_query)) AS rank
  FROM posts p
  WHERE p.status = 'published'
    AND p.search_vector @@ plainto_tsquery('simple', search_query)
  ORDER BY rank DESC
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## RLS (Row Level Security)

### Helper Function
```sql
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN (
    SELECT coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
      false
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### posts
```sql
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "posts_public_read_published"
  ON posts FOR SELECT
  USING (status = 'published' OR is_admin());

CREATE POLICY "posts_admin_insert"
  ON posts FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "posts_admin_update"
  ON posts FOR UPDATE
  USING (is_admin());

CREATE POLICY "posts_admin_delete"
  ON posts FOR DELETE
  USING (is_admin());
```

### comments
```sql
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "comments_public_read_approved"
  ON comments FOR SELECT
  USING (is_approved = true OR is_admin());

CREATE POLICY "comments_anyone_insert"
  ON comments FOR INSERT
  WITH CHECK (true);

CREATE POLICY "comments_admin_update"
  ON comments FOR UPDATE
  USING (is_admin());

CREATE POLICY "comments_admin_delete"
  ON comments FOR DELETE
  USING (is_admin());
```

### contacts
```sql
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "contacts_anyone_insert"
  ON contacts FOR INSERT
  WITH CHECK (true);

CREATE POLICY "contacts_admin_read"
  ON contacts FOR SELECT
  USING (is_admin());

CREATE POLICY "contacts_admin_update"
  ON contacts FOR UPDATE
  USING (is_admin());

CREATE POLICY "contacts_admin_delete"
  ON contacts FOR DELETE
  USING (is_admin());
```

### categories
```sql
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "categories_public_read"
  ON categories FOR SELECT
  USING (true);

CREATE POLICY "categories_admin_all"
  ON categories FOR ALL
  USING (is_admin());
```

### tags
```sql
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tags_public_read"
  ON tags FOR SELECT
  USING (true);

CREATE POLICY "tags_admin_all"
  ON tags FOR ALL
  USING (is_admin());
```

### post_tags
```sql
ALTER TABLE post_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "post_tags_public_read"
  ON post_tags FOR SELECT
  USING (true);

CREATE POLICY "post_tags_admin_all"
  ON post_tags FOR ALL
  USING (is_admin());
```

## Storage

```sql
-- thumbnails 버킷 (public read)
INSERT INTO storage.buckets (id, name, public)
VALUES ('thumbnails', 'thumbnails', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "thumbnails_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'thumbnails');

CREATE POLICY "thumbnails_admin_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'thumbnails' AND is_admin());

CREATE POLICY "thumbnails_admin_update"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'thumbnails' AND is_admin());

CREATE POLICY "thumbnails_admin_delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'thumbnails' AND is_admin());
```

## Indexes

```sql
CREATE INDEX idx_posts_status_published ON posts(status, published_at DESC)
  WHERE status = 'published';
CREATE INDEX idx_posts_category ON posts(category_id);
CREATE INDEX idx_posts_featured ON posts(is_featured) WHERE is_featured = true;
CREATE INDEX idx_posts_search ON posts USING GIN(search_vector);
CREATE INDEX idx_comments_post ON comments(post_id, created_at);
CREATE INDEX idx_contacts_unread ON contacts(is_read) WHERE is_read = false;
```

> Note: `UNIQUE(category_id, slug)` 제약조건이 자동으로 인덱스를 생성하므로 별도 slug 인덱스 불필요.

## Seed Data

```sql
INSERT INTO categories (name, slug, description, sort_order) VALUES
  ('Tech', 'tech', '기술 관련 포스트', 1),
  ('Life', 'life', '일상 이야기', 2),
  ('Dev', 'dev', '개발 이야기', 3)
ON CONFLICT (slug) DO NOTHING;

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
```

## Migration Files

| 순서 | 파일 | 내용 |
|------|------|------|
| 1 | `20260210000001_create_tables.sql` | 테이블, 인덱스, 트리거, view count RPC |
| 2 | `20260210000002_enable_rls.sql` | RLS 정책, is_admin() 헬퍼 |
| 3 | `20260210000003_storage.sql` | thumbnails 버킷, 스토리지 정책 |
| 4 | `20260210000004_improvements.sql` | 중복 인덱스 제거, comments.updated_at, email CHECK |
| 5 | `20260210000005_fulltext_search.sql` | search_vector, GIN 인덱스, search_posts RPC |

## Column Quick Reference

| 테이블 | PK 타입 | 주요 FK | Status/Boolean | Timestamps |
|--------|---------|---------|----------------|------------|
| categories | serial | - | - | created_at |
| posts | uuid | category_id → categories | status(draft/published/archived), is_featured | created_at, updated_at |
| tags | serial | - | - | created_at |
| post_tags | composite | post_id → posts, tag_id → tags | - | - |
| comments | serial | post_id → posts, parent_id → self | is_approved | created_at, updated_at |
| contacts | serial | - | is_read | created_at |
