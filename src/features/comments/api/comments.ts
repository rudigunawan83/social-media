import apiClient from "@/lib/axios";
import { Comment } from "@/types/models";
import { PaginatedResult } from "@/types/api";
import { normalizeComment, toPaginatedComments, unwrapData } from "@/lib/normalize";

export const commentsApi = {
  getComments: async (
    postId: number,
    page = 1,
    limit = 20
  ): Promise<PaginatedResult<Comment>> => {
    const { data } = await apiClient.get(`/api/posts/${postId}/comments`, {
      params: { page, limit },
    });
    return toPaginatedComments(data);
  },

  createComment: async (postId: number, text: string): Promise<Comment> => {
    const { data } = await apiClient.post(`/api/posts/${postId}/comments`, { text });
    return normalizeComment(unwrapData(data));
  },

  deleteComment: async (id: number): Promise<{ success: boolean }> => {
    const { data } = await apiClient.delete(`/api/comments/${id}`);
    return data;
  },
};
