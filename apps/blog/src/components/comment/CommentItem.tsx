"use client";

import { useState } from "react";
import { formatDateTime } from "@repo/date-utils";
import { Button, Input } from "@repo/ui";

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
            {formatDateTime(comment.created_at)}
          </span>
        </div>
        <div className="flex gap-1">
          {onReply && (
            <Button variant="ghost" size="sm" onClick={onReply}>
              답글
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDeleteForm(!showDeleteForm)}
          >
            삭제
          </Button>
        </div>
      </div>

      <p className="mt-2 text-sm leading-relaxed whitespace-pre-wrap">
        {comment.content}
      </p>

      {showDeleteForm && (
        <div className="mt-3 flex items-center gap-2">
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호"
            className="h-8 w-40"
          />
          <Button
            size="sm"
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? "삭제 중..." : "확인"}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setShowDeleteForm(false);
              setPassword("");
              setError("");
            }}
          >
            취소
          </Button>
          {error && <span className="text-xs text-destructive">{error}</span>}
        </div>
      )}
    </div>
  );
}
