import { useEffect } from "react";
import { useWatch, useFormContext } from "react-hook-form";
import { AlertCircle, CheckCircle } from "lucide-react";
import { Input, Label } from "@repo/ui";
import { checkSlugAvailability } from "@/lib/api";
import type { PostSchemaValues } from "@/lib/schemas";

interface Props {
  isEdit: boolean;
  postId: string | undefined;
  slugAvailable: boolean | null;
  slugChecking: boolean;
  onSlugAvailable: (v: boolean | null) => void;
  onSlugChecking: (v: boolean) => void;
}

// useWatch("slug")를 이 컴포넌트로 격리 → slug 변경 시 SlugField만 리렌더링
// availability check 조건:
//   - 수정 모드: 항상 실행 (기존 slug 변경 감지 필요)
//   - 신규 모드: dirtyFields.slug === true일 때만 (사용자가 직접 수정한 경우)
//                자동생성 slug는 shouldDirty:false로 setValue되므로 dirtyFields.slug = false → 체크 안 함
export function SlugField({
  isEdit,
  postId,
  slugAvailable,
  slugChecking,
  onSlugAvailable,
  onSlugChecking,
}: Props) {
  const {
    register,
    control,
    formState: { errors, dirtyFields },
  } = useFormContext<PostSchemaValues>();

  const slug = useWatch({ control, name: "slug" });

  useEffect(() => {
    const isUserEdited = !!dirtyFields.slug;

    // 신규 글에서 자동생성된 slug는 availability check 불필요
    if (!slug || (!isEdit && !isUserEdited)) {
      onSlugAvailable(null);
      return;
    }

    const timer = setTimeout(async () => {
      onSlugChecking(true);
      try {
        onSlugAvailable(await checkSlugAvailability(slug, postId));
      } catch {
        onSlugAvailable(null);
      } finally {
        onSlugChecking(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [slug, postId, isEdit, dirtyFields.slug, onSlugAvailable, onSlugChecking]);

  return (
    <div className="space-y-2">
      <Label htmlFor="slug">슬러그</Label>
      <div className="relative">
        <Input
          id="slug"
          placeholder="post-url-slug"
          {...register("slug")}
          className={slugAvailable === false ? "border-destructive" : ""}
        />
        {slugChecking && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        )}
        {!slugChecking && slugAvailable === true && (
          <CheckCircle className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-green-500" />
        )}
        {!slugChecking && slugAvailable === false && (
          <AlertCircle className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-destructive" />
        )}
      </div>
      {errors.slug && (
        <p className="text-sm text-destructive">{errors.slug.message}</p>
      )}
      {!errors.slug && slugAvailable === false && (
        <p className="text-sm text-destructive">이미 사용 중인 슬러그입니다.</p>
      )}
      {!errors.slug && slugAvailable === true && (
        <p className="text-sm text-green-600">사용 가능한 슬러그입니다.</p>
      )}
    </div>
  );
}
