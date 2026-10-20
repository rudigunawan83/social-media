"use client";

import React, { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Provider } from "react-redux";
import { store, useAppDispatch } from "@/store";
import { initializeAuth, setUser, logout } from "@/store/authSlice";
import { usersApi } from "@/features/users/api/users";
import { queryKeys } from "@/lib/query-keys";
import { isValidUser } from "@/lib/normalize";

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  useEffect(() => {
    dispatch(initializeAuth());
    const token = localStorage.getItem("sociality_token");
    if (!token) return;

    usersApi
      .getMyProfile()
      .then((user) => {
        if (!isValidUser(user)) return;
        dispatch(setUser(user));
        queryClient.setQueryData(queryKeys.auth.me, user);
      })
      .catch((err) => {
        if (err?.response?.status === 401) {
          dispatch(logout());
        }
      });
  }, [dispatch, queryClient]);

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
            staleTime: 1000 * 60 * 2,
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
