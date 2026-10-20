"use client";

import React, { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Grid, Heart, Send } from "lucide-react";
import { TimelineLayout } from "@/components/layout/timeline-layout";
import { Avatar } from "@/components/common/avatar";
import { FollowButton } from "@/features/follow/components/follow-button";
import { PostGrid } from "@/features/posts/components/post-grid";
import { LoadingSpinner, EmptyState, ErrorState } from "@/components/common/state-views";
import { usersApi } from "@/features/users/api/users";
import { queryKeys } from "@/lib/query-keys";
import { useAppSelector } from "@/store";
import { cn } from "@/lib/utils";

/**
 * Profil publik / friend — Figma 41420-10785
 * Layout flat seperti /me + Follow (ungu) + Share
 */
export default function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const resolvedParams = use(params);
  const username = decodeURIComponent(resolvedParams.username);
  const router = useRouter();
  const { user: currentUser, isAuthenticated } = useAppSelector((s) => s.auth);
  const [activeTab, setActiveTab] = useState<"gallery" | "liked">("gallery");

  const {
    data: user,
    isLoading: userLoading,
    isError: userError,
    refetch,
  } = useQuery({
    queryKey: queryKeys.users.profile(username),
    queryFn: () => usersApi.getPublicProfile(username),
  });

  const isOwnProfile =
    Boolean(user?.isMe) ||
    (isAuthenticated &&
      !!currentUser?.username &&
      currentUser.username.toLowerCase() === username.toLowerCase());

  useEffect(() => {
    if (isOwnProfile) {
      router.replace("/me");
    }
  }, [isOwnProfile, router]);

  const { data: postsData, isLoading: postsLoading } = useQuery({
    queryKey: queryKeys.users.posts(username),
    queryFn: () => usersApi.getUserPosts(username, 1, 30),
    enabled: !!user && !isOwnProfile,
  });

  const { data: likesData, isLoading: likesLoading } = useQuery({
    queryKey: queryKeys.users.likes(username),
    queryFn: () => usersApi.getUserLikes(username, 1, 30),
    enabled: !!user && !isOwnProfile && activeTab === "liked",
  });

  const postsCount =
    (user?.postsCount && user.postsCount > 0 ? user.postsCount : null) ??
    postsData?.total ??
    postsData?.meta?.total ??
    postsData?.items?.length ??
    0;
  const likesCount =
    (user?.likesCount && user.likesCount > 0 ? user.likesCount : null) ??
    likesData?.total ??
    likesData?.meta?.total ??
    0;

  const handleShareProfile = async () => {
    const url = `${window.location.origin}/profile/${username}`;
    try {
      if (navigator.share) {
        await navigator.share({
          url,
          title: user?.name || user?.username || username,
        });
      } else {
        await navigator.clipboard.writeText(url);
        alert("Link profil disalin");
      }
    } catch {
      /* cancelled */
    }
  };

  if (isOwnProfile) {
    return (
      <TimelineLayout>
        <LoadingSpinner />
      </TimelineLayout>
    );
  }

  return (
    <TimelineLayout>
      {userLoading && <LoadingSpinner />}
      {userError && (
        <ErrorState message="Profil tidak ditemukan." onRetry={() => refetch()} />
      )}

      {user && (
        <div className="px-4 md:px-0">
          {/* Header flat — Figma Friend Profile */}
          <div className="mb-6 pt-2 md:pt-0">
            <div className="flex items-start gap-4 sm:gap-6">
              <Avatar
                src={user.avatarUrl}
                name={user.name || user.username}
                size="xl"
                className="h-[86px] w-[86px] shrink-0 text-2xl sm:h-24 sm:w-24"
              />

              <div className="min-w-0 flex-1">
                <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h1 className="truncate text-lg font-bold text-white sm:text-xl">
                      {user.name || user.username}
                    </h1>
                    <p className="text-sm text-neutral-400">@{user.username}</p>
                  </div>

                  {/* Follow (ungu pill) + Share */}
                  <div className="flex shrink-0 items-center gap-2">
                    {isAuthenticated ? (
                      <FollowButton
                        username={user.username}
                        initialIsFollowing={user.isFollowedByMe}
                      />
                    ) : (
                      <Link
                        href={`/login?returnTo=${encodeURIComponent(`/profile/${username}`)}`}
                        className="inline-flex min-w-[96px] cursor-pointer items-center justify-center rounded-full bg-violet-600 px-5 py-2 text-sm font-semibold text-white shadow-md shadow-violet-600/25 transition hover:bg-violet-500"
                      >
                        Follow
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={handleShareProfile}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-white transition hover:bg-white/5"
                      title="Share profile"
                      aria-label="Share profile"
                    >
                      <Send className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {user.bio && (
                  <p className="mb-1 whitespace-pre-wrap text-sm leading-relaxed text-neutral-300">
                    {user.bio}
                  </p>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="mt-5 grid grid-cols-4 border-y border-white/10 py-3">
              <div className="text-center">
                <span className="block text-base font-bold text-white sm:text-lg">
                  {postsCount}
                </span>
                <span className="text-[11px] text-neutral-500 sm:text-xs">Post</span>
              </div>
              <Link
                href={`/profile/${username}/followers`}
                className="border-l border-white/10 text-center hover:opacity-80"
              >
                <span className="block text-base font-bold text-white sm:text-lg">
                  {user.followersCount ?? 0}
                </span>
                <span className="text-[11px] text-neutral-500 sm:text-xs">Followers</span>
              </Link>
              <Link
                href={`/profile/${username}/following`}
                className="border-l border-white/10 text-center hover:opacity-80"
              >
                <span className="block text-base font-bold text-white sm:text-lg">
                  {user.followingCount ?? 0}
                </span>
                <span className="text-[11px] text-neutral-500 sm:text-xs">Following</span>
              </Link>
              <button
                type="button"
                onClick={() => setActiveTab("liked")}
                className="border-l border-white/10 text-center hover:opacity-80"
              >
                <span className="block text-base font-bold text-white sm:text-lg">
                  {likesCount}
                </span>
                <span className="text-[11px] text-neutral-500 sm:text-xs">Likes</span>
              </button>
            </div>
          </div>

          {/* Tabs: Gallery | Liked */}
          <div className="mb-1 flex items-center justify-center border-b border-white/10">
            {[
              { id: "gallery" as const, label: "Gallery", icon: Grid },
              { id: "liked" as const, label: "Liked", icon: Heart },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex cursor-pointer items-center gap-2 border-b-2 px-6 py-3 text-sm font-semibold transition-colors",
                    activeTab === tab.id
                      ? "border-white text-white"
                      : "border-transparent text-neutral-500 hover:text-neutral-200"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4",
                      activeTab === tab.id && tab.id === "liked" && "fill-white"
                    )}
                  />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {activeTab === "gallery" && (
            <div className="-mx-4 md:mx-0">
              {postsLoading && <LoadingSpinner />}
              {!postsLoading && (!postsData?.items || postsData.items.length === 0) && (
                <EmptyState
                  title="Belum ada post"
                  description={`@${user.username} belum memposting apapun.`}
                />
              )}
              {!postsLoading && postsData?.items && postsData.items.length > 0 && (
                <PostGrid posts={postsData.items} tight />
              )}
            </div>
          )}

          {activeTab === "liked" && (
            <div className="-mx-4 md:mx-0">
              {likesLoading && <LoadingSpinner />}
              {!likesLoading && (!likesData?.items || likesData.items.length === 0) && (
                <EmptyState
                  title="Belum ada liked"
                  description={`@${user.username} belum like postingan.`}
                />
              )}
              {!likesLoading && likesData?.items && likesData.items.length > 0 && (
                <PostGrid posts={likesData.items} tight />
              )}
            </div>
          )}
        </div>
      )}
    </TimelineLayout>
  );
}
