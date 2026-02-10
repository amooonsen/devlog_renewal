import Link from "next/link";
import Image from "next/image";
import dayjs from "dayjs";

interface PostCardProps {
  title: string;
  slug: string;
  excerpt: string | null;
  thumbnailUrl: string | null;
  publishedAt: string | null;
  categoryName: string;
  categorySlug: string;
  tags: { name: string; slug: string }[];
  viewCount: number;
  featured?: boolean;
}

export function PostCard({
  title,
  slug,
  excerpt,
  thumbnailUrl,
  publishedAt,
  categoryName,
  categorySlug,
  tags,
  viewCount,
  featured = false,
}: PostCardProps) {
  const href = `/post/${categorySlug}/${slug}`;

  return (
    <article
      className={`group rounded-lg border border-border bg-card transition-colors hover:bg-accent/50 ${
        featured ? "md:col-span-2" : ""
      }`}
    >
      <Link href={href} className="flex flex-col gap-4 p-4 sm:flex-row">
        {thumbnailUrl && (
          <div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-md sm:w-48">
            <Image
              src={thumbnailUrl}
              alt={title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, 192px"
            />
          </div>
        )}

        <div className="flex flex-1 flex-col justify-between gap-2">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-primary">
                {categoryName}
              </span>
              {publishedAt && (
                <span className="text-xs text-muted-foreground">
                  {dayjs(publishedAt).format("YYYY.MM.DD")}
                </span>
              )}
            </div>

            <h3 className="text-lg font-semibold leading-snug group-hover:text-primary">
              {title}
            </h3>

            {excerpt && (
              <p className="line-clamp-2 text-sm text-muted-foreground">
                {excerpt}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-1.5">
              {tags.slice(0, 3).map((tag) => (
                <span
                  key={tag.slug}
                  className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
                >
                  {tag.name}
                </span>
              ))}
            </div>

            <span className="text-xs text-muted-foreground">
              조회 {viewCount}
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
