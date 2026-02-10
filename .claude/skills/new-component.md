# Skill: 컴포넌트 생성

> 블로그/어드민 앱에서 새 컴포넌트를 생성할 때의 반복 패턴

## Blog 컴포넌트 (Server Component 기본)

### 위치 결정
```
apps/blog/src/components/
├── layout/    → Header, Footer, 네비게이션 관련
├── post/      → 포스트 표시 관련
├── comment/   → 댓글 관련
├── mdx/       → MDX 렌더링 관련
├── common/    → 검색, 필터 등 공통
└── contact/   → 문의 관련
```

### Server Component 템플릿
```tsx
// components/{domain}/{Name}.tsx
import type { Post } from '@repo/types';

interface {Name}Props {
  // props 정의
}

export default function {Name}({ ...props }: {Name}Props) {
  return (
    <div>
      {/* 구현 */}
    </div>
  );
}
```

### Client Component 템플릿 (인터랙션 필요 시)
```tsx
// components/{domain}/{Name}.tsx
"use client";

import { useState } from 'react';

interface {Name}Props {
  // props 정의
}

export default function {Name}({ ...props }: {Name}Props) {
  return (
    <div>
      {/* 구현 */}
    </div>
  );
}
```

### Client 전환 판단 기준
| 필요한 기능 | Server | Client |
|-------------|--------|--------|
| 데이터 페칭 | O | - |
| 정적 UI 렌더링 | O | - |
| onClick/onChange 등 이벤트 | - | O |
| useState/useEffect | - | O |
| 브라우저 API (window, localStorage) | - | O |
| 폼 입력 | - | O |

## Admin 컴포넌트 (Client Component)

### 위치 결정
```
apps/admin/src/components/
├── layout/    → AdminLayout, Sidebar, AdminHeader
├── post/      → 포스트 관리 관련
├── comment/   → 댓글 관리 관련
├── contact/   → 문의 관리 관련
└── common/    → 재사용 테이블, 뱃지, 다이얼로그
```

### 기본 템플릿
```tsx
// components/{domain}/{Name}.tsx
interface {Name}Props {
  // props 정의
}

export default function {Name}({ ...props }: {Name}Props) {
  return (
    <div>
      {/* 구현 */}
    </div>
  );
}
```

## 체크리스트

- [ ] 도메인 폴더 선택 (layout/post/comment/mdx/common/contact)
- [ ] Server vs Client 결정
- [ ] Props interface 정의
- [ ] import 순서: React → 외부 → @repo/* → 프로젝트 내부
- [ ] TypeScript strict (no any)
