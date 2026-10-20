"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  Compass,
  Search,
  Bookmark,
  User as UserIcon,
  PlusSquare,
  LogOut,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store";
import { setCreatePostModalOpen } from "@/store/uiSlice";
import { logout } from "@/store/authSlice";
import { Avatar } from "@/components/common/avatar";
import { SocialityLogo } from "@/components/common/sociality-logo";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((s) => s.auth);

  const navItems = [
    { label: "Home", href: "/feed", icon: Home },
    { label: "Explore", href: "/explore", icon: Compass },
    { label: "Search", href: "/users/search", icon: Search },
    { label: "Bookmarks", href: "/me?tab=saved", icon: Bookmark, requiresAuth: true },
    { label: "Profile", href: "/me", icon: UserIcon, requiresAuth: true },
  ];

  const handleLogout = () => {
    dispatch(logout());
    router.push("/login");
  };

  const handleCreatePost = () => {
    if (!isAuthenticated) {
      router.push(`/login?returnTo=${encodeURIComponent(pathname)}`);
      return;
    }
    dispatch(setCreatePostModalOpen(true));
  };

  return (
    <aside className="sticky top-0 z-30 hidden h-screen w-64 flex-col justify-between border-r border-white/8 bg-black p-4 md:flex">
      <div>
        <Link href="/feed" className="mb-6 flex items-center px-3 py-3">
          <SocialityLogo
            markClassName="h-7 w-7"
            textClassName="text-xl font-semibold tracking-tight"
          />
        </Link>

        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            if (item.requiresAuth && !isAuthenticated) return null;
            const Icon = item.icon;
            const base = item.href.split("?")[0];
            const isActive =
              pathname === base ||
              (base !== "/feed" && pathname.startsWith(base) && base !== "/me") ||
              (base === "/me" && pathname.startsWith("/me"));

            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "flex items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-semibold transition-colors",
                  isActive
                    ? "bg-white/10 text-white"
                    : "text-neutral-400 hover:bg-white/5 hover:text-white"
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}

          <button
            onClick={handleCreatePost}
            className="mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black transition hover:bg-neutral-200 active:scale-[0.98]"
          >
            <PlusSquare className="h-5 w-5" />
            <span>Create Post</span>
          </button>
        </nav>
      </div>

      <div className="border-t border-white/8 pt-4">
        {isAuthenticated && user ? (
          <div className="flex items-center justify-between rounded-xl border border-white/8 bg-[#121212] p-2">
            <Link href="/me" className="flex min-w-0 flex-1 items-center gap-2.5 hover:opacity-80">
              <Avatar src={user.avatarUrl} name={user.name || user.username} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-neutral-100">
                  {user.name || user.username}
                </p>
                <p className="truncate text-[10px] text-neutral-500">@{user.username}</p>
              </div>
            </Link>
            <button
              onClick={handleLogout}
              title="Logout"
              className="rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-red-500/10 hover:text-red-400"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <Link
              href="/login"
              className="w-full rounded-xl bg-white/10 py-2 text-center text-xs font-semibold text-white hover:bg-white/15"
            >
              Log In
            </Link>
            <Link
              href="/register"
              className="w-full rounded-xl bg-white py-2 text-center text-xs font-semibold text-black hover:bg-neutral-200"
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
}
