# Skill: Supabase 작업

> Supabase 로컬 개발, 마이그레이션, 타입 생성 등 반복 작업 패턴

## 로컬 개발 시작/종료

```bash
# 시작 (Docker 필요)
pnpm db:start

# 종료
pnpm db:stop
```

## 마이그레이션 생성

### 1. 새 마이그레이션 파일 생성
```bash
supabase migration new {migration_name}
# → supabase/migrations/{timestamp}_{migration_name}.sql 생성
```

### 2. SQL 작성
```sql
-- supabase/migrations/{timestamp}_{migration_name}.sql

-- 테이블 생성
CREATE TABLE {table_name} (
  id serial PRIMARY KEY,
  -- 컬럼 정의
  created_at timestamptz DEFAULT now()
);

-- RLS 활성화
ALTER TABLE {table_name} ENABLE ROW LEVEL SECURITY;

-- RLS 정책
CREATE POLICY "{policy_name}"
  ON {table_name} FOR {SELECT|INSERT|ALL}
  USING ({condition});

-- 인덱스
CREATE INDEX idx_{table}_{column} ON {table_name}({column});
```

### 3. 마이그레이션 적용
```bash
pnpm db:migrate    # 프로덕션에 적용
supabase db reset  # 로컬 리셋 (모든 마이그레이션 재실행)
```

## 타입 자동 생성

```bash
# 로컬 Supabase 기반 타입 생성
pnpm db:generate
# → packages/database/src/types.ts 에 덮어쓰기
```

**타이밍**: 마이그레이션 적용 후 반드시 실행

## DB 리셋

```bash
pnpm db:reset
# → 모든 마이그레이션 재실행 + seed.sql 적용
```

## 시드 데이터

```bash
# 시드 파일 위치
supabase/seed.sql
```

## Storage 버킷 생성

```sql
-- 마이그레이션에 포함 또는 대시보드에서 수동 생성
INSERT INTO storage.buckets (id, name, public)
VALUES ('thumbnails', 'thumbnails', true);

-- Storage RLS
CREATE POLICY "Public thumbnail access"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'thumbnails');

CREATE POLICY "Admin can upload thumbnails"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'thumbnails'
    AND auth.jwt() ->> 'role' = 'admin'
  );
```

## 작업 순서 체크리스트

### 새 테이블 추가 시
1. [ ] `supabase migration new {name}` → SQL 파일 생성
2. [ ] DDL 작성 (CREATE TABLE)
3. [ ] RLS 활성화 + 정책 작성
4. [ ] 인덱스 생성 (필요 시)
5. [ ] `supabase db reset` → 로컬 적용
6. [ ] `pnpm db:generate` → 타입 재생성
7. [ ] `@repo/types`에 비즈니스 타입 추가/수정

### 컬럼 변경 시
1. [ ] `supabase migration new {name}` → SQL 파일 생성
2. [ ] ALTER TABLE 작성
3. [ ] `supabase db reset` → 로컬 적용
4. [ ] `pnpm db:generate` → 타입 재생성
5. [ ] 관련 코드 수정 (쿼리, 타입 참조)
