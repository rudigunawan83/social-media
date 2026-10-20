"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Compass, PlusCircle } from "lucide-react";
import { useDispatch } from "react-redux";
import { TimelineLayout } from "@/components/layout/timeline-layout";
import { PostCard } from "@/features/posts/components/post-card";
import { LoadingSpinner, EmptyState, ErrorState } from "@/components/common/state-views";
import { LoadMoreButton } from "@/components/common/load-more-button";
import { postsApi } from "@/features/posts/api/posts";
import { queryKeys } from "@/lib/query-keys";
import { useAppSelector } from "@/store";
import { setCreatePostModalOpen } from "@/store/uiSlice";
import { Post } from "@/types/models";

export default function FeedPage() {
  const dispatch = useDispatch();
  const { isAuthenticated, isLoading: authLoading } = useAppSelector((s) => s.auth);
  const [page, setPage] = useState(1);
  const [posts, setPosts] = useState<Post[]>([]);

  // Sebelum login: /api/posts (explore publik)
  // Sesudah login: /api/feed (timeline pribadi)
  const { data, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: isAuthenticated
      ? queryKeys.feed.list(page)
      : queryKeys.posts.explore(page),
    queryFn: async () => {
      const result = isAuthenticated
        ? await postsApi.getFeed(page, 20)
        : await postsApi.getExplorePosts(page, 20);
      setPosts((prev) => {
        if (page === 1) return result.items;
        const ids = new Set(prev.map((p) => p.id));
        return [...prev, ...result.items.filter((p) => !ids.has(p.id))];
      });
      return result;
    },
    enabled: !authLoading,
  });

  // Reset list saat status auth berubah
  React.useEffect(() => {
    setPage(1);
    setPosts([]);
  }, [isAuthenticated]);

  const list = posts.length > 0 ? posts : data?.items || [];

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <TimelineLayout>
      {/* Judul Timeline hanya desktop — mobile Figma langsung feed */}
      <div className="mb-4 hidden border-b border-white/10 pb-3 md:block">
        <h1 className="text-base font-semibold tracking-wide text-white">Timeline</h1>
      </div>

      {isLoading && page === 1 && <LoadingSpinner />}
      {isError && (
        <ErrorState message="Gagal memuat timeline." onRetry={() => refetch()} />
      )}

      {!isLoading && !isError && list.length === 0 && (
        <EmptyState
          title={isAuthenticated ? "Timeline masih kosong" : "Belum ada postingan"}
          description={
            isAuthenticated
              ? "Follow orang lain atau buat postingan pertama Anda."
              : "Belum ada post publik. Coba lagi nanti atau daftar untuk mulai berbagi."
          }
          action={
            isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/users/search"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600 px-4 py-2 text-xs font-semibold text-white hover:bg-violet-500"
                >
                  <Compass className="h-3.5 w-3.5" />
                  Find People
                </Link>
                <button
                  onClick={() => dispatch(setCreatePostModalOpen(true))}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 px-4 py-2 text-xs font-semibold text-neutral-200"
                >
                  <PlusCircle className="h-3.5 w-3.5" />
                  Create Post
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login?returnTo=/feed"
                  className="rounded-xl border border-white/20 px-4 py-2 text-xs font-semibold text-white"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="rounded-xl bg-violet-600 px-4 py-2 text-xs font-semibold text-white"
                >
                  Register
                </Link>
              </div>
            )
          }
        />
      )}

      {list.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}

      <LoadMoreButton
        hasMore={data?.hasMore}
        isLoading={isFetching && page > 1}
        onClick={() => setPage((p) => p + 1)}
      />
    </TimelineLayout>
  );
}
