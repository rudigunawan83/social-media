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
    // Jangan set Content-Type manual — biar browser/axios menambah boundary multipart
    await apiClient.patch("/api/me", payload, {
      headers: isFormData ? { "Content-Type": undefined as unknown as string } : undefined,
      transformRequest: isFormData
        ? [
            (data, headers) => {
              if (headers && typeof headers === "object") {
                delete (headers as Record<string, unknown>)["Content-Type"];
              }
              return data;
            },
          ]
        : undefined,
    });
    // PATCH kadang tidak mengembalikan user lengkap — ambil ulang dari GET /api/me
    return usersApi.getMyProfile();
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
