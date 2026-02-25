import type { PostListQueryResult } from "@repo/types";
import { extractTags } from "@/lib/post-utils";
import { PostCard } from "./PostCard";

interface PostListProps {
  posts: PostListQueryResult[];
}

export function PostList({ posts }: PostListProps) {
  if (posts.length === 0) {
    return (
      <p className="py-12 text-center text-muted-foreground">
        포스트가 없습니다.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          title={post.title}
          slug={post.slug}
          excerpt={post.excerpt}
          thumbnailUrl={post.thumbnail_url}
          publishedAt={post.published_at}
          categoryName={post.categories?.name ?? ""}
          categorySlug={post.categories?.slug ?? ""}
          tags={extractTags(post.post_tags)}
          viewCount={post.view_count}
          featured={post.is_featured}
        />
      ))}
    </div>
  );
}
