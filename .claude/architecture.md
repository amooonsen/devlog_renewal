# Architecture

> 모노레포 구조, DB 스키마, 핵심 설계 결정 요약

## Monorepo Structure

```
devlog_renewal/
├── apps/
│   ├── blog/          # Next.js 16 - 블로그 프론트엔드 + API Routes
│   └── admin/         # React 19 SPA (Vite) - 관리자 패널
├── packages/
│   ├── ui/            # 공유 UI 컴포넌트 (shadcn/ui 기반)
│   ├── database/      # Supabase 클라이언트 + 자동 생성 타입
│   ├── types/         # 공유 TypeScript 비즈니스 타입
│   ├── typescript-config/  # 공유 tsconfig
│   └── eslint-config/     # 공유 ESLint 설정
├── supabase/          # DB 마이그레이션, 시드, 설정
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

## Package Dependency Map

```
apps/blog   → @repo/database(server), @repo/types, @repo/ui
apps/admin  → @repo/database(client), @repo/types, @repo/ui
@repo/ui    → @repo/typescript-config
@repo/database → @repo/typescript-config
@repo/types → @repo/typescript-config
```

## Database Schema (Supabase PostgreSQL)

### ERD Summary

```
categories (1) ──→ (N) posts (N) ←──→ (N) tags
                         │                    via post_tags
                         ├── (N) comments (self-ref: parent_id)
                         └── contacts (독립)
```

### Tables

| 테이블 | PK | 핵심 컬럼 | 비고 |
|--------|-----|-----------|------|
| categories | serial | name, slug, sort_order | UNIQUE(name, slug) |
| posts | uuid | title, slug, content, status, category_id | UNIQUE(category_id, slug) |
| tags | serial | name, slug | UNIQUE(name, slug) |
| post_tags | (post_id, tag_id) | - | 다대다 관계 |
| comments | serial | post_id, author_name, content, password(bcrypt), parent_id | 대댓글 자기참조 |
| contacts | serial | name, email, subject, message, is_read | 문의하기 |

### Post Status Flow

```
draft → published → archived
         ↑
         └── (어드민에서 상태 변경)
```

### RLS Policies

| 테이블 | 공개 | 어드민 |
|--------|------|--------|
| posts | SELECT (status='published') | ALL (role='admin') |
| comments | SELECT (is_approved=true), INSERT (anyone) | ALL (role='admin') |
| contacts | INSERT (anyone) | SELECT (role='admin') |
| categories, tags | SELECT (anyone) | ALL (role='admin') |

### Key Indexes

- `idx_posts_status_published` - 발행된 포스트 조회 최적화
- `idx_posts_category` - 카테고리별 필터링
- `idx_posts_slug` - (category_id, slug) 유니크 조회
- `idx_posts_featured` - 피처드 포스트
- `idx_comments_post` - 포스트별 댓글
- `idx_contacts_unread` - 미읽은 문의

## Blog Routing

```
/                          → 메인 (Featured + 최신 포스트)
/post                      → 전체 포스트 목록
/post/[category]           → 카테고리별 목록
/post/[category]/[slug]    → 포스트 상세
/contact                   → 문의하기 폼
/api/comments              → POST(작성), DELETE(삭제)
/api/contact               → POST(문의 제출)
/api/views/[postId]        → POST(조회수 증가)
/sitemap.ts                → 동적 사이트맵
```

## Admin Routing

```
/login                     → Supabase Auth 로그인
/dashboard                 → 대시보드 (통계 요약)
/posts                     → 포스트 목록 (상태 필터)
/posts/new                 → 포스트 작성
/posts/:id/edit            → 포스트 수정
/comments                  → 댓글 관리 (승인/거부/삭제)
/contacts                  → 문의 관리 (읽음 처리)
```

## Auth Flow (Admin)

```
1. /login → Supabase Auth (email/password)
2. 성공 → JWT 토큰 (HTTP-only cookie)
3. API 요청 → Supabase RLS가 admin role 검증
4. 토큰 만료 → 자동 갱신 또는 재로그인
```

## Caching Strategy (Blog)

| 대상 | 방식 | TTL |
|------|------|-----|
| 포스트 목록 | `"use cache"` + `cacheLife('hours')` | 시간 단위 |
| 포스트 상세 | `"use cache"` + `cacheTag('post-{slug}')` + `cacheLife('days')` | 일 단위 |
| 캐시 무효화 | 어드민 수정 시 `revalidateTag('post-{slug}')` | 즉시 |

## Key Design Decisions

| 결정 | 이유 |
|------|------|
| Turborepo 모노레포 | blog/admin 코드 공유, 일관된 빌드 파이프라인 |
| Supabase | Auth+DB+Storage 올인원, RLS로 보안, 무료 티어 |
| 2단 라우팅 | v1의 3단 라우팅 불필요한 복잡성 제거 |
| `lib/` 단일 모듈 | v1 Repository 패턴 오버엔지니어링 제거 |
| Admin을 별도 SPA | SSR 불필요, Vite로 빠른 개발, 블로그와 독립 배포 |
| `next-mdx-remote` | DB 저장 마크다운을 서버에서 렌더링 |
| shadcn/ui 공유 | blog/admin 일관된 디자인 시스템 |

## Deployment Strategy

| 앱 | 플랫폼 | 방식 | 이유 |
|----|--------|------|------|
| Blog (Next.js 16) | Vercel | SSR/Edge Runtime | Next.js 최적 지원, ISR |
| Admin (React SPA) | Vercel (Static) | 정적 빌드 배포 | 간단한 SPA, CDN 배포 |
| Database | Supabase Cloud | 매니지드 서비스 | PostgreSQL + Auth + Storage |

Vercel Turborepo 통합: 단일 레포에서 두 앱 모두 자동 배포 가능.

### 배포 흐름
```
dev 브랜치 → PR → main 머지 → Vercel 자동 배포
                                ├── apps/blog → Vercel (SSR)
                                └── apps/admin → Vercel (Static)
```
