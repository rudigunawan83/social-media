import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "@/types/models";

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const initialState: AuthState = {
  token: null,
  user: null,
  isAuthenticated: false,
  isLoading: true,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ token: string; user?: User }>
    ) => {
      state.token = action.payload.token;
      if (action.payload.user) {
        state.user = action.payload.user;
      }
      state.isAuthenticated = true;
      state.isLoading = false;
      if (typeof window !== "undefined") {
        localStorage.setItem("sociality_token", action.payload.token);
        if (action.payload.user) {
          localStorage.setItem("sociality_user", JSON.stringify(action.payload.user));
        }
      }
    },
    setUser: (state, action: PayloadAction<User>) => {
      const next = action.payload;
      // Jangan timpa user valid dengan payload kosong dari API
      const nextOk = Boolean(next?.id && (next.username || next.name));
      const prevOk = Boolean(state.user?.id && (state.user.username || state.user.name));
      if (!nextOk && prevOk) return;

      state.user = nextOk ? next : state.user;
      state.isAuthenticated = true;
      state.isLoading = false;
      if (typeof window !== "undefined" && nextOk) {
        localStorage.setItem("sociality_user", JSON.stringify(next));
      }
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      if (typeof window !== "undefined") {
        localStorage.removeItem("sociality_token");
        localStorage.removeItem("sociality_user");
      }
    },
    initializeAuth: (state) => {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("sociality_token");
        const userStr = localStorage.getItem("sociality_user");
        if (token) {
          state.token = token;
          state.isAuthenticated = true;
          if (userStr) {
            try {
              state.user = JSON.parse(userStr);
            } catch (e) {
              console.error(e);
            }
          }
        }
      }
      state.isLoading = false;
    },
  },
});

export const { setCredentials, setUser, logout, initializeAuth } = authSlice.actions;
export default authSlice.reducer;
