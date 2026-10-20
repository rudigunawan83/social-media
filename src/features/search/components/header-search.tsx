"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Avatar } from "@/components/common/avatar";
import { usersApi } from "@/features/users/api/users";
import { postsApi } from "@/features/posts/api/posts";
import { queryKeys } from "@/lib/query-keys";
import { cn } from "@/lib/utils";

type HeaderSearchProps = {
  className?: string;
  /** Tampil penuh di mobile search page */
  autoFocus?: boolean;
  variant?: "header" | "page";
};

export function HeaderSearch({
  className,
  autoFocus = false,
  variant = "header",
}: HeaderSearchProps) {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 280);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const enabled = debounced.length > 0 && (open || variant === "page");

  const { data: usersData, isFetching: usersLoading } = useQuery({
    queryKey: queryKeys.users.search(debounced),
    queryFn: () => usersApi.searchUsers(debounced, 1, 8),
    enabled,
  });

  const { data: postsData, isFetching: postsLoading } = useQuery({
    queryKey: queryKeys.posts.search(debounced),
    queryFn: () => postsApi.searchPosts(debounced, 1, 24),
    enabled,
  });

  const users = usersData?.items || [];
  const posts = postsData?.items || [];
  const isFetching = usersLoading || postsLoading;
  const hasAny = users.length > 0 || posts.length > 0;
  const showDropdown = variant === "header" && open && query.trim().length > 0;

  const goSearchPage = () => {
    const q = query.trim();
    setOpen(false);
    if (!q) {
      router.push("/search");
      return;
    }
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <div ref={rootRef} className={cn("relative w-full", className)}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          goSearchPage();
        }}
        className="relative"
      >
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          autoFocus={autoFocus}
          placeholder="Search"
          className={cn(
            "w-full rounded-full border border-transparent bg-[#1a1a1a] py-2.5 pl-10 pr-9 text-sm text-white placeholder-neutral-500 outline-none transition focus:border-white/15 focus:bg-[#222]",
            variant === "page" && "rounded-2xl border-white/10 bg-[#121212] py-3"
          )}
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setDebounced("");
            }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-neutral-400 hover:text-white"
            aria-label="Clear"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </form>

      {/* Dropdown live — Figma 41423-12296 */}
      {showDropdown && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 max-h-[min(420px,70vh)] overflow-y-auto rounded-xl border border-white/10 bg-[#121212] shadow-2xl shadow-black/60">
          {isFetching && !hasAny ? (
            <p className="px-4 py-6 text-center text-xs text-neutral-500">Searching...</p>
          ) : !hasAny ? (
            <p className="px-4 py-8 text-center text-sm text-neutral-400">No search found</p>
          ) : (
            <div className="py-2">
              {users.length > 0 && (
                <div className="px-1">
                  <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-neutral-500">
                    People
                  </p>
                  {users.map((user) => (
                    <Link
                      key={user.id}
                      href={`/profile/${user.username}`}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 transition hover:bg-white/5"
                    >
                      <Avatar
                        src={user.avatarUrl}
                        name={user.name || user.username}
                        size="sm"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-white">
                          {user.name || user.username}
                        </p>
                        <p className="truncate text-xs text-neutral-500">@{user.username}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {posts.length > 0 && (
                <div className="mt-1 border-t border-white/8 px-1 pt-1">
                  <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-neutral-500">
                    Posts
                  </p>
                  {posts.slice(0, 6).map((post) => (
                    <Link
                      key={post.id}
                      href={`/posts/${post.id}`}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 transition hover:bg-white/5"
                    >
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-neutral-900">
                        {post.imageUrl ? (
                          <Image
                            src={post.imageUrl}
                            alt=""
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        ) : null}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm text-neutral-200">
                          {post.caption || "Untitled post"}
                        </p>
                        <p className="truncate text-xs text-neutral-500">
                          @{post.author?.username}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={goSearchPage}
                className="mt-1 w-full border-t border-white/8 px-4 py-2.5 text-left text-xs font-semibold text-violet-400 hover:bg-white/5"
              >
                See all results for “{debounced || query.trim()}”
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
