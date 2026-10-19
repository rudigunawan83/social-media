"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Compass, Search, PlusCircle, User as UserIcon } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store";
import { setCreatePostModalOpen } from "@/store/uiSlice";
import { cn } from "@/lib/utils";

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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0b0f19]/95 backdrop-blur-lg border-t border-slate-800 px-4 py-2.5 flex items-center justify-around">
      <Link
        href="/feed"
        className={cn(
          "p-2 rounded-xl transition-colors",
          pathname === "/feed" ? "text-purple-400" : "text-slate-400"
        )}
      >
        <Home className="w-6 h-6" />
      </Link>

      <Link
        href="/explore"
        className={cn(
          "p-2 rounded-xl transition-colors",
          pathname === "/explore" ? "text-purple-400" : "text-slate-400"
        )}
      >
        <Compass className="w-6 h-6" />
      </Link>

      <button
        onClick={handleCreatePost}
        className="p-1 rounded-full gradient-primary text-white shadow-lg shadow-purple-500/30 hover:scale-105 active:scale-95 transition-transform"
      >
        <PlusCircle className="w-8 h-8" />
      </button>

      <Link
        href="/users/search"
        className={cn(
          "p-2 rounded-xl transition-colors",
          pathname === "/users/search" ? "text-purple-400" : "text-slate-400"
        )}
      >
        <Search className="w-6 h-6" />
      </Link>

      <Link
        href={isAuthenticated ? "/me" : "/login"}
        className={cn(
          "p-2 rounded-xl transition-colors",
          pathname === "/me" || pathname === "/login"
            ? "text-purple-400"
            : "text-slate-400"
        )}
      >
        <UserIcon className="w-6 h-6" />
      </Link>
    </nav>
  );
}
