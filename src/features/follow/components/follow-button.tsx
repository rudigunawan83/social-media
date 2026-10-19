"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppSelector } from "@/store";
import { followApi } from "../api/follow";
import { queryKeys } from "@/lib/query-keys";
import { cn } from "@/lib/utils";
import { UserCheck, UserPlus, UserX } from "lucide-react";

interface FollowButtonProps {
  username: string;
  initialIsFollowing?: boolean;
  onToggle?: (isFollowing: boolean) => void;
  className?: string;
  size?: "sm" | "md";
}

export function FollowButton({
  username,
  initialIsFollowing = false,
  onToggle,
  className,
  size = "md",
}: FollowButtonProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAuthenticated, user: currentUser } = useAppSelector((s) => s.auth);

  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isHovered, setIsHovered] = useState(false);

  // If viewing self, don't show follow button
  if (currentUser?.username === username) {
    return null;
  }

  const mutation = useMutation({
    mutationFn: async (shouldFollow: boolean) => {
      if (shouldFollow) {
        return await followApi.followUser(username);
      } else {
        return await followApi.unfollowUser(username);
      }
    },
    onMutate: async (shouldFollow) => {
      setIsFollowing(shouldFollow);
      onToggle?.(shouldFollow);
    },
    onError: () => {
      setIsFollowing(!isFollowing);
      onToggle?.(!isFollowing);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.profile(username) });
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
    },
  });

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      router.push(`/login?returnTo=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    if (mutation.isPending) return;
    mutation.mutate(!isFollowing);
  };

  const isSmall = size === "sm";

  return (
    <button
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      disabled={mutation.isPending}
      className={cn(
        "rounded-full font-medium transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 select-none",
        isSmall ? "px-3 py-1 text-xs" : "px-4 py-1.5 text-sm",
        isFollowing
          ? isHovered
            ? "bg-red-500/20 text-red-300 border border-red-500/40"
            : "bg-slate-800 text-slate-200 border border-slate-700 hover:border-slate-600"
          : "gradient-primary text-white shadow-md hover:shadow-purple-500/25 active:scale-95",
        className
      )}
    >
      {isFollowing ? (
        isHovered ? (
          <>
            <UserX className={isSmall ? "w-3 h-3" : "w-3.5 h-3.5"} />
            <span>Unfollow</span>
          </>
        ) : (
          <>
            <UserCheck className={isSmall ? "w-3 h-3 text-purple-400" : "w-3.5 h-3.5 text-purple-400"} />
            <span>Following</span>
          </>
        )
      ) : (
        <>
          <UserPlus className={isSmall ? "w-3 h-3" : "w-3.5 h-3.5"} />
          <span>Follow</span>
        </>
      )}
    </button>
  );
}
