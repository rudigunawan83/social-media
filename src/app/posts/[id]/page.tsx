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

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this post?")) {
      deleteMutation.mutate();
    }
  };

  return (
    <MainLayout>
      <div className="mb-4">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </div>

      {isLoading && <LoadingSpinner />}
      {isError && (
        <ErrorState message="Could not find this post." onRetry={refetch} />
      )}

      {post && (
        <div className="glass-panel rounded-2xl overflow-hidden shadow-2xl border border-slate-700/80 mb-6">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-800">
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
                    {post.author?.name || post.author?.username}
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
                  disabled={deleteMutation.isPending}
                  title="Delete post"
                  className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Full Image */}
          {post.imageUrl && (
            <div className="relative aspect-square md:aspect-4/3 w-full bg-slate-950 overflow-hidden">
              <Image
                src={post.imageUrl}
                alt={post.caption || "Post Image"}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 700px"
                className="object-contain"
              />
            </div>
          )}

          {/* Post Action Bar & Caption */}
          <div className="p-5 border-b border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <LikeButton
                postId={post.id}
                initialIsLiked={post.isLikedByMe}
                initialLikesCount={post.likesCount || 0}
              />
              <SaveButton postId={post.id} initialIsSaved={post.isSavedByMe} />
            </div>

            {post.caption && (
              <p className="text-sm text-slate-200 leading-relaxed">
                <span className="font-semibold text-slate-100 mr-2">
                  {post.author?.username}
                </span>
                {post.caption}
              </p>
            )}
          </div>

          {/* Comments Section */}
          <div className="p-5">
            <CommentBox postId={post.id} postAuthorId={post.authorId} />
          </div>
        </div>
      )}
    </MainLayout>
  );
}
