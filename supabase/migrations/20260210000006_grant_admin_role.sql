-- =============================================================
-- newabekar@naver.com 계정에 admin 권한 부여
-- app_metadata.role = 'admin' → RLS is_admin() 함수에서 사용
-- =============================================================

-- 이미 가입된 유저에 대해 admin role 부여
UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'newabekar@naver.com';
