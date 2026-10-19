"use client";

import React, { useState, useEffect } from "react";
import { Search as SearchIcon, X, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/main-layout";
import { UserChip } from "@/features/users/components/user-chip";
import { LoadingSpinner, EmptyState } from "@/components/common/state-views";
import { usersApi } from "@/features/users/api/users";
import { queryKeys } from "@/lib/query-keys";

export default function SearchUsersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Debounce search query by 300ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchTerm.trim());
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const {
    data: users,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: queryKeys.users.search(debouncedQuery),
    queryFn: () => usersApi.searchUsers(debouncedQuery),
    enabled: debouncedQuery.length > 0,
  });

  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white flex items-center gap-2 mb-1">
          <Users className="w-5 h-5 text-purple-400" />
          Find People
        </h1>
        <p className="text-xs text-slate-400">
          Search for creators and friends by name or username
        </p>
      </div>

      {/* Search Input Bar */}
      <div className="relative mb-6">
        <SearchIcon className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search creators, friends, usernames..."
          className="w-full pl-11 pr-10 py-3 rounded-2xl bg-slate-900/90 border border-slate-700/80 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 shadow-inner transition-colors"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Results View */}
      {debouncedQuery.length === 0 ? (
        <EmptyState
          title="Search for users"
          description="Type a name or username above to discover new people to follow."
        />
      ) : isFetching ? (
        <LoadingSpinner />
      ) : !users || users.length === 0 ? (
        <EmptyState
          title="No users found"
          description={`We couldn't find any users matching "${debouncedQuery}".`}
        />
      ) : (
        <div className="glass-panel rounded-2xl p-4 divide-y divide-slate-800/80 shadow-lg border border-slate-800">
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
