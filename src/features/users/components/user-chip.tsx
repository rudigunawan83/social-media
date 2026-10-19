"use client";

import React from "react";
import Link from "next/link";
import { User } from "@/types/models";
import { Avatar } from "@/components/common/avatar";
import { FollowButton } from "@/features/follow/components/follow-button";
import { cn } from "@/lib/utils";

interface UserChipProps {
  user: User;
  showFollowButton?: boolean;
  className?: string;
}

export function UserChip({ user, showFollowButton = true, className }: UserChipProps) {
  return (
    <div className={cn("flex items-center justify-between gap-3 group", className)}>
      <Link
        href={`/profile/${user.username}`}
        className="flex items-center gap-3 min-w-0 flex-1 hover:opacity-90 transition-opacity"
      >
        <Avatar src={user.avatarUrl} name={user.name || user.username} size="md" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-100 truncate group-hover:text-purple-400 transition-colors">
            {user.name || user.username}
          </p>
          <p className="text-xs text-slate-400 truncate">@{user.username}</p>
        </div>
      </Link>
      {showFollowButton && (
        <FollowButton
          username={user.username}
          initialIsFollowing={user.isFollowedByMe}
          size="sm"
        />
      )}
    </div>
  );
}
