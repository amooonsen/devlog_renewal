import { Link } from "react-router";
import { formatDate } from "@repo/date-utils";
import { Pencil, Trash2, Eye } from "lucide-react";
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
import type { PostWithRelations } from "@repo/types";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";

interface PostTableProps {
  posts: PostWithRelations[];
  onDelete: (id: string) => void;
}

export function PostTable({ posts, onDelete }: PostTableProps) {
  if (posts.length === 0) {
    return (
      <p className="py-8 text-center text-muted-foreground">
        포스트가 없습니다.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[400px]">제목</TableHead>
          <TableHead>카테고리</TableHead>
          <TableHead>상태</TableHead>
          <TableHead>조회수</TableHead>
          <TableHead>생성일</TableHead>
          <TableHead className="text-right">액션</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {posts.map((post) => (
          <TableRow key={post.id}>
            <TableCell>
              <div className="flex flex-col gap-1">
                <span className="font-medium">{post.title}</span>
                <div className="flex gap-1">
                  {post.tags.map((tag) => (
                    <Badge key={tag.id} variant="outline" className="text-xs">
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </TableCell>
            <TableCell>{post.category?.name ?? "-"}</TableCell>
            <TableCell>
              <StatusBadge status={post.status} />
            </TableCell>
            <TableCell>
              <span className="flex items-center gap-1 text-muted-foreground">
                <Eye className="h-3 w-3" />
                {post.view_count}
              </span>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {formatDate(post.created_at)}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-1">
                <Button variant="ghost" size="icon" asChild>
                  <Link to={`/posts/${post.id}/edit`}>
                    <Pencil className="h-4 w-4" />
                  </Link>
                </Button>
                <ConfirmDialog
                  trigger={
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  }
                  title="포스트 보관"
                  description="이 포스트를 보관 처리하시겠습니까? 보관된 포스트는 공개되지 않습니다."
                  confirmLabel="보관"
                  onConfirm={() => onDelete(post.id)}
                />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
