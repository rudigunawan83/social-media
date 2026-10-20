import apiClient from "@/lib/axios";
import { User } from "@/types/models";
import { PaginatedResult } from "@/types/api";
import { toPaginatedUsers } from "@/lib/normalize";

export const followApi = {
  followUser: async (username: string): Promise<{ success: boolean }> => {
    const { data } = await apiClient.post(`/api/follow/${username}`);
    return data;
  },

  unfollowUser: async (username: string): Promise<{ success: boolean }> => {
    const { data } = await apiClient.delete(`/api/follow/${username}`);
    return data;
  },

  getUserFollowers: async (
    username: string,
    page = 1,
    limit = 20
  ): Promise<PaginatedResult<User>> => {
    const { data } = await apiClient.get(`/api/users/${username}/followers`, {
      params: { page, limit },
    });
    return toPaginatedUsers(data);
  },

  getUserFollowing: async (
    username: string,
    page = 1,
    limit = 20
  ): Promise<PaginatedResult<User>> => {
    const { data } = await apiClient.get(`/api/users/${username}/following`, {
      params: { page, limit },
    });
    return toPaginatedUsers(data);
  },

  getMyFollowers: async (page = 1, limit = 20): Promise<PaginatedResult<User>> => {
    const { data } = await apiClient.get("/api/me/followers", { params: { page, limit } });
    return toPaginatedUsers(data);
  },

  getMyFollowing: async (page = 1, limit = 20): Promise<PaginatedResult<User>> => {
    const { data } = await apiClient.get("/api/me/following", { params: { page, limit } });
    return toPaginatedUsers(data);
  },
};
