"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { UserChip } from "@/features/users/components/user-chip";
import { LoadingSpinner, EmptyState, ErrorState } from "@/components/common/state-views";
import { LoadMoreButton } from "@/components/common/load-more-button";
import { User } from "@/types/models";
import { PaginatedResult } from "@/types/api";

type Fetcher = (page: number, limit: number) => Promise<PaginatedResult<User>>;

export function FollowList({
  queryKey,
  fetcher,
  emptyTitle,
  emptyDescription,
}: {
  queryKey: readonly unknown[];
  fetcher: Fetcher;
  emptyTitle: string;
  emptyDescription: string;
}) {
  const [page, setPage] = useState(1);
  const [accumulated, setAccumulated] = useState<User[]>([]);

  const { data, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: [...queryKey, page],
    queryFn: async () => {
      const result = await fetcher(page, 20);
      setAccumulated((prev) => {
        if (page === 1) return result.items;
        const ids = new Set(prev.map((u) => u.id));
        return [...prev, ...result.items.filter((u) => !ids.has(u.id))];
      });
      return result;
    },
  });

  const users = accumulated.length > 0 ? accumulated : data?.items || [];
  const hasMore = data?.hasMore;

  if (isLoading && page === 1) return <LoadingSpinner />;
  if (isError) return <ErrorState message="Gagal memuat daftar." onRetry={() => refetch()} />;
  if (!isLoading && users.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="rounded-2xl border border-white/8 bg-[#121212] p-3 sm:p-4">
      <div className="divide-y divide-white/5">
        {users.map((user) => (
          <div key={user.id} className="py-3 first:pt-1 last:pb-1">
            <UserChip user={user} />
          </div>
        ))}
      </div>
      <LoadMoreButton
        hasMore={hasMore}
        isLoading={isFetching && page > 1}
        onClick={() => setPage((p) => p + 1)}
      />
    </div>
  );
}
