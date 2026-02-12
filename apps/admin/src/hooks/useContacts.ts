import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  fetchContacts,
  markContactAsRead,
  type ContactFilter,
} from "@/lib/api";

/**
 * 문의 목록을 조회하는 쿼리 훅입니다.
 *
 * @param filter - 읽음 상태/페이지 필터 옵션
 */
export function useContacts(filter?: ContactFilter) {
  return useQuery({
    queryKey: ["contacts", filter],
    queryFn: () => fetchContacts(filter),
  });
}

/**
 * 문의 읽음 처리 뮤테이션 훅입니다.
 *
 * 성공 시 문의 목록과 대시보드 캐시를 무효화합니다.
 */
export function useMarkContactAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => markContactAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
