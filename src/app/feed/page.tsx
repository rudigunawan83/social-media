"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PlusCircle } from "lucide-react";
import { useDispatch } from "react-redux";
import { TimelineLayout } from "@/components/layout/timeline-layout";
import { PostCard } from "@/features/posts/components/post-card";
import { LoadingSpinner, EmptyState, ErrorState } from "@/components/common/state-views";
import { LoadMoreButton } from "@/components/common/load-more-button";
import { postsApi } from "@/features/posts/api/posts";
import { queryKeys } from "@/lib/query-keys";
import { useAppSelector } from "@/store";
import { setCreatePostModalOpen } from "@/store/uiSlice";
import { useHasMounted } from "@/hooks/use-has-mounted";
import { Post } from "@/types/models";

export const GO_HOME_EVENT = "sociality:go-home";

/** Timeline Home — semua post publik (semua user) */
export default function FeedPage() {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const mounted = useHasMounted();
  const { isAuthenticated, isLoading: authLoading } = useAppSelector((s) => s.auth);
  const [page, setPage] = useState(1);
  const [posts, setPosts] = useState<Post[]>([]);

  const ready = mounted && !authLoading;

  const { data, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: queryKeys.posts.explore(page),
    queryFn: async () => {
      // GET /api/posts — semua postingan, bukan hanya following
      const result = await postsApi.getExplorePosts(page, 20);
      setPosts((prev) => {
        if (page === 1) return result.items;
        const ids = new Set(prev.map((p) => p.id));
        return [...prev, ...result.items.filter((p) => !ids.has(p.id))];
      });
      return result;
    },
    enabled: ready,
  });

  // Logo / Home navbar → reset & muat ulang semua post
  useEffect(() => {
    const onGoHome = () => {
      setPage(1);
      setPosts([]);
      queryClient.invalidateQueries({ queryKey: ["posts", "explore"] });
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
    window.addEventListener(GO_HOME_EVENT, onGoHome);
    return () => window.removeEventListener(GO_HOME_EVENT, onGoHome);
  }, [queryClient]);

  const list = posts.length > 0 ? posts : data?.items || [];

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <TimelineLayout>
      <div className="mb-4 hidden border-b border-white/10 pb-3 md:block">
        <h1 className="text-base font-semibold tracking-wide text-white">Timeline</h1>
      </div>

      {isLoading && page === 1 && <LoadingSpinner />}
      {isError && (
        <ErrorState message="Gagal memuat timeline." onRetry={() => refetch()} />
      )}

      {!isLoading && !isError && list.length === 0 && (
        <EmptyState
          title="Belum ada postingan"
          description={
            isAuthenticated
              ? "Jadilah yang pertama berbagi, atau coba lagi nanti."
              : "Belum ada post publik. Coba lagi nanti atau daftar untuk mulai berbagi."
          }
          action={
            isAuthenticated ? (
              <button
                onClick={() => dispatch(setCreatePostModalOpen(true))}
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 px-4 py-2 text-xs font-semibold text-neutral-200"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                Create Post
              </button>
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
