import { useState } from "react";
import { Skeleton, Tabs, TabsList, TabsTrigger, TabsContent } from "@repo/ui";
import { toast } from "sonner";
import {
  useComments,
  useApproveComment,
  useRejectComment,
  useDeleteComment,
} from "@/hooks/useComments";
import { CommentTable } from "@/components/comment/CommentTable";
import { Pagination } from "@/components/common/Pagination";

const PER_PAGE = 20;

type ApprovalFilter = "all" | "approved" | "pending";

export function CommentListPage() {
  const [filter, setFilter] = useState<ApprovalFilter>("all");
  const [page, setPage] = useState(1);

  const queryFilter = {
    isApproved: filter === "all" ? undefined : filter === "approved",
    page,
    perPage: PER_PAGE,
  };

  const { data, isLoading } = useComments(queryFilter);
  const approve = useApproveComment();
  const reject = useRejectComment();
  const remove = useDeleteComment();

  const handleApprove = async (id: number) => {
    try {
      await approve.mutateAsync(id);
      toast.success("댓글이 승인되었습니다.");
    } catch {
      toast.error("댓글 승인에 실패했습니다.");
    }
  };

  const handleReject = async (id: number) => {
    try {
      await reject.mutateAsync(id);
      toast.success("댓글이 거부되었습니다.");
    } catch {
      toast.error("댓글 거부에 실패했습니다.");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await remove.mutateAsync(id);
      toast.success("댓글이 삭제되었습니다.");
    } catch {
      toast.error("댓글 삭제에 실패했습니다.");
    }
  };

  const totalPages = data ? Math.ceil(data.total / PER_PAGE) : 0;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Comments</h2>

      <Tabs
        value={filter}
        onValueChange={(val) => {
          setFilter(val as ApprovalFilter);
          setPage(1);
        }}
      >
        <TabsList>
          <TabsTrigger value="all">전체</TabsTrigger>
          <TabsTrigger value="approved">승인</TabsTrigger>
          <TabsTrigger value="pending">대기</TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="mt-4">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : (
            <>
              <CommentTable
                comments={data?.comments ?? []}
                onApprove={handleApprove}
                onReject={handleReject}
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
