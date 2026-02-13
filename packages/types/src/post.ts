import type { Database } from "@repo/database";

// Supabase 생성 타입 재사용
export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type Tag = Database["public"]["Tables"]["tags"]["Row"];
export type Post = Database["public"]["Tables"]["posts"]["Row"];

export type PostStatus = "draft" | "published" | "archived";

// 관계가 포함된 타입 (조인 쿼리 결과)
export type PostWithRelations = Post & {
  category: Category;
  tags: Tag[];
};

export interface PostListItem
  extends Pick<
    Post,
    | "id"
    | "title"
    | "slug"
    | "excerpt"
    | "thumbnail_url"
    | "is_featured"
    | "view_count"
    | "published_at"
  > {
  category: Pick<Category, "name" | "slug">;
  tags: Pick<Tag, "name" | "slug">[];
}

/** search_posts RPC 반환 타입 */
export interface PostSearchResult
  extends Pick<
    Post,
    | "id"
    | "title"
    | "slug"
    | "excerpt"
    | "thumbnail_url"
    | "published_at"
    | "view_count"
    | "is_featured"
    | "category_id"
  > {
  rank: number;
}

// ── Supabase 조인 쿼리 결과 타입 (blog용) ──

/** Supabase 조인 쿼리에서 반환되는 카테고리 참조 형태 */
type CategoryRef = Pick<Category, "name" | "slug">;

/** Supabase 조인 쿼리에서 반환되는 태그 참조 형태 */
type TagRef = Pick<Tag, "name" | "slug">;

/** post_tags 중간 테이블 조인 결과 */
type PostTagJoin = { tags: TagRef | null };

/** 포스트 목록 조회 쿼리 결과 타입 (Supabase join) */
export interface PostListQueryResult
  extends Pick<
    Post,
    | "id"
    | "title"
    | "slug"
    | "excerpt"
    | "thumbnail_url"
    | "published_at"
    | "view_count"
    | "is_featured"
  > {
  categories: CategoryRef | null;
  post_tags: PostTagJoin[] | null;
}

/** 포스트 상세 조회 쿼리 결과 타입 */
export interface PostDetailQueryResult extends Post {
  categories: CategoryRef | null;
  post_tags: PostTagJoin[] | null;
}

/** 사이트맵 슬러그 쿼리 결과 타입 */
export interface PostSlugQueryResult {
  slug: string;
  updated_at: string;
  categories: Pick<Category, "slug"> | null;
}
