import type { Metadata } from "next";
import { Suspense } from "react";
import { getPublishedPosts, getCategories } from "@/lib/posts";
import { matchesKoreanSearch } from "@/lib/search";
import { PostList } from "@/components/post/PostList";
import { Pagination } from "@/components/common/Pagination";
import { CategoryFilter } from "@/components/common/CategoryFilter";
import { SearchInput } from "@/components/common/SearchInput";
import { notFound } from "next/navigation";

// 60초마다 재검증 (ISR)
export const revalidate = 60;

interface Props {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ page?: string; q?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const { data: categories } = await getCategories();
  const cat = categories?.find((c) => c.slug === category);

  return {
    title: cat?.name ?? category,
    description: cat?.description ?? `${category} 카테고리 포스트 목록`,
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { category } = await params;
  const { page: pageParam, q } = await searchParams;
  const currentPage = Math.max(1, Number(pageParam) || 1);
  const perPage = 10;

  const [postsResult, categoriesResult] = await Promise.all([
    getPublishedPosts({ category, page: currentPage, limit: q ? 50 : perPage }),
    getCategories(),
  ]);

  const categories = categoriesResult.data ?? [];
  const currentCategory = categories.find((c) => c.slug === category);

  if (!currentCategory) {
    notFound();
  }

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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {currentCategory.name}
        </h1>
        {currentCategory.description && (
          <p className="mt-2 text-muted-foreground">
            {currentCategory.description}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Suspense fallback={null}>
          <SearchInput basePath={`/post/${category}`} />
        </Suspense>
        <CategoryFilter categories={categories} currentSlug={category} />
      </div>

      <PostList posts={posts} />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        basePath={`/post/${category}`}
        searchParams={q ? { q } : undefined}
      />
    </div>
  );
}
