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

  const { data: users, isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.posts.likes(postId || 0),
    queryFn: () => (postId ? likesApi.getPostLikes(postId) : Promise.resolve([])),
    enabled: !!postId,
  });

  if (!postId) return null;

  const handleClose = () => {
    dispatch(setLikedByPostId(null));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-md rounded-2xl overflow-hidden shadow-2xl border border-slate-700 flex flex-col max-h-[80vh]">
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <Heart className="w-4 h-4 fill-red-500 text-red-500" />
            Liked by
          </h2>
          <button
            onClick={handleClose}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto flex-1 flex flex-col gap-3">
          {isLoading && <LoadingSpinner />}
          {isError && <ErrorState message="Failed to load likes." onRetry={refetch} />}
          {!isLoading && !isError && (!users || users.length === 0) && (
            <EmptyState
              title="No likes yet"
              description="Be the first to like this post!"
            />
          )}
          {!isLoading &&
            !isError &&
            users &&
            users.map((user) => (
              <UserChip key={user.id} user={user} className="p-2 rounded-xl hover:bg-slate-800/40" />
            ))}
        </div>
      </div>
    </div>
  );
}
