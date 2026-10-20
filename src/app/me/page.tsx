"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Grid, Bookmark, Heart, Edit3, Send } from "lucide-react";
import { TimelineLayout } from "@/components/layout/timeline-layout";
import { Avatar } from "@/components/common/avatar";
import { PostGrid } from "@/features/posts/components/post-grid";
import { LoadingSpinner, EmptyState } from "@/components/common/state-views";
import { usersApi } from "@/features/users/api/users";
import { likesApi } from "@/features/likes/api/likes";
import { bookmarksApi } from "@/features/bookmarks/api/bookmarks";
import { queryKeys } from "@/lib/query-keys";
import { useAppDispatch, useAppSelector } from "@/store";
import { setEditProfileModalOpen } from "@/store/uiSlice";
import { setUser } from "@/store/authSlice";
import { cn } from "@/lib/utils";
import { useHasMounted } from "@/hooks/use-has-mounted";

/** Angka stats: prioritaskan counts dari /api/me, fallback ke total list */
function resolveStatCount(
  profileCount: number | undefined,
  pageTotal: number | undefined,
  itemsLength?: number
) {
  if (typeof profileCount === "number" && profileCount > 0) return profileCount;
  if (typeof pageTotal === "number" && pageTotal > 0) return pageTotal;
  if (typeof itemsLength === "number" && itemsLength > 0) return itemsLength;
  return profileCount ?? pageTotal ?? 0;
}

function MyProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const mounted = useHasMounted();
  const { isAuthenticated, user: cachedUser, isLoading: authLoading } = useAppSelector(
    (s) => s.auth
  );

  type MeTab = "gallery" | "saved" | "likes";
  const tabFromUrl = (): MeTab => {
    const t = searchParams.get("tab");
    if (t === "saved") return "saved";
    if (t === "likes" || t === "liked") return "likes";
    return "gallery";
  };
  const [activeTab, setActiveTab] = useState<MeTab>(tabFromUrl);

  useEffect(() => {
    setActiveTab(tabFromUrl());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login?returnTo=/me");
    }
  }, [authLoading, isAuthenticated, router]);

  const { data: profile } = useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: () => usersApi.getMyProfile(),
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (profile?.id) {
      dispatch(setUser(profile));
    }
  }, [profile, dispatch]);

  const user = profile || cachedUser;

  // Selalu fetch posts + likes agar angka stats dari API (pagination.total / counts)
  const { data: myPostsData, isLoading: postsLoading } = useQuery({
    queryKey: queryKeys.posts.myPosts(),
    queryFn: () => usersApi.getMyPosts(1, 30),
    enabled: isAuthenticated,
  });

  const { data: likedData, isLoading: likesLoading } = useQuery({
    queryKey: queryKeys.posts.myLikes(),
    queryFn: () => likesApi.getMyLikes(1, 30),
    enabled: isAuthenticated,
  });

  const { data: savedData, isLoading: savedLoading } = useQuery({
    queryKey: queryKeys.posts.mySaved(),
    queryFn: () => bookmarksApi.getMySaved(1, 30),
    enabled: isAuthenticated && activeTab === "saved",
  });

  const postsCount = resolveStatCount(
    user?.postsCount,
    myPostsData?.total ?? myPostsData?.meta?.total,
    myPostsData?.items?.length
  );
  const likesCount = resolveStatCount(
    user?.likesCount,
    likedData?.total ?? likedData?.meta?.total,
    likedData?.items?.length
  );

  if (!mounted || authLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) return null;

  const setTab = (tab: MeTab) => {
    setActiveTab(tab);
    if (tab === "saved") router.replace("/me?tab=saved");
    else if (tab === "likes") router.replace("/me?tab=likes");
    else router.replace("/me");
  };

  const handleShareProfile = async () => {
    const url = `${window.location.origin}/profile/${user?.username || ""}`;
    try {
      if (navigator.share) {
        await navigator.share({
          url,
          title: user?.name || user?.username || "Profile",
        });
      } else {
        await navigator.clipboard.writeText(url);
        alert("Link profil disalin");
      }
    } catch {
      /* cancelled */
    }
  };

  return (
    <div className="px-4 md:px-0">
      {/* Header profil — Figma 41421-12065: flat, tanpa kartu tebal */}
      <div className="mb-6 pt-2 md:pt-0">
        <div className="flex items-start gap-4 sm:gap-6">
          <Avatar
            src={user?.avatarUrl}
            name={user?.name || user?.username}
            size="xl"
            className="h-[86px] w-[86px] shrink-0 text-2xl sm:h-24 sm:w-24"
          />

          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <h1 className="truncate text-lg font-bold text-white sm:text-xl">
                  {user?.name || user?.username || "My Profile"}
                </h1>
                <p className="text-sm text-neutral-400">@{user?.username}</p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => dispatch(setEditProfileModalOpen(true))}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-white/20 bg-transparent px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-white/5"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  Edit Profile
                </button>
                <button
                  type="button"
                  onClick={handleShareProfile}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/20 text-white transition hover:bg-white/5"
                  title="Share profile"
                  aria-label="Share profile"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {user?.bio && (
              <p className="mb-4 whitespace-pre-wrap text-sm leading-relaxed text-neutral-300">
                {user.bio}
              </p>
            )}
          </div>
        </div>

        {/* Stats: Post · Followers · Following · Likes — Figma: divider vertikal */}
        <div className="mt-5 grid grid-cols-4 border-y border-white/10 py-3">
          <button
            type="button"
            onClick={() => setTab("gallery")}
            className={cn(
              "cursor-pointer text-center transition hover:opacity-80",
              activeTab === "gallery" && "opacity-100"
            )}
            aria-label="Lihat postingan"
          >
            <span className="block text-base font-bold text-white sm:text-lg">{postsCount}</span>
            <span className="text-[11px] text-neutral-500 sm:text-xs">Post</span>
          </button>
          <Link
            href="/me/followers"
            className="cursor-pointer border-l border-white/10 text-center hover:opacity-80"
          >
            <span className="block text-base font-bold text-white sm:text-lg">
              {user?.followersCount ?? 0}
            </span>
            <span className="text-[11px] text-neutral-500 sm:text-xs">Followers</span>
          </Link>
          <Link
            href="/me/following"
            className="cursor-pointer border-l border-white/10 text-center hover:opacity-80"
          >
            <span className="block text-base font-bold text-white sm:text-lg">
              {user?.followingCount ?? 0}
            </span>
            <span className="text-[11px] text-neutral-500 sm:text-xs">Following</span>
          </Link>
          <button
            type="button"
            onClick={() => setTab("likes")}
            className={cn(
              "cursor-pointer border-l border-white/10 text-center transition hover:opacity-80",
              activeTab === "likes" && "opacity-100"
            )}
            aria-label="Lihat likes"
          >
            <span className="block text-base font-bold text-white sm:text-lg">{likesCount}</span>
            <span className="text-[11px] text-neutral-500 sm:text-xs">Likes</span>
          </button>
        </div>
      </div>

      {/* Tabs: Gallery | Saved | Liked — grid seperti Figma profil */}
      <div className="mb-1 flex items-center justify-center border-b border-white/10">
        {[
          { id: "gallery" as const, label: "Gallery", icon: Grid },
          { id: "saved" as const, label: "Saved", icon: Bookmark },
          { id: "likes" as const, label: "Liked", icon: Heart },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setTab(tab.id)}
              className={cn(
                "flex cursor-pointer items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition-colors sm:px-6",
                activeTab === tab.id
                  ? "border-white text-white"
                  : "border-transparent text-neutral-500 hover:text-neutral-200"
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4",
                  activeTab === tab.id && tab.id === "likes" && "fill-white"
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
          {!postsLoading && (!myPostsData?.items || myPostsData.items.length === 0) && (
            <EmptyState
              title="Belum ada post"
              description="Bagikan foto atau pikiran pertama Anda."
            />
          )}
          {!postsLoading && myPostsData?.items && myPostsData.items.length > 0 && (
            <PostGrid posts={myPostsData.items} tight />
          )}
        </div>
      )}

      {activeTab === "saved" && (
        <div className="-mx-4 md:mx-0">
          {savedLoading && <LoadingSpinner />}
          {!savedLoading && (!savedData?.items || savedData.items.length === 0) && (
            <EmptyState
              title="Belum ada saved"
              description="Simpan postingan dengan ikon bookmark."
            />
          )}
          {!savedLoading && savedData?.items && savedData.items.length > 0 && (
            <PostGrid posts={savedData.items} tight />
          )}
        </div>
      )}

      {activeTab === "likes" && (
        <div className="-mx-4 md:mx-0">
          {likesLoading && <LoadingSpinner />}
          {!likesLoading && (!likedData?.items || likedData.items.length === 0) && (
            <EmptyState
              title="Belum ada liked"
              description="Postingan yang Anda like akan muncul di sini."
            />
          )}
          {!likesLoading && likedData?.items && likedData.items.length > 0 && (
            <PostGrid posts={likedData.items} tight />
          )}
        </div>
      )}
    </div>
  );
}

export default function MyProfilePage() {
  return (
    <TimelineLayout>
      <Suspense fallback={<LoadingSpinner />}>
        <MyProfileContent />
      </Suspense>
    </TimelineLayout>
  );
}
