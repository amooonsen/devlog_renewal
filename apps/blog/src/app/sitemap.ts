import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

// sitemap은 빌드 시 정적 생성이므로 cookies() 기반 Supabase 사용 불가
// 런타임에서만 동적 포스트 URL을 생성
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let posts: { slug: string; updated_at: string; categories: { slug: string } | null }[] = [];
  let categories: { slug: string }[] = [];

  try {
    const { getAllPublishedSlugs, getCategories } = await import("@/lib/posts");
    const [postsResult, categoriesResult] = await Promise.all([
      getAllPublishedSlugs(),
      getCategories(),
    ]);
    posts = postsResult.data ?? [];
    categories = categoriesResult.data ?? [];
  } catch {
    // 빌드 시 Supabase 접근 실패 시 기본 정적 URL만 반환
  }

  const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${siteConfig.url}/post/${post.categories?.slug ?? "uncategorized"}/${post.slug}`,
    lastModified: post.updated_at,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const categoryEntries: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${siteConfig.url}/post/${cat.slug}`,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [
    {
      url: siteConfig.url,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${siteConfig.url}/post`,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteConfig.url}/contact`,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    ...categoryEntries,
    ...postEntries,
  ];
}
