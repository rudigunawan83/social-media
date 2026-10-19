"use client";

import React, { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";
import { store, useAppDispatch } from "@/store";
import { initializeAuth, setUser } from "@/store/authSlice";
import apiClient from "@/lib/axios";

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(initializeAuth());
    const token = localStorage.getItem("sociality_token");
    if (token) {
      apiClient
        .get("/api/me")
        .then((res) => {
          if (res.data?.data) {
            dispatch(setUser(res.data.data));
          } else if (res.data) {
            dispatch(setUser(res.data));
          }
        })
        .catch(() => {
          // Token expired or invalid
        });
    }
  }, [dispatch]);

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 1,
            staleTime: 1000 * 60 * 2, // 2 minutes
          },
        },
      })
  );

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <AuthInitializer>{children}</AuthInitializer>
      </QueryClientProvider>
    </Provider>
  );
}
