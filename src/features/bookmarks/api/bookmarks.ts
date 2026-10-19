import apiClient from "@/lib/axios";
import { Post } from "@/types/models";

export const bookmarksApi = {
  savePost: async (id: number): Promise<{ success: boolean }> => {
    const { data } = await apiClient.post(`/api/posts/${id}/save`);
    return data;
  },

  unsavePost: async (id: number): Promise<{ success: boolean }> => {
    const { data } = await apiClient.delete(`/api/posts/${id}/save`);
    return data;
  },

  getMySaved: async (page = 1, limit = 20): Promise<Post[]> => {
    const { data } = await apiClient.get("/api/me/saved", { params: { page, limit } });
    const list = data.data || data.items || data;
    return Array.isArray(list) ? list : [];
  },
};
