"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Grid3X3, Search as SearchIcon, Users, X } from "lucide-react";
import { TimelineLayout } from "@/components/layout/timeline-layout";
import { Avatar } from "@/components/common/avatar";
import { FollowButton } from "@/features/follow/components/follow-button";
import { PostGrid } from "@/features/posts/components/post-grid";
import { LoadingSpinner, EmptyState } from "@/components/common/state-views";
import { usersApi } from "@/features/users/api/users";
import { postsApi } from "@/features/posts/api/posts";
import { queryKeys } from "@/lib/query-keys";
import { cn } from "@/lib/utils";
import { useAppSelector } from "@/store";

function SearchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQ = searchParams.get("q") || "";
  const { isAuthenticated } = useAppSelector((s) => s.auth);

  const [query, setQuery] = useState(initialQ);
  const [debounced, setDebounced] = useState(initialQ.trim());
  const [tab, setTab] = useState<"posts" | "people">(
    searchParams.get("tab") === "people" ? "people" : "posts"
  );

  useEffect(() => {
    const q = searchParams.get("q") || "";
    setQuery(q);
    setDebounced(q.trim());
    setTab(searchParams.get("tab") === "people" ? "people" : "posts");
  }, [searchParams]);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    const currentQ = searchParams.get("q") || "";
    const currentTab = searchParams.get("tab") === "people" ? "people" : "posts";
    if (currentQ === debounced && currentTab === tab) return;

    const params = new URLSearchParams();
    if (debounced) params.set("q", debounced);
    if (tab === "people") params.set("tab", "people");
    const qs = params.toString();
    router.replace(qs ? `/search?${qs}` : "/search");
  }, [debounced, tab, searchParams, router]);

  const enabled = debounced.length > 0;

  const { data: postsData, isFetching: postsLoading } = useQuery({
    queryKey: queryKeys.posts.search(debounced),
    queryFn: () => postsApi.searchPosts(debounced, 1, 48),
    enabled: enabled && tab === "posts",
  });

  const { data: usersData, isFetching: usersLoading } = useQuery({
    queryKey: queryKeys.users.search(debounced),
    queryFn: () => usersApi.searchUsers(debounced, 1, 30),
    enabled: enabled && tab === "people",
  });

  const posts = postsData?.items || [];
  const users = usersData?.items || [];

  return (
    <div className="px-4 pb-4 md:px-0">
      {/* Input — Figma Search */}
      <div className="relative mb-5">
        <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search"
          autoFocus
          className="w-full rounded-2xl border border-white/10 bg-[#121212] py-3 pl-10 pr-10 text-sm text-white placeholder-neutral-500 outline-none focus:border-violet-500/40"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-white"
            aria-label="Clear"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="mb-5 flex items-center justify-center border-b border-white/10">
        {[
          { id: "posts" as const, label: "Posts", icon: Grid3X3 },
          { id: "people" as const, label: "People", icon: Users },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={cn(
                "flex items-center gap-2 border-b-2 px-6 py-3 text-sm font-semibold transition",
                tab === item.id
                  ? "border-white text-white"
                  : "border-transparent text-neutral-500 hover:text-neutral-200"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </button>
          );
        })}
      </div>

      {!enabled ? (
        <EmptyState
          title="Search"
          description="Cari postingan atau orang berdasarkan kata kunci."
        />
      ) : tab === "posts" ? (
        postsLoading ? (
          <LoadingSpinner />
        ) : posts.length === 0 ? (
          <EmptyState title="No posts found" description={`Tidak ada post untuk "${debounced}".`} />
        ) : (
          <div className="-mx-4 md:mx-0">
            <PostGrid posts={posts} tight />
          </div>
        )
      ) : usersLoading ? (
        <LoadingSpinner />
      ) : users.length === 0 ? (
        <EmptyState
          title="No search found"
          description={`Tidak ada user untuk "${debounced}".`}
        />
      ) : (
        <div className="divide-y divide-white/5 overflow-hidden rounded-2xl border border-white/8 bg-[#121212]">
          {users.map((user) => (
            <div key={user.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <Link
                href={`/profile/${user.username}`}
                className="flex min-w-0 flex-1 items-center gap-3 hover:opacity-90"
              >
                <Avatar src={user.avatarUrl} name={user.name || user.username} size="md" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">
                    {user.name || user.username}
                  </p>
                  <p className="truncate text-xs text-neutral-500">@{user.username}</p>
                </div>
              </Link>
              {isAuthenticated && (
                <FollowButton
                  username={user.username}
                  initialIsFollowing={user.isFollowedByMe}
                  size="sm"
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <TimelineLayout>
      <Suspense fallback={<LoadingSpinner />}>
        <SearchPageContent />
      </Suspense>
    </TimelineLayout>
  );
}
