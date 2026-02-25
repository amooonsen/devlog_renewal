import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase";
import { commentSchema } from "@/lib/schemas";

const commentPostSchema = commentSchema.extend({
  post_id: z.string().min(1, "포스트 ID가 필요합니다."),
  parent_id: z.number().nullable().optional(),
});

const commentDeleteSchema = z.object({
  comment_id: z.number().int(),
  password: z.string().min(1, "비밀번호를 입력해주세요."),
});

/**
 * 새 댓글을 작성합니다.
 *
 * 요청 본문에 post_id, author_name, content, password가 필수이며,
 * parent_id를 지정하면 대댓글로 등록됩니다.
 * 새 댓글은 미승인 상태(is_approved=false)로 생성됩니다.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = commentPostSchema.safeParse(body);

    if (!result.success) {
      const message = result.error.issues[0]?.message ?? "입력값이 올바르지 않습니다.";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const { post_id, author_name, content, password, parent_id } = result.data;

    const supabase = await createClient();

    // @supabase/ssr의 createServerClient는 INSERT 타입을 never로 추론하는 SDK 제한
    // 런타임에서는 RLS 정책에 의해 정상 동작
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from("comments").insert({
      post_id,
      author_name: author_name.trim(),
      content: content.trim(),
      password,
      parent_id: parent_id ?? null,
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

/**
 * 비밀번호 확인 후 댓글을 삭제합니다.
 *
 * 작성 시 입력한 비밀번호와 일치해야 삭제가 가능합니다.
 */
export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const result = commentDeleteSchema.safeParse(body);

    if (!result.success) {
      const message = result.error.issues[0]?.message ?? "입력값이 올바르지 않습니다.";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const { comment_id, password } = result.data;

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
