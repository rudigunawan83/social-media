"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { TimelineLayout } from "@/components/layout/timeline-layout";
import { PostCard } from "@/features/posts/components/post-card";
import { LoadingSpinner, EmptyState, ErrorState } from "@/components/common/state-views";
import { LoadMoreButton } from "@/components/common/load-more-button";
import { likesApi } from "@/features/likes/api/likes";
import { queryKeys } from "@/lib/query-keys";
import { useAppSelector } from "@/store";
import { Post } from "@/types/models";

/** Likes — pola halaman sama seperti Following (Back + judul + list) */
export default function MyLikesPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAppSelector((s) => s.auth);
  const [page, setPage] = useState(1);
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login?returnTo=/me/likes");
    }
  }, [isAuthenticated, isLoading, router]);

  const { data, isLoading: listLoading, isError, isFetching, refetch } = useQuery({
    queryKey: [...queryKeys.posts.myLikes(), page],
    queryFn: async () => {
      const result = await likesApi.getMyLikes(page, 20);
      setPosts((prev) => {
        if (page === 1) return result.items;
        const ids = new Set(prev.map((p) => p.id));
        return [...prev, ...result.items.filter((p) => !ids.has(p.id))];
      });
      return result;
    },
    enabled: isAuthenticated,
  });

  if (!isAuthenticated && !isLoading) return null;

  const list = posts.length > 0 ? posts : data?.items || [];

  return (
    <TimelineLayout>
      <div className="mb-5 flex items-center gap-3 px-4 md:px-0">
        <Link
          href="/me"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <h1 className="text-lg font-semibold text-white">Likes</h1>
      </div>

      {listLoading && page === 1 && <LoadingSpinner />}
      {isError && (
        <ErrorState message="Gagal memuat likes." onRetry={() => refetch()} />
      )}
      {!listLoading && !isError && list.length === 0 && (
        <EmptyState
          title="Belum ada likes"
          description="Postingan yang Anda like akan muncul di sini."
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
