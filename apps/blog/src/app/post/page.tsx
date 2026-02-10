import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Posts",
  description: "모든 포스트 목록",
};

export default function PostListPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Posts</h1>
        <p className="mt-2 text-muted-foreground">
          모든 포스트를 확인하세요.
        </p>
      </div>

      <p className="text-muted-foreground">
        Coming soon. Posts will be loaded from Supabase.
      </p>
    </div>
  );
}
