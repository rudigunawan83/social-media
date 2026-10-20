"use client";

import React from "react";
import { X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAppDispatch, useAppSelector } from "@/store";
import { setLikedByPostId } from "@/store/uiSlice";
import { likesApi } from "../api/likes";
import { queryKeys } from "@/lib/query-keys";
import { UserChip } from "@/features/users/components/user-chip";
import { LoadingSpinner, EmptyState, ErrorState } from "@/components/common/state-views";

/** Modal daftar user yang like — Figma 41444-7516 */
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={() => dispatch(setLikedByPostId(null))}
      role="presentation"
    >
      <div
        className="flex h-[min(570px,80vh)] w-full max-w-[548px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#1a1a1a] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="likes-modal-title"
      >
        <div className="flex shrink-0 items-center justify-between px-5 py-4">
          <h2 id="likes-modal-title" className="text-lg font-bold text-white">
            Likes
          </h2>
          <button
            type="button"
            onClick={() => dispatch(setLikedByPostId(null))}
            className="rounded-full p-1 text-white transition-colors hover:bg-white/5"
            aria-label="Close"
          >
            <X className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>

        <div className="flex flex-1 flex-col overflow-y-auto px-2 pb-3">
          {isLoading && (
            <div className="p-4">
              <LoadingSpinner />
            </div>
          )}
          {isError && (
            <div className="p-4">
              <ErrorState message="Gagal memuat likes." onRetry={() => refetch()} />
            </div>
          )}
          {!isLoading && !isError && users.length === 0 && (
            <div className="p-4">
              <EmptyState
                title="Belum ada like"
                description="Jadilah yang pertama like postingan ini."
              />
            </div>
          )}
          {!isLoading &&
            !isError &&
            users.map((user) => (
              <UserChip
                key={user.id}
                user={user}
                hideAtPrefix
                className="rounded-xl px-3 py-3 hover:bg-white/[0.04]"
              />
            ))}
        </div>
      </div>
    </div>
  );
}
