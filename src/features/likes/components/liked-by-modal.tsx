"use client";

import React from "react";
import { X, Heart } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAppDispatch, useAppSelector } from "@/store";
import { setLikedByPostId } from "@/store/uiSlice";
import { likesApi } from "../api/likes";
import { queryKeys } from "@/lib/query-keys";
import { UserChip } from "@/features/users/components/user-chip";
import { LoadingSpinner, EmptyState, ErrorState } from "@/components/common/state-views";

export function LikedByModal() {
  const dispatch = useAppDispatch();
  const postId = useAppSelector((s) => s.ui.likedByPostId);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.posts.likes(postId || 0),
    queryFn: () =>
      postId
        ? likesApi.getPostLikes(postId)
        : Promise.resolve({ items: [], page: 1, limit: 20, hasMore: false }),
    enabled: !!postId,
  });

  if (!postId) return null;

  const users = data?.items || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="flex max-h-[80vh] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#121212] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/8 p-4">
          <h2 className="flex items-center gap-2 text-base font-semibold text-white">
            <Heart className="h-4 w-4 fill-red-500 text-red-500" />
            Likes
          </h2>
          <button
            onClick={() => dispatch(setLikedByPostId(null))}
            className="rounded-full p-1 text-neutral-400 transition-colors hover:bg-white/5 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
          {isLoading && <LoadingSpinner />}
          {isError && <ErrorState message="Gagal memuat likes." onRetry={() => refetch()} />}
          {!isLoading && !isError && users.length === 0 && (
            <EmptyState title="Belum ada like" description="Jadilah yang pertama like postingan ini." />
          )}
          {!isLoading &&
            !isError &&
            users.map((user) => (
              <UserChip
                key={user.id}
                user={user}
                className="rounded-xl p-2 hover:bg-white/5"
              />
            ))}
        </div>
      </div>
    </div>
  );
}
