import Link from "next/link";
import { siteConfig } from "@/config/site";
import { getFeaturedPosts, getPublishedPosts } from "@/lib/posts";
import { PostList } from "@/components/post/PostList";

export default async function HomePage() {
  const [featured, recent] = await Promise.all([
    getFeaturedPosts(),
    getPublishedPosts({ limit: 5 }),
  ]);

  return (
    <div className="space-y-12">
      <section className="space-y-4 pt-8">
        <h1 className="text-4xl font-bold tracking-tight">
          {siteConfig.name}
        </h1>
        <p className="text-lg text-muted-foreground">
          {siteConfig.description}
        </p>
      </section>

      {featured.data && featured.data.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Featured</h2>
          <PostList posts={featured.data} />
        </section>
      )}

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Recent Posts</h2>
          <Link
            href="/post"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            모두 보기 →
          </Link>
        </div>
        {recent.data && recent.data.length > 0 ? (
          <PostList posts={recent.data} />
        ) : (
          <p className="py-8 text-center text-muted-foreground">
            아직 포스트가 없습니다.
          </p>
        )}
      </section>
    </div>
  );
}
