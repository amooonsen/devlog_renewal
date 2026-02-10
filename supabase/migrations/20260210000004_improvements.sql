-- =============================================================
-- Schema Improvements
-- =============================================================

-- 1. 중복 인덱스 제거
-- UNIQUE(category_id, slug) 제약조건이 이미 동일 컬럼에 인덱스를 자동 생성하므로
-- idx_posts_slug는 불필요한 중복
DROP INDEX IF EXISTS idx_posts_slug;

-- 2. comments 테이블에 updated_at 추가
-- 어드민에서 승인/거부 시 변경 시간 추적
ALTER TABLE comments
  ADD COLUMN updated_at timestamptz NOT NULL DEFAULT now();

CREATE TRIGGER comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- 3. contacts.email 형식 검증 (DB 레벨 방어)
ALTER TABLE contacts
  ADD CONSTRAINT contacts_email_format
  CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
