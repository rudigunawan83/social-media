import apiClient from "@/lib/axios";
import { User, Post } from "@/types/models";
import { PaginatedResult } from "@/types/api";
import {
  normalizeUser,
  toPaginatedPosts,
  toPaginatedUsers,
  unwrapData,
} from "@/lib/normalize";

export const usersApi = {
  getMyProfile: async (): Promise<User> => {
    const { data } = await apiClient.get("/api/me");
    return normalizeUser(unwrapData(data));
  },

  updateMyProfile: async (payload: FormData | Record<string, unknown>): Promise<User> => {
    const isFormData = typeof FormData !== "undefined" && payload instanceof FormData;
    const { data } = await apiClient.patch("/api/me", payload, {
      headers: isFormData ? { "Content-Type": "multipart/form-data" } : undefined,
    });
    return normalizeUser(unwrapData(data));
  },

  getMyPosts: async (page = 1, limit = 20): Promise<PaginatedResult<Post>> => {
    const { data } = await apiClient.get("/api/me/posts", { params: { page, limit } });
    return toPaginatedPosts(data);
  },

  getPublicProfile: async (username: string): Promise<User> => {
    const { data } = await apiClient.get(`/api/users/${username}`);
    return normalizeUser(unwrapData(data));
  },

  getUserPosts: async (
    username: string,
    page = 1,
    limit = 20
  ): Promise<PaginatedResult<Post>> => {
    const { data } = await apiClient.get(`/api/users/${username}/posts`, {
      params: { page, limit },
    });
    return toPaginatedPosts(data);
  },

  getUserLikes: async (
    username: string,
    page = 1,
    limit = 20
  ): Promise<PaginatedResult<Post>> => {
    const { data } = await apiClient.get(`/api/users/${username}/likes`, {
      params: { page, limit },
    });
    return toPaginatedPosts(data);
  },

  searchUsers: async (q: string, page = 1, limit = 20): Promise<PaginatedResult<User>> => {
    if (!q.trim()) return { items: [], page: 1, limit, hasMore: false };
    const { data } = await apiClient.get("/api/users/search", { params: { q, page, limit } });
    return toPaginatedUsers(data);
  },
};
