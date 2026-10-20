import apiClient from "@/lib/axios";
import { User, Post } from "@/types/models";
import { PaginatedResult } from "@/types/api";
import { toPaginatedPosts, toPaginatedUsers } from "@/lib/normalize";

export const likesApi = {
  likePost: async (id: number): Promise<{ success: boolean }> => {
    const { data } = await apiClient.post(`/api/posts/${id}/like`);
    return data;
  },

  unlikePost: async (id: number): Promise<{ success: boolean }> => {
    const { data } = await apiClient.delete(`/api/posts/${id}/like`);
    return data;
  },

  getPostLikes: async (id: number, page = 1, limit = 20): Promise<PaginatedResult<User>> => {
    const { data } = await apiClient.get(`/api/posts/${id}/likes`, { params: { page, limit } });
    return toPaginatedUsers(data);
  },

  getMyLikes: async (page = 1, limit = 20): Promise<PaginatedResult<Post>> => {
    const { data } = await apiClient.get("/api/me/likes", { params: { page, limit } });
    return toPaginatedPosts(data);
  },
};
