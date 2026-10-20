"use client";

import React, { useState, useEffect, Suspense } from "react";
import { Search as SearchIcon, X, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { MainLayout } from "@/components/layout/main-layout";
import { UserChip } from "@/features/users/components/user-chip";
import { LoadingSpinner, EmptyState } from "@/components/common/state-views";
import { usersApi } from "@/features/users/api/users";
import { queryKeys } from "@/lib/query-keys";

function SearchUsersContent() {
  const searchParams = useSearchParams();
  const initialQ = searchParams.get("q") || "";
  const [searchTerm, setSearchTerm] = useState(initialQ);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQ.trim());

  useEffect(() => {
    const q = searchParams.get("q") || "";
    setSearchTerm(q);
    setDebouncedQuery(q.trim());
  }, [searchParams]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchTerm.trim());
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const { data, isFetching } = useQuery({
    queryKey: queryKeys.users.search(debouncedQuery),
    queryFn: () => usersApi.searchUsers(debouncedQuery),
    enabled: debouncedQuery.length > 0,
  });

  const users = data?.items || [];

  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="mb-1 flex items-center gap-2 text-xl font-semibold text-white">
          <Users className="h-5 w-5 text-neutral-400" />
          Search
        </h1>
        <p className="text-xs text-neutral-500">Cari user berdasarkan nama atau username</p>
      </div>

      <div className="relative mb-6">
        <SearchIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-500" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search username or name..."
          className="w-full rounded-2xl border border-white/10 bg-[#121212] py-3 pl-11 pr-10 text-sm text-neutral-100 placeholder-neutral-500 focus:border-white/25 focus:outline-none"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {debouncedQuery.length === 0 ? (
        <EmptyState
          title="Cari orang"
          description="Ketik nama atau username untuk menemukan orang baru."
        />
      ) : isFetching ? (
        <LoadingSpinner />
      ) : users.length === 0 ? (
        <EmptyState
          title="Tidak ditemukan"
          description={`Tidak ada user yang cocok dengan "${debouncedQuery}".`}
        />
      ) : (
        <div className="divide-y divide-white/5 rounded-2xl border border-white/8 bg-[#121212] p-4">
          {users.map((user) => (
            <div key={user.id} className="py-3 first:pt-1 last:pb-1">
              <UserChip user={user} />
            </div>
          ))}
        </div>
      )}
    </MainLayout>
  );
}

export default function SearchUsersPage() {
  return (
    <Suspense fallback={<MainLayout><LoadingSpinner /></MainLayout>}>
      <SearchUsersContent />
    </Suspense>
  );
}
