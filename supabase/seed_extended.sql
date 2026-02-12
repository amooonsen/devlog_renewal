-- =============================================================
-- Extended Seed Data for Development
-- 카테고리 3개, 포스트 3개, 각 포스트당 댓글 3개씩
-- =============================================================

-- 기존 seed.sql 데이터가 이미 있다고 가정하고 추가 데이터만 생성

-- Additional Comments for existing posts
DO $$
DECLARE
  post_hello_id uuid;
  post_nextjs_id uuid;
  post_supabase_id uuid;
BEGIN
  -- Get post IDs
  SELECT id INTO post_hello_id FROM posts WHERE slug = 'hello-devlog';
  SELECT id INTO post_nextjs_id FROM posts WHERE slug = 'nextjs-16-changes';
  SELECT id INTO post_supabase_id FROM posts WHERE slug = 'supabase-rls-guide';

  -- Comments for "hello-devlog" post (2개 더 추가)
  INSERT INTO comments (post_id, author_name, content, password, is_approved, created_at) VALUES
    (
      post_hello_id,
      '이현수',
      'Next.js 16 + Supabase 조합 정말 좋네요! 저도 따라서 만들어보고 싶습니다.',
      '$2a$10$placeholder_hash_for_dev_seed',
      true,
      now() - interval '2 hours'
    ),
    (
      post_hello_id,
      '박지은',
      'Turborepo 모노레포 구조도 궁금합니다. 다음 포스트 기대할게요!',
      '$2a$10$placeholder_hash_for_dev_seed',
      true,
      now() - interval '5 hours'
    );

  -- Comments for "nextjs-16-changes" post (3개 추가)
  INSERT INTO comments (post_id, author_name, content, password, is_approved, created_at) VALUES
    (
      post_nextjs_id,
      '김태현',
      'Turbopack 정말 빠르네요! 개발 경험이 확실히 좋아졌습니다.',
      '$2a$10$placeholder_hash_for_dev_seed',
      true,
      now() - interval '3 hours'
    ),
    (
      post_nextjs_id,
      '정민지',
      '비동기 params가 처음엔 헷갈렸는데, 익숙해지니 더 명확한 것 같아요.',
      '$2a$10$placeholder_hash_for_dev_seed',
      true,
      now() - interval '6 hours'
    ),
    (
      post_nextjs_id,
      '최승환',
      'use cache 지시어 관련해서 더 자세한 설명 부탁드립니다!',
      '$2a$10$placeholder_hash_for_dev_seed',
      true,
      now() - interval '1 day'
    );

  -- Comments for "supabase-rls-guide" post (3개 추가)
  INSERT INTO comments (post_id, author_name, content, password, is_approved, created_at) VALUES
    (
      post_supabase_id,
      '윤서준',
      'RLS 정책 설정이 생각보다 복잡하네요. 좋은 자료 감사합니다!',
      '$2a$10$placeholder_hash_for_dev_seed',
      true,
      now() - interval '4 hours'
    ),
    (
      post_supabase_id,
      '장하은',
      'JWT role 기반 RLS 정책도 알려주시면 좋을 것 같습니다.',
      '$2a$10$placeholder_hash_for_dev_seed',
      true,
      now() - interval '8 hours'
    ),
    (
      post_supabase_id,
      '강민석',
      '실전 프로젝트에서 RLS 적용하니 보안이 확실히 좋아졌어요. 추천합니다!',
      '$2a$10$placeholder_hash_for_dev_seed',
      true,
      now() - interval '2 days'
    );

END $$;

-- Update view counts for posts (realistic numbers)
UPDATE posts SET view_count = 156 WHERE slug = 'hello-devlog';
UPDATE posts SET view_count = 89 WHERE slug = 'nextjs-16-changes';
UPDATE posts SET view_count = 42 WHERE slug = 'supabase-rls-guide';

-- Additional Contact messages
INSERT INTO contacts (name, email, subject, message, created_at) VALUES
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
