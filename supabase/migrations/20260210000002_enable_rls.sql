-- =============================================================
-- Row Level Security Policies
-- =============================================================

-- Helper: Check if current user is admin
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

-- =============================================================
-- Categories: public read, admin write
-- =============================================================

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "categories_public_read"
  ON categories FOR SELECT
  USING (true);

CREATE POLICY "categories_admin_all"
  ON categories FOR ALL
  USING (is_admin());

-- =============================================================
-- Posts: published = public read, admin = full access
-- =============================================================

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

-- =============================================================
-- Tags: public read, admin write
-- =============================================================

ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tags_public_read"
  ON tags FOR SELECT
  USING (true);

CREATE POLICY "tags_admin_all"
  ON tags FOR ALL
  USING (is_admin());

-- =============================================================
-- Post Tags: follows posts policy
-- =============================================================

ALTER TABLE post_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "post_tags_public_read"
  ON post_tags FOR SELECT
  USING (true);

CREATE POLICY "post_tags_admin_all"
  ON post_tags FOR ALL
  USING (is_admin());

-- =============================================================
-- Comments: approved = public read, anyone can insert, admin manages
-- =============================================================

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

-- =============================================================
-- Contacts: anyone can insert, admin reads
-- =============================================================

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
