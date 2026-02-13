import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  fetchPosts,
  fetchPost,
  createPost,
  updatePost,
  deletePost,
  fetchCategories,
  fetchTags,
  type PostFilter,
  type PostFormData,
} from "@/lib/api";

/**
 * 포스트 목록을 조회하는 쿼리 훅입니다.
 *
 * @param filter - 상태/페이지 필터 옵션
 */
export function usePosts(filter?: PostFilter) {
  return useQuery({
    queryKey: ["posts", filter],
    queryFn: () => fetchPosts(filter),
  });
}

/**
 * 단일 포스트를 ID로 조회하는 쿼리 훅입니다.
 *
 * id가 undefined이면 쿼리를 비활성화합니다.
 *
 * @param id - 포스트 UUID
 */
export function usePost(id: string | undefined) {
  return useQuery({
    queryKey: ["posts", id],
    queryFn: () => fetchPost(id!),
    enabled: !!id,
  });
}

/**
 * 포스트 생성 뮤테이션 훅입니다.
 *
 * 성공 시 포스트 목록과 대시보드 캐시를 무효화합니다.
 */
export function useCreatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: PostFormData) => createPost(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

/**
 * 포스트 수정 뮤테이션 훅입니다.
 *
 * 성공 시 포스트 목록, 해당 포스트, 대시보드 캐시를 무효화합니다.
 */
export function useUpdatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PostFormData }) =>
      updatePost(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["posts", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

/**
 * 포스트 삭제(소프트 삭제) 뮤테이션 훅입니다.
 *
 * 성공 시 포스트 목록과 대시보드 캐시를 무효화합니다.
 */
export function useDeletePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

/**
 * 카테고리 목록을 조회하는 쿼리 훅입니다.
 *
 * staleTime 30분으로 불필요한 재요청을 방지합니다.
 */
export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    staleTime: 1000 * 60 * 30,
  });
}

/**
 * 태그 목록을 조회하는 쿼리 훅입니다.
 *
 * staleTime 30분으로 불필요한 재요청을 방지합니다.
 */
export function useTags() {
  return useQuery({
    queryKey: ["tags"],
    queryFn: fetchTags,
    staleTime: 1000 * 60 * 30,
  });
}
