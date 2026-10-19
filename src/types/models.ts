export interface User {
  id: number;
  name: string;
  username: string;
  email?: string;
  phone?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
  postsCount?: number;
  followersCount?: number;
  followingCount?: number;
  likesCount?: number;
  savedCount?: number;
  isFollowedByMe?: boolean;
  isMe?: boolean;
  followsMe?: boolean;
}

export interface Post {
  id: number;
  caption: string;
  imageUrl: string;
  authorId: number;
  author?: User;
  likesCount?: number;
  commentsCount?: number;
  isLikedByMe?: boolean;
  isSavedByMe?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface Comment {
  id: number;
  text: string;
  postId: number;
  authorId: number;
  author?: User;
  createdAt: string;
  updatedAt?: string;
}

export interface LikeInfo {
  id?: number;
  postId: number;
  userId: number;
  user?: User;
  createdAt?: string;
}
