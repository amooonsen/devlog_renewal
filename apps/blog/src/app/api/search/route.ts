import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase";
import { matchesKoreanSearch } from "@/lib/search";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query?.trim()) {
    return NextResponse.json({ data: [] });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = (await createClient()) as any;

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
    .limit(50);

  // es-hangul 클라이언트 필터링 (초성 + 자모 검색)
  const filtered = (posts ?? []).filter(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (post: any) =>
      matchesKoreanSearch(post.title, query) ||
      (post.excerpt && matchesKoreanSearch(post.excerpt, query))
  );

  return NextResponse.json({ data: filtered.slice(0, 20) });
}
