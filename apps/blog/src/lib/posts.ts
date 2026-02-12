import { createClient } from "./supabase";

// Database 타입이 생성되기 전까지 any 캐스트 필요 (`pnpm db:generate` 후 제거)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getSupabase(): Promise<any> {
  return createClient();
}

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

interface PostDetail {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  thumbnail_url: string | null;
  status: string;
  is_featured: boolean;
  view_count: number;
  category_id: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  categories: { name: string; slug: string } | null;
  post_tags: { tags: { name: string; slug: string } | null }[] | null;
}

interface CategoryItem {
  id: number;
  name: string;
  slug: string;
  description: string | null;
}

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
    .order("published_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (options?.category) {
    query = query.eq("categories.slug", options.category);
  }

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
  await supabase.rpc("increment_view_count", { p_post_id: postId });
}
