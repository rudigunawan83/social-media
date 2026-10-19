import apiClient from "@/lib/axios";
import { Comment } from "@/types/models";

export const commentsApi = {
  getComments: async (postId: number, page = 1, limit = 20): Promise<Comment[]> => {
    const { data } = await apiClient.get(`/api/posts/${postId}/comments`, { params: { page, limit } });
    const list = data.data || data.items || data;
    return Array.isArray(list) ? list : [];
  },

  createComment: async (postId: number, text: string): Promise<Comment> => {
    const { data } = await apiClient.post(`/api/posts/${postId}/comments`, { text });
    return data.data || data;
  },

  deleteComment: async (id: number): Promise<{ success: boolean }> => {
    const { data } = await apiClient.delete(`/api/comments/${id}`);
    return data;
  },
};
