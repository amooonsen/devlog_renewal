import { cacheLife, cacheTag } from "next/cache";
import { createReadOnlyClient } from "./supabase-readonly";

/** 승인된 댓글의 공개 표시 항목 타입 */
interface CommentItem {
  id: number;
  post_id: string;
  author_name: string;
  content: string;
  parent_id: number | null;
  created_at: string;
}

/**
 * 특정 포스트의 승인된 댓글 목록을 시간순으로 조회합니다.
 *
 * "use cache" + cacheLife("minutes")로 60초 revalidation 캐싱이 적용됩니다.
 * 비승인 댓글은 제외되며, 대댓글 구조를 위한 parent_id를 포함합니다.
 *
 * @param postId - 댓글을 조회할 포스트 ID
 * @returns 승인된 댓글 목록
 */
export async function getCommentsByPost(
  postId: string
): Promise<{ data: CommentItem[] | null }> {
  "use cache";
  cacheLife("minutes");
  cacheTag("comments");

  const supabase = createReadOnlyClient();
  if (!supabase) return { data: null };

  const { data } = await supabase
    .from("comments")
    .select("id, post_id, author_name, content, parent_id, created_at")
    .eq("post_id", postId)
    .eq("is_approved", true)
    .order("created_at", { ascending: true });

  return { data };
}
