import apiClient from "@/lib/axios";
import { User } from "@/types/models";
import { normalizeUser, unwrapData } from "@/lib/normalize";

export interface RegisterPayload {
  name: string;
  username: string;
  email: string;
  phone?: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResult {
  token: string;
  user?: User;
  message?: string;
  success?: boolean;
}

export const authApi = {
  register: async (payload: RegisterPayload) => {
    const { data } = await apiClient.post("/api/auth/register", payload);
    return unwrapData(data);
  },

  login: async (payload: LoginPayload): Promise<AuthResult> => {
    const { data } = await apiClient.post("/api/auth/login", payload);
    const inner = unwrapData<any>(data) || data;
    const userRaw = inner.user || data.user;
    return {
      token: inner.token || data.token,
      user: userRaw ? normalizeUser(userRaw) : undefined,
      message: data.message,
      success: data.success,
    };
  },
};
