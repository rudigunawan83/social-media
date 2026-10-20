"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Plus, User as UserIcon } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store";
import { setCreatePostModalOpen } from "@/store/uiSlice";
import { cn } from "@/lib/utils";

/** Bottom nav mobile Figma: floating pill — Home | + | Profile */
export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((s) => s.auth);

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
      <div className="pointer-events-auto flex items-center gap-6 rounded-full border border-white/10 bg-[#121212]/95 px-6 py-2.5 shadow-2xl shadow-black/50 backdrop-blur-lg">
        <Link
          href="/feed"
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full transition",
            pathname === "/feed" ? "bg-white/10 text-white" : "text-neutral-400"
          )}
          aria-label="Home"
        >
          <Home className="h-5 w-5" />
        </Link>

        <button
          onClick={handleCreatePost}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-violet-600 text-white shadow-lg shadow-violet-600/40 transition hover:bg-violet-500 active:scale-95"
          aria-label="Create post"
        >
          <Plus className="h-6 w-6" strokeWidth={2.5} />
        </button>

        <Link
          href={isAuthenticated ? "/me" : `/login?returnTo=${encodeURIComponent(pathname)}`}
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full transition",
            pathname.startsWith("/me") ? "bg-white/10 text-white" : "text-neutral-400"
          )}
          aria-label="Profile"
        >
          <UserIcon className="h-5 w-5" />
        </Link>
      </div>
    </nav>
  );
}
