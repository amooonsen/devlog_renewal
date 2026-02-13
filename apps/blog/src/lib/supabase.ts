import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@repo/database";

/**
 * Next.js 서버 환경용 Supabase 클라이언트를 생성합니다.
 *
 * next/headers의 cookies()를 사용하여 요청별 인증 상태를 관리하며,
 * Server Component에서 호출 시 쿠키 쓰기는 무시됩니다.
 *
 * @returns Supabase 서버 클라이언트 인스턴스
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(
          cookiesToSet: {
            name: string;
            value: string;
            options: CookieOptions;
          }[]
        ) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component에서 호출 시 쿠키는 읽기 전용
          }
        },
      },
    }
  );
}
