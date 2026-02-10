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

export function useComments(filter?: CommentFilter) {
  return useQuery({
    queryKey: ["comments", filter],
    queryFn: () => fetchComments(filter),
  });
}

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
