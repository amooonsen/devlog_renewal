import { PostCard } from "./PostCard";

interface PostItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  thumbnail_url: string | null;
  published_at: string | null;
  view_count: number;
  is_featured: boolean;
  categories: { name: string; slug: string } | null;
  post_tags: { tags: { name: string; slug: string } | null }[] | null;
}

interface PostListProps {
  posts: PostItem[];
}

function extractTags(
  postTags: { tags: { name: string; slug: string } | null }[] | null
): { name: string; slug: string }[] {
  if (!postTags) return [];
  return postTags
    .map((pt) => pt.tags)
    .filter((t): t is { name: string; slug: string } => t !== null);
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
