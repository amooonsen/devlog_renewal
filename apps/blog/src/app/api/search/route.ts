import { NextResponse } from "next/server";
import { createReadOnlyClient } from "@/lib/supabase-readonly";
import { matchesKoreanSearch } from "@/lib/search";
import { SEARCH_FETCH_LIMIT, SEARCH_RESULTS_LIMIT } from "@/config/constants";
import type { PostListQueryResult } from "@repo/types";

/**
 * 포스트 검색 API입니다.
 *
 * 쿼리 파라미터 `q`로 검색어를 받아, 발행된 포스트 최대 50개를 조회한 뒤
 * es-hangul 기반 한글 퍼지 검색(초성/자모)으로 필터링하여 최대 20개를 반환합니다.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query?.trim()) {
    return NextResponse.json({ data: [] });
  }

  const supabase = createReadOnlyClient();
  if (!supabase) return NextResponse.json({ data: [] });

  const { data: posts } = await supabase
    .from("posts")
    .select(
      `
      id, title, slug, excerpt, thumbnail_url, published_at, view_count, is_featured,
      categories(name, slug),
      post_tags(tags(name, slug))
    `
    )
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(SEARCH_FETCH_LIMIT);

  // es-hangul 클라이언트 필터링 (초성 + 자모 검색)
  const filtered = ((posts as PostListQueryResult[]) ?? []).filter((post) =>
    matchesKoreanSearch(post.title, query) ||
    (post.excerpt && matchesKoreanSearch(post.excerpt, query))
  );

  return NextResponse.json({ data: filtered.slice(0, SEARCH_RESULTS_LIMIT) });
}
