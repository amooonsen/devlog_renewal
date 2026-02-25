import { CommentItem } from "./CommentItem";
import { CommentForm } from "./CommentForm";
import type { CommentPublic } from "@repo/types";

interface CommentListProps {
  comments: CommentPublic[];
  replies: CommentPublic[];
  postId: string;
  replyTo: number | null;
  onReply: (commentId: number | null) => void;
  onCommentAdded: () => void;
  onCommentDeleted: (commentId: number) => void;
}

export function CommentList({
  comments,
  replies,
  postId,
  replyTo,
  onReply,
  onCommentAdded,
  onCommentDeleted,
}: CommentListProps) {
  return (
    <div className="space-y-4">
      {comments.map((comment) => {
        const childReplies = replies.filter((r) => r.parent_id === comment.id);

        return (
          <div key={comment.id}>
            <CommentItem
              comment={comment}
              onReply={() =>
                onReply(replyTo === comment.id ? null : comment.id)
              }
              onDeleted={() => onCommentDeleted(comment.id)}
            />

            {/* 답글 목록 */}
            {childReplies.length > 0 && (
              <div className="ml-8 mt-2 space-y-2 border-l-2 border-border pl-4">
                {childReplies.map((reply) => (
                  <CommentItem
                    key={reply.id}
                    comment={reply}
                    onDeleted={() => onCommentDeleted(reply.id)}
                  />
                ))}
              </div>
            )}

            {/* 답글 작성 폼 */}
            {replyTo === comment.id && (
              <div className="ml-8 mt-2 border-l-2 border-primary/30 pl-4">
                <CommentForm
                  postId={postId}
                  parentId={comment.id}
                  onSuccess={onCommentAdded}
                  onCancel={() => onReply(null)}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
