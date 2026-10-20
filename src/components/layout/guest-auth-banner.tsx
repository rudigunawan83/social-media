"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppSelector } from "@/store";

/** Banner sticky desktop only — mobile pakai hamburger menu (Figma) */
export function GuestAuthBanner() {
  const pathname = usePathname();
  const { isAuthenticated } = useAppSelector((s) => s.auth);

  if (isAuthenticated) return null;

  const returnTo = encodeURIComponent(pathname || "/feed");

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 hidden border-t border-violet-500/30 bg-gradient-to-r from-violet-950/95 via-violet-900/95 to-indigo-950/95 px-4 py-3 backdrop-blur-md md:block">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 sm:flex-row">
        <div className="text-center sm:text-left">
          <p className="text-sm font-semibold text-white">Join Sociality today</p>
          <p className="text-xs text-violet-200/80">
            Log in to like, comment, follow, and share posts.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/login?returnTo=${returnTo}`}
            className="rounded-xl border border-white/25 bg-transparent px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/10"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="rounded-xl bg-violet-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-violet-600/30 transition hover:bg-violet-500"
          >
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}
