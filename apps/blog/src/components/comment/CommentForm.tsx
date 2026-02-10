"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Input, Textarea } from "@repo/ui";
import { commentSchema, type CommentFormValues } from "@/lib/schemas";

interface CommentFormProps {
  postId: string;
  parentId: number | null;
  onSuccess: () => void;
  onCancel?: () => void;
}

export function CommentForm({
  postId,
  parentId,
  onSuccess,
  onCancel,
}: CommentFormProps) {
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CommentFormValues>({
    resolver: zodResolver(commentSchema),
  });

  const onSubmit = async (data: CommentFormValues) => {
    setServerError("");

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          post_id: postId,
          parent_id: parentId,
        }),
      });

      if (!res.ok) {
        const body = await res.json();
        setServerError(body.error ?? "댓글 작성에 실패했습니다.");
        return;
      }

      reset();
      onSuccess();
    } catch {
      setServerError("서버 오류가 발생했습니다.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <div className="flex gap-3">
        <div className="flex-1">
          <Input
            placeholder="이름"
            {...register("author_name")}
          />
          {errors.author_name && (
            <p className="mt-1 text-xs text-destructive">
              {errors.author_name.message}
            </p>
          )}
        </div>
        <div className="flex-1">
          <Input
            type="password"
            placeholder="비밀번호 (삭제 시 필요)"
            {...register("password")}
          />
          {errors.password && (
            <p className="mt-1 text-xs text-destructive">
              {errors.password.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <Textarea
          placeholder={
            parentId ? "답글을 작성하세요..." : "댓글을 작성하세요..."
          }
          rows={3}
          {...register("content")}
        />
        {errors.content && (
          <p className="mt-1 text-xs text-destructive">
            {errors.content.message}
          </p>
        )}
      </div>

      {serverError && (
        <p className="text-sm text-destructive">{serverError}</p>
      )}

      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            취소
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "등록 중..."
            : parentId
              ? "답글 등록"
              : "댓글 등록"}
        </Button>
      </div>
    </form>
  );
}
