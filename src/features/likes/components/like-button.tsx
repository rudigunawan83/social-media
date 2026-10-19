"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store";
import { setLikedByPostId } from "@/store/uiSlice";
import { likesApi } from "../api/likes";
import { queryKeys } from "@/lib/query-keys";
import { cn } from "@/lib/utils";

interface LikeButtonProps {
  postId: number;
  initialIsLiked?: boolean;
  initialLikesCount?: number;
  className?: string;
}

export function LikeButton({
  postId,
  initialIsLiked = false,
  initialLikesCount = 0,
  className,
}: LikeButtonProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAppSelector((s) => s.auth);

  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likesCount, setLikesCount] = useState(initialLikesCount);

  const mutation = useMutation({
    mutationFn: async (liked: boolean) => {
      if (liked) {
        return await likesApi.likePost(postId);
      } else {
        return await likesApi.unlikePost(postId);
      }
    },
    onMutate: async (newLiked) => {
      setIsLiked(newLiked);
      setLikesCount((prev) => (newLiked ? prev + 1 : Math.max(0, prev - 1)));
    },
    onError: () => {
      // Rollback
      setIsLiked(!isLiked);
      setLikesCount(initialLikesCount);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.detail(postId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.myLikes() });
    },
  });

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      router.push(`/login?returnTo=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    if (mutation.isPending) return;
    mutation.mutate(!isLiked);
  };

  const handleOpenLikedBy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(setLikedByPostId(postId));
  };

  return (
    <div className={cn("inline-flex items-center gap-1.5", className)}>
      <button
        onClick={handleToggle}
        disabled={mutation.isPending}
        title={isLiked ? "Unlike post" : "Like post"}
        className="p-1 rounded-full text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all active:scale-75"
      >
        <Heart
          className={cn(
            "w-5 h-5 transition-transform duration-200",
            isLiked ? "fill-red-500 text-red-500 scale-110" : "text-slate-300"
          )}
        />
      </button>
      <button
        onClick={handleOpenLikedBy}
        className="text-xs font-semibold text-slate-300 hover:text-purple-400 hover:underline transition-colors cursor-pointer"
        title="View users who liked"
      >
        {likesCount}
      </button>
    </div>
  );
}
