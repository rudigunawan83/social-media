"use client";

import React, { use } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/main-layout";
import { Avatar } from "@/components/common/avatar";
import { LikeButton } from "@/features/likes/components/like-button";
import { SaveButton } from "@/features/bookmarks/components/save-button";
import { FollowButton } from "@/features/follow/components/follow-button";
import { CommentBox } from "@/features/comments/components/comment-box";
import { LoadingSpinner, ErrorState } from "@/components/common/state-views";
import { postsApi } from "@/features/posts/api/posts";
import { queryKeys } from "@/lib/query-keys";
import { formatRelativeTime } from "@/lib/utils";
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

  const deleteMutation = useMutation({
    mutationFn: () => postsApi.deletePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.feed.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
      router.push("/feed");
    },
  });

  return (
    <MainLayout wide>
      <div className="mb-4">
        <button
          onClick={() => router.back()}
          className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-neutral-400 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
      </div>

      {isLoading && <LoadingSpinner />}
      {isError && <ErrorState message="Post tidak ditemukan." onRetry={() => refetch()} />}

      {post && (
        <div className="overflow-hidden rounded-2xl border border-white/8 bg-[#121212] md:grid md:grid-cols-[1.2fr_0.9fr]">
          <div className="relative aspect-square w-full bg-black md:aspect-auto md:min-h-[520px]">
            {post.imageUrl ? (
              <Image
                src={post.imageUrl}
                alt={post.caption || "Post Image"}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 60vw"
                className="object-contain"
              />
            ) : (
              <div className="flex h-full min-h-[280px] items-center justify-center text-sm text-neutral-600">
                No image
              </div>
            )}
          </div>

          <div className="flex max-h-[80vh] flex-col border-t border-white/8 md:max-h-none md:border-t-0 md:border-l">
            <div className="flex items-center justify-between border-b border-white/8 p-4">
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
                  <p className="text-xs text-neutral-500">
                    @{post.author?.username} · {formatRelativeTime(post.createdAt)}
                  </p>
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
                    onClick={() => {
                      if (confirm("Hapus postingan ini?")) deleteMutation.mutate();
                    }}
                    disabled={deleteMutation.isPending}
                    title="Delete post"
                    className="rounded-full p-1.5 text-neutral-500 hover:bg-red-500/10 hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="border-b border-white/8 px-4 py-3">
              <div className="mb-2 flex items-center justify-between">
                <LikeButton
                  postId={post.id}
                  initialIsLiked={post.isLikedByMe}
                  initialLikesCount={post.likesCount || 0}
                />
                <SaveButton postId={post.id} initialIsSaved={post.isSavedByMe} />
              </div>
              {post.caption && (
                <p className="text-sm leading-relaxed text-neutral-200">
                  <span className="mr-2 font-semibold text-white">
                    {post.author?.username}
                  </span>
                  {post.caption}
                </p>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <CommentBox postId={post.id} postAuthorId={post.authorId} />
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
