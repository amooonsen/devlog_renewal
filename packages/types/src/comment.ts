export interface Comment {
  id: number;
  post_id: string;
  author_name: string;
  content: string;
  is_approved: boolean;
  parent_id: number | null;
  created_at: string;
}

export interface CommentWithReplies extends Comment {
  replies: Comment[];
}

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
