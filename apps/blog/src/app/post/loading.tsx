export default function PostListLoading() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="h-9 w-48 animate-pulse rounded bg-muted" />
        <div className="h-5 w-64 animate-pulse rounded bg-muted" />
      </div>

      {/* 카테고리 필터 스켈레톤 */}
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-8 w-20 animate-pulse rounded-full bg-muted" />
        ))}
      </div>

      {/* 포스트 카드 스켈레톤 */}
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="flex gap-4 rounded-lg border border-border p-4"
          >
            <div className="h-24 w-48 shrink-0 animate-pulse rounded-md bg-muted" />
            <div className="flex-1 space-y-3">
              <div className="h-4 w-32 animate-pulse rounded bg-muted" />
              <div className="h-6 w-3/4 animate-pulse rounded bg-muted" />
              <div className="h-4 w-full animate-pulse rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
