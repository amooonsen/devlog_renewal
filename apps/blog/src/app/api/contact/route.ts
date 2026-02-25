import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase";
import { contactSchema } from "@/lib/schemas";

/**
 * 새 문의를 등록합니다.
 *
 * name, email, subject, message가 필수이며,
 * 이메일 형식 검증과 제목 길이(200자) 제한이 적용됩니다.
 * 등록된 문의는 미읽음 상태(is_read=false)로 생성됩니다.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = contactSchema.safeParse(body);

    if (!result.success) {
      const message = result.error.issues[0]?.message ?? "입력값이 올바르지 않습니다.";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const { name, email, subject, message } = result.data;

    const supabase = await createClient();

    // @supabase/ssr의 createServerClient는 INSERT 타입을 never로 추론하는 SDK 제한
    // 런타임에서는 RLS(contacts_anyone_insert)으로 정상 동작
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from("contacts").insert({
      name: name.trim(),
      email: email.trim(),
      subject: subject.trim(),
      message: message.trim(),
    });

    if (error) {
      return NextResponse.json(
        { error: "문의 등록에 실패했습니다." },
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
