import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { post_id, author_name, content, password, parent_id } = body;

    if (!post_id || !author_name || !content || !password) {
      return NextResponse.json(
        { error: "필수 항목을 모두 입력해주세요." },
        { status: 400 }
      );
    }

    if (author_name.length > 50) {
      return NextResponse.json(
        { error: "이름은 50자 이내로 입력해주세요." },
        { status: 400 }
      );
    }

    if (content.length > 1000) {
      return NextResponse.json(
        { error: "댓글은 1000자 이내로 입력해주세요." },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from("comments").insert({
      post_id,
      author_name: author_name.trim(),
      content: content.trim(),
      password,
      parent_id: parent_id || null,
    });

    if (error) {
      return NextResponse.json(
        { error: "댓글 작성에 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { comment_id, password } = body;

    if (!comment_id || !password) {
      return NextResponse.json(
        { error: "필수 항목을 모두 입력해주세요." },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // 비밀번호 확인 후 삭제
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: comment } = await (supabase as any)
      .from("comments")
      .select("id, password")
      .eq("id", comment_id)
      .single();

    if (!comment) {
      return NextResponse.json(
        { error: "댓글을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    if (comment.password !== password) {
      return NextResponse.json(
        { error: "비밀번호가 일치하지 않습니다." },
        { status: 403 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from("comments")
      .delete()
      .eq("id", comment_id);

    if (error) {
      return NextResponse.json(
        { error: "댓글 삭제에 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
