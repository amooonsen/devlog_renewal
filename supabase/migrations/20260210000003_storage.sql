-- =============================================================
-- Supabase Storage for post thumbnails
-- =============================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('thumbnails', 'thumbnails', true)
ON CONFLICT (id) DO NOTHING;

-- Public read for thumbnails
CREATE POLICY "thumbnails_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'thumbnails');

-- Admin upload/delete
CREATE POLICY "thumbnails_admin_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'thumbnails' AND is_admin());

CREATE POLICY "thumbnails_admin_update"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'thumbnails' AND is_admin());

CREATE POLICY "thumbnails_admin_delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'thumbnails' AND is_admin());
