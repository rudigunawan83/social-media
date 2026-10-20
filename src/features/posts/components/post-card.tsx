"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { MessageCircle, MoreHorizontal, Send, Trash2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Post } from "@/types/models";
import { Avatar } from "@/components/common/avatar";
import { LikeButton } from "@/features/likes/components/like-button";
import { SaveButton } from "@/features/bookmarks/components/save-button";
import { postsApi } from "../api/posts";
import { useAppDispatch, useAppSelector } from "@/store";
import { setLikedByPostId } from "@/store/uiSlice";
import { formatRelativeTime, cn } from "@/lib/utils";
import { queryKeys } from "@/lib/query-keys";

export function PostCard({ post }: { post: Post }) {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();
  const { user: currentUser } = useAppSelector((s) => s.auth);
  const [imageError, setImageError] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const isOwner = currentUser?.id === post.authorId;
  const likesCount = post.likesCount || 0;
  const commentsCount = post.commentsCount || 0;
  const caption = post.caption || "";
  const needsMore = caption.length > 100;

  const deleteMutation = useMutation({
    mutationFn: () => postsApi.deletePost(post.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.feed.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
    },
  });

  const handleShare = async () => {
    const url = `${window.location.origin}/posts/${post.id}`;
    try {
      if (navigator.share) {
        await navigator.share({ url, title: post.caption || "Post" });
      } else {
        await navigator.clipboard.writeText(url);
        alert("Link disalin");
      }
    } catch {
      /* cancelled */
    }
  };

  return (
    <article className="mb-5 border-b border-white/10 pb-5 last:border-b-0">
      <div className="mb-3 flex items-center justify-between px-4 md:px-1">
        <div className="flex min-w-0 items-center gap-3">
          <Link href={`/profile/${post.author?.username || ""}`}>
            <Avatar
              src={post.author?.avatarUrl}
              name={post.author?.name || post.author?.username}
              size="sm"
            />
          </Link>
          <div className="min-w-0">
            <Link
              href={`/profile/${post.author?.username || ""}`}
              className="block truncate text-sm font-semibold text-white hover:opacity-80"
            >
              {post.author?.username || post.author?.name || "Unknown"}
            </Link>
            <p className="text-[11px] capitalize text-neutral-500">
              {formatRelativeTime(post.createdAt)}
            </p>
          </div>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="rounded-full p-1.5 text-neutral-400 hover:bg-white/5 hover:text-white"
            aria-label="More"
          >
            <MoreHorizontal className="h-5 w-5" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 z-20 mt-1 w-36 overflow-hidden rounded-xl border border-white/10 bg-[#121212] shadow-xl">
              <Link
                href={`/posts/${post.id}`}
                className="block px-3 py-2 text-xs text-neutral-200 hover:bg-white/5"
                onClick={() => setMenuOpen(false)}
              >
                View post
              </Link>
              {isOwner && (
                <button
                  type="button"
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-red-400 hover:bg-red-500/10"
                  onClick={() => {
                    setMenuOpen(false);
                    if (confirm("Hapus postingan ini?")) deleteMutation.mutate();
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {post.imageUrl && !imageError ? (
        <Link
          href={`/posts/${post.id}`}
          className="relative mb-3 block aspect-square w-full overflow-hidden bg-neutral-950 md:rounded-xl"
        >
          <Image
            src={post.imageUrl}
            alt={post.caption || "Post image"}
            fill
            sizes="(max-width: 768px) 100vw, 470px"
            className="object-cover"
            onError={() => setImageError(true)}
          />
        </Link>
      ) : (
        <div className="mb-3 flex aspect-square w-full items-center justify-center bg-neutral-950 text-sm text-neutral-600 md:rounded-xl">
          No image
        </div>
      )}

      {/* Actions — Figma mobile: icon + count */}
      <div className="mb-2 flex items-center justify-between px-4 md:px-1">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <LikeButton
              postId={post.id}
              initialIsLiked={post.isLikedByMe}
              initialLikesCount={likesCount}
              showCount={false}
            />
            <button
              type="button"
              onClick={() => dispatch(setLikedByPostId(post.id))}
              className="text-sm font-medium text-neutral-200"
            >
              {likesCount}
            </button>
          </div>

          <Link
            href={`/posts/${post.id}`}
            className="inline-flex items-center gap-1.5 text-neutral-200"
            aria-label="Comments"
          >
            <MessageCircle className="h-6 w-6" />
            <span className="text-sm font-medium">{commentsCount}</span>
          </Link>

          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 text-neutral-200"
            aria-label="Share"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
        <SaveButton postId={post.id} initialIsSaved={post.isSavedByMe} />
      </div>

      {likesCount > 0 && (
        <button
          type="button"
          onClick={() => dispatch(setLikedByPostId(post.id))}
          className="mb-1 hidden px-1 text-left text-sm font-semibold text-white hover:underline md:block"
        >
          Liked by {likesCount.toLocaleString()} {likesCount === 1 ? "other" : "others"}
        </button>
      )}

      {caption && (
        <p className="px-4 text-sm leading-relaxed text-neutral-200 md:px-1">
          <Link
            href={`/profile/${post.author?.username || ""}`}
            className="mr-1.5 font-semibold text-white hover:opacity-80"
          >
            {post.author?.username}
          </Link>
          <span className={cn(!expanded && needsMore && "line-clamp-2")}>
            {caption}
          </span>
          {needsMore && !expanded && (
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="ml-1 text-neutral-500"
            >
              Show More
            </button>
          )}
        </p>
      )}

      {commentsCount > 0 && (
        <Link
          href={`/posts/${post.id}`}
          className="mt-1 block px-4 text-sm text-neutral-500 hover:text-neutral-300 md:px-1"
        >
          View all {commentsCount} comments
        </Link>
      )}
    </article>
  );
}
