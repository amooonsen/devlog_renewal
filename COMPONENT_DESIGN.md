# Component Refactoring Design

## 개요

3가지 리팩토링 수행:
1. **shadcn UI 마이그레이션** - raw HTML 요소 → shadcn 컴포넌트
2. **React Hook Form 전환** - useState 폼 → RHF + Zod
3. **es-hangul 검색** - 한글 초성/자모 검색 기능 추가

---

## 1. 현재 상태 분석

### Blog App - Raw HTML 요소 목록

| 파일 | 요소 | 수량 | 대체 컴포넌트 |
|------|------|------|---------------|
| `components/contact/ContactForm.tsx` | input, textarea, label, button | 11 | Input, Textarea, Label, Button |
| `components/comment/CommentForm.tsx` | input, textarea, button | 5 | Input, Textarea, Button |
| `components/comment/CommentItem.tsx` | input, button | 5 | Input, Button |
| `components/layout/ThemeToggle.tsx` | button | 1 | Button (variant=ghost, size=icon) |
| `app/error.tsx` | button | 1 | Button |

**총 23개 raw HTML 요소 → shadcn 컴포넌트 전환 필요**

### Blog App - useState 폼

| 파일 | 필드 수 | 유효성 검사 | 변환 |
|------|---------|------------|------|
| `ContactForm.tsx` | 4 (name, email, subject, message) | 수동 empty check + API 응답 | RHF + Zod |
| `CommentForm.tsx` | 3 (authorName, content, password) | 수동 empty check | RHF + Zod |
| `CommentItem.tsx` | 1 (password) | 수동 empty check | 단순하므로 useState 유지 |

### Admin App - 잔여 항목

| 파일 | 요소 | 처리 |
|------|------|------|
| `pages/LoginPage.tsx` | useState 폼 | RHF + Zod 전환 |
| `pages/PostEditorPage.tsx` | raw button (태그 토글) | Badge 또는 Toggle 컴포넌트 |
| `components/post/ThumbnailUploader.tsx` | hidden file input | 유지 (의도적 패턴) |

### 검색 기능 - 현재 없음

- 블로그: CategoryFilter만 존재, 텍스트 검색 없음
- Admin: Tab 필터만 존재, 검색 없음

---

## 2. 의존성 추가

### Blog App (`apps/blog/package.json`)

```
react-hook-form    # 폼 상태 관리
@hookform/resolvers # Zod 연동
zod                # 스키마 유효성 검사
es-hangul          # 한글 검색
```

### Admin App - 이미 설치됨

- `react-hook-form`, `zod`, `@hookform/resolvers` 설치 완료
- `es-hangul`만 추가

---

## 3. 변경 계획

### Phase A: shadcn UI 마이그레이션

#### A-1. `ContactForm.tsx` 리팩토링

**Before:**
```tsx
<label htmlFor="name" className="text-sm font-medium">이름</label>
<input id="name" type="text" className="h-10 w-full rounded-md ..." />
<button type="submit" className="h-10 w-full rounded-md bg-primary ...">문의하기</button>
```

**After:**
```tsx
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Textarea } from "@repo/ui/textarea";
import { Label } from "@repo/ui/label";

<Label htmlFor="name">이름</Label>
<Input id="name" type="text" placeholder="홍길동" />
<Button type="submit" disabled={submitting} className="w-full sm:w-auto">문의하기</Button>
```

#### A-2. `CommentForm.tsx` 리팩토링

```tsx
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Textarea } from "@repo/ui/textarea";

<Input type="text" placeholder="이름" maxLength={50} />
<Input type="password" placeholder="비밀번호" />
<Textarea placeholder="댓글을 작성하세요..." rows={3} />
<Button type="submit">댓글 등록</Button>
<Button type="button" variant="ghost" onClick={onCancel}>취소</Button>
```

#### A-3. `CommentItem.tsx` 리팩토링

```tsx
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";

<Button variant="ghost" size="sm" onClick={onReply}>답글</Button>
<Button variant="ghost" size="sm" onClick={...}>삭제</Button>
{/* 삭제 확인 */}
<Input type="password" placeholder="비밀번호" className="h-8 w-40" />
<Button size="sm" variant="destructive" onClick={handleDelete}>확인</Button>
<Button size="sm" variant="ghost" onClick={cancel}>취소</Button>
```

#### A-4. `ThemeToggle.tsx` 리팩토링

```tsx
import { Button } from "@repo/ui/button";

<Button variant="ghost" size="icon" onClick={toggle} aria-label="테마 전환">
  {/* sun/moon SVG */}
</Button>
```

#### A-5. `error.tsx` 리팩토링

```tsx
import { Button } from "@repo/ui/button";

<Button onClick={reset}>다시 시도</Button>
```

#### A-6. Admin `PostEditorPage.tsx` 태그 토글

```tsx
import { Badge } from "@repo/ui/badge";

<Badge
  variant={selected ? "default" : "outline"}
  className="cursor-pointer"
  onClick={toggle}
>
  {tag.name}
</Badge>
```

---

### Phase B: React Hook Form + Zod 전환

#### B-1. Zod 스키마 정의 (`apps/blog/src/lib/schemas.ts`)

```typescript
import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().min(1, "이름을 입력해주세요.").max(50),
  email: z.string().min(1, "이메일을 입력해주세요.").email("올바른 이메일을 입력해주세요."),
  subject: z.string().min(1, "제목을 입력해주세요.").max(200, "제목은 200자 이내로 입력해주세요."),
  message: z.string().min(1, "내용을 입력해주세요."),
});

export const commentSchema = z.object({
  author_name: z.string().min(1, "이름을 입력해주세요.").max(50, "이름은 50자 이내로 입력해주세요."),
  content: z.string().min(1, "댓글을 입력해주세요.").max(1000, "댓글은 1000자 이내로 입력해주세요."),
  password: z.string().min(1, "비밀번호를 입력해주세요."),
});

export const loginSchema = z.object({
  email: z.string().min(1, "이메일을 입력해주세요.").email("올바른 이메일을 입력해주세요."),
  password: z.string().min(1, "비밀번호를 입력해주세요."),
});

export type ContactFormValues = z.infer<typeof contactSchema>;
export type CommentFormValues = z.infer<typeof commentSchema>;
export type LoginFormValues = z.infer<typeof loginSchema>;
```

#### B-2. `ContactForm.tsx` → RHF 전환

**Before (useState × 6 + 수동 검증):**
```tsx
const [name, setName] = useState("");
const [email, setEmail] = useState("");
// ... 4 more states
if (!name.trim() || !email.trim() || ...) { setError("..."); return; }
```

**After (RHF + Zod):**
```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactSchema, type ContactFormValues } from "@/lib/schemas";

const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ContactFormValues>({
  resolver: zodResolver(contactSchema),
});

const onSubmit = async (data: ContactFormValues) => {
  const res = await fetch("/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) { /* 서버 에러 처리 */ }
  reset();
  setSuccess(true);
};

<form onSubmit={handleSubmit(onSubmit)}>
  <Label htmlFor="name">이름</Label>
  <Input id="name" {...register("name")} />
  {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
  ...
  <Button type="submit" disabled={isSubmitting}>문의하기</Button>
</form>
```

**개선 효과:**
- useState 6개 → 0개 (RHF 내부 관리)
- 수동 validation → Zod 스키마 자동 검증
- 필드별 에러 메시지 표시

#### B-3. `CommentForm.tsx` → RHF 전환

동일 패턴 적용. `parentId`, `postId`는 prop으로 유지하고 submit 시 병합.

```tsx
const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<CommentFormValues>({
  resolver: zodResolver(commentSchema),
});

const onSubmit = async (data: CommentFormValues) => {
  await fetch("/api/comments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...data, post_id: postId, parent_id: parentId }),
  });
  reset();
  onSuccess();
};
```

#### B-4. Admin `LoginPage.tsx` → RHF 전환

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginFormValues } from "../lib/schemas";

const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormValues>({
  resolver: zodResolver(loginSchema),
});
```

---

### Phase C: es-hangul 검색 기능

#### C-1. 검색 유틸 (`apps/blog/src/lib/search.ts`)

```typescript
import { getChoseong, disassemble } from "es-hangul";

export function matchesKoreanSearch(text: string, query: string): boolean {
  if (!query.trim()) return true;

  const normalizedQuery = query.trim().toLowerCase();
  const normalizedText = text.toLowerCase();

  // 1. 일반 문자열 포함 검색
  if (normalizedText.includes(normalizedQuery)) return true;

  // 2. 초성 검색 (입력이 모두 자음인 경우)
  const isChoseongOnly = /^[ㄱ-ㅎ]+$/.test(normalizedQuery);
  if (isChoseongOnly) {
    const choseong = getChoseong(text);
    return choseong.includes(normalizedQuery);
  }

  // 3. 자모 분해 검색 (입력 도중 부분 매칭)
  const decomposedText = disassemble(normalizedText);
  const decomposedQuery = disassemble(normalizedQuery);
  return decomposedText.includes(decomposedQuery);
}
```

#### C-2. SearchInput 컴포넌트 (`apps/blog/src/components/common/SearchInput.tsx`)

```tsx
"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@repo/ui/input";

interface SearchInputProps {
  basePath: string;
  placeholder?: string;
}

export function SearchInput({ basePath, placeholder = "검색..." }: SearchInputProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [, startTransition] = useTransition();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    startTransition(() => {
      const params = new URLSearchParams(searchParams);
      if (value) {
        params.set("q", value);
        params.delete("page"); // 검색 시 페이지 초기화
      } else {
        params.delete("q");
      }
      router.push(`${basePath}?${params.toString()}`);
    });
  };

  return (
    <Input
      type="search"
      value={query}
      onChange={handleChange}
      placeholder={placeholder}
      className="max-w-sm"
    />
  );
}
```

#### C-3. 검색 API (`apps/blog/src/app/api/search/route.ts`)

서버사이드에서 Supabase full-text search + es-hangul 클라이언트 필터링 결합.

```typescript
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase";
import { matchesKoreanSearch } from "@/lib/search";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query?.trim()) {
    return NextResponse.json({ data: [] });
  }

  const supabase = await createClient() as any;

  // Supabase full-text search (PostgreSQL)
  const { data: posts } = await supabase
    .from("posts")
    .select("id, title, slug, excerpt, thumbnail_url, published_at, categories(name, slug)")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(50);

  // es-hangul 클라이언트 필터링 (초성 + 자모 검색)
  const filtered = (posts ?? []).filter((post: any) =>
    matchesKoreanSearch(post.title, query) ||
    (post.excerpt && matchesKoreanSearch(post.excerpt, query))
  );

  return NextResponse.json({ data: filtered.slice(0, 20) });
}
```

#### C-4. 포스트 목록 페이지에 검색 통합

`apps/blog/src/app/post/page.tsx`에 SearchInput 추가:

```tsx
<SearchInput basePath="/post" placeholder="포스트 검색 (초성 검색 가능)" />
<CategoryFilter categories={categories} />
<PostList posts={posts} />
```

searchParams에서 `q` 파라미터를 읽어 서버에서 필터링하거나 API 호출.

---

## 4. 파일 변경 요약

### 새로 생성

| 파일 | 설명 |
|------|------|
| `apps/blog/src/lib/schemas.ts` | Zod 스키마 (contact, comment) |
| `apps/blog/src/lib/search.ts` | es-hangul 검색 유틸 |
| `apps/blog/src/components/common/SearchInput.tsx` | 검색 입력 컴포넌트 |
| `apps/blog/src/app/api/search/route.ts` | 검색 API 엔드포인트 |
| `apps/admin/src/lib/schemas.ts` 에 loginSchema 추가 | Zod 로그인 스키마 |

### 수정

| 파일 | 변경 내용 |
|------|----------|
| `apps/blog/src/components/contact/ContactForm.tsx` | shadcn UI + RHF + Zod |
| `apps/blog/src/components/comment/CommentForm.tsx` | shadcn UI + RHF + Zod |
| `apps/blog/src/components/comment/CommentItem.tsx` | shadcn Button + Input |
| `apps/blog/src/components/layout/ThemeToggle.tsx` | shadcn Button |
| `apps/blog/src/app/error.tsx` | shadcn Button |
| `apps/blog/src/app/post/page.tsx` | SearchInput 추가 |
| `apps/admin/src/pages/LoginPage.tsx` | RHF + Zod 전환 |
| `apps/admin/src/pages/PostEditorPage.tsx` | 태그 토글 → Badge |

### 패키지 설치

```bash
# Blog
pnpm --filter blog add react-hook-form @hookform/resolvers zod es-hangul

# Admin
pnpm --filter admin add es-hangul
```

---

## 5. 구현 순서

```
Phase A: shadcn UI (5개 파일) ─── 독립적, 바로 시작
Phase B: RHF + Zod (4개 파일) ─── Phase A 이후 (같은 파일 수정)
Phase C: es-hangul 검색 (4개 파일) ─── 독립적, 병렬 가능
```

**권장 순서:**
1. 의존성 설치 (pnpm add)
2. `lib/schemas.ts` 생성 (B의 기반)
3. Phase A + Phase B 동시 (파일별로 shadcn + RHF 한 번에 적용)
4. Phase C (검색 기능)
5. 빌드 검증
