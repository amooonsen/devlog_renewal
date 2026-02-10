import type { Metadata } from "next";
import Link from "next/link";
import dayjs from "dayjs";
import { notFound } from "next/navigation";
import { getPost } from "@/lib/posts";
import { getCommentsByPost } from "@/lib/comments";
import { renderMDX } from "@/lib/mdx";
import { CommentSection } from "@/components/comment/CommentSection";
import { ViewCounter } from "@/components/post/ViewCounter";

// 빌드 시 cookies() 사용 불가하므로 동적 렌더링
export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ category: string; slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category, slug } = await params;
  const { data: post } = await getPost(category, slug);

  if (!post) {
    return { title: "Post Not Found" };
  }

  return {
    title: post.title,
    description: post.excerpt ?? `${post.title} - DevLog`,
    openGraph: {
      title: post.title,
      description: post.excerpt ?? undefined,
      type: "article",
      publishedTime: post.published_at ?? undefined,
      images: post.thumbnail_url ? [{ url: post.thumbnail_url }] : undefined,
    },
  };
}

export default async function PostDetailPage({ params }: Props) {
  const { category, slug } = await params;
  const { data: post } = await getPost(category, slug);
  if (!post) {
    notFound();
  }

  const tags =
    post.post_tags
      ?.map((pt) => pt.tags)
      .filter((t): t is { name: string; slug: string } => t !== null) ?? [];

  // 댓글은 post.id로 조회
  const { data: comments } = await getCommentsByPost(post.id);

  // MDX 렌더링
  const content = await renderMDX(post.content);

  return (
    <article className="mx-auto max-w-3xl">
      {/* 헤더 */}
      <header className="space-y-4 border-b border-border pb-8">
        <div className="flex items-center gap-2 text-sm">
          <Link
            href={`/post/${post.categories?.slug ?? category}`}
            className="font-medium text-primary hover:underline"
          >
            {post.categories?.name ?? category}
          </Link>
          {post.published_at && (
            <>
              <span className="text-muted-foreground">·</span>
              <time className="text-muted-foreground">
                {dayjs(post.published_at).format("YYYY년 MM월 DD일")}
              </time>
            </>
          )}
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground">
            조회 {post.view_count}
          </span>
        </div>

        <h1 className="text-4xl font-bold tracking-tight">{post.title}</h1>

        {post.excerpt && (
          <p className="text-lg text-muted-foreground">{post.excerpt}</p>
        )}

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag.slug}
                className="rounded-full bg-secondary px-3 py-1 text-sm text-secondary-foreground"
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}
      </header>

      {/* 본문 */}
      <div className="prose prose-neutral dark:prose-invert max-w-none py-8">
        {content}
      </div>

      {/* 조회수 카운터 (클라이언트) */}
      <ViewCounter postId={post.id} />

      {/* 하단 네비게이션 */}
      <div className="border-t border-border pt-8">
        <Link
          href={`/post/${post.categories?.slug ?? category}`}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← {post.categories?.name ?? category} 목록으로
        </Link>
      </div>

      {/* 댓글 섹션 */}
      <CommentSection
        postId={post.id}
        comments={comments ?? []}
      />
    </article>
  );
}
