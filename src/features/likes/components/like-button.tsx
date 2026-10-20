"use client";

import React, { useEffect, useState } from "react";
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
  showCount?: boolean;
  className?: string;
}

export function LikeButton({
  postId,
  initialIsLiked = false,
  initialLikesCount = 0,
  showCount = true,
  className,
}: LikeButtonProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAppSelector((s) => s.auth);

  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likesCount, setLikesCount] = useState(initialLikesCount);

  useEffect(() => {
    setIsLiked(initialIsLiked);
    setLikesCount(initialLikesCount);
  }, [initialIsLiked, initialLikesCount]);

  const mutation = useMutation({
    mutationFn: async (liked: boolean) => {
      if (liked) return likesApi.likePost(postId);
      return likesApi.unlikePost(postId);
    },
    onMutate: async (newLiked) => {
      setIsLiked(newLiked);
      setLikesCount((prev) => (newLiked ? prev + 1 : Math.max(0, prev - 1)));
    },
    onError: (_e, newLiked) => {
      setIsLiked(!newLiked);
      setLikesCount(initialLikesCount);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.detail(postId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.myLikes() });
      queryClient.invalidateQueries({ queryKey: queryKeys.feed.all });
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

  return (
    <div className={cn("inline-flex items-center gap-1.5", className)}>
      <button
        onClick={handleToggle}
        disabled={mutation.isPending}
        title={isLiked ? "Unlike post" : "Like post"}
        className="rounded-full p-1 text-neutral-200 transition-all hover:opacity-70 active:scale-75"
      >
        <Heart
          className={cn(
            "h-6 w-6 transition-transform duration-200",
            isLiked ? "scale-110 fill-red-500 text-red-500" : "text-neutral-100"
          )}
        />
      </button>
      {showCount && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            dispatch(setLikedByPostId(postId));
          }}
          className="cursor-pointer text-xs font-semibold text-neutral-200 hover:underline"
          title="View users who liked"
        >
          {likesCount}
        </button>
      )}
    </div>
  );
}
