import type { Metadata } from "next";
import { getPublishedPosts, getCategories } from "@/lib/posts";
import { PostList } from "@/components/post/PostList";
import { Pagination } from "@/components/common/Pagination";
import { CategoryFilter } from "@/components/common/CategoryFilter";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ page?: string }>;
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
  const { page: pageParam } = await searchParams;
  const currentPage = Math.max(1, Number(pageParam) || 1);
  const perPage = 10;

  const [postsResult, categoriesResult] = await Promise.all([
    getPublishedPosts({ category, page: currentPage, limit: perPage }),
    getCategories(),
  ]);

  const categories = categoriesResult.data ?? [];
  const currentCategory = categories.find((c) => c.slug === category);

  if (!currentCategory) {
    notFound();
  }

  const posts = postsResult.data ?? [];
  const totalCount = postsResult.count ?? 0;
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

      <CategoryFilter categories={categories} currentSlug={category} />

      <PostList posts={posts} />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        basePath={`/post/${category}`}
      />
    </div>
  );
}
