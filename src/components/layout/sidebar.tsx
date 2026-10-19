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
  Sparkles,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store";
import { setCreatePostModalOpen } from "@/store/uiSlice";
import { logout } from "@/store/authSlice";
import { Avatar } from "@/components/common/avatar";
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
    <aside className="hidden md:flex flex-col w-64 h-screen sticky top-0 border-r border-slate-800 bg-[#0b0f19]/90 backdrop-blur-md p-4 justify-between z-30">
      <div>
        {/* Brand Logo */}
        <Link href="/feed" className="flex items-center gap-3 px-3 py-4 mb-4 group">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center text-white shadow-lg shadow-purple-500/30 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-white via-slate-100 to-purple-300 bg-clip-text text-transparent">
              Sociality
            </h1>
            <p className="text-[10px] text-purple-400 font-medium tracking-wider uppercase">
              MVP Frontend
            </p>
          </div>
        </Link>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-1.5">
          {navItems.map((item) => {
            if (item.requiresAuth && !isAuthenticated) return null;
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/feed" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200",
                  isActive
                    ? "bg-purple-600/15 text-purple-300 border border-purple-500/20"
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50"
                )}
              >
                <Icon className={cn("w-5 h-5", isActive ? "text-purple-400" : "")} />
                <span>{item.label}</span>
              </Link>
            );
          })}

          {/* Create Post Button */}
          <button
            onClick={handleCreatePost}
            className="mt-4 w-full py-3 px-4 rounded-xl gradient-primary font-semibold text-sm text-white shadow-lg shadow-purple-600/25 hover:shadow-purple-600/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <PlusSquare className="w-5 h-5" />
            <span>Create Post</span>
          </button>
        </nav>
      </div>

      {/* User Session Footer */}
      <div className="pt-4 border-t border-slate-800/80">
        {isAuthenticated && user ? (
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800">
            <Link
              href="/me"
              className="flex items-center gap-2.5 min-w-0 flex-1 hover:opacity-80 transition-opacity"
            >
              <Avatar src={user.avatarUrl} name={user.name || user.username} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-200 truncate">
                  {user.name || user.username}
                </p>
                <p className="text-[10px] text-slate-500 truncate">@{user.username}</p>
              </div>
            </Link>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <Link
              href="/login"
              className="w-full py-2 px-3 text-center rounded-xl bg-slate-800 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors"
            >
              Log In
            </Link>
            <Link
              href="/register"
              className="w-full py-2 px-3 text-center rounded-xl gradient-primary text-xs font-semibold text-white shadow hover:opacity-90 transition-opacity"
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
}
