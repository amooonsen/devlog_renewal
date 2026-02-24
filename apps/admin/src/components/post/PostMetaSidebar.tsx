import { Controller, useFormContext, useWatch } from "react-hook-form";
import { format, parseISO } from "date-fns";
import { ko } from "date-fns/locale";
import { CalendarIcon, Save } from "lucide-react";
import {
  Badge,
  Button,
  Calendar,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Switch,
} from "@repo/ui";
import type { Category, Tag } from "@repo/types";
import type { PostSchemaValues } from "@/lib/schemas";
import { ThumbnailUploader } from "./ThumbnailUploader";

// 발행 날짜 필드: status를 내부에서 구독 → status 변경 시 이 컴포넌트만 리렌더링
function PublishDateField() {
  const { control } = useFormContext<PostSchemaValues>();
  const status = useWatch({ control, name: "status" });

  if (status !== "published") return null;

  return (
    <div className="space-y-2">
      <Label>발행 날짜</Label>
      <Controller
        name="published_at"
        control={control}
        render={({ field }) => {
          const dateValue = field.value ? parseISO(field.value) : undefined;
          const timeValue = field.value ? field.value.slice(11, 16) : "";

          const handleDateSelect = (date: Date | undefined) => {
            if (!date) {
              field.onChange("");
              return;
            }
            const [h, m] = (timeValue || "00:00").split(":");
            date.setHours(Number(h), Number(m), 0, 0);
            field.onChange(date.toISOString());
          };

          const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            if (dateValue) {
              const [h, m] = e.target.value.split(":");
              const updated = new Date(dateValue);
              updated.setHours(Number(h), Number(m), 0, 0);
              field.onChange(updated.toISOString());
            }
          };

          return (
            <div className="space-y-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateValue ? (
                      format(dateValue, "PPP", { locale: ko })
                    ) : (
                      <span className="text-muted-foreground">날짜 선택</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start">
                  <Calendar
                    mode="single"
                    selected={dateValue}
                    onSelect={handleDateSelect}
                    locale={ko}
                  />
                </PopoverContent>
              </Popover>
              {dateValue && (
                <Input type="time" value={timeValue} onChange={handleTimeChange} />
              )}
            </div>
          );
        }}
      />
      <p className="text-xs text-muted-foreground">
        비워두면 현재 시간으로 자동 설정됩니다.
      </p>
    </div>
  );
}

interface Props {
  isEdit: boolean;
  isSubmitting: boolean;
  slugChecking: boolean;
  slugAvailable: boolean | null;
  categories: Category[];
  tags: Tag[];
}

export function PostMetaSidebar({
  isEdit,
  isSubmitting,
  slugChecking,
  slugAvailable,
  categories,
  tags,
}: Props) {
  const {
    control,
    formState: { errors },
  } = useFormContext<PostSchemaValues>();

  return (
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
                <Select value={field.value} onValueChange={field.onChange}>
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

          {/* 발행 날짜: status 구독을 내부에서 처리 → PostMetaSidebar 리렌더링 없음 */}
          <PublishDateField />

          <Separator />

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
                        field.onChange(
                          selected
                            ? field.value.filter((id) => id !== tag.id)
                            : [...field.value, tag.id]
                        );
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
  );
}
