# Database Schema Specification

> Supabase PostgreSQL DDL, RLS, 인덱스 - 구현 시 그대로 사용 가능한 SQL

## DDL (Data Definition Language)

### categories
```sql
CREATE TABLE categories (
  id serial PRIMARY KEY,
  name varchar(50) NOT NULL UNIQUE,
  slug varchar(50) NOT NULL UNIQUE,
  description text,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
```

### posts
```sql
CREATE TABLE posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title varchar(200) NOT NULL,
  category_id int NOT NULL REFERENCES categories(id),
  slug varchar(200) NOT NULL,
  content text NOT NULL,
  excerpt varchar(500),
  thumbnail_url text,
  status varchar(20) DEFAULT 'draft',
  is_featured boolean DEFAULT false,
  view_count int DEFAULT 0,
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(category_id, slug)
);
```

### tags
```sql
CREATE TABLE tags (
  id serial PRIMARY KEY,
  name varchar(50) NOT NULL UNIQUE,
  slug varchar(50) NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);
```

### post_tags
```sql
CREATE TABLE post_tags (
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  tag_id int REFERENCES tags(id) ON DELETE CASCADE,
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
  is_approved boolean DEFAULT true,
  parent_id int REFERENCES comments(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);
```

### contacts
```sql
CREATE TABLE contacts (
  id serial PRIMARY KEY,
  name varchar(100) NOT NULL,
  email varchar(255) NOT NULL,
  subject varchar(200) NOT NULL,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
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
```

## RLS (Row Level Security)

### posts
```sql
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published posts are viewable by everyone"
  ON posts FOR SELECT
  USING (status = 'published');

CREATE POLICY "Admins can do everything"
  ON posts FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');
```

### comments
```sql
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
```

### contacts
```sql
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit contact"
  ON contacts FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can read contacts"
  ON contacts FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin');
```

### categories
```sql
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories are viewable by everyone"
  ON categories FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage categories"
  ON categories FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');
```

### tags
```sql
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tags are viewable by everyone"
  ON tags FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage tags"
  ON tags FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');
```

### post_tags
```sql
ALTER TABLE post_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Post tags are viewable by everyone"
  ON post_tags FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage post tags"
  ON post_tags FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');
```

## Indexes

```sql
CREATE INDEX idx_posts_status_published ON posts(status, published_at DESC)
  WHERE status = 'published';
CREATE INDEX idx_posts_category ON posts(category_id);
CREATE INDEX idx_posts_slug ON posts(category_id, slug);
CREATE INDEX idx_posts_featured ON posts(is_featured) WHERE is_featured = true;
CREATE INDEX idx_comments_post ON comments(post_id, created_at);
CREATE INDEX idx_contacts_unread ON contacts(is_read) WHERE is_read = false;
```

## Seed Data

```sql
-- 카테고리
INSERT INTO categories (name, slug, description, sort_order) VALUES
  ('Tech', 'tech', '기술 관련 포스트', 1),
  ('Life', 'life', '일상 관련 포스트', 2),
  ('Newsletter', 'newsletter', '뉴스레터', 3);

-- 태그
INSERT INTO tags (name, slug) VALUES
  ('React', 'react'),
  ('Next.js', 'nextjs'),
  ('TypeScript', 'typescript'),
  ('Supabase', 'supabase'),
  ('CSS', 'css');
```

## Column Quick Reference

| 테이블 | PK 타입 | 주요 FK | Status/Boolean |
|--------|---------|---------|----------------|
| categories | serial | - | - |
| posts | uuid | category_id → categories | status(draft/published/archived), is_featured |
| tags | serial | - | - |
| post_tags | composite | post_id → posts, tag_id → tags | - |
| comments | serial | post_id → posts, parent_id → self | is_approved |
| contacts | serial | - | is_read |
