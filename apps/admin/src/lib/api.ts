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

/** 포스트 목록 필터 옵션 */
export interface PostFilter {
  status?: PostStatus;
  page?: number;
  perPage?: number;
}

/** 포스트 작성/수정 폼 데이터 */
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

/**
 * 포스트 목록을 필터링하여 페이지네이션 조회합니다.
 *
 * 카테고리, 태그 관계를 조인하여 반환하며,
 * post_tags 중간 테이블을 tags 배열로 평탄화합니다.
 *
 * @param filter - 상태, 페이지, 페이지당 개수 필터
 * @returns 포스트 목록과 전체 개수
 */
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

  // post_tags 관계를 tags 배열로 평탄화
  const posts: PostWithRelations[] = (data ?? []).map((post) => ({
    ...post,
    category: post.categories,
    tags: post.post_tags?.map((pt: { tags: Tag }) => pt.tags) ?? [],
  }));

  return { posts, total: count ?? 0 };
}

/**
 * ID로 단일 포스트를 상세 조회합니다.
 *
 * @param id - 포스트 UUID
 * @returns 카테고리/태그를 포함한 포스트 상세 데이터
 */
export async function fetchPost(id: string): Promise<PostWithRelations> {
  const { data, error } = await supabase
    .from("posts")
    .select("*, categories(*), post_tags(tags(*))")
    .eq("id", id)
    .single();

  if (error) throw error;

  return {
    ...data,
    category: data.categories,
    tags: data.post_tags?.map((pt: { tags: Tag }) => pt.tags) ?? [],
  };
}

/**
 * 새 포스트를 생성합니다.
 *
 * 발행(published) 상태이고 published_at이 미지정이면 현재 시각으로 자동 설정됩니다.
 * 태그 연결은 post_tags 중간 테이블에 별도 삽입합니다.
 *
 * @param formData - 포스트 폼 데이터 (태그 ID 배열 포함)
 * @returns 생성된 포스트
 */
export async function createPost(formData: PostFormData): Promise<Post> {
  const { tag_ids, ...postData } = formData;

  // 발행 시 published_at 자동 설정
  if (postData.status === "published" && !postData.published_at) {
    postData.published_at = new Date().toISOString();
  }

  // 빈 문자열 → null 변환 (timestamptz/text nullable 컬럼 호환)
  const insertData = {
    ...postData,
    published_at: postData.published_at || null,
    thumbnail_url: postData.thumbnail_url || null,
    excerpt: postData.excerpt || null,
  };

  const { data, error } = await supabase
    .from("posts")
    .insert(insertData)
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

/**
 * 기존 포스트를 수정합니다.
 *
 * updated_at을 현재 시각으로 갱신하며,
 * 태그는 기존 연결을 전부 삭제 후 재삽입하는 전략입니다.
 *
 * @param id - 수정할 포스트 UUID
 * @param formData - 포스트 폼 데이터
 * @returns 수정된 포스트
 */
export async function updatePost(
  id: string,
  formData: PostFormData
): Promise<Post> {
  const { tag_ids, ...postData } = formData;

  // 빈 문자열 → null 변환 (timestamptz/text nullable 컬럼 호환)
  const updateData = {
    ...postData,
    published_at: postData.published_at || null,
    thumbnail_url: postData.thumbnail_url || null,
    excerpt: postData.excerpt || null,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("posts")
    .update(updateData)
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

/**
 * 포스트를 소프트 삭제합니다 (archived 상태로 변경).
 *
 * 실제 DB 행을 삭제하지 않고 status를 archived로 변경합니다.
 *
 * @param id - 삭제할 포스트 UUID
 */
export async function deletePost(id: string): Promise<void> {
  const { error } = await supabase
    .from("posts")
    .update({ status: "archived" as PostStatus })
    .eq("id", id);

  if (error) throw error;
}

// ──────────────────────────────────────
// Categories
// ──────────────────────────────────────

/**
 * 전체 카테고리 목록을 정렬 순서대로 조회합니다.
 *
 * @returns 카테고리 배열
 */
export async function fetchCategories(): Promise<Category[]> {
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

/**
 * 전체 태그 목록을 이름순으로 조회합니다.
 *
 * @returns 태그 배열
 */
export async function fetchTags(): Promise<Tag[]> {
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

/** 댓글 목록 필터 옵션 */
export interface CommentFilter {
  isApproved?: boolean;
  page?: number;
  perPage?: number;
}

/** 포스트 정보를 포함한 댓글 타입 */
export type CommentWithPost = Comment & {
  posts: { title: string; slug: string } | null;
};

/**
 * 댓글 목록을 필터링하여 페이지네이션 조회합니다.
 *
 * 연관된 포스트의 제목과 슬러그를 조인하여 반환합니다.
 *
 * @param filter - 승인 상태, 페이지, 페이지당 개수 필터
 * @returns 댓글 목록과 전체 개수
 */
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

/**
 * 댓글을 승인 처리합니다.
 *
 * @param id - 승인할 댓글 ID
 */
export async function approveComment(id: number): Promise<void> {
  const { error } = await supabase
    .from("comments")
    .update({ is_approved: true })
    .eq("id", id);

  if (error) throw error;
}

/**
 * 댓글을 거부 처리합니다 (승인 취소).
 *
 * @param id - 거부할 댓글 ID
 */
export async function rejectComment(id: number): Promise<void> {
  const { error } = await supabase
    .from("comments")
    .update({ is_approved: false })
    .eq("id", id);

  if (error) throw error;
}

/**
 * 댓글을 영구 삭제합니다.
 *
 * @param id - 삭제할 댓글 ID
 */
export async function deleteComment(id: number): Promise<void> {
  const { error } = await supabase.from("comments").delete().eq("id", id);
  if (error) throw error;
}

// ──────────────────────────────────────
// Contacts
// ──────────────────────────────────────

/** 문의 목록 필터 옵션 */
export interface ContactFilter {
  isRead?: boolean;
  page?: number;
  perPage?: number;
}

/**
 * 문의 목록을 필터링하여 페이지네이션 조회합니다.
 *
 * @param filter - 읽음 상태, 페이지, 페이지당 개수 필터
 * @returns 문의 목록과 전체 개수
 */
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

/**
 * 문의를 읽음 처리합니다.
 *
 * @param id - 읽음 처리할 문의 ID
 */
export async function markContactAsRead(id: number): Promise<void> {
  const { error } = await supabase
    .from("contacts")
    .update({ is_read: true })
    .eq("id", id);

  if (error) throw error;
}

// ──────────────────────────────────────
// Dashboard
// ──────────────────────────────────────

/** 대시보드 통계 데이터 타입 */
export interface DashboardStats {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  totalComments: number;
  pendingComments: number;
  unreadContacts: number;
}

/**
 * 대시보드 통계를 병렬로 조회합니다.
 *
 * 6개의 count 쿼리를 Promise.all로 동시 실행하여
 * 포스트/댓글/문의의 각종 상태별 개수를 집계합니다.
 *
 * @returns 대시보드 통계 데이터
 */
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

/**
 * 최근 댓글 5개를 조회합니다.
 *
 * 대시보드 최근 활동 섹션에 표시되며,
 * 연관 포스트의 제목과 슬러그를 포함합니다.
 *
 * @returns 최근 댓글 목록
 */
export async function fetchRecentComments(): Promise<CommentWithPost[]> {
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

/**
 * 썸네일 이미지를 Supabase Storage에 업로드합니다.
 *
 * 파일명에 타임스탬프와 UUID를 조합하여 충돌을 방지하며,
 * 업로드 후 공개 URL을 반환합니다.
 *
 * @param file - 업로드할 이미지 파일
 * @returns 업로드된 이미지의 공개 URL
 */
export async function uploadThumbnail(file: File): Promise<string> {
  const ext = file.name.split(".").pop();
  const fileName = `${Date.now()}-${crypto.randomUUID()}.${ext}`;
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

/**
 * 포스트 슬러그의 사용 가능 여부를 확인합니다.
 *
 * 수정 시에는 자기 자신을 제외하고 중복 검사를 수행합니다.
 *
 * @param slug - 확인할 슬러그
 * @param excludeId - 수정 시 제외할 포스트 ID
 * @returns 사용 가능하면 true
 */
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
