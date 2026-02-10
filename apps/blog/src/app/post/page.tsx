import type { Metadata } from "next";
import { getPublishedPosts, getCategories } from "@/lib/posts";
import { PostList } from "@/components/post/PostList";
import { Pagination } from "@/components/common/Pagination";
import { CategoryFilter } from "@/components/common/CategoryFilter";

export const metadata: Metadata = {
  title: "Posts",
  description: "모든 포스트 목록",
};

interface Props {
  searchParams: Promise<{ page?: string }>;
}

export default async function PostListPage({ searchParams }: Props) {
  const { page: pageParam } = await searchParams;
  const currentPage = Math.max(1, Number(pageParam) || 1);
  const perPage = 10;

  const [postsResult, categoriesResult] = await Promise.all([
    getPublishedPosts({ page: currentPage, limit: perPage }),
    getCategories(),
  ]);

  const posts = postsResult.data ?? [];
  const totalCount = postsResult.count ?? 0;
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

      <CategoryFilter categories={categories} />

      <PostList posts={posts} />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        basePath="/post"
      />
    </div>
  );
}
