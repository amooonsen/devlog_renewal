import type {Metadata} from "next";
import Link from "next/link";
import {formatKoreanDate} from "@repo/date-utils";
import {notFound} from "next/navigation";
import {getPost, getAllPublishedSlugs} from "@/lib/posts";
import {getCommentsByPost} from "@/lib/comments";
import {renderMDX, extractHeadings} from "@/lib/mdx";
import {CommentSection} from "@/components/comment/CommentSection";
import {ViewCounter} from "@/components/post/ViewCounter";
import {TableOfContents} from "@/components/post/TableOfContents";
import {ScrollToTop} from "@/components/common/ScrollToTop";
import {calculateReadTime, formatReadTime} from "@/lib/readTime";

// 빌드 시 게시된 포스트를 정적으로 생성, 1시간마다 ISR 재검증
export const revalidate = 3600;

export async function generateStaticParams() {
  const {data} = await getAllPublishedSlugs();
  return (data ?? []).map((post) => ({
    category: post.categories?.slug ?? "uncategorized",
    slug: post.slug,
  }));
}

interface Props {
  params: Promise<{category: string; slug: string}>;
}

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {category, slug} = await params;
  const {data: post} = await getPost(category, slug);

  if (!post) {
    return {title: "Post Not Found"};
  }

  return {
    title: post.title,
    description: post.excerpt ?? `${post.title} - DevLog`,
    openGraph: {
      title: post.title,
      description: post.excerpt ?? undefined,
      type: "article",
      publishedTime: post.published_at ?? undefined,
      images: post.thumbnail_url ? [{url: post.thumbnail_url}] : undefined,
    },
  };
}

export default async function PostDetailPage({params}: Props) {
  const {category, slug} = await params;
  const {data: post} = await getPost(category, slug);
  if (!post) {
    notFound();
  }

  const tags =
    post.post_tags
      ?.map((pt) => pt.tags)
      .filter((t): t is {name: string; slug: string} => t !== null) ?? [];

  // 댓글은 post.id로 조회
  const {data: comments} = await getCommentsByPost(post.id);

  // MDX 렌더링 및 TOC 추출
  const content = await renderMDX(post.content);
  const headings = extractHeadings(post.content);

  // 읽기 시간 계산
  const readTime = calculateReadTime(post.content);

  return (
    <div className="relative mx-auto max-w-7xl">
      {/* TOC - 데스크톱 우측 고정 */}
      {headings.length > 0 && (
        <aside className="fixed left-[calc(50%+400px)] top-24 hidden w-64 xl:block">
          <div className="sticky top-24">
            <TableOfContents headings={headings} />
          </div>
        </aside>
      )}

      <article className="mx-auto max-w-3xl">
        {/* 모바일 TOC */}
        {headings.length > 0 && (
          <div className="mb-8 rounded-lg border border-border bg-card p-6 xl:hidden">
            <TableOfContents headings={headings} />
          </div>
        )}

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
                <time className="text-muted-foreground">{formatKoreanDate(post.published_at)}</time>
              </>
            )}
            <span className="text-muted-foreground">·</span>
            <span className="text-muted-foreground">조회 {post.view_count}</span>
            <span className="text-muted-foreground">·</span>
            <span className="text-muted-foreground">{formatReadTime(readTime)}</span>
          </div>

          <h1 className="text-4xl font-bold tracking-tight">{post.title}</h1>

          {post.excerpt && <p className="text-lg text-muted-foreground">{post.excerpt}</p>}

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
        <div className="prose prose-neutral dark:prose-invert max-w-none py-8">{content}</div>

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
        <CommentSection postId={post.id} comments={comments ?? []} />
      </article>

      {/* 맨 위로 버튼 */}
      <ScrollToTop />
    </div>
  );
}
