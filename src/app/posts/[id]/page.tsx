"use client";

import React, { use, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MoreHorizontal, MessageCircle, Send, Trash2, X } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TimelineLayout } from "@/components/layout/timeline-layout";
import { Avatar } from "@/components/common/avatar";
import { LikeButton } from "@/features/likes/components/like-button";
import { SaveButton } from "@/features/bookmarks/components/save-button";
import { CommentBox } from "@/features/comments/components/comment-box";
import { LoadingSpinner, ErrorState } from "@/components/common/state-views";
import { postsApi } from "@/features/posts/api/posts";
import { queryKeys } from "@/lib/query-keys";
import { RelativeTime } from "@/components/common/relative-time";
import { useAppSelector } from "@/store";

export default function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const postId = parseInt(resolvedParams.id, 10);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user: currentUser } = useAppSelector((s) => s.auth);
  const [menuOpen, setMenuOpen] = useState(false);

  const {
    data: post,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: queryKeys.posts.detail(postId),
    queryFn: () => postsApi.getPostDetail(postId),
    enabled: !isNaN(postId),
  });

  const isOwner = currentUser?.id === post?.authorId;
  const likesCount = post?.likesCount || 0;
  const commentsCount = post?.commentsCount || 0;

  const deleteMutation = useMutation({
    mutationFn: () => postsApi.deletePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.feed.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
      router.push("/feed");
    },
  });

  const handleClose = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/feed");
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/posts/${postId}`;
    try {
      if (navigator.share) {
        await navigator.share({ url, title: post?.caption || "Post" });
      } else {
        await navigator.clipboard.writeText(url);
        alert("Link disalin");
      }
    } catch {
      /* cancelled */
    }
  };

  return (
    <TimelineLayout wide>
      {isLoading && <LoadingSpinner />}
      {isError && <ErrorState message="Post tidak ditemukan." onRetry={() => refetch()} />}

      {post && (
        /* Figma: https://www.figma.com/design/5qL4zS8bo8geBn2aJfa239/Social-Media?node-id=41421-11452 */
        <div className="mx-auto w-full max-w-[980px] overflow-hidden border-y border-white/10 bg-[#0a0a0a] md:mt-2 md:rounded-2xl md:border md:border-white/10">
          <div className="flex flex-col md:max-h-[min(720px,calc(100vh-8rem))] md:flex-row">
            {/* Kolom kiri — gambar */}
            <div className="relative aspect-square w-full shrink-0 bg-black md:aspect-auto md:w-[54%] md:min-h-[560px]">
              {post.imageUrl ? (
                <Image
                  src={post.imageUrl}
                  alt={post.caption || "Post Image"}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 54vw"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full min-h-[280px] items-center justify-center text-sm text-neutral-600">
                  No image
                </div>
              )}
            </div>

            {/* Kolom kanan */}
            <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-[#121212] md:border-l md:border-white/10">
              {/* Header: avatar · nama · waktu · more · close */}
              <div className="flex shrink-0 items-center justify-between gap-2 border-b border-white/10 px-4 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <Link href={`/profile/${post.author?.username || ""}`}>
                    <Avatar
                      src={post.author?.avatarUrl}
                      name={post.author?.name || post.author?.username}
                      size="md"
                    />
                  </Link>
                  <div className="min-w-0">
                    <Link
                      href={`/profile/${post.author?.username || ""}`}
                      className="block truncate text-sm font-semibold text-white hover:opacity-80"
                    >
                      {post.author?.name || post.author?.username}
                    </Link>
                    <p className="text-[11px] capitalize text-neutral-500">
                      <RelativeTime date={post.createdAt} />
                    </p>
                  </div>
                </div>

                <div className="relative flex shrink-0 items-center gap-0.5">
                  <button
                    type="button"
                    onClick={() => setMenuOpen((v) => !v)}
                    className="rounded-full p-1.5 text-neutral-400 hover:bg-white/5 hover:text-white"
                    aria-label="More"
                  >
                    <MoreHorizontal className="h-5 w-5" />
                  </button>
                  {menuOpen && (
                    <div className="absolute right-10 top-full z-20 mt-1 w-36 overflow-hidden rounded-xl border border-white/10 bg-[#1a1a1a] shadow-xl">
                      <Link
                        href={`/profile/${post.author?.username || ""}`}
                        className="block px-3 py-2 text-xs text-neutral-200 hover:bg-white/5"
                        onClick={() => setMenuOpen(false)}
                      >
                        View profile
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
                  <button
                    type="button"
                    onClick={handleClose}
                    className="rounded-full p-1.5 text-neutral-300 hover:bg-white/5 hover:text-white"
                    aria-label="Close"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <CommentBox postId={post.id} postAuthorId={post.authorId} variant="detail">
                {({ list, composer }) => (
                  <>
                    {/* Caption + comments (scroll) */}
                    <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
                      {post.caption && (
                        <p className="mb-5 text-sm leading-relaxed text-neutral-200">
                          {post.caption}
                        </p>
                      )}
                      {list}
                    </div>

                    {/* Actions: like · comment · share | bookmark */}
                    <div className="flex shrink-0 items-center justify-between border-t border-white/10 px-4 py-2.5">
                      <div className="flex items-center gap-4">
                        <LikeButton
                          postId={post.id}
                          initialIsLiked={post.isLikedByMe}
                          initialLikesCount={likesCount}
                          showCount
                        />
                        <div className="inline-flex items-center gap-1.5 text-neutral-200">
                          <MessageCircle className="h-6 w-6" />
                          <span className="text-xs font-semibold">{commentsCount}</span>
                        </div>
                        <button
                          type="button"
                          onClick={handleShare}
                          className="inline-flex items-center gap-1.5 text-neutral-200 hover:opacity-70"
                          aria-label="Share"
                        >
                          <Send className="h-5 w-5" />
                        </button>
                      </div>
                      <SaveButton
                        postId={post.id}
                        initialIsSaved={post.isSavedByMe}
                        className="text-neutral-200 hover:bg-white/5 hover:text-white [&_svg]:text-neutral-100"
                      />
                    </div>

                    {/* Composer: smile + Add Comment + Post */}
                    {composer}
                  </>
                )}
              </CommentBox>
            </div>
          </div>
        </div>
      )}
    </TimelineLayout>
  );
}
