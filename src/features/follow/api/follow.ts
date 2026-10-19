import apiClient from "@/lib/axios";
import { User } from "@/types/models";

export const followApi = {
  followUser: async (username: string): Promise<{ success: boolean }> => {
    const { data } = await apiClient.post(`/api/follow/${username}`);
    return data;
  },

  unfollowUser: async (username: string): Promise<{ success: boolean }> => {
    const { data } = await apiClient.delete(`/api/follow/${username}`);
    return data;
  },

  getUserFollowers: async (username: string, page = 1, limit = 20): Promise<User[]> => {
    const { data } = await apiClient.get(`/api/users/${username}/followers`, { params: { page, limit } });
    const list = data.data || data.items || data;
    return Array.isArray(list) ? list : [];
  },

  getUserFollowing: async (username: string, page = 1, limit = 20): Promise<User[]> => {
    const { data } = await apiClient.get(`/api/users/${username}/following`, { params: { page, limit } });
    const list = data.data || data.items || data;
    return Array.isArray(list) ? list : [];
  },

  getMyFollowers: async (page = 1, limit = 20): Promise<User[]> => {
    const { data } = await apiClient.get("/api/me/followers", { params: { page, limit } });
    const list = data.data || data.items || data;
    return Array.isArray(list) ? list : [];
  },

  getMyFollowing: async (page = 1, limit = 20): Promise<User[]> => {
    const { data } = await apiClient.get("/api/me/following", { params: { page, limit } });
    const list = data.data || data.items || data;
    return Array.isArray(list) ? list : [];
  },
};
