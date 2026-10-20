"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Compass, Grid, LayoutList } from "lucide-react";
import { MainLayout } from "@/components/layout/main-layout";
import { PostCard } from "@/features/posts/components/post-card";
import { PostGrid } from "@/features/posts/components/post-grid";
import { LoadingSpinner, EmptyState, ErrorState } from "@/components/common/state-views";
import { LoadMoreButton } from "@/components/common/load-more-button";
import { postsApi } from "@/features/posts/api/posts";
import { queryKeys } from "@/lib/query-keys";
import { cn } from "@/lib/utils";
import { Post } from "@/types/models";

export default function ExplorePage() {
  const [viewMode, setViewMode] = useState<"feed" | "grid">("grid");
  const [page, setPage] = useState(1);
  const [posts, setPosts] = useState<Post[]>([]);

  const { data, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: queryKeys.posts.explore(page),
    queryFn: async () => {
      const result = await postsApi.getExplorePosts(page, 21);
      setPosts((prev) => {
        if (page === 1) return result.items;
        const ids = new Set(prev.map((p) => p.id));
        return [...prev, ...result.items.filter((p) => !ids.has(p.id))];
      });
      return result;
    },
  });

  const list = posts.length > 0 ? posts : data?.items || [];

  return (
    <MainLayout>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-semibold text-white">
            <Compass className="h-5 w-5 text-neutral-400" />
            Explore
          </h1>
          <p className="mt-0.5 text-xs text-neutral-500">Temukan postingan publik</p>
        </div>

        <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-[#121212] p-1">
          <button
            onClick={() => setViewMode("grid")}
            className={cn(
              "rounded-lg p-1.5 transition-colors",
              viewMode === "grid" ? "bg-white text-black" : "text-neutral-400 hover:text-white"
            )}
            title="Grid"
          >
            <Grid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode("feed")}
            className={cn(
              "rounded-lg p-1.5 transition-colors",
              viewMode === "feed" ? "bg-white text-black" : "text-neutral-400 hover:text-white"
            )}
            title="Feed"
          >
            <LayoutList className="h-4 w-4" />
          </button>
        </div>
      </div>

      {isLoading && page === 1 && <LoadingSpinner />}
      {isError && <ErrorState message="Gagal memuat explore." onRetry={() => refetch()} />}
      {!isLoading && !isError && list.length === 0 && (
        <EmptyState title="Belum ada post" description="Jadilah yang pertama berbagi." />
      )}

      {list.length > 0 &&
        (viewMode === "feed" ? (
          <div className="flex flex-col">
            {list.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <PostGrid posts={list} />
        ))}

      <LoadMoreButton
        hasMore={data?.hasMore}
        isLoading={isFetching && page > 1}
        onClick={() => setPage((p) => p + 1)}
      />
    </MainLayout>
  );
}
