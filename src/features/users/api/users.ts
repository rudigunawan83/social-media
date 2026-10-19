import apiClient from "@/lib/axios";
import { User, Post } from "@/types/models";

export const usersApi = {
  getMyProfile: async (): Promise<User> => {
    const { data } = await apiClient.get("/api/me");
    return data.data || data;
  },

  updateMyProfile: async (payload: FormData | Record<string, any>): Promise<User> => {
    const isFormData = typeof FormData !== "undefined" && payload instanceof FormData;
    const { data } = await apiClient.patch("/api/me", payload, {
      headers: isFormData ? { "Content-Type": "multipart/form-data" } : undefined,
    });
    return data.data || data;
  },

  getMyPosts: async (page = 1, limit = 20): Promise<{ items: Post[]; hasMore: boolean }> => {
    const { data } = await apiClient.get("/api/me/posts", { params: { page, limit } });
    const list = data.data || data.items || data;
    return {
      items: Array.isArray(list) ? list : [],
      hasMore: Array.isArray(list) ? list.length === limit : false,
    };
  },

  getPublicProfile: async (username: string): Promise<User> => {
    const { data } = await apiClient.get(`/api/users/${username}`);
    return data.data || data;
  },

  getUserPosts: async (username: string, page = 1, limit = 20): Promise<Post[]> => {
    const { data } = await apiClient.get(`/api/users/${username}/posts`, { params: { page, limit } });
    const list = data.data || data.items || data;
    return Array.isArray(list) ? list : [];
  },

  getUserLikes: async (username: string, page = 1, limit = 20): Promise<Post[]> => {
    const { data } = await apiClient.get(`/api/users/${username}/likes`, { params: { page, limit } });
    const list = data.data || data.items || data;
    return Array.isArray(list) ? list : [];
  },

  searchUsers: async (q: string, page = 1, limit = 20): Promise<User[]> => {
    if (!q.trim()) return [];
    const { data } = await apiClient.get("/api/users/search", { params: { q, page, limit } });
    const list = data.data || data.items || data;
    return Array.isArray(list) ? list : [];
  },
};
