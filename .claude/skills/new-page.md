# Skill: 페이지 생성

> Blog (Next.js 16 App Router) / Admin (React Router v7) 페이지 생성 패턴

## Blog 페이지 (Next.js 16)

### 기본 페이지 템플릿
```tsx
// apps/blog/src/app/{route}/page.tsx
"use cache";
import { cacheLife } from 'next/cache';

export default async function {Name}Page() {
  cacheLife('hours');
  // 데이터 페칭
  return (
    <main>
      {/* 구현 */}
    </main>
  );
}
```

### 동적 라우트 페이지 템플릿
```tsx
// apps/blog/src/app/{route}/[param]/page.tsx
"use cache";
import { cacheLife, cacheTag } from 'next/cache';

interface Props {
  params: Promise<{ param: string }>;
}

export default async function {Name}Page({ params }: Props) {
  const { param } = await params;  // Next.js 16: 비동기 params 필수
  cacheTag(`tag-${param}`);
  cacheLife('days');
  // 데이터 페칭
  return (
    <main>
      {/* 구현 */}
    </main>
  );
}

// SEO 메타데이터
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { param } = await params;
  // ...
  return {
    title: '',
    description: '',
    openGraph: { /* ... */ },
  };
}
```

### 캐싱 전략 선택
| 페이지 유형 | cacheLife | cacheTag | 무효화 |
|-------------|----------|----------|--------|
| 목록 (포스트 리스트) | `'hours'` | 불필요 | 시간 만료 |
| 상세 (포스트 디테일) | `'days'` | `post-{slug}` | 어드민 수정 시 revalidateTag |
| 정적 (about, contact) | `'max'` | 불필요 | 거의 없음 |

### 필수 확인사항
- [ ] `params`는 `Promise<{...}>` 타입 + `await` 사용
- [ ] `"use cache"` 지시어 + 적절한 cacheLife
- [ ] `generateMetadata` 함수 (SEO)
- [ ] Server Component로 작성 (기본)

## Admin 페이지 (React Router v7)

### 기본 페이지 템플릿
```tsx
// apps/admin/src/pages/{Name}Page.tsx
import { useQuery } from '@tanstack/react-query';

export default function {Name}Page() {
  const { data, isLoading } = use{Domain}();

  if (isLoading) return <Skeleton />;

  return (
    <div>
      <h1 className="text-2xl font-bold">{/* 페이지 제목 */}</h1>
      {/* 구현 */}
    </div>
  );
}
```

### 라우터 등록
```tsx
// App.tsx 또는 router.tsx
<Route element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
  <Route path="/dashboard" element={<DashboardPage />} />
  <Route path="/posts" element={<PostListPage />} />
  <Route path="/posts/new" element={<PostEditorPage />} />
  <Route path="/posts/:id/edit" element={<PostEditorPage />} />
  <Route path="/comments" element={<CommentListPage />} />
  <Route path="/contacts" element={<ContactListPage />} />
</Route>
<Route path="/login" element={<LoginPage />} />
```

### 필수 확인사항
- [ ] ProtectedRoute 래핑 (인증 필요 페이지)
- [ ] TanStack Query 훅 사용 (데이터 페칭)
- [ ] 로딩 상태 처리 (Skeleton/Spinner)
- [ ] 에러 상태 처리
