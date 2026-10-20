"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check } from "lucide-react";
import { useAppSelector } from "@/store";
import { followApi } from "../api/follow";
import { queryKeys } from "@/lib/query-keys";
import { cn } from "@/lib/utils";

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

  useEffect(() => {
    setIsFollowing(initialIsFollowing);
  }, [initialIsFollowing]);

  if (currentUser?.username === username) return null;

  const mutation = useMutation({
    mutationFn: async (shouldFollow: boolean) => {
      if (shouldFollow) return followApi.followUser(username);
      return followApi.unfollowUser(username);
    },
    onMutate: async (shouldFollow) => {
      setIsFollowing(shouldFollow);
      onToggle?.(shouldFollow);
    },
    onError: (_e, shouldFollow) => {
      setIsFollowing(!shouldFollow);
      onToggle?.(!shouldFollow);
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
        "inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-full font-semibold transition-all disabled:opacity-50",
        isSmall ? "px-3.5 py-1.5 text-xs" : "min-w-[96px] px-5 py-2 text-sm",
        isFollowing
          ? isHovered
            ? "border border-red-500/50 bg-red-500/15 text-red-300"
            : "border border-white/25 bg-transparent text-white"
          : "border border-transparent bg-violet-600 text-white shadow-md shadow-violet-600/25 hover:bg-violet-500 active:scale-95",
        className
      )}
    >
      {isFollowing ? (
        isHovered ? (
          "Unfollow"
        ) : (
          <>
            <Check className="h-3.5 w-3.5" />
            Following
          </>
        )
      ) : (
        "Follow"
      )}
    </button>
  );
}
