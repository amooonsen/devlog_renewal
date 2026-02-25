/** post_tags 조인 결과에서 태그 배열을 추출합니다. */
export function extractTags(
  postTags: { tags: { name: string; slug: string } | null }[] | null | undefined
): { name: string; slug: string }[] {
  if (!postTags) return [];
  return postTags
    .map((pt) => pt.tags)
    .filter((t): t is { name: string; slug: string } => t !== null);
}
