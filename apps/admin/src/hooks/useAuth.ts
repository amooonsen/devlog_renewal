import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

/**
 * Supabase Auth 기반 인증 상태 관리 훅입니다.
 *
 * 마운트 시 현재 세션을 확인하고,
 * onAuthStateChange로 인증 상태 변경을 실시간 구독합니다.
 *
 * @returns user - 현재 인증 사용자 (미인증 시 null)
 * @returns loading - 초기 세션 확인 중 여부
 * @returns signIn - 이메일/비밀번호 로그인 함수
 * @returns signOut - 로그아웃 함수
 */
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // refreshSession()으로 최신 app_metadata(role: admin)가 포함된 JWT 강제 갱신
    // 기존 세션이 마이그레이션 이전에 발급된 경우 RLS is_admin() 실패를 방지
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        const { data } = await supabase.auth.refreshSession();
        setUser(data.user ?? null);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  /** 이메일/비밀번호로 로그인합니다. */
  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  /** 현재 세션을 종료합니다. */
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return { user, loading, signIn, signOut };
}
