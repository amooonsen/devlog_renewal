import { createClient } from "./supabase";
import type { Database } from "@repo/database";

/** Supabase 서버 클라이언트 생성 헬퍼 */
async function getSupabase() {
  return createClient();
}

// Supabase 생성 타입 활용
type Post = Database["public"]["Tables"]["posts"]["Row"];
type Category = Database["public"]["Tables"]["categories"]["Row"];

/** 포스트 목록 조회 시 반환되는 항목 타입 (조인 포함) */
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

/** 포스트 상세 조회 시 반환되는 타입 (전체 컬럼 + 조인) */
interface PostDetail extends Post {
  categories: { name: string; slug: string } | null;
  post_tags: { tags: { name: string; slug: string } | null }[] | null;
}

type CategoryItem = Category;

/** 사이트맵 생성용 슬러그 항목 타입 */
interface SlugItem {
  slug: string;
  updated_at: string;
  categories: { slug: string } | null;
}

/**
 * 발행된 포스트 목록을 페이지네이션하여 조회합니다.
 *
 * 카테고리 슬러그가 주어지면 해당 카테고리의 포스트만 필터링하며,
 * Supabase의 range 쿼리로 서버 사이드 페이지네이션을 수행합니다.
 *
 * @param options - 카테고리, 태그, 페이지, 개수 등 필터 옵션
 * @returns 포스트 목록과 전체 개수
 */
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

  // 카테고리 슬러그로 필터링하는 경우, 먼저 category_id를 조회
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

  if (categoryId) {
    query = query.eq("category_id", categoryId);
  }

  query = query.range(offset, offset + limit - 1);

  const { data, count } = await query;
  return { data, count };
}

/**
 * 슬러그로 단일 포스트를 상세 조회합니다.
 *
 * 카테고리/태그 관계 데이터를 포함하여 반환합니다.
 *
 * @param _category - 카테고리 슬러그 (라우팅용, 쿼리에는 미사용)
 * @param slug - 포스트 슬러그
 * @returns 포스트 상세 데이터
 */
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

/**
 * 추천(Featured) 포스트 최대 3개를 조회합니다.
 *
 * 홈 페이지 상단 Featured 섹션에 표시됩니다.
 *
 * @returns 추천 포스트 목록
 */
export async function getFeaturedPosts(): Promise<{
  data: PostListItem[] | null;
}> {
  const supabase = await getSupabase();

  const { data } = await supabase
    .from("posts")
    .select(
      `
      id, title, slug, excerpt, thumbnail_url,
      published_at, view_count, is_featured,
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

/**
 * 전체 카테고리 목록을 정렬 순서대로 조회합니다.
 *
 * 네비게이션, 카테고리 필터 등에 사용됩니다.
 *
 * @returns 카테고리 목록
 */
export async function getCategories(): Promise<{
  data: CategoryItem[] | null;
}> {
  const supabase = await getSupabase();

  const { data } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order");

  return { data };
}

/**
 * 발행된 모든 포스트의 슬러그와 카테고리 정보를 조회합니다.
 *
 * sitemap.ts에서 동적 URL 생성에 사용됩니다.
 *
 * @returns 슬러그 목록
 */
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

/**
 * 포스트 조회수를 1 증가시킵니다.
 *
 * Supabase RPC 함수 `increment_view_count`를 호출하며,
 * 클라이언트의 ViewCounter 컴포넌트에서 포스트 로드 시 호출됩니다.
 *
 * @param postId - 조회수를 증가시킬 포스트 ID
 */
export async function incrementViewCount(postId: string): Promise<void> {
  const supabase = await getSupabase();
  // @ts-expect-error - increment_view_count RPC가 Database 타입에 미포함 (pnpm db:generate로 해결 가능)
  await supabase.rpc("increment_view_count", { p_post_id: postId });
}
