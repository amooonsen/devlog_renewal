import type { Metadata } from "next";

interface Props {
  params: Promise<{ category: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  return {
    title: category.charAt(0).toUpperCase() + category.slice(1),
    description: `${category} 카테고리 포스트 목록`,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { category } = await params;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight capitalize">
          {category}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {category} 카테고리의 포스트입니다.
        </p>
      </div>

      <p className="text-muted-foreground">
        Coming soon. Posts will be loaded from Supabase.
      </p>
    </div>
  );
}
