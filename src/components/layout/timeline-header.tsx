"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, LogOut, Menu, X } from "lucide-react";
import { Avatar } from "@/components/common/avatar";
import { SocialityLogo } from "@/components/common/sociality-logo";
import { useAppDispatch, useAppSelector } from "@/store";
import { logout } from "@/store/authSlice";

export function TimelineHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((s) => s.auth);
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const returnTo = encodeURIComponent(pathname || "/feed");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) {
      router.push("/users/search");
      return;
    }
    router.push(`/users/search?q=${encodeURIComponent(q)}`);
  };

  const handleLogout = () => {
    dispatch(logout());
    setMenuOpen(false);
    router.push("/feed");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-black/95 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[470px] items-center gap-3 px-4 md:h-16 md:max-w-6xl md:gap-8">
        <Link href="/feed" className="shrink-0" onClick={() => setMenuOpen(false)}>
          <SocialityLogo
            markClassName="h-5 w-5 md:h-6 md:w-6"
            textClassName="text-base font-bold tracking-tight md:text-xl"
          />
        </Link>

        {/* Desktop search */}
        <form onSubmit={handleSearch} className="mx-auto hidden w-full max-w-md md:block">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search"
              className="w-full rounded-xl border border-transparent bg-[#1a1a1a] py-2.5 pl-10 pr-3 text-sm text-white placeholder-neutral-500 outline-none transition focus:border-violet-500/40 focus:bg-[#121212]"
            />
          </div>
        </form>

        <div className="ml-auto flex items-center gap-1.5 md:gap-3">
          {/* Mobile search icon */}
          <Link
            href="/users/search"
            className="rounded-lg p-2 text-white hover:bg-white/5 md:hidden"
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </Link>

          {isAuthenticated && user ? (
            <>
              {/* Mobile: avatar only (Figma after login) */}
              <Link href="/me" className="md:hidden" aria-label="Profile">
                <Avatar src={user.avatarUrl} name={user.name || user.username} size="sm" />
              </Link>

              {/* Desktop: name + logout */}
              <Link href="/me" className="hidden items-center gap-2.5 hover:opacity-90 md:flex">
                <Avatar src={user.avatarUrl} name={user.name || user.username} size="sm" />
                <span className="text-sm font-semibold text-white">
                  {user.name || user.username}
                </span>
              </Link>
              <button
                onClick={handleLogout}
                title="Logout"
                className="hidden rounded-lg p-2 text-neutral-400 transition hover:bg-red-500/10 hover:text-red-400 md:inline-flex"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <>
              {/* Mobile: hamburger — Figma before login */}
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                className="rounded-lg p-2 text-white hover:bg-white/5 md:hidden"
                aria-label={menuOpen ? "Close menu" : "Open menu"}
              >
                {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>

              {/* Desktop: Login + Register */}
              <Link
                href={`/login?returnTo=${returnTo}`}
                className="hidden rounded-xl border border-white/20 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/5 md:inline-flex"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="hidden rounded-xl bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-violet-500 md:inline-flex"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile guest menu panel — Figma Before Login / Open */}
      {!isAuthenticated && menuOpen && (
        <div className="border-t border-white/10 bg-black px-4 py-3 md:hidden">
          <div className="mx-auto flex max-w-[470px] items-center justify-end gap-3">
            <Link
              href={`/login?returnTo=${returnTo}`}
              onClick={() => setMenuOpen(false)}
              className="px-2 py-1.5 text-sm font-semibold text-white"
            >
              Login
            </Link>
            <Link
              href="/register"
              onClick={() => setMenuOpen(false)}
              className="rounded-full bg-violet-600 px-4 py-1.5 text-sm font-semibold text-white"
            >
              Register
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
