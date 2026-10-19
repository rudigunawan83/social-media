import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_URL || "https://be-social-media-api-production.up.railway.app";

export const apiClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("sociality_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== "undefined" && error.response?.status === 401) {
      const currentPath = window.location.pathname;
      if (!currentPath.startsWith("/login") && !currentPath.startsWith("/register")) {
        // clear invalidated token
        localStorage.removeItem("sociality_token");
        localStorage.removeItem("sociality_user");
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
