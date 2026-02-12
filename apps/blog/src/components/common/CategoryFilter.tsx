import Link from "next/link";

interface CategoryFilterProps {
  categories: { name: string; slug: string }[];
  currentSlug?: string;
}

export function CategoryFilter({
  categories,
  currentSlug,
}: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href="/post"
        className={`rounded-full px-3 py-1 text-sm transition-colors ${
          !currentSlug
            ? "bg-primary text-primary-foreground"
            : "bg-secondary text-secondary-foreground hover:bg-accent"
        }`}
      >
        전체
      </Link>
      {categories.map((cat) => (
        <Link
          key={cat.slug}
          href={`/post/${cat.slug}`}
          className={`rounded-full px-3 py-1 text-sm transition-colors ${
            currentSlug === cat.slug
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground hover:bg-accent"
          }`}
        >
          {cat.name}
        </Link>
      ))}
    </div>
  );
}
