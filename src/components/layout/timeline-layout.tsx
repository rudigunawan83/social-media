"use client";

import React from "react";
import { TimelineHeader } from "./timeline-header";
import { BottomNav } from "./bottom-nav";
import { GuestAuthBanner } from "./guest-auth-banner";
import { CreatePostModal } from "@/features/posts/components/create-post-modal";
import { LikedByModal } from "@/features/likes/components/liked-by-modal";
import { EditProfileModal } from "@/features/users/components/edit-profile-modal";
import { useHasMounted } from "@/hooks/use-has-mounted";

/** Layout Timeline Figma mobile + desktop (tanpa navbar kiri) */
export function TimelineLayout({ children }: { children: React.ReactNode }) {
  const mounted = useHasMounted();

  return (
    <div className="min-h-screen bg-black text-neutral-100">
      <TimelineHeader />
      <main className="mx-auto w-full max-w-[470px] px-0 pb-28 pt-0 md:px-0 md:pb-10 md:pt-6">
        {children}
      </main>
      {/* Banner/nav yang beda guest vs auth: render setelah mount agar SSR = client */}
      {mounted && <GuestAuthBanner />}
      {mounted && <BottomNav />}
      <CreatePostModal />
      <LikedByModal />
      <EditProfileModal />
    </div>
  );
}
