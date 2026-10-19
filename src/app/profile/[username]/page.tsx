"use client";

import React, { useState, use } from "react";
import { useQuery } from "@tanstack/react-query";
import { Grid, Heart, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout/main-layout";
import { Avatar } from "@/components/common/avatar";
import { FollowButton } from "@/features/follow/components/follow-button";
import { PostCard } from "@/features/posts/components/post-card";
import { LoadingSpinner, EmptyState, ErrorState } from "@/components/common/state-views";
import { usersApi } from "@/features/users/api/users";
import { queryKeys } from "@/lib/query-keys";
import { cn } from "@/lib/utils";

export default function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const resolvedParams = use(params);
  const username = decodeURIComponent(resolvedParams.username);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"posts" | "likes">("posts");

  const {
    data: user,
    isLoading: userLoading,
    isError: userError,
    refetch,
  } = useQuery({
    queryKey: queryKeys.users.profile(username),
    queryFn: () => usersApi.getPublicProfile(username),
  });

  const { data: posts, isLoading: postsLoading } = useQuery({
    queryKey: queryKeys.users.posts(username),
    queryFn: () => usersApi.getUserPosts(username),
    enabled: activeTab === "posts",
  });

  const { data: likes, isLoading: likesLoading } = useQuery({
    queryKey: queryKeys.users.likes(username),
    queryFn: () => usersApi.getUserLikes(username),
    enabled: activeTab === "likes",
  });

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

      {userLoading && <LoadingSpinner />}
      {userError && (
        <ErrorState message="Could not find this user profile." onRetry={refetch} />
      )}

      {user && (
        <>
          {/* Profile Header */}
          <div className="glass-panel rounded-3xl p-6 md:p-8 mb-6 shadow-xl border border-slate-700/80">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <Avatar
                src={user.avatarUrl}
                name={user.name || user.username}
                size="xl"
                className="w-24 h-24 text-2xl ring-4 ring-purple-500/20 shadow-xl"
              />

              <div className="flex-1 text-center sm:text-left min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                  <div>
                    <h1 className="text-xl font-bold text-white truncate">
                      {user.name || user.username}
                    </h1>
                    <p className="text-sm text-purple-400 font-medium">@{user.username}</p>
                  </div>

                  <FollowButton
                    username={user.username}
                    initialIsFollowing={user.isFollowedByMe}
                  />
                </div>

                {user.bio && (
                  <p className="text-sm text-slate-300 mb-4 whitespace-pre-wrap leading-relaxed">
                    {user.bio}
                  </p>
                )}

                {/* Stats Row */}
                <div className="flex items-center justify-center sm:justify-start gap-6 pt-2 border-t border-slate-800/80">
                  <div className="text-center sm:text-left">
                    <span className="block font-bold text-base text-slate-100">
                      {user.postsCount ?? posts?.length ?? 0}
                    </span>
                    <span className="text-xs text-slate-400">Posts</span>
                  </div>
                  <div className="text-center sm:text-left">
                    <span className="block font-bold text-base text-slate-100">
                      {user.followersCount ?? 0}
                    </span>
                    <span className="text-xs text-slate-400">Followers</span>
                  </div>
                  <div className="text-center sm:text-left">
                    <span className="block font-bold text-base text-slate-100">
                      {user.followingCount ?? 0}
                    </span>
                    <span className="text-xs text-slate-400">Following</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center justify-center border-b border-slate-800 mb-6">
            <button
              onClick={() => setActiveTab("posts")}
              className={cn(
                "flex items-center gap-2 py-3 px-6 text-sm font-semibold border-b-2 transition-colors cursor-pointer",
                activeTab === "posts"
                  ? "border-purple-500 text-purple-400"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              )}
            >
              <Grid className="w-4 h-4" />
              <span>Posts</span>
            </button>

            <button
              onClick={() => setActiveTab("likes")}
              className={cn(
                "flex items-center gap-2 py-3 px-6 text-sm font-semibold border-b-2 transition-colors cursor-pointer",
                activeTab === "likes"
                  ? "border-purple-500 text-purple-400"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              )}
            >
              <Heart className="w-4 h-4" />
              <span>Likes</span>
            </button>
          </div>

          {/* Content */}
          <div>
            {activeTab === "posts" && (
              <div>
                {postsLoading && <LoadingSpinner />}
                {!postsLoading && (!posts || posts.length === 0) && (
                  <EmptyState
                    title="No posts yet"
                    description={`@${user.username} has not posted anything yet.`}
                  />
                )}
                {!postsLoading &&
                  posts?.map((post) => <PostCard key={post.id} post={post} />)}
              </div>
            )}

            {activeTab === "likes" && (
              <div>
                {likesLoading && <LoadingSpinner />}
                {!likesLoading && (!likes || likes.length === 0) && (
                  <EmptyState
                    title="No liked posts"
                    description={`@${user.username} has not liked any posts yet.`}
                  />
                )}
                {!likesLoading &&
                  likes?.map((post) => <PostCard key={post.id} post={post} />)}
              </div>
            )}
          </div>
        </>
      )}
    </MainLayout>
  );
}
