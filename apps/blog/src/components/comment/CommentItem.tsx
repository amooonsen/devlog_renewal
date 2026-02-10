"use client";

import { useState } from "react";
import dayjs from "dayjs";

interface Comment {
  id: number;
  author_name: string;
  content: string;
  created_at: string;
}

interface CommentItemProps {
  comment: Comment;
  onReply?: () => void;
  onDeleted: () => void;
}

export function CommentItem({ comment, onReply, onDeleted }: CommentItemProps) {
  const [showDeleteForm, setShowDeleteForm] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!password) {
      setError("비밀번호를 입력해주세요.");
      return;
    }

    setDeleting(true);
    setError("");

    try {
      const res = await fetch("/api/comments", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          comment_id: comment.id,
          password,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "삭제에 실패했습니다.");
        return;
      }

      onDeleted();
    } catch {
      setError("서버 오류가 발생했습니다.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="rounded-lg border border-border p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{comment.author_name}</span>
          <span className="text-xs text-muted-foreground">
            {dayjs(comment.created_at).format("YYYY.MM.DD HH:mm")}
          </span>
        </div>
        <div className="flex gap-2 text-xs">
          {onReply && (
            <button
              onClick={onReply}
              className="text-muted-foreground hover:text-foreground"
            >
              답글
            </button>
          )}
          <button
            onClick={() => setShowDeleteForm(!showDeleteForm)}
            className="text-muted-foreground hover:text-destructive"
          >
            삭제
          </button>
        </div>
      </div>

      <p className="mt-2 text-sm leading-relaxed whitespace-pre-wrap">
        {comment.content}
      </p>

      {showDeleteForm && (
        <div className="mt-3 flex items-center gap-2">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호"
            className="h-8 rounded-md border border-input bg-background px-2 text-sm"
          />
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="h-8 rounded-md bg-destructive px-3 text-xs text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
          >
            {deleting ? "삭제 중..." : "확인"}
          </button>
          <button
            onClick={() => {
              setShowDeleteForm(false);
              setPassword("");
              setError("");
            }}
            className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            취소
          </button>
          {error && <span className="text-xs text-destructive">{error}</span>}
        </div>
      )}
    </div>
  );
}
