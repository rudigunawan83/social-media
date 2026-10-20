"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Plus, User as UserIcon } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store";
import { setCreatePostModalOpen } from "@/store/uiSlice";
import { cn } from "@/lib/utils";

/**
 * Floating bottom nav — Figma Timeline After Login (41420-11177)
 * Home | + (create) | Profile — tampil mobile + desktop
 */
export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((s) => s.auth);

  const isHome = pathname === "/feed" || pathname === "/";
  const isProfile = pathname.startsWith("/me");

  const goHome = (e: React.MouseEvent) => {
    // Semua post (explore) — refresh jika sudah di /feed
    if (isHome) {
      e.preventDefault();
      window.dispatchEvent(new Event("sociality:go-home"));
      return;
    }
  };

  const handleCreatePost = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      router.push(`/login?returnTo=${encodeURIComponent(pathname)}`);
      return;
    }
    dispatch(setCreatePostModalOpen(true));
  };

  return (
    <nav className="pointer-events-none fixed bottom-5 left-0 right-0 z-40 flex justify-center">
      <div className="pointer-events-auto flex items-end gap-7 rounded-full border border-white/10 bg-black/95 px-6 py-2.5 shadow-2xl shadow-black/50 backdrop-blur-lg sm:gap-8 sm:px-7">
        <Link
          href="/feed"
          onClick={goHome}
          className={cn(
            "flex min-w-[48px] flex-col items-center gap-1 transition sm:min-w-[52px]",
            isHome ? "text-white" : "text-white/80 hover:text-white"
          )}
          aria-label="Home"
          aria-current={isHome ? "page" : undefined}
        >
          <span
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-xl transition",
              isHome ? "bg-violet-600 text-white" : "bg-transparent text-white"
            )}
          >
            <Home className={cn("h-5 w-5", isHome && "fill-white")} strokeWidth={2} />
          </span>
          <span className="text-[10px] font-medium leading-none">Home</span>
        </Link>

        <button
          type="button"
          onClick={handleCreatePost}
          className="-mt-2 mb-0.5 flex h-12 w-12 items-center justify-center rounded-full bg-violet-600 text-white shadow-lg shadow-violet-600/40 transition hover:bg-violet-500 active:scale-95"
          aria-label="Create post"
        >
          <Plus className="h-6 w-6" strokeWidth={2.5} />
        </button>

        <Link
          href={isAuthenticated ? "/me" : `/login?returnTo=${encodeURIComponent(pathname)}`}
          className={cn(
            "flex min-w-[48px] flex-col items-center gap-1 transition sm:min-w-[52px]",
            isProfile ? "text-white" : "text-white/80 hover:text-white"
          )}
          aria-label="Profile"
          aria-current={isProfile ? "page" : undefined}
        >
          <span
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-xl transition",
              isProfile ? "bg-violet-600 text-white" : "bg-transparent text-white"
            )}
          >
            <UserIcon
              className={cn("h-5 w-5", isProfile && "fill-white")}
              strokeWidth={2}
            />
          </span>
          <span className="text-[10px] font-medium leading-none">Profile</span>
        </Link>
      </div>
    </nav>
  );
}
