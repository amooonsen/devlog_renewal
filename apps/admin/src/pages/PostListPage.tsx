import { useState } from "react";
import { Link } from "react-router";
import { Plus } from "lucide-react";
import { Button, Skeleton, Tabs, TabsList, TabsTrigger, TabsContent } from "@repo/ui";
import { toast } from "sonner";
import type { PostStatus } from "@repo/types";
import { usePosts, useDeletePost } from "@/hooks/usePosts";
import { PostTable } from "@/components/post/PostTable";
import { Pagination } from "@/components/common/Pagination";

const PER_PAGE = 20;

export function PostListPage() {
  const [statusFilter, setStatusFilter] = useState<PostStatus | "all">("all");
  const [page, setPage] = useState(1);

  const filter = {
    status: statusFilter === "all" ? undefined : statusFilter,
    page,
    perPage: PER_PAGE,
  };

  const { data, isLoading } = usePosts(filter);
  const deletePost = useDeletePost();

  const handleDelete = async (id: string) => {
    try {
      await deletePost.mutateAsync(id);
      toast.success("포스트가 보관 처리되었습니다.");
    } catch {
      toast.error("포스트 보관에 실패했습니다.");
    }
  };

  const totalPages = data ? Math.ceil(data.total / PER_PAGE) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Posts</h2>
        <Button asChild>
          <Link to="/posts/new">
            <Plus className="mr-2 h-4 w-4" />
            새 포스트
          </Link>
        </Button>
      </div>

      <Tabs
        value={statusFilter}
        onValueChange={(val) => {
          setStatusFilter(val as PostStatus | "all");
          setPage(1);
        }}
      >
        <TabsList>
          <TabsTrigger value="all">전체</TabsTrigger>
          <TabsTrigger value="published">발행</TabsTrigger>
          <TabsTrigger value="draft">초안</TabsTrigger>
          <TabsTrigger value="archived">보관</TabsTrigger>
        </TabsList>

        <TabsContent value={statusFilter} className="mt-4">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <>
              <PostTable
                posts={data?.posts ?? []}
                onDelete={handleDelete}
              />
              <div className="mt-4">
                <Pagination
                  page={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
