import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20">
      <h1 className="text-6xl font-bold">404</h1>
      <p className="text-lg text-muted-foreground">
        페이지를 찾을 수 없습니다.
      </p>
      <Link
        href="/"
        className="text-sm text-primary underline-offset-4 hover:underline"
      >
        홈으로 돌아가기
      </Link>
    </div>
  );
}
