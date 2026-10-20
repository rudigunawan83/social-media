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

  /** Cari post by caption/author — BE explore + filter client (q dikirim jika BE support) */
  searchPosts: async (q: string, page = 1, limit = 30): Promise<PaginatedResult<Post>> => {
    const keyword = q.trim().toLowerCase();
    if (!keyword) return { items: [], page: 1, limit, hasMore: false };

    const { data } = await apiClient.get("/api/posts", {
      params: { page, limit, q: q.trim() },
    });
    const result = toPaginatedPosts(data);
    const filtered = result.items.filter((post) => {
      const caption = (post.caption || "").toLowerCase();
      const name = (post.author?.name || "").toLowerCase();
      const username = (post.author?.username || "").toLowerCase();
      return (
        caption.includes(keyword) ||
        name.includes(keyword) ||
        username.includes(keyword)
      );
    });

    return {
      ...result,
      items: filtered,
      total: filtered.length,
      hasMore: Boolean(result.hasMore),
    };
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
