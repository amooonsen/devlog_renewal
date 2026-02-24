import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useForm, FormProvider, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";
import { Button, Skeleton } from "@repo/ui";
import { toast } from "sonner";
import {
  usePost,
  useCreatePost,
  useUpdatePost,
  useCategories,
  useTags,
} from "@/hooks/usePosts";
import { postSchema, type PostSchemaValues } from "@/lib/schemas";
import { PostMainContent } from "@/components/post/PostMainContent";
import { PostMetaSidebar } from "@/components/post/PostMetaSidebar";

const generateSlug = (title: string) =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

// FormProvider로 감싸 → 하위 컴포넌트에서 useFormContext로 접근 가능
// auto-slug: watch(callback) 패턴 → 리렌더링 없이 title 변화에 반응
export function PostEditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  // slug 검증 상태: submit 핸들러에서 접근 필요하므로 여기서 관리
  const [slugChecking, setSlugChecking] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);

  const { data: existingPost, isLoading: postLoading } = usePost(id);
  const { data: categories = [] } = useCategories();
  const { data: tags = [] } = useTags();
  const createPost = useCreatePost();
  const updatePost = useUpdatePost();

  const methods = useForm<PostSchemaValues>({
    resolver: zodResolver(postSchema) as Resolver<PostSchemaValues>,
    defaultValues: {
      title: "",
      slug: "",
      content: "",
      excerpt: "",
      thumbnail_url: "",
      status: "draft",
      is_featured: false,
      category_id: 0,
      tag_ids: [],
      published_at: "",
    },
  });

  const {
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { isSubmitting, dirtyFields },
  } = methods;

  // dirtyFields.slug ref: watch callback 클로저에서 최신값을 참조하기 위해
  // dirtyFields가 변경될 때마다 ref 업데이트 (리렌더링 없이 접근 가능)
  const slugDirtyRef = useRef(false);
  useEffect(() => {
    slugDirtyRef.current = !!dirtyFields.slug;
  }, [dirtyFields.slug]);

  // title → slug 자동생성
  // watch(callback) 패턴: 리렌더링 없이 폼 값 변화에 반응하는 사이드이펙트
  // slugDirtyRef.current가 true면 사용자가 직접 수정 → 자동생성 중단
  useEffect(() => {
    if (isEdit) return;
    const subscription = watch((values, { name }) => {
      if (name === "title" && !slugDirtyRef.current) {
        setValue("slug", generateSlug(values.title ?? ""), {
          shouldDirty: false,   // 자동생성은 dirty 마킹 안 함 → dirtyFields.slug 유지
          shouldValidate: false,
        });
      }
    });
    return () => subscription.unsubscribe();
  }, [isEdit, watch, setValue]);

  // 수정 모드: 기존 데이터로 폼 초기화
  useEffect(() => {
    if (existingPost) {
      reset({
        title: existingPost.title,
        slug: existingPost.slug,
        content: existingPost.content,
        excerpt: existingPost.excerpt ?? "",
        thumbnail_url: existingPost.thumbnail_url ?? "",
        status: existingPost.status,
        is_featured: existingPost.is_featured,
        category_id: existingPost.category_id,
        tag_ids: existingPost.tags.map((t) => t.id),
        published_at: existingPost.published_at ?? "",
      });
    }
  }, [existingPost, reset]);

  const onSubmit = async (data: PostSchemaValues) => {
    if (!isEdit && slugAvailable === false) {
      toast.error("이미 사용 중인 슬러그입니다.");
      return;
    }

    try {
      if (isEdit) {
        await updatePost.mutateAsync({ id, data });
        toast.success("포스트가 수정되었습니다.");
      } else {
        await createPost.mutateAsync(data);
        toast.success("포스트가 생성되었습니다.");
      }
      navigate("/posts");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "저장에 실패했습니다."
      );
    }
  };

  if (isEdit && postLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/posts")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-2xl font-bold">
          {isEdit ? "포스트 수정" : "새 포스트"}
        </h2>
      </div>

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <PostMainContent
              isEdit={isEdit}
              postId={id}
              slugAvailable={slugAvailable}
              slugChecking={slugChecking}
              onSlugAvailable={setSlugAvailable}
              onSlugChecking={setSlugChecking}
            />
            <PostMetaSidebar
              isEdit={isEdit}
              isSubmitting={isSubmitting}
              slugChecking={slugChecking}
              slugAvailable={slugAvailable}
              categories={categories}
              tags={tags}
            />
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
