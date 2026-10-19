"use client";

import React, { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Grid,
  Bookmark,
  Heart,
  Edit3,
} from "lucide-react";
import { MainLayout } from "@/components/layout/main-layout";
import { Avatar } from "@/components/common/avatar";
import { PostCard } from "@/features/posts/components/post-card";
import { LoadingSpinner, EmptyState } from "@/components/common/state-views";
import { usersApi } from "@/features/users/api/users";
import { likesApi } from "@/features/likes/api/likes";
import { bookmarksApi } from "@/features/bookmarks/api/bookmarks";
import { queryKeys } from "@/lib/query-keys";
import { useAppDispatch, useAppSelector } from "@/store";
import { setEditProfileModalOpen } from "@/store/uiSlice";
import { cn } from "@/lib/utils";

function MyProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
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

  // Fetch fresh profile stats
  const { data: profile } = useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: () => usersApi.getMyProfile(),
    enabled: isAuthenticated,
  });

  const user = profile || cachedUser;

  // Tab: Posts
  const { data: myPostsData, isLoading: postsLoading } = useQuery({
    queryKey: queryKeys.posts.myPosts(),
    queryFn: () => usersApi.getMyPosts(1, 30),
    enabled: isAuthenticated && activeTab === "posts",
  });

  // Tab: Saved
  const { data: savedPosts, isLoading: savedLoading } = useQuery({
    queryKey: queryKeys.posts.mySaved(),
    queryFn: () => bookmarksApi.getMySaved(1, 30),
    enabled: isAuthenticated && activeTab === "saved",
  });

  // Tab: Likes
  const { data: likedPosts, isLoading: likesLoading } = useQuery({
    queryKey: queryKeys.posts.myLikes(),
    queryFn: () => likesApi.getMyLikes(1, 30),
    enabled: isAuthenticated && activeTab === "likes",
  });

  if (!isAuthenticated && !authLoading) return null;

  return (
    <>
      {/* Profile Header */}
      <div className="glass-panel rounded-3xl p-6 md:p-8 mb-6 shadow-xl border border-slate-700/80">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <Avatar
            src={user?.avatarUrl}
            name={user?.name || user?.username}
            size="xl"
            className="w-24 h-24 text-2xl ring-4 ring-purple-500/20 shadow-xl"
          />

          <div className="flex-1 text-center sm:text-left min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
              <div>
                <h1 className="text-xl font-bold text-white truncate">
                  {user?.name || user?.username || "My Profile"}
                </h1>
                <p className="text-sm text-purple-400 font-medium">@{user?.username}</p>
              </div>

              <button
                onClick={() => dispatch(setEditProfileModalOpen(true))}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>
            </div>

            {user?.bio && (
              <p className="text-sm text-slate-300 mb-4 whitespace-pre-wrap leading-relaxed">
                {user.bio}
              </p>
            )}

            {/* Stats Row */}
            <div className="flex items-center justify-center sm:justify-start gap-6 pt-2 border-t border-slate-800/80">
              <div className="text-center sm:text-left">
                <span className="block font-bold text-base text-slate-100">
                  {user?.postsCount ?? myPostsData?.items?.length ?? 0}
                </span>
                <span className="text-xs text-slate-400">Posts</span>
              </div>
              <div className="text-center sm:text-left">
                <span className="block font-bold text-base text-slate-100">
                  {user?.followersCount ?? 0}
                </span>
                <span className="text-xs text-slate-400">Followers</span>
              </div>
              <div className="text-center sm:text-left">
                <span className="block font-bold text-base text-slate-100">
                  {user?.followingCount ?? 0}
                </span>
                <span className="text-xs text-slate-400">Following</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
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
          <span>My Posts</span>
        </button>

        <button
          onClick={() => setActiveTab("saved")}
          className={cn(
            "flex items-center gap-2 py-3 px-6 text-sm font-semibold border-b-2 transition-colors cursor-pointer",
            activeTab === "saved"
              ? "border-purple-500 text-purple-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          )}
        >
          <Bookmark className="w-4 h-4" />
          <span>Saved</span>
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
          <span>Liked</span>
        </button>
      </div>

      {/* Tab Contents */}
      <div>
        {activeTab === "posts" && (
          <div>
            {postsLoading && <LoadingSpinner />}
            {!postsLoading && (!myPostsData?.items || myPostsData.items.length === 0) && (
              <EmptyState
                title="No posts yet"
                description="Share your first photo or thought with your followers."
              />
            )}
            {!postsLoading &&
              myPostsData?.items?.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
          </div>
        )}

        {activeTab === "saved" && (
          <div>
            {savedLoading && <LoadingSpinner />}
            {!savedLoading && (!savedPosts || savedPosts.length === 0) && (
              <EmptyState
                title="No saved posts"
                description="Save posts by tapping the bookmark icon to read them later."
              />
            )}
            {!savedLoading &&
              savedPosts?.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
          </div>
        )}

        {activeTab === "likes" && (
          <div>
            {likesLoading && <LoadingSpinner />}
            {!likesLoading && (!likedPosts || likedPosts.length === 0) && (
              <EmptyState
                title="No liked posts"
                description="Posts you've liked will show up here."
              />
            )}
            {!likesLoading &&
              likedPosts?.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
          </div>
        )}
      </div>
    </>
  );
}

export default function MyProfilePage() {
  return (
    <MainLayout>
      <Suspense fallback={<LoadingSpinner />}>
        <MyProfileContent />
      </Suspense>
    </MainLayout>
  );
}
