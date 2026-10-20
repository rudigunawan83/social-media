"use client";

import React from "react";
import { TimelineHeader } from "./timeline-header";
import { BottomNav } from "./bottom-nav";
import { GuestAuthBanner } from "./guest-auth-banner";
import { CreatePostModal } from "@/features/posts/components/create-post-modal";
import { LikedByModal } from "@/features/likes/components/liked-by-modal";
import { EditProfileModal } from "@/features/users/components/edit-profile-modal";
import { useAppSelector } from "@/store";

/** Layout Timeline Figma mobile + desktop (tanpa navbar kiri) */
export function TimelineLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAppSelector((s) => s.auth);

  return (
    <div className="min-h-screen bg-black text-neutral-100">
      <TimelineHeader />
      <main
        className={`mx-auto w-full max-w-[470px] px-0 pt-0 md:px-0 md:pt-6 ${
          isAuthenticated ? "pb-28 md:pb-10" : "pb-28 md:pb-28"
        }`}
      >
        {children}
      </main>
      <GuestAuthBanner />
      <BottomNav />
      <CreatePostModal />
      <LikedByModal />
      <EditProfileModal />
    </div>
  );
}
