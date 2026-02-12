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
