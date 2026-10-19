"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/main-layout";
import { PostCard } from "@/features/posts/components/post-card";
import { LoadingSpinner, EmptyState, ErrorState } from "@/components/common/state-views";
import { postsApi } from "@/features/posts/api/posts";
import { queryKeys } from "@/lib/query-keys";
import { Compass, Grid, LayoutList, Heart, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ExplorePage() {
  const [viewMode, setViewMode] = useState<"feed" | "grid">("grid");
  const [page, setPage] = useState(1);

  const {
    data: posts,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: queryKeys.posts.explore(page),
    queryFn: () => postsApi.getExplorePosts(page, 20),
  });

  return (
    <MainLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Compass className="w-5 h-5 text-purple-400" />
            Explore
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Discover trending photos and community posts
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setViewMode("grid")}
            className={cn(
              "p-1.5 rounded-lg text-xs font-medium transition-colors",
              viewMode === "grid"
                ? "bg-purple-600/20 text-purple-400"
                : "text-slate-400 hover:text-slate-200"
            )}
            title="Grid view"
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("feed")}
            className={cn(
              "p-1.5 rounded-lg text-xs font-medium transition-colors",
              viewMode === "feed"
                ? "bg-purple-600/20 text-purple-400"
                : "text-slate-400 hover:text-slate-200"
            )}
            title="Feed view"
          >
            <LayoutList className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isLoading && <LoadingSpinner />}
      {isError && (
        <ErrorState message="Could not load explore posts." onRetry={refetch} />
      )}

      {!isLoading && !isError && (!posts || posts.length === 0) && (
        <EmptyState
          title="No posts discovered"
          description="Be the first to share a post with the community!"
        />
      )}

      {!isLoading && !isError && posts && posts.length > 0 && (
        <>
          {viewMode === "feed" ? (
            <div className="flex flex-col gap-4">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/posts/${post.id}`}
                  className="group relative aspect-square rounded-xl overflow-hidden bg-slate-900 border border-slate-800/80 hover:border-purple-500/40 transition-colors"
                >
                  {post.imageUrl ? (
                    <Image
                      src={post.imageUrl}
                      alt={post.caption || "Explore post"}
                      fill
                      sizes="(max-width: 768px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-slate-500">
                      No Image
                    </div>
                  )}

                  {/* Hover Overlay with Likes & Comments Count */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white font-semibold text-xs backdrop-blur-xs">
                    <div className="flex items-center gap-1.5">
                      <Heart className="w-4 h-4 fill-white" />
                      <span>{post.likesCount || 0}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MessageCircle className="w-4 h-4 fill-white" />
                      <span>{post.commentsCount || 0}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </MainLayout>
  );
}
