import apiClient from "@/lib/axios";
import { Post } from "@/types/models";
import { PaginatedResult } from "@/types/api";
import { normalizePost, toPaginatedPosts, unwrapData } from "@/lib/normalize";

export const postsApi = {
  getFeed: async (page = 1, limit = 20): Promise<PaginatedResult<Post>> => {
    const { data } = await apiClient.get("/api/feed", { params: { page, limit } });
    return toPaginatedPosts(data);
  },

  getExplorePosts: async (page = 1, limit = 20): Promise<PaginatedResult<Post>> => {
    const { data } = await apiClient.get("/api/posts", { params: { page, limit } });
    return toPaginatedPosts(data);
  },

  getPostDetail: async (id: number): Promise<Post> => {
    const { data } = await apiClient.get(`/api/posts/${id}`);
    return normalizePost(unwrapData(data));
  },

  createPost: async (formData: FormData): Promise<Post> => {
    const { data } = await apiClient.post("/api/posts", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return normalizePost(unwrapData(data));
  },

  deletePost: async (id: number): Promise<{ success: boolean }> => {
    const { data } = await apiClient.delete(`/api/posts/${id}`);
    return data;
  },
};
