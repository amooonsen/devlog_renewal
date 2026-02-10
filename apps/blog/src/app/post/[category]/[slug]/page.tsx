import type { Metadata } from "next";

interface Props {
  params: Promise<{ category: string; slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  // TODO: Fetch post from Supabase and generate metadata
  return {
    title: slug.replace(/-/g, " "),
  };
}

export default async function PostDetailPage({ params }: Props) {
  const { category, slug } = await params;

  return (
    <article className="space-y-8">
      <header className="space-y-4">
        <p className="text-sm font-medium text-primary capitalize">
          {category}
        </p>
        <h1 className="text-4xl font-bold tracking-tight">
          {slug.replace(/-/g, " ")}
        </h1>
      </header>

      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <p className="text-muted-foreground">
          Coming soon. Post content will be rendered from Supabase.
        </p>
      </div>
    </article>
  );
}
