import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { getAllPublishedSlugs, getCategories } from "@/lib/posts";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [postsResult, categoriesResult] = await Promise.all([
    getAllPublishedSlugs(),
    getCategories(),
  ]);

  const posts = postsResult.data ?? [];
  const categories = categoriesResult.data ?? [];

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
