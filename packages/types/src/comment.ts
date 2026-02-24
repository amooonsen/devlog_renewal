import type { Database } from "@repo/database";

// Supabase 생성 타입 재사용
export type Comment = Database["public"]["Tables"]["comments"]["Row"];

export type CommentWithReplies = Comment & {
  replies: Comment[];
};

export interface CreateCommentInput {
  post_id: string;
  author_name: string;
  content: string;
  password: string;
  parent_id?: number;
}

export interface DeleteCommentInput {
  comment_id: number;
  password: string;
}

/** 블로그 공개 댓글 조회 결과 타입 (비밀번호 미포함) */
export type CommentPublic = Pick<
  Comment,
  "id" | "post_id" | "author_name" | "content" | "parent_id" | "created_at"
>;