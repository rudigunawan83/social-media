import apiClient from "@/lib/axios";
import { User } from "@/types/models";

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
  register: async (payload: RegisterPayload): Promise<any> => {
    const { data } = await apiClient.post("/api/auth/register", payload);
    return data.data || data;
  },

  login: async (payload: LoginPayload): Promise<AuthResult> => {
    const { data } = await apiClient.post("/api/auth/login", payload);
    // Backend returns { success: true, message: "...", data: { token: "...", user: {...} } }
    const inner = data.data || data;
    return {
      token: inner.token || data.token,
      user: inner.user || data.user,
      message: data.message,
      success: data.success,
    };
  },
};
