# Skill: API Route 생성

> Next.js 16 Blog 앱의 API Route 생성 패턴

## 기본 템플릿

```tsx
// apps/blog/src/app/api/{resource}/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@repo/database/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 1. 입력 검증
    if (!body.requiredField) {
      return NextResponse.json(
        { error: '필수 필드가 누락되었습니다' },
        { status: 400 }
      );
    }

    // 2. Supabase 작업
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('table_name')
      .insert(body)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // 3. 성공 응답
    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
```

## 동적 파라미터 라우트

```tsx
// apps/blog/src/app/api/{resource}/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;  // Next.js 16: 비동기 params
  // ...
}
```

## 프로젝트 API 목록

| 경로 | 메서드 | 기능 | Body |
|------|--------|------|------|
| `/api/comments` | POST | 댓글 작성 | `{ post_id, author_name, content, password, parent_id? }` |
| `/api/comments` | DELETE | 댓글 삭제 | `{ comment_id, password }` |
| `/api/contact` | POST | 문의 제출 | `{ name, email, subject, message }` |
| `/api/views/[postId]` | POST | 조회수 증가 | - |

## 필수 확인사항
- [ ] try-catch로 에러 핸들링
- [ ] 입력 검증 (필수 필드, 타입, 길이)
- [ ] 적절한 HTTP 상태 코드 (200, 201, 400, 404, 500)
- [ ] `await params` (동적 라우트)
- [ ] Supabase 에러 핸들링
