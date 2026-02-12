import { NextResponse } from "next/server";
import { incrementViewCount } from "@/lib/posts";

/**
 * 포스트 조회수를 증가시킵니다.
 *
 * 클라이언트 ViewCounter 컴포넌트에서 포스트 로드 시 호출되며,
 * Supabase RPC로 원자적 증가를 수행합니다.
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;

    if (!postId) {
      return NextResponse.json(
        { error: "Post ID is required" },
        { status: 400 }
      );
    }

    await incrementViewCount(postId);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to increment view count" },
      { status: 500 }
    );
  }
}
