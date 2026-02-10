-- =============================================================
-- DevLog Database Schema
-- =============================================================

-- 1. Categories
CREATE TABLE categories (
  id serial PRIMARY KEY,
  name varchar(50) NOT NULL UNIQUE,
  slug varchar(50) NOT NULL UNIQUE,
  description text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Posts
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
  UNIQUE (category_id, slug)
);

-- 3. Tags
CREATE TABLE tags (
  id serial PRIMARY KEY,
  name varchar(50) NOT NULL UNIQUE,
  slug varchar(50) NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 4. Post-Tags (many-to-many)
CREATE TABLE post_tags (
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  tag_id int NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

-- 5. Comments
CREATE TABLE comments (
  id serial PRIMARY KEY,
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author_name varchar(50) NOT NULL,
  content text NOT NULL,
  password varchar(255) NOT NULL,
  is_approved boolean NOT NULL DEFAULT true,
  parent_id int REFERENCES comments(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 6. Contacts
CREATE TABLE contacts (
  id serial PRIMARY KEY,
  name varchar(100) NOT NULL,
  email varchar(255) NOT NULL,
  subject varchar(200) NOT NULL,
  message text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- =============================================================
-- Indexes
-- =============================================================

CREATE INDEX idx_posts_status_published ON posts(status, published_at DESC)
  WHERE status = 'published';
CREATE INDEX idx_posts_category ON posts(category_id);
CREATE INDEX idx_posts_slug ON posts(category_id, slug);
CREATE INDEX idx_posts_featured ON posts(is_featured)
  WHERE is_featured = true;
CREATE INDEX idx_comments_post ON comments(post_id, created_at);
CREATE INDEX idx_contacts_unread ON contacts(is_read)
  WHERE is_read = false;

-- =============================================================
-- Auto-update updated_at trigger
-- =============================================================

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

-- =============================================================
-- View count increment function (for RPC)
-- =============================================================

CREATE OR REPLACE FUNCTION increment_view_count(p_post_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE posts
  SET view_count = view_count + 1
  WHERE id = p_post_id AND status = 'published';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
