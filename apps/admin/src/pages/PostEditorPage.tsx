import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import MDEditor from "@uiw/react-md-editor";
import { ArrowLeft, Save, AlertCircle, CheckCircle } from "lucide-react";
import {
  Badge,
  Button,
  Input,
  Label,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Separator,
  Skeleton,
} from "@repo/ui";
import { toast } from "sonner";
import {
  usePost,
  useCreatePost,
  useUpdatePost,
  useCategories,
  useTags,
} from "@/hooks/usePosts";
import { postSchema, type PostSchemaValues } from "@/lib/schemas";
import { ThumbnailUploader } from "@/components/post/ThumbnailUploader";
import { checkSlugAvailability } from "@/lib/api";

export function PostEditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [slugChecking, setSlugChecking] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);

  const { data: existingPost, isLoading: postLoading } = usePost(id);
  const { data: categories = [] } = useCategories();
  const { data: tags = [] } = useTags();
  const createPost = useCreatePost();
  const updatePost = useUpdatePost();

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PostSchemaValues>({
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

  // 제목 → 슬러그 자동 생성 (새 글일 때만)
  const title = watch("title");
  useEffect(() => {
    if (!isEdit && title) {
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
      setValue("slug", slug);
    }
  }, [title, isEdit, setValue]);

  // 슬러그 중복 검증 (디바운스)
  const slug = watch("slug");
  useEffect(() => {
    if (!slug) {
      setSlugAvailable(null);
      return;
    }

    const timer = setTimeout(async () => {
      setSlugChecking(true);
      try {
        const available = await checkSlugAvailability(slug, id);
        setSlugAvailable(available);
      } catch {
        setSlugAvailable(null);
      } finally {
        setSlugChecking(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [slug, id]);

  const onSubmit = async (data: PostSchemaValues) => {
    // 슬러그 중복 검증
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
      {/* 헤더 */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/posts")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-2xl font-bold">
          {isEdit ? "포스트 수정" : "새 포스트"}
        </h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* 메인: 제목 + 에디터 */}
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
                <p className="text-sm text-destructive">
                  {errors.title.message}
                </p>
              )}
            </div>

            {/* 슬러그 */}
            <div className="space-y-2">
              <Label htmlFor="slug">슬러그</Label>
              <div className="relative">
                <Input
                  id="slug"
                  placeholder="post-url-slug"
                  {...register("slug")}
                  className={
                    slugAvailable === false ? "border-destructive" : ""
                  }
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
                <p className="text-sm text-destructive">
                  {errors.slug.message}
                </p>
              )}
              {!errors.slug && slugAvailable === false && (
                <p className="text-sm text-destructive">
                  이미 사용 중인 슬러그입니다.
                </p>
              )}
              {!errors.slug && slugAvailable === true && (
                <p className="text-sm text-green-600">사용 가능한 슬러그입니다.</p>
              )}
            </div>

            {/* 마크다운 에디터 */}
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
              {errors.content && (
                <p className="text-sm text-destructive">
                  {errors.content.message}
                </p>
              )}
            </div>

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
                <p className="text-sm text-destructive">
                  {errors.excerpt.message}
                </p>
              )}
            </div>
          </div>

          {/* 사이드바: 메타 정보 */}
          <div className="space-y-4">
            {/* 발행 설정 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">발행 설정</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 상태 */}
                <div className="space-y-2">
                  <Label>상태</Label>
                  <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">초안</SelectItem>
                          <SelectItem value="published">발행</SelectItem>
                          <SelectItem value="archived">보관</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                {/* Featured */}
                <div className="flex items-center justify-between">
                  <Label htmlFor="is_featured">Featured</Label>
                  <Controller
                    name="is_featured"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        id="is_featured"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                </div>

                {/* 발행 날짜 */}
                {watch("status") === "published" && (
                  <div className="space-y-2">
                    <Label htmlFor="published_at">발행 날짜</Label>
                    <Input
                      id="published_at"
                      type="datetime-local"
                      {...register("published_at")}
                      placeholder="비워두면 현재 시간"
                    />
                    <p className="text-xs text-muted-foreground">
                      비워두면 현재 시간으로 자동 설정됩니다.
                    </p>
                  </div>
                )}

                <Separator />

                {/* 저장 버튼 */}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={
                    isSubmitting ||
                    slugChecking ||
                    (!isEdit && slugAvailable === false)
                  }
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isSubmitting ? "저장 중..." : isEdit ? "수정" : "저장"}
                </Button>
              </CardContent>
            </Card>

            {/* 카테고리 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">카테고리</CardTitle>
              </CardHeader>
              <CardContent>
                {categories.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    카테고리를 먼저 생성해주세요.
                  </p>
                ) : (
                  <Controller
                    name="category_id"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value ? String(field.value) : ""}
                        onValueChange={(val) => field.onChange(Number(val))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="카테고리 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={String(cat.id)}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                )}
                {errors.category_id && (
                  <p className="mt-1 text-sm text-destructive">
                    {errors.category_id.message}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* 태그 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">태그</CardTitle>
              </CardHeader>
              <CardContent>
                <Controller
                  name="tag_ids"
                  control={control}
                  render={({ field }) => (
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => {
                        const selected = field.value.includes(tag.id);
                        return (
                          <Badge
                            key={tag.id}
                            variant={selected ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() => {
                              if (selected) {
                                field.onChange(
                                  field.value.filter((id) => id !== tag.id)
                                );
                              } else {
                                field.onChange([...field.value, tag.id]);
                              }
                            }}
                          >
                            {tag.name}
                          </Badge>
                        );
                      })}
                      {tags.length === 0 && (
                        <p className="text-sm text-muted-foreground">
                          태그가 없습니다.
                        </p>
                      )}
                    </div>
                  )}
                />
              </CardContent>
            </Card>

            {/* 썸네일 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">썸네일</CardTitle>
              </CardHeader>
              <CardContent>
                <Controller
                  name="thumbnail_url"
                  control={control}
                  render={({ field }) => (
                    <ThumbnailUploader
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
