"use client";

import { useState } from "react";

interface CommentFormProps {
  postId: string;
  parentId: number | null;
  onSuccess: () => void;
  onCancel?: () => void;
}

export function CommentForm({ postId, parentId, onSuccess, onCancel }: CommentFormProps) {
  const [authorName, setAuthorName] = useState("");
  const [content, setContent] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!authorName.trim() || !content.trim() || !password) {
      setError("모든 항목을 입력해주세요.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          post_id: postId,
          author_name: authorName.trim(),
          content: content.trim(),
          password,
          parent_id: parentId,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "댓글 작성에 실패했습니다.");
        return;
      }

      setAuthorName("");
      setContent("");
      setPassword("");
      onSuccess();
    } catch {
      setError("서버 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex gap-3">
        <input
          type="text"
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          placeholder="이름"
          maxLength={50}
          className="h-9 flex-1 rounded-md border border-input bg-background px-3 text-sm"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="비밀번호 (삭제 시 필요)"
          className="h-9 flex-1 rounded-md border border-input bg-background px-3 text-sm"
        />
      </div>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={parentId ? "답글을 작성하세요..." : "댓글을 작성하세요..."}
        maxLength={1000}
        rows={3}
        className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm"
      />

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex justify-end gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="h-9 rounded-md px-4 text-sm text-muted-foreground hover:text-foreground"
          >
            취소
          </button>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="h-9 rounded-md bg-primary px-4 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {submitting ? "등록 중..." : parentId ? "답글 등록" : "댓글 등록"}
        </button>
      </div>
    </form>
  );
}
