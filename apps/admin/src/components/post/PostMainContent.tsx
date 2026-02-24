import { Controller, useFormContext } from "react-hook-form";
import MDEditor from "@uiw/react-md-editor";
import { Input, Label, Textarea } from "@repo/ui";
import type { PostSchemaValues } from "@/lib/schemas";
import { SlugField } from "./SlugField";

interface Props {
  isEdit: boolean;
  postId: string | undefined;
  slugAvailable: boolean | null;
  slugChecking: boolean;
  onSlugAvailable: (v: boolean | null) => void;
  onSlugChecking: (v: boolean) => void;
}

// MDEditor를 별도 컴포넌트로 분리 → React Compiler가 memoize
// content 변경 시에만 리렌더링, title/slug 입력과 무관
function PostContentEditor({ error }: { error?: string }) {
  const { control } = useFormContext<PostSchemaValues>();
  return (
    <div className="space-y-2">
      <Label>내용</Label>
      <Controller
        name="content"
        control={control}
        render={({ field }) => (
          <div data-color-mode="light">
            <MDEditor
              value={field.value}
              onChange={(val) => field.onChange(val ?? "")}
              height={500}
              preview="live"
            />
          </div>
        )}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

// useWatch("title"), useWatch("slug") 제거 → 이 컴포넌트는 더 이상 title/slug 변경으로 리렌더링 안 됨
// - auto-slug: PostEditorPage의 watch(callback)에서 처리 (리렌더링 없음)
// - slug 구독: SlugField 컴포넌트로 격리
export function PostMainContent({
  isEdit,
  postId,
  slugAvailable,
  slugChecking,
  onSlugAvailable,
  onSlugChecking,
}: Props) {
  const {
    register,
    formState: { errors },
  } = useFormContext<PostSchemaValues>();

  return (
    <div className="space-y-4 lg:col-span-2">
      {/* 제목 */}
      <div className="space-y-2">
        <Label htmlFor="title">제목</Label>
        <Input
          id="title"
          placeholder="포스트 제목"
          {...register("title")}
        />
        {errors.title && (
          <p className="text-sm text-destructive">{errors.title.message}</p>
        )}
      </div>

      {/* 슬러그: useWatch("slug") 격리 + dirtyFields.slug 가드 */}
      <SlugField
        isEdit={isEdit}
        postId={postId}
        slugAvailable={slugAvailable}
        slugChecking={slugChecking}
        onSlugAvailable={onSlugAvailable}
        onSlugChecking={onSlugChecking}
      />

      {/* 마크다운 에디터: React Compiler가 memoize → title/slug 입력 시 리렌더링 안 됨 */}
      <PostContentEditor error={errors.content?.message} />

      {/* 요약 */}
      <div className="space-y-2">
        <Label htmlFor="excerpt">요약</Label>
        <Textarea
          id="excerpt"
          placeholder="포스트 요약 (최대 500자)"
          rows={3}
          {...register("excerpt")}
        />
        {errors.excerpt && (
          <p className="text-sm text-destructive">{errors.excerpt.message}</p>
        )}
      </div>
    </div>
  );
}
