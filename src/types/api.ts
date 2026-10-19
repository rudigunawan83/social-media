import { User, Post, Comment } from "./models";

export interface ApiResponse<T = any> {
  success?: boolean;
  message?: string;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
    hasNextPage?: boolean;
  };
}

export interface PaginatedResult<T> {
  items: T[];
  page: number;
  limit: number;
  total?: number;
  totalPages?: number;
  hasMore?: boolean;
}

export interface LoginResponse {
  token: string;
  user: User;
  message?: string;
}

export interface RegisterResponse {
  token?: string;
  user?: User;
  message?: string;
}
