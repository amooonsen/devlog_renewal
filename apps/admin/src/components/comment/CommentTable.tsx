import { formatDate } from "@repo/date-utils";
import { Check, X, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Button,
  Badge,
} from "@repo/ui";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import type { CommentWithPost } from "@/lib/api";

interface CommentTableProps {
  comments: CommentWithPost[];
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  onDelete: (id: number) => void;
}

export function CommentTable({
  comments,
  onApprove,
  onReject,
  onDelete,
}: CommentTableProps) {
  if (comments.length === 0) {
    return (
      <p className="py-8 text-center text-muted-foreground">
        댓글이 없습니다.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>작성자</TableHead>
          <TableHead className="w-[350px]">내용</TableHead>
          <TableHead>포스트</TableHead>
          <TableHead>상태</TableHead>
          <TableHead>작성일</TableHead>
          <TableHead className="text-right">액션</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {comments.map((comment) => (
          <TableRow key={comment.id}>
            <TableCell className="font-medium">
              {comment.author_name}
            </TableCell>
            <TableCell>
              <p className="line-clamp-2 text-sm">{comment.content}</p>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {comment.posts?.title ?? "-"}
            </TableCell>
            <TableCell>
              <Badge variant={comment.is_approved ? "default" : "secondary"}>
                {comment.is_approved ? "승인" : "대기"}
              </Badge>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {formatDate(comment.created_at)}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-1">
                {!comment.is_approved && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onApprove(comment.id)}
                    title="승인"
                  >
                    <Check className="h-4 w-4 text-green-600" />
                  </Button>
                )}
                {comment.is_approved && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onReject(comment.id)}
                    title="거부"
                  >
                    <X className="h-4 w-4 text-orange-500" />
                  </Button>
                )}
                <ConfirmDialog
                  trigger={
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  }
                  title="댓글 삭제"
                  description="이 댓글을 영구 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
                  confirmLabel="삭제"
                  onConfirm={() => onDelete(comment.id)}
                />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
