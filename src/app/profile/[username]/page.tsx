"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Grid, Heart, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout/main-layout";
import { Avatar } from "@/components/common/avatar";
import { FollowButton } from "@/features/follow/components/follow-button";
import { PostGrid } from "@/features/posts/components/post-grid";
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

  const { data: postsData, isLoading: postsLoading } = useQuery({
    queryKey: queryKeys.users.posts(username),
    queryFn: () => usersApi.getUserPosts(username),
    enabled: activeTab === "posts",
  });

  const { data: likesData, isLoading: likesLoading } = useQuery({
    queryKey: queryKeys.users.likes(username),
    queryFn: () => usersApi.getUserLikes(username),
    enabled: activeTab === "likes",
  });

  return (
    <MainLayout>
      <div className="mb-4">
        <button
          onClick={() => router.back()}
          className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-neutral-400 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
      </div>

      {userLoading && <LoadingSpinner />}
      {userError && (
        <ErrorState message="Profil tidak ditemukan." onRetry={() => refetch()} />
      )}

      {user && (
        <>
          <div className="mb-6 rounded-2xl border border-white/8 bg-[#121212] p-5 md:p-7">
            <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
              <Avatar
                src={user.avatarUrl}
                name={user.name || user.username}
                size="xl"
                className="h-24 w-24 text-2xl ring-2 ring-white/10"
              />

              <div className="min-w-0 flex-1 text-center sm:text-left">
                <div className="mb-3 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <div>
                    <h1 className="truncate text-xl font-semibold text-white">
                      {user.name || user.username}
                    </h1>
                    <p className="text-sm text-neutral-400">@{user.username}</p>
                  </div>
                  <FollowButton
                    username={user.username}
                    initialIsFollowing={user.isFollowedByMe}
                  />
                </div>

                {user.bio && (
                  <p className="mb-4 whitespace-pre-wrap text-sm leading-relaxed text-neutral-300">
                    {user.bio}
                  </p>
                )}

                <div className="flex items-center justify-center gap-6 border-t border-white/8 pt-3 sm:justify-start">
                  <div className="text-center sm:text-left">
                    <span className="block text-base font-bold text-white">
                      {user.postsCount ?? postsData?.items?.length ?? 0}
                    </span>
                    <span className="text-xs text-neutral-500">Posts</span>
                  </div>
                  <Link
                    href={`/profile/${username}/followers`}
                    className="text-center hover:opacity-80 sm:text-left"
                  >
                    <span className="block text-base font-bold text-white">
                      {user.followersCount ?? 0}
                    </span>
                    <span className="text-xs text-neutral-500">Followers</span>
                  </Link>
                  <Link
                    href={`/profile/${username}/following`}
                    className="text-center hover:opacity-80 sm:text-left"
                  >
                    <span className="block text-base font-bold text-white">
                      {user.followingCount ?? 0}
                    </span>
                    <span className="text-xs text-neutral-500">Following</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-5 flex items-center justify-center border-b border-white/8">
            <button
              onClick={() => setActiveTab("posts")}
              className={cn(
                "flex cursor-pointer items-center gap-2 border-b-2 px-6 py-3 text-sm font-semibold transition-colors",
                activeTab === "posts"
                  ? "border-white text-white"
                  : "border-transparent text-neutral-500 hover:text-neutral-200"
              )}
            >
              <Grid className="h-4 w-4" />
              Posts
            </button>
            <button
              onClick={() => setActiveTab("likes")}
              className={cn(
                "flex cursor-pointer items-center gap-2 border-b-2 px-6 py-3 text-sm font-semibold transition-colors",
                activeTab === "likes"
                  ? "border-white text-white"
                  : "border-transparent text-neutral-500 hover:text-neutral-200"
              )}
            >
              <Heart className="h-4 w-4" />
              Likes
            </button>
          </div>

          {activeTab === "posts" && (
            <div>
              {postsLoading && <LoadingSpinner />}
              {!postsLoading && (!postsData?.items || postsData.items.length === 0) && (
                <EmptyState
                  title="Belum ada post"
                  description={`@${user.username} belum memposting apapun.`}
                />
              )}
              {!postsLoading && postsData?.items && postsData.items.length > 0 && (
                <PostGrid posts={postsData.items} />
              )}
            </div>
          )}

          {activeTab === "likes" && (
            <div>
              {likesLoading && <LoadingSpinner />}
              {!likesLoading && (!likesData?.items || likesData.items.length === 0) && (
                <EmptyState
                  title="Belum ada liked"
                  description={`@${user.username} belum like postingan.`}
                />
              )}
              {!likesLoading && likesData?.items && likesData.items.length > 0 && (
                <PostGrid posts={likesData.items} />
              )}
            </div>
          )}
        </>
      )}
    </MainLayout>
  );
}
