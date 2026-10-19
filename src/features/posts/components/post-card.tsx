"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { MessageCircle, MoreHorizontal, Trash2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Post } from "@/types/models";
import { Avatar } from "@/components/common/avatar";
import { LikeButton } from "@/features/likes/components/like-button";
import { SaveButton } from "@/features/bookmarks/components/save-button";
import { FollowButton } from "@/features/follow/components/follow-button";
import { postsApi } from "../api/posts";
import { useAppSelector } from "@/store";
import { formatRelativeTime } from "@/lib/utils";
import { queryKeys } from "@/lib/query-keys";

export function PostCard({ post }: { post: Post }) {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAppSelector((s) => s.auth);
  const [imageError, setImageError] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isOwner = currentUser?.id === post.authorId;

  const deleteMutation = useMutation({
    mutationFn: () => postsApi.deletePost(post.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.feed.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
    },
  });

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this post?")) {
      setIsDeleting(true);
      deleteMutation.mutate();
    }
  };

  return (
    <article className="glass-panel rounded-2xl overflow-hidden mb-6 transition-all duration-200 hover:border-slate-700/80 shadow-lg">
      {/* Post Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <Link href={`/profile/${post.author?.username || ""}`}>
            <Avatar
              src={post.author?.avatarUrl}
              name={post.author?.name || post.author?.username}
              size="md"
            />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <Link
                href={`/profile/${post.author?.username || ""}`}
                className="font-semibold text-sm text-slate-100 hover:text-purple-400 transition-colors"
              >
                {post.author?.name || post.author?.username || "Unknown"}
              </Link>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs text-slate-400">
                {formatRelativeTime(post.createdAt)}
              </span>
            </div>
            <p className="text-xs text-slate-400">@{post.author?.username}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {post.author?.username && (
            <FollowButton
              username={post.author.username}
              initialIsFollowing={post.author.isFollowedByMe}
              size="sm"
            />
          )}

          {isOwner && (
            <button
              onClick={handleDelete}
              disabled={isDeleting || deleteMutation.isPending}
              title="Delete post"
              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Post Image */}
      {post.imageUrl && !imageError ? (
        <Link href={`/posts/${post.id}`} className="block relative aspect-square w-full bg-slate-900/60 overflow-hidden">
          <Image
            src={post.imageUrl}
            alt={post.caption || "Post image"}
            fill
            sizes="(max-width: 768px) 100vw, 600px"
            className="object-cover hover:scale-102 transition-transform duration-300"
            onError={() => setImageError(true)}
          />
        </Link>
      ) : (
        <div className="aspect-video w-full bg-slate-900/40 flex items-center justify-center text-slate-600 text-sm">
          No image preview available
        </div>
      )}

      {/* Post Actions & Details */}
      <div className="p-4 pt-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-4">
            <LikeButton
              postId={post.id}
              initialIsLiked={post.isLikedByMe}
              initialLikesCount={post.likesCount || 0}
            />
            <Link
              href={`/posts/${post.id}`}
              className="inline-flex items-center gap-1.5 text-slate-300 hover:text-purple-400 transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              <span className="text-xs font-semibold">{post.commentsCount || 0}</span>
            </Link>
          </div>
          <SaveButton postId={post.id} initialIsSaved={post.isSavedByMe} />
        </div>

        {/* Caption */}
        {post.caption && (
          <p className="text-sm text-slate-200 mt-2 leading-relaxed">
            <span className="font-semibold text-slate-100 mr-2">
              {post.author?.username}
            </span>
            {post.caption}
          </p>
        )}
      </div>
    </article>
  );
}
