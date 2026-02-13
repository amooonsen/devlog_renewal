import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { getAllPublishedSlugs, getCategories } from "@/lib/posts";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let posts: { slug: string; updated_at: string; categories: { slug: string } | null }[] = [];
  let categories: { slug: string }[] = [];

  try {
    const [postsResult, categoriesResult] = await Promise.all([
      getAllPublishedSlugs(),
      getCategories(),
    ]);
    posts = postsResult.data ?? [];
    categories = categoriesResult.data ?? [];
  } catch {
    // Supabase 접근 실패 시 기본 정적 URL만 반환
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
