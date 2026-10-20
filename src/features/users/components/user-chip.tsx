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
  /** Figma Likes modal: username tanpa prefix @ */
  hideAtPrefix?: boolean;
  className?: string;
}

export function UserChip({
  user,
  showFollowButton = true,
  hideAtPrefix = false,
  className,
}: UserChipProps) {
  return (
    <div className={cn("group flex items-center justify-between gap-3", className)}>
      <Link
        href={`/profile/${user.username}`}
        className="flex min-w-0 flex-1 items-center gap-3 transition-opacity hover:opacity-90"
      >
        <Avatar src={user.avatarUrl} name={user.name || user.username} size="md" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-white transition-colors group-hover:text-neutral-200">
            {user.name || user.username}
          </p>
          <p className="truncate text-xs text-neutral-400">
            {hideAtPrefix ? user.username : `@${user.username}`}
          </p>
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
