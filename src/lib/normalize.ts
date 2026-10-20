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

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://be-social-media-api-production.up.railway.app";

/** Ubah path relatif avatar BE jadi URL absolut yang bisa di-load <img> */
export function resolveMediaUrl(value?: string | null): string | null {
  if (!value || typeof value !== "string") return null;
  const url = value.trim();
  if (!url || url === "null" || url === "undefined") return null;
  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("blob:") ||
    url.startsWith("data:")
  ) {
    return url;
  }
  if (url.startsWith("//")) return `https:${url}`;
  const path = url.startsWith("/") ? url : `/${url}`;
  return `${API_BASE.replace(/\/$/, "")}${path}`;
}

function pickAvatar(raw: any): string | null {
  const candidates = [
    raw?.avatarUrl,
    raw?.avatar_url,
    raw?.avatar,
    raw?.profilePicture,
    raw?.profile_picture,
    raw?.photoUrl,
    raw?.imageUrl,
    typeof raw?.avatar === "object" ? raw.avatar?.url : null,
  ];
  for (const c of candidates) {
    if (typeof c === "string" && c.trim()) return resolveMediaUrl(c);
  }
  return null;
}

/** Cek apakah objek punya field identitas user yang valid */
export function isValidUser(user?: User | null): user is User {
  return Boolean(user && user.id && (user.username || user.name));
}

export function normalizeUser(raw: any): User {
  if (!raw || typeof raw !== "object") {
    return { id: 0, name: "", username: "" };
  }

  // Kadang payload nested: { user|profile|me: {...} }
  const nested =
    (raw.user && typeof raw.user === "object" && raw.user) ||
    (raw.profile && typeof raw.profile === "object" && raw.profile) ||
    (raw.me && typeof raw.me === "object" && raw.me) ||
    null;
  const source = nested || raw;
  // BE: counts | stats | quickStats — field post/posts/likes bervariasi
  const counts =
    source.counts ||
    raw.counts ||
    source.stats ||
    raw.stats ||
    source.quickStats ||
    raw.quickStats ||
    {};

  const pickNum = (...vals: unknown[]) => {
    for (const v of vals) {
      if (v == null || v === "") continue;
      const n = Number(v);
      if (!Number.isNaN(n)) return n;
    }
    return 0;
  };

  return {
    id: Number(source.id ?? raw.id ?? 0),
    name: String(source.name ?? source.fullName ?? source.displayName ?? source.username ?? ""),
    username: String(source.username ?? ""),
    email: source.email,
    phone: source.phone ?? source.phoneNumber ?? null,
    bio: source.bio ?? source.about ?? null,
    avatarUrl: pickAvatar(source) ?? pickAvatar(raw),
    createdAt: source.createdAt,
    updatedAt: source.updatedAt,
    postsCount: pickNum(
      source.postsCount,
      source.postCount,
      counts.post,
      counts.posts,
      counts.postCount,
      raw.postsCount,
      raw.postCount
    ),
    followersCount: pickNum(
      source.followersCount,
      counts.followers,
      counts.follower,
      raw.followersCount
    ),
    followingCount: pickNum(
      source.followingCount,
      counts.following,
      counts.followings,
      raw.followingCount
    ),
    likesCount: pickNum(
      source.likesCount,
      source.likeCount,
      counts.likes,
      counts.like,
      counts.likeCount,
      raw.likesCount,
      raw.likeCount
    ),
    savedCount: pickNum(source.savedCount, counts.saved, counts.saves, raw.savedCount),
    isFollowedByMe: Boolean(
      source.isFollowedByMe ?? source.isFollowing ?? source.followedByMe ?? false
    ),
    isMe: Boolean(source.isMe ?? raw.isMe),
    followsMe: Boolean(source.followsMe),
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
