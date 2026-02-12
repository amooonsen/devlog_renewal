import { cacheLife, cacheTag } from "next/cache";
import { createReadOnlyClient } from "./supabase-readonly";
import type { CommentPublic } from "@repo/types";

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
): Promise<{ data: CommentPublic[] | null }> {
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
