"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Grid, Bookmark, Heart, Edit3, Settings } from "lucide-react";
import { TimelineLayout } from "@/components/layout/timeline-layout";
import { Avatar } from "@/components/common/avatar";
import { PostGrid } from "@/features/posts/components/post-grid";
import { PostCard } from "@/features/posts/components/post-card";
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

function MyProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const mounted = useHasMounted();
  const { isAuthenticated, user: cachedUser, isLoading: authLoading } = useAppSelector(
    (s) => s.auth
  );

  const initialTab = searchParams.get("tab") || "posts";
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam) setActiveTab(tabParam);
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

  // Sinkronkan profil terbaru (termasuk avatarUrl) ke Redux + localStorage
  useEffect(() => {
    if (profile?.id) {
      dispatch(setUser(profile));
    }
  }, [profile, dispatch]);

  const user = profile || cachedUser;

  const { data: myPostsData, isLoading: postsLoading } = useQuery({
    queryKey: queryKeys.posts.myPosts(),
    queryFn: () => usersApi.getMyPosts(1, 30),
    enabled: isAuthenticated && (activeTab === "posts" || activeTab === "overview"),
  });

  const { data: savedData, isLoading: savedLoading } = useQuery({
    queryKey: queryKeys.posts.mySaved(),
    queryFn: () => bookmarksApi.getMySaved(1, 30),
    enabled: isAuthenticated && activeTab === "saved",
  });

  const { data: likedData, isLoading: likesLoading } = useQuery({
    queryKey: queryKeys.posts.myLikes(),
    queryFn: () => likesApi.getMyLikes(1, 30),
    enabled: isAuthenticated && activeTab === "likes",
  });

  if (!mounted || authLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) return null;

  const setTab = (tab: string) => {
    setActiveTab(tab);
    router.replace(`/me?tab=${tab}`);
  };

  return (
    <>
      <div className="mb-6 rounded-2xl border border-white/8 bg-[#121212] p-5 md:p-7">
        <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
          <Avatar
            src={user?.avatarUrl}
            name={user?.name || user?.username}
            size="xl"
            className="h-24 w-24 text-2xl ring-2 ring-white/10"
          />

          <div className="min-w-0 flex-1 text-center sm:text-left">
            <div className="mb-3 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <h1 className="truncate text-xl font-semibold text-white">
                  {user?.name || user?.username || "My Profile"}
                </h1>
                <p className="text-sm text-neutral-400">@{user?.username}</p>
              </div>

              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => dispatch(setEditProfileModalOpen(true))}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-neutral-100 transition hover:bg-white/10"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  Edit Profile
                </button>
                <button
                  onClick={() => setTab("settings")}
                  className="rounded-xl border border-white/10 bg-white/5 p-2 text-neutral-300 hover:bg-white/10"
                  title="Settings"
                >
                  <Settings className="h-4 w-4" />
                </button>
              </div>
            </div>

            {user?.bio && (
              <p className="mb-4 whitespace-pre-wrap text-sm leading-relaxed text-neutral-300">
                {user.bio}
              </p>
            )}

            <div className="flex items-center justify-center gap-6 border-t border-white/8 pt-3 sm:justify-start">
              <div className="text-center sm:text-left">
                <span className="block text-base font-bold text-white">
                  {user?.postsCount ?? myPostsData?.items?.length ?? 0}
                </span>
                <span className="text-xs text-neutral-500">Posts</span>
              </div>
              <Link href="/me/followers" className="text-center hover:opacity-80 sm:text-left">
                <span className="block text-base font-bold text-white">
                  {user?.followersCount ?? 0}
                </span>
                <span className="text-xs text-neutral-500">Followers</span>
              </Link>
              <Link href="/me/following" className="text-center hover:opacity-80 sm:text-left">
                <span className="block text-base font-bold text-white">
                  {user?.followingCount ?? 0}
                </span>
                <span className="text-xs text-neutral-500">Following</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-5 flex items-center justify-center border-b border-white/8">
        {[
          { id: "posts", label: "Posts", icon: Grid },
          { id: "saved", label: "Saved", icon: Bookmark },
          { id: "likes", label: "Liked", icon: Heart },
          { id: "settings", label: "Settings", icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setTab(tab.id)}
              className={cn(
                "flex cursor-pointer items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors",
                activeTab === tab.id
                  ? "border-white text-white"
                  : "border-transparent text-neutral-500 hover:text-neutral-200"
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {activeTab === "posts" && (
        <div>
          {postsLoading && <LoadingSpinner />}
          {!postsLoading && (!myPostsData?.items || myPostsData.items.length === 0) && (
            <EmptyState
              title="Belum ada post"
              description="Bagikan foto atau pikiran pertama Anda."
            />
          )}
          {!postsLoading && myPostsData?.items && myPostsData.items.length > 0 && (
            <PostGrid posts={myPostsData.items} />
          )}
        </div>
      )}

      {activeTab === "saved" && (
        <div>
          {savedLoading && <LoadingSpinner />}
          {!savedLoading && (!savedData?.items || savedData.items.length === 0) && (
            <EmptyState
              title="Belum ada saved"
              description="Simpan postingan dengan ikon bookmark."
            />
          )}
          {!savedLoading &&
            savedData?.items?.map((post) => <PostCard key={post.id} post={post} />)}
        </div>
      )}

      {activeTab === "likes" && (
        <div>
          {likesLoading && <LoadingSpinner />}
          {!likesLoading && (!likedData?.items || likedData.items.length === 0) && (
            <EmptyState
              title="Belum ada liked"
              description="Postingan yang Anda like akan muncul di sini."
            />
          )}
          {!likesLoading && likedData?.items && likedData.items.length > 0 && (
            <PostGrid posts={likedData.items} />
          )}
        </div>
      )}

      {activeTab === "settings" && (
        <div className="rounded-2xl border border-white/8 bg-[#121212] p-5">
          <h2 className="mb-2 text-sm font-semibold text-white">Settings</h2>
          <p className="mb-4 text-xs text-neutral-500">
            Ubah informasi dasar profil Anda kapan saja.
          </p>
          <button
            onClick={() => dispatch(setEditProfileModalOpen(true))}
            className="rounded-xl bg-white px-4 py-2 text-xs font-semibold text-black"
          >
            Edit Profile
          </button>
        </div>
      )}
    </>
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
