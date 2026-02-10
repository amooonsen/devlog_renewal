# Admin App Technical Specification

> React 19 + Vite SPA 관리자 패널 구현 스펙 - 인증, CRUD, 페이지 기능

## 라우팅 구조 (React Router v7)

```
/login          → LoginPage.tsx       (공개)
/dashboard      → DashboardPage.tsx   (인증 필요)
/posts          → PostListPage.tsx    (인증 필요)
/posts/new      → PostEditorPage.tsx  (인증 필요)
/posts/:id/edit → PostEditorPage.tsx  (인증 필요)
/comments       → CommentListPage.tsx (인증 필요)
/contacts       → ContactListPage.tsx (인증 필요)
```

## 인증 (Supabase Auth)

### signIn (lib/auth.ts)
```typescript
import { createClient } from '@repo/database/client';

export async function signIn(email: string, password: string) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}
```

### ProtectedRoute
```typescript
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" />;
  return children;
}
```

### useAuth 훅
- Supabase `onAuthStateChange` 구독
- user, session, loading 상태 관리
- signIn, signOut 메서드 제공

## 페이지별 기능 상세

### 대시보드 (`/dashboard`)
| 위젯 | 쿼리 | 표시 |
|-------|------|------|
| 포스트 통계 | `posts.select('status').count()` | 전체/발행/초안/보관 수 |
| 최근 댓글 | `comments.select('*').order('created_at').limit(5)` | 최근 5개 |
| 미읽은 문의 | `contacts.select('*').eq('is_read', false).count()` | 미읽은 수 |
| 오늘 조회수 | `posts.select('view_count').gte('updated_at', today)` | 오늘 총합 |

### 포스트 목록 (`/posts`)
- **필터**: 상태별 (전체/발행/초안/보관)
- **정렬**: 생성일 내림차순 (기본)
- **페이지네이션**: offset 기반
- **액션**: 수정 (→ /posts/:id/edit), 삭제 (→ archived 상태 변경)

### 포스트 에디터 (`/posts/new`, `/posts/:id/edit`)
- **폼 필드**:
  - title (varchar 200, 필수)
  - category_id (Select, 필수)
  - tags (자동완성 multi-select)
  - content (마크다운 에디터, 필수)
  - excerpt (varchar 500)
  - thumbnail (파일 업로드 → Supabase Storage)
  - status (draft/published/archived)
  - is_featured (boolean)
  - published_at (날짜 선택, 발행 시)
- **에디터**: `@uiw/react-md-editor` (프리뷰 지원)
- **폼 검증**: react-hook-form + zod
- **썸네일 업로드**: Supabase Storage → `thumbnails/` 버킷
- **캐시 무효화**: 발행/수정 시 `revalidateTag('post-{slug}')` 호출

### Zod 스키마
```typescript
import { z } from 'zod';

export const postSchema = z.object({
  title: z.string().min(1).max(200),
  category_id: z.number().positive(),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/),
  content: z.string().min(1),
  excerpt: z.string().max(500).optional(),
  thumbnail_url: z.string().url().optional(),
  status: z.enum(['draft', 'published', 'archived']),
  is_featured: z.boolean().default(false),
  published_at: z.string().datetime().optional(),
});
```

### 댓글 관리 (`/comments`)
- **필터**: 승인 상태 (전체/승인/미승인)
- **포스트별 보기**: post_id로 그룹핑
- **액션**:
  - 승인: `UPDATE comments SET is_approved = true WHERE id = ?`
  - 거부: `UPDATE comments SET is_approved = false WHERE id = ?`
  - 삭제: `DELETE FROM comments WHERE id = ?`

### 문의 관리 (`/contacts`)
- **필터**: 읽음 상태 (전체/읽음/미읽음)
- **상세 보기**: 모달 또는 확장 행으로 전문 확인
- **읽음 처리**: `UPDATE contacts SET is_read = true WHERE id = ?`

## TanStack Query 훅

### usePosts
```typescript
// 목록
useQuery({ queryKey: ['posts', filter], queryFn: () => fetchPosts(filter) })

// 생성
useMutation({ mutationFn: createPost, onSuccess: invalidateQueries(['posts']) })

// 수정
useMutation({ mutationFn: updatePost, onSuccess: invalidateQueries(['posts', id]) })
```

### useComments
```typescript
useQuery({ queryKey: ['comments', filter], queryFn: () => fetchComments(filter) })
useMutation({ mutationFn: approveComment })
useMutation({ mutationFn: deleteComment })
```

### useContacts
```typescript
useQuery({ queryKey: ['contacts', filter], queryFn: () => fetchContacts(filter) })
useMutation({ mutationFn: markAsRead })
```

## 컴포넌트 목록

| 컴포넌트 | 위치 | 역할 |
|----------|------|------|
| AdminLayout | layout/ | 사이드바 + 헤더 래퍼 |
| Sidebar | layout/ | 좌측 네비게이션 |
| AdminHeader | layout/ | 상단 헤더 (유저 정보, 로그아웃) |
| PostTable | post/ | 포스트 목록 테이블 |
| PostEditor | post/ | 마크다운 에디터 래퍼 |
| PostMetaForm | post/ | 메타 정보 폼 (카테고리, 태그, 썸네일) |
| ThumbnailUploader | post/ | 썸네일 파일 업로드 |
| CommentTable | comment/ | 댓글 목록 테이블 |
| CommentActions | comment/ | 승인/거부/삭제 버튼 그룹 |
| ContactTable | contact/ | 문의 목록 테이블 |
| ContactDetail | contact/ | 문의 상세 모달 |
| DataTable | common/ | 재사용 테이블 (정렬, 필터, 페이지네이션) |
| StatusBadge | common/ | 상태 뱃지 (draft/published/archived) |
| ConfirmDialog | common/ | 삭제 등 확인 다이얼로그 |

## 파일 구조

```
apps/admin/src/
├── pages/
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   ├── PostListPage.tsx
│   ├── PostEditorPage.tsx
│   ├── CommentListPage.tsx
│   └── ContactListPage.tsx
├── components/
│   ├── layout/        (AdminLayout, Sidebar, AdminHeader)
│   ├── post/          (PostTable, PostEditor, PostMetaForm, ThumbnailUploader)
│   ├── comment/       (CommentTable, CommentActions)
│   ├── contact/       (ContactTable, ContactDetail)
│   └── common/        (DataTable, StatusBadge, ConfirmDialog)
├── hooks/
│   ├── useAuth.ts
│   ├── usePosts.ts
│   ├── useComments.ts
│   └── useContacts.ts
├── lib/
│   ├── auth.ts
│   └── api.ts
└── config/
```
