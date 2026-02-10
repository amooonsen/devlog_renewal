-- =============================================================
-- Full-Text Search for Posts
-- =============================================================
-- 'simple' 사전 사용: PostgreSQL에 한국어 사전이 없으므로
-- 공백 기반 토크나이징으로 한/영 혼합 검색 부분 지원.
-- 완전한 한국어 FTS가 필요하면 pg_bigm 확장 또는 ILIKE 대안 검토.

-- 1. Generated column으로 검색 벡터 자동 생성
ALTER TABLE posts
  ADD COLUMN search_vector tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('simple', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(excerpt, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(content, '')), 'C')
  ) STORED;

-- 2. GIN 인덱스 (검색 성능 최적화)
CREATE INDEX idx_posts_search ON posts USING GIN(search_vector);

-- 3. 검색 RPC 함수
-- published 포스트만 검색, 관련도 순 정렬
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
