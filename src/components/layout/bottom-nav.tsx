"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Plus, User as UserIcon } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store";
import { setCreatePostModalOpen } from "@/store/uiSlice";
import { cn } from "@/lib/utils";

/** Bottom nav mobile Figma: Home (label) | + ungu | Profile (label) */
export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((s) => s.auth);

  const isHome = pathname === "/feed" || pathname === "/";
  const isProfile = pathname.startsWith("/me");

  const handleCreatePost = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      router.push(`/login?returnTo=${encodeURIComponent(pathname)}`);
      return;
    }
    dispatch(setCreatePostModalOpen(true));
  };

  return (
    <nav className="pointer-events-none fixed bottom-5 left-0 right-0 z-40 flex justify-center md:hidden">
      <div className="pointer-events-auto flex items-end gap-8 rounded-full border border-white/10 bg-black/95 px-7 py-2.5 shadow-2xl shadow-black/50 backdrop-blur-lg">
        <Link
          href="/feed"
          className={cn(
            "flex min-w-[52px] flex-col items-center gap-0.5 transition",
            isHome ? "text-violet-500" : "text-white"
          )}
          aria-label="Home"
        >
          <Home className={cn("h-5 w-5", isHome && "fill-violet-500")} strokeWidth={2} />
          <span className="text-[10px] font-medium leading-none">Home</span>
        </Link>

        <button
          onClick={handleCreatePost}
          className="-mt-1 mb-0.5 flex h-11 w-11 items-center justify-center rounded-full bg-violet-600 text-white shadow-lg shadow-violet-600/40 transition hover:bg-violet-500 active:scale-95"
          aria-label="Create post"
        >
          <Plus className="h-6 w-6" strokeWidth={2.5} />
        </button>

        <Link
          href={isAuthenticated ? "/me" : `/login?returnTo=${encodeURIComponent(pathname)}`}
          className={cn(
            "flex min-w-[52px] flex-col items-center gap-0.5 transition",
            isProfile ? "text-violet-500" : "text-white"
          )}
          aria-label="Profile"
        >
          <UserIcon
            className={cn("h-5 w-5", isProfile && "fill-violet-500")}
            strokeWidth={2}
          />
          <span className="text-[10px] font-medium leading-none">Profile</span>
        </Link>
      </div>
    </nav>
  );
}
