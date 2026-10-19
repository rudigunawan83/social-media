import apiClient from "@/lib/axios";
import { Post } from "@/types/models";

export const postsApi = {
  getFeed: async (page = 1, limit = 20): Promise<Post[]> => {
    const { data } = await apiClient.get("/api/feed", { params: { page, limit } });
    const list = data.data || data.items || data;
    return Array.isArray(list) ? list : [];
  },

  getExplorePosts: async (page = 1, limit = 20): Promise<Post[]> => {
    const { data } = await apiClient.get("/api/posts", { params: { page, limit } });
    const list = data.data || data.items || data;
    return Array.isArray(list) ? list : [];
  },

  getPostDetail: async (id: number): Promise<Post> => {
    const { data } = await apiClient.get(`/api/posts/${id}`);
    return data.data || data;
  },

  createPost: async (formData: FormData): Promise<Post> => {
    const { data } = await apiClient.post("/api/posts", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data.data || data;
  },

  deletePost: async (id: number): Promise<{ success: boolean }> => {
    const { data } = await apiClient.delete(`/api/posts/${id}`);
    return data;
  },
};
