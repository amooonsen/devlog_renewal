import type { Metadata } from "next";
import { Suspense } from "react";
import { getPublishedPosts, getCategories } from "@/lib/posts";
import { matchesKoreanSearch } from "@/lib/search";
import { PostList } from "@/components/post/PostList";
import { Pagination } from "@/components/common/Pagination";
import { CategoryFilter } from "@/components/common/CategoryFilter";
import { SearchInput } from "@/components/common/SearchInput";

export const metadata: Metadata = {
  title: "Posts",
  description: "모든 포스트 목록",
};

interface Props {
  searchParams: Promise<{ page?: string; q?: string }>;
}

export default async function PostListPage({ searchParams }: Props) {
  const { page: pageParam, q } = await searchParams;
  const currentPage = Math.max(1, Number(pageParam) || 1);
  const perPage = 10;

  const [postsResult, categoriesResult] = await Promise.all([
    getPublishedPosts({ page: currentPage, limit: q ? 50 : perPage }),
    getCategories(),
  ]);

  let posts = postsResult.data ?? [];
  let totalCount = postsResult.count ?? 0;

  // 검색어가 있으면 es-hangul로 필터링
  if (q?.trim()) {
    posts = posts.filter(
      (post) =>
        matchesKoreanSearch(post.title, q) ||
        (post.excerpt && matchesKoreanSearch(post.excerpt, q))
    );
    totalCount = posts.length;
    // 검색 결과 페이지네이션
    const offset = (currentPage - 1) * perPage;
    posts = posts.slice(offset, offset + perPage);
  }

  const totalPages = Math.ceil(totalCount / perPage);
  const categories = categoriesResult.data ?? [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Posts</h1>
        <p className="mt-2 text-muted-foreground">
          모든 포스트를 확인하세요.
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Suspense fallback={null}>
          <SearchInput basePath="/post" />
        </Suspense>
        <CategoryFilter categories={categories} />
      </div>

      <PostList posts={posts} />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        basePath="/post"
        searchParams={q ? { q } : undefined}
      />
    </div>
  );
}
