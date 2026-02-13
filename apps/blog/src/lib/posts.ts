import { cacheLife, cacheTag } from "next/cache";
import { createReadOnlyClient } from "./supabase-readonly";
import { createClient } from "./supabase";
import type {
  Category,
  PostListQueryResult,
  PostDetailQueryResult,
  PostSlugQueryResult,
} from "@repo/types";

/**
 * 발행된 포스트 목록을 페이지네이션하여 조회합니다.
 *
 * "use cache" + cacheLife("minutes")로 60초 revalidation 캐싱이 적용됩니다.
 * 카테고리 슬러그가 주어지면 해당 카테고리의 포스트만 필터링합니다.
 *
 * @param options - 카테고리, 태그, 페이지, 개수 등 필터 옵션
 * @returns 포스트 목록과 전체 개수
 */
export async function getPublishedPosts(options?: {
  category?: string;
  tag?: string;
  page?: number;
  limit?: number;
}): Promise<{ data: PostListQueryResult[] | null; count: number | null }> {
  "use cache";
  cacheLife("minutes");
  cacheTag("posts");

  const supabase = createReadOnlyClient();
  if (!supabase) return { data: null, count: null };

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
 * "use cache" + cacheLife("minutes")로 캐싱이 적용됩니다.
 *
 * @param _category - 카테고리 슬러그 (라우팅용, 쿼리에는 미사용)
 * @param slug - 포스트 슬러그
 * @returns 포스트 상세 데이터
 */
export async function getPost(
  _category: string,
  slug: string
): Promise<{ data: PostDetailQueryResult | null }> {
  "use cache";
  cacheLife("minutes");
  cacheTag("posts");

  const supabase = createReadOnlyClient();
  if (!supabase) return { data: null };

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
 * "use cache" + cacheLife("minutes")로 캐싱이 적용됩니다.
 *
 * @returns 추천 포스트 목록
 */
export async function getFeaturedPosts(): Promise<{
  data: PostListQueryResult[] | null;
}> {
  "use cache";
  cacheLife("minutes");
  cacheTag("posts");

  const supabase = createReadOnlyClient();
  if (!supabase) return { data: null };

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
 * "use cache" + cacheLife("hours")로 장기 캐싱이 적용됩니다.
 *
 * @returns 카테고리 목록
 */
export async function getCategories(): Promise<{
  data: Category[] | null;
}> {
  "use cache";
  cacheLife("hours");
  cacheTag("categories");

  const supabase = createReadOnlyClient();
  if (!supabase) return { data: null };

  const { data } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order");

  return { data };
}

/**
 * 발행된 모든 포스트의 슬러그와 카테고리 정보를 조회합니다.
 *
 * "use cache" + cacheLife("hours")로 장기 캐싱이 적용됩니다.
 * sitemap.ts에서 동적 URL 생성에 사용됩니다.
 *
 * @returns 슬러그 목록
 */
export async function getAllPublishedSlugs(): Promise<{
  data: PostSlugQueryResult[] | null;
}> {
  "use cache";
  cacheLife("hours");
  cacheTag("posts");

  const supabase = createReadOnlyClient();
  if (!supabase) return { data: null };

  const { data } = await supabase
    .from("posts")
    .select("slug, updated_at, categories(slug)")
    .eq("status", "published");

  return { data };
}

/**
 * 포스트 조회수를 1 증가시킵니다.
 *
 * SECURITY DEFINER RPC로 권한 무관하게 동작합니다.
 * 캐싱 대상이 아닙니다 (쓰기 작업).
 *
 * @param postId - 조회수를 증가시킬 포스트 ID
 */
export async function incrementViewCount(postId: string): Promise<void> {
  const supabase = await createClient();
  // @ts-expect-error - increment_view_count RPC가 Database 타입에 미포함 (pnpm db:generate로 해결 가능)
  await supabase.rpc("increment_view_count", { p_post_id: postId });
}
