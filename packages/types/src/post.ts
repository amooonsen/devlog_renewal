export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
  created_at: string;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
  created_at: string;
}

export type PostStatus = "draft" | "published" | "archived";

export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  thumbnail_url: string | null;
  status: PostStatus;
  is_featured: boolean;
  view_count: number;
  category_id: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PostWithRelations extends Post {
  category: Category;
  tags: Tag[];
}

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
