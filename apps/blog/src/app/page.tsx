import Link from "next/link";
import { siteConfig } from "@/config/site";

export default function HomePage() {
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

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Recent Posts</h2>
          <Link
            href="/post"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            View all →
          </Link>
        </div>
        <p className="text-muted-foreground">
          Coming soon. Posts will be loaded from Supabase.
        </p>
      </section>
    </div>
  );
}
