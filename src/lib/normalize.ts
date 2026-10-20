import type { Comment, Post, User } from "@/types/models";
import type { PaginatedResult } from "@/types/api";

/** Ambil payload list dari shape BE: { data: { posts|users|comments, pagination } } */
export function unwrapData<T = unknown>(raw: any): T {
  if (raw == null) return raw as T;
  if (typeof raw === "object" && "data" in raw) return (raw.data ?? raw) as T;
  return raw as T;
}

export function extractPagination(payload: any): PaginatedResult<never>["meta"] & {
  page: number;
  limit: number;
  hasMore: boolean;
} {
  const p = payload?.pagination || payload?.meta || {};
  const page = Number(p.page ?? 1);
  const limit = Number(p.limit ?? 20);
  const totalPages = p.totalPages != null ? Number(p.totalPages) : undefined;
  const total = p.total != null ? Number(p.total) : undefined;
  const hasMore =
    typeof p.hasNextPage === "boolean"
      ? p.hasNextPage
      : totalPages != null
        ? page < totalPages
        : false;

  return { page, limit, total, totalPages, hasMore };
}

export function extractList<T>(
  raw: any,
  keys: string[] = ["items", "posts", "users", "comments", "data"]
): { items: T[]; page: number; limit: number; total?: number; totalPages?: number; hasMore: boolean } {
  const payload = unwrapData(raw);
  if (Array.isArray(payload)) {
    return { items: payload as T[], page: 1, limit: payload.length, hasMore: false };
  }

  let items: T[] = [];
  const record = (payload ?? {}) as Record<string, unknown>;
  for (const key of keys) {
    const value = record[key];
    if (Array.isArray(value)) {
      items = value as T[];
      break;
    }
  }

  const meta = extractPagination(payload);
  if (!meta.hasMore && items.length > 0 && meta.limit > 0) {
    meta.hasMore = items.length >= meta.limit;
  }

  return { items, ...meta };
}

export function normalizeUser(raw: any): User {
  if (!raw || typeof raw !== "object") {
    return { id: 0, name: "", username: "" };
  }

  const counts = raw.counts || {};
  return {
    id: Number(raw.id),
    name: raw.name ?? raw.username ?? "",
    username: raw.username ?? "",
    email: raw.email,
    phone: raw.phone ?? null,
    bio: raw.bio ?? null,
    avatarUrl: raw.avatarUrl ?? raw.avatar ?? null,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    postsCount: Number(raw.postsCount ?? counts.post ?? counts.posts ?? 0),
    followersCount: Number(raw.followersCount ?? counts.followers ?? 0),
    followingCount: Number(raw.followingCount ?? counts.following ?? 0),
    likesCount: Number(raw.likesCount ?? counts.likes ?? 0),
    savedCount: Number(raw.savedCount ?? counts.saved ?? 0),
    isFollowedByMe: Boolean(
      raw.isFollowedByMe ?? raw.isFollowing ?? raw.followedByMe ?? false
    ),
    isMe: Boolean(raw.isMe),
    followsMe: Boolean(raw.followsMe),
  };
}

export function normalizePost(raw: any): Post {
  const authorRaw = raw?.author || raw?.user;
  const author = authorRaw ? normalizeUser(authorRaw) : undefined;
  const authorId = Number(raw?.authorId ?? author?.id ?? 0);

  return {
    id: Number(raw?.id),
    caption: raw?.caption ?? "",
    imageUrl: raw?.imageUrl ?? raw?.image ?? "",
    authorId,
    author,
    likesCount: Number(raw?.likesCount ?? raw?.likeCount ?? 0),
    commentsCount: Number(raw?.commentsCount ?? raw?.commentCount ?? 0),
    isLikedByMe: Boolean(raw?.isLikedByMe ?? raw?.likedByMe ?? false),
    isSavedByMe: Boolean(raw?.isSavedByMe ?? raw?.savedByMe ?? false),
    createdAt: raw?.createdAt ?? "",
    updatedAt: raw?.updatedAt,
  };
}

export function normalizeComment(raw: any): Comment {
  const authorRaw = raw?.author || raw?.user;
  const author = authorRaw ? normalizeUser(authorRaw) : undefined;

  return {
    id: Number(raw?.id),
    text: raw?.text ?? raw?.content ?? raw?.body ?? "",
    postId: Number(raw?.postId ?? 0),
    authorId: Number(raw?.authorId ?? author?.id ?? 0),
    author,
    createdAt: raw?.createdAt ?? "",
    updatedAt: raw?.updatedAt,
  };
}

export function toPaginatedPosts(raw: any): PaginatedResult<Post> {
  const { items, ...meta } = extractList<any>(raw, ["posts", "items", "data"]);
  return { items: items.map(normalizePost), ...meta };
}

export function toPaginatedUsers(raw: any): PaginatedResult<User> {
  const { items, ...meta } = extractList<any>(raw, ["users", "items", "data"]);
  return { items: items.map(normalizeUser), ...meta };
}

export function toPaginatedComments(raw: any): PaginatedResult<Comment> {
  const { items, ...meta } = extractList<any>(raw, ["comments", "items", "data"]);
  return { items: items.map(normalizeComment), ...meta };
}
