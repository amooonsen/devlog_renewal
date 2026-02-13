import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  fetchComments,
  approveComment,
  rejectComment,
  deleteComment,
  type CommentFilter,
} from "@/lib/api";

/**
 * 댓글 목록을 조회하는 쿼리 훅입니다.
 *
 * @param filter - 승인 상태/페이지 필터 옵션
 */
export function useComments(filter?: CommentFilter) {
  return useQuery({
    queryKey: ["comments", filter],
    queryFn: () => fetchComments(filter),
  });
}

/**
 * 댓글 승인 뮤테이션 훅입니다.
 *
 * 성공 시 댓글 목록과 대시보드 캐시를 무효화합니다.
 */
export function useApproveComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => approveComment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

/**
 * 댓글 거부 뮤테이션 훅입니다.
 *
 * 성공 시 댓글 목록과 대시보드 캐시를 무효화합니다.
 */
export function useRejectComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => rejectComment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

/**
 * 댓글 삭제 뮤테이션 훅입니다.
 *
 * 성공 시 댓글 목록과 대시보드 캐시를 무효화합니다.
 */
export function useDeleteComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteComment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
