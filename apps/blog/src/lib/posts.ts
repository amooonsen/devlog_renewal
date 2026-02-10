import { createClient } from "./supabase";

export async function getPublishedPosts(options?: {
  category?: string;
  tag?: string;
  page?: number;
  limit?: number;
}) {
  const supabase = await createClient();
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

  const result = await query;
  return result;
}

export async function getPost(category: string, slug: string) {
  const supabase = await createClient();

  const result = await supabase
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

  return result;
}

export async function getFeaturedPosts() {
  const supabase = await createClient();

  const result = await supabase
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

  return result;
}

export async function getCategories() {
  const supabase = await createClient();

  const result = await supabase
    .from("categories")
    .select("id, name, slug, description")
    .order("sort_order");

  return result;
}

export async function getAllPublishedSlugs() {
  const supabase = await createClient();

  const result = await supabase
    .from("posts")
    .select("slug, updated_at, categories(slug)")
    .eq("status", "published");

  return result;
}

export async function incrementViewCount(postId: string) {
  const supabase = await createClient();

  // RPC function defined in migration - types generated after `pnpm db:generate`
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await (supabase as any).rpc("increment_view_count", {
    p_post_id: postId,
  });

  return result;
}
