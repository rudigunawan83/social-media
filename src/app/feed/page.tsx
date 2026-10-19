"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/main-layout";
import { PostCard } from "@/features/posts/components/post-card";
import { LoadingSpinner, EmptyState, ErrorState } from "@/components/common/state-views";
import { postsApi } from "@/features/posts/api/posts";
import { queryKeys } from "@/lib/query-keys";
import { useAppSelector } from "@/store";
import { Sparkles, Compass, PlusCircle } from "lucide-react";
import { useDispatch } from "react-redux";
import { setCreatePostModalOpen } from "@/store/uiSlice";

export default function FeedPage() {
  const dispatch = useDispatch();
  const { isAuthenticated, isLoading: authLoading } = useAppSelector((s) => s.auth);
  const [page, setPage] = useState(1);

  const {
    data: posts,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: queryKeys.feed.list(page),
    queryFn: () => postsApi.getFeed(page, 20),
    enabled: isAuthenticated,
  });

  return (
    <MainLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            Home Feed
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Posts from people you follow & your recent activity
          </p>
        </div>
      </div>

      {!authLoading && !isAuthenticated && (
        <EmptyState
          title="Sign in to view your feed"
          description="Follow other creators to see their photos and updates in your personal timeline."
          action={
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="px-4 py-2 rounded-xl gradient-primary text-xs font-semibold text-white shadow"
              >
                Log In
              </Link>
              <Link
                href="/explore"
                className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-200 hover:bg-slate-700"
              >
                Explore Public Posts
              </Link>
            </div>
          }
        />
      )}

      {isAuthenticated && (
        <>
          {isLoading && <LoadingSpinner />}
          {isError && (
            <ErrorState message="Could not load your feed." onRetry={refetch} />
          )}
          {!isLoading && !isError && (!posts || posts.length === 0) && (
            <EmptyState
              title="Your feed is empty"
              description="You haven't followed anyone yet, or they haven't posted anything."
              action={
                <div className="flex items-center gap-3">
                  <Link
                    href="/users/search"
                    className="px-4 py-2 rounded-xl gradient-primary text-xs font-semibold text-white shadow flex items-center gap-1.5"
                  >
                    <Compass className="w-3.5 h-3.5" />
                    Find People
                  </Link>
                  <button
                    onClick={() => dispatch(setCreatePostModalOpen(true))}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-200 hover:bg-slate-700 flex items-center gap-1.5"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    Create Post
                  </button>
                </div>
              }
            />
          )}

          {!isLoading &&
            !isError &&
            posts &&
            posts.map((post) => <PostCard key={post.id} post={post} />)}
        </>
      )}
    </MainLayout>
  );
}
