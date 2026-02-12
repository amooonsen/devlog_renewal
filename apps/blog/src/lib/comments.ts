import { createClient } from "./supabase";

interface CommentItem {
  id: number;
  post_id: string;
  author_name: string;
  content: string;
  parent_id: number | null;
  created_at: string;
}

export async function getCommentsByPost(
  postId: string
): Promise<{ data: CommentItem[] | null }> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = (await createClient()) as any;

  const { data } = await supabase
    .from("comments")
    .select("id, post_id, author_name, content, parent_id, created_at")
    .eq("post_id", postId)
    .eq("is_approved", true)
    .order("created_at", { ascending: true });

  return { data };
}
