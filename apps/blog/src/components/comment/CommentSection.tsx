"use client";

import {useState} from "react";
import {CommentList} from "./CommentList";
import {CommentForm} from "./CommentForm";
import {useRouter} from "next/navigation";

interface Comment {
  id: number;
  post_id: string;
  author_name: string;
  content: string;
  parent_id: number | null;
  created_at: string;
}

interface CommentSectionProps {
  postId: string;
  comments: Comment[];
}

export function CommentSection({postId, comments: initialComments}: CommentSectionProps) {
  const [comments, setComments] = useState(initialComments);
  const [replyTo, setReplyTo] = useState<number | null>(null);

  const router = useRouter();

  const handleCommentAdded = () => {
    // 댓글 작성 후 새로고침으로 최신 목록 반영
    router.refresh();
  };

  const handleCommentDeleted = (commentId: number) => {
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  };

  // 트리 구조로 변환 (parent_id 기반)
  const rootComments = comments.filter((c) => c.parent_id === null);
  const replies = comments.filter((c) => c.parent_id !== null);

  return (
    <section className="mt-12 space-y-6">
      <h2 className="text-xl font-semibold">
        댓글 {comments.length > 0 && `(${comments.length})`}
      </h2>

      <CommentForm postId={postId} parentId={null} onSuccess={handleCommentAdded} />

      {rootComments.length > 0 ? (
        <CommentList
          comments={rootComments}
          replies={replies}
          postId={postId}
          replyTo={replyTo}
          onReply={setReplyTo}
          onCommentAdded={handleCommentAdded}
          onCommentDeleted={handleCommentDeleted}
        />
      ) : (
        <p className="py-8 text-center text-muted-foreground">
          아직 댓글이 없습니다. 첫 댓글을 남겨보세요!
        </p>
      )}
    </section>
  );
}
