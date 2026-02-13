export default function PostDetailLoading() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* 헤더 스켈레톤 */}
      <div className="space-y-4 border-b border-border pb-8">
        <div className="flex gap-2">
          <div className="h-4 w-16 animate-pulse rounded bg-muted" />
          <div className="h-4 w-24 animate-pulse rounded bg-muted" />
        </div>
        <div className="h-10 w-3/4 animate-pulse rounded bg-muted" />
        <div className="h-5 w-full animate-pulse rounded bg-muted" />
        <div className="flex gap-2">
          <div className="h-7 w-16 animate-pulse rounded-full bg-muted" />
          <div className="h-7 w-20 animate-pulse rounded-full bg-muted" />
        </div>
      </div>

      {/* 본문 스켈레톤 */}
      <div className="space-y-4 py-8">
        {[95, 80, 88, 72, 96, 84, 78, 90].map((w, i) => (
          <div
            key={i}
            className="h-4 animate-pulse rounded bg-muted"
            style={{ width: `${w}%` }}
          />
        ))}
      </div>
    </div>
  );
}
