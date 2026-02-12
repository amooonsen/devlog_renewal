import { supabase } from "./supabase";
import type {
  Post,
  PostWithRelations,
  PostStatus,
  Category,
  Tag,
  Comment,
  Contact,
} from "@repo/types";

// ──────────────────────────────────────
// Posts
// ──────────────────────────────────────

export interface PostFilter {
  status?: PostStatus;
  page?: number;
  perPage?: number;
}

export interface PostFormData {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  thumbnail_url?: string;
  status: PostStatus;
  is_featured: boolean;
  category_id: number;
  tag_ids: number[];
  published_at?: string;
}

export async function fetchPosts(filter?: PostFilter) {
  const page = filter?.page ?? 1;
  const perPage = filter?.perPage ?? 20;
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  let query = supabase
    .from("posts")
    .select("*, categories(*), post_tags(tags(*))", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (filter?.status) {
    query = query.eq("status", filter.status);
  }

  const { data, error, count } = await query;
  if (error) throw error;

  // post_tags 관계를 tags 배열로 변환
  const posts: PostWithRelations[] = (data ?? []).map((post) => ({
    ...post,
    category: post.categories,
    tags: post.post_tags?.map((pt: { tags: Tag }) => pt.tags) ?? [],
  }));

  return { posts, total: count ?? 0 };
}

export async function fetchPost(id: string) {
  const { data, error } = await supabase
    .from("posts")
    .select("*, categories(*), post_tags(tags(*))")
    .eq("id", id)
    .single();

  if (error) throw error;

  const post: PostWithRelations = {
    ...data,
    category: data.categories,
    tags: data.post_tags?.map((pt: { tags: Tag }) => pt.tags) ?? [],
  };
  return post;
}

export async function createPost(formData: PostFormData) {
  const { tag_ids, ...postData } = formData;

  // 발행 시 published_at 자동 설정
  if (postData.status === "published" && !postData.published_at) {
    postData.published_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from("posts")
    .insert(postData)
    .select()
    .single();

  if (error) throw error;

  // 태그 연결
  if (tag_ids.length > 0) {
    const postTags = tag_ids.map((tag_id) => ({
      post_id: data.id,
      tag_id,
    }));
    const { error: tagError } = await supabase
      .from("post_tags")
      .insert(postTags);
    if (tagError) throw tagError;
  }

  return data as Post;
}

export async function updatePost(id: string, formData: PostFormData) {
  const { tag_ids, ...postData } = formData;

  const { data, error } = await supabase
    .from("posts")
    .update({ ...postData, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  // 태그 갱신: 기존 삭제 후 재삽입
  const { error: deleteError } = await supabase
    .from("post_tags")
    .delete()
    .eq("post_id", id);
  if (deleteError) throw deleteError;

  if (tag_ids.length > 0) {
    const postTags = tag_ids.map((tag_id) => ({
      post_id: id,
      tag_id,
    }));
    const { error: tagError } = await supabase
      .from("post_tags")
      .insert(postTags);
    if (tagError) throw tagError;
  }

  return data as Post;
}

export async function deletePost(id: string) {
  // archived 상태로 변경 (소프트 삭제)
  const { error } = await supabase
    .from("posts")
    .update({ status: "archived" as PostStatus })
    .eq("id", id);

  if (error) throw error;
}

// ──────────────────────────────────────
// Categories
// ──────────────────────────────────────

export async function fetchCategories() {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return data as Category[];
}

// ──────────────────────────────────────
// Tags
// ──────────────────────────────────────

export async function fetchTags() {
  const { data, error } = await supabase
    .from("tags")
    .select("*")
    .order("name", { ascending: true });

  if (error) throw error;
  return data as Tag[];
}

// ──────────────────────────────────────
// Comments
// ──────────────────────────────────────

export interface CommentFilter {
  isApproved?: boolean;
  page?: number;
  perPage?: number;
}

export type CommentWithPost = Comment & {
  posts: { title: string; slug: string } | null;
};

export async function fetchComments(filter?: CommentFilter) {
  const page = filter?.page ?? 1;
  const perPage = filter?.perPage ?? 20;
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  let query = supabase
    .from("comments")
    .select("*, posts(title, slug)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (filter?.isApproved !== undefined) {
    query = query.eq("is_approved", filter.isApproved);
  }

  const { data, error, count } = await query;
  if (error) throw error;
  return { comments: (data ?? []) as CommentWithPost[], total: count ?? 0 };
}

export async function approveComment(id: number) {
  const { error } = await supabase
    .from("comments")
    .update({ is_approved: true })
    .eq("id", id);

  if (error) throw error;
}

export async function rejectComment(id: number) {
  const { error } = await supabase
    .from("comments")
    .update({ is_approved: false })
    .eq("id", id);

  if (error) throw error;
}

export async function deleteComment(id: number) {
  const { error } = await supabase.from("comments").delete().eq("id", id);
  if (error) throw error;
}

// ──────────────────────────────────────
// Contacts
// ──────────────────────────────────────

export interface ContactFilter {
  isRead?: boolean;
  page?: number;
  perPage?: number;
}

export async function fetchContacts(filter?: ContactFilter) {
  const page = filter?.page ?? 1;
  const perPage = filter?.perPage ?? 20;
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  let query = supabase
    .from("contacts")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (filter?.isRead !== undefined) {
    query = query.eq("is_read", filter.isRead);
  }

  const { data, error, count } = await query;
  if (error) throw error;
  return { contacts: (data ?? []) as Contact[], total: count ?? 0 };
}

export async function markContactAsRead(id: number) {
  const { error } = await supabase
    .from("contacts")
    .update({ is_read: true })
    .eq("id", id);

  if (error) throw error;
}

// ──────────────────────────────────────
// Dashboard
// ──────────────────────────────────────

export interface DashboardStats {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  totalComments: number;
  pendingComments: number;
  unreadContacts: number;
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const [posts, published, drafts, comments, pendingComments, unreadContacts] =
    await Promise.all([
      supabase.from("posts").select("*", { count: "exact", head: true }),
      supabase
        .from("posts")
        .select("*", { count: "exact", head: true })
        .eq("status", "published"),
      supabase
        .from("posts")
        .select("*", { count: "exact", head: true })
        .eq("status", "draft"),
      supabase.from("comments").select("*", { count: "exact", head: true }),
      supabase
        .from("comments")
        .select("*", { count: "exact", head: true })
        .eq("is_approved", false),
      supabase
        .from("contacts")
        .select("*", { count: "exact", head: true })
        .eq("is_read", false),
    ]);

  return {
    totalPosts: posts.count ?? 0,
    publishedPosts: published.count ?? 0,
    draftPosts: drafts.count ?? 0,
    totalComments: comments.count ?? 0,
    pendingComments: pendingComments.count ?? 0,
    unreadContacts: unreadContacts.count ?? 0,
  };
}

export async function fetchRecentComments() {
  const { data, error } = await supabase
    .from("comments")
    .select("*, posts(title, slug)")
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) throw error;
  return (data ?? []) as CommentWithPost[];
}

// ──────────────────────────────────────
// Thumbnail Upload
// ──────────────────────────────────────

export async function uploadThumbnail(file: File): Promise<string> {
  const ext = file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const filePath = `thumbnails/${fileName}`;

  const { error } = await supabase.storage
    .from("thumbnails")
    .upload(filePath, file);

  if (error) throw error;

  const {
    data: { publicUrl },
  } = supabase.storage.from("thumbnails").getPublicUrl(filePath);

  return publicUrl;
}

// ──────────────────────────────────────
// Slug validation
// ──────────────────────────────────────

export async function checkSlugAvailability(
  slug: string,
  excludeId?: string
): Promise<boolean> {
  let query = supabase.from("posts").select("id").eq("slug", slug);

  if (excludeId) {
    query = query.neq("id", excludeId);
  }

  const { data, error } = await query;

  if (error) throw error;

  return (data?.length ?? 0) === 0;
}
