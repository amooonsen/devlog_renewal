import { createClient } from "./supabase";
import type { Database } from "@repo/database";

// Supabase 클라이언트 생성 헬퍼
async function getSupabase() {
  return createClient();
}

// Supabase 생성 타입 활용
type Post = Database["public"]["Tables"]["posts"]["Row"];
type Category = Database["public"]["Tables"]["categories"]["Row"];
// 조인 쿼리 결과 타입
interface PostListItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  thumbnail_url: string | null;
  published_at: string | null;
  view_count: number;
  is_featured: boolean;
  categories: { name: string; slug: string } | null;
  post_tags: { tags: { name: string; slug: string } | null }[] | null;
}

interface PostDetail extends Post {
  categories: { name: string; slug: string } | null;
  post_tags: { tags: { name: string; slug: string } | null }[] | null;
}

type CategoryItem = Category;

interface SlugItem {
  slug: string;
  updated_at: string;
  categories: { slug: string } | null;
}

export async function getPublishedPosts(options?: {
  category?: string;
  tag?: string;
  page?: number;
  limit?: number;
}): Promise<{ data: PostListItem[] | null; count: number | null }> {
  const supabase = await getSupabase();
  const page = options?.page ?? 1;
  const limit = options?.limit ?? 10;
  const offset = (page - 1) * limit;

  // 카테고리 슬러그로 필터링하는 경우, 먼저 category_id를 찾아야 함
  let categoryId: number | undefined;
  if (options?.category) {
    const { data: categoryData } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", options.category)
      .single<{ id: number }>();

    if (categoryData) {
      categoryId = categoryData.id;
    }
  }

  let query = supabase
    .from("posts")
    .select(
      `
      id, title, slug, excerpt, thumbnail_url,
      published_at, view_count, is_featured,
      categories(name, slug),
      post_tags(tags(name, slug))
    `,
      { count: "exact" }
    )
    .eq("status", "published")
    .order("published_at", { ascending: false });

  // 카테고리 ID로 필터링
  if (categoryId) {
    query = query.eq("category_id", categoryId);
  }

  query = query.range(offset, offset + limit - 1);

  const { data, count } = await query;
  return { data, count };
}

export async function getPost(
  _category: string,
  slug: string
): Promise<{ data: PostDetail | null }> {
  const supabase = await getSupabase();

  const { data } = await supabase
    .from("posts")
    .select(
      `
      *,
      categories(name, slug),
      post_tags(tags(name, slug))
    `
    )
    .eq("slug", slug)
    .single();

  return { data };
}

export async function getFeaturedPosts(): Promise<{
  data: PostListItem[] | null;
}> {
  const supabase = await getSupabase();

  const { data } = await supabase
    .from("posts")
    .select(
      `
      id, title, slug, excerpt, thumbnail_url,
      published_at, view_count,
      categories(name, slug),
      post_tags(tags(name, slug))
    `
    )
    .eq("status", "published")
    .eq("is_featured", true)
    .order("published_at", { ascending: false })
    .limit(3);

  return { data };
}

export async function getCategories(): Promise<{
  data: CategoryItem[] | null;
}> {
  const supabase = await getSupabase();

  const { data } = await supabase
    .from("categories")
    .select("id, name, slug, description")
    .order("sort_order");

  return { data };
}

export async function getAllPublishedSlugs(): Promise<{
  data: SlugItem[] | null;
}> {
  const supabase = await getSupabase();

  const { data } = await supabase
    .from("posts")
    .select("slug, updated_at, categories(slug)")
    .eq("status", "published");

  return { data };
}

export async function incrementViewCount(postId: string) {
  const supabase = await getSupabase();
  // @ts-expect-error - Supabase RPC 타입 추론 문제 (pnpm db:generate로 해결 가능)
  await supabase.rpc("increment_view_count", { p_post_id: postId });
}
