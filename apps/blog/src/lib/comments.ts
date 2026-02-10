import { createClient } from "./supabase";

export async function getCommentsByPost(postId: string) {
  const supabase = await createClient();

  const result = await supabase
    .from("comments")
    .select("id, post_id, author_name, content, parent_id, created_at")
    .eq("post_id", postId)
    .eq("is_approved", true)
    .order("created_at", { ascending: true });

  return result;
}
