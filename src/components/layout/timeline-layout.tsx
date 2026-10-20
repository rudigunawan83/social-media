"use client";

import React from "react";
import { TimelineHeader } from "./timeline-header";
import { BottomNav } from "./bottom-nav";
import { CreatePostModal } from "@/features/posts/components/create-post-modal";
import { LikedByModal } from "@/features/likes/components/liked-by-modal";
import { EditProfileModal } from "@/features/users/components/edit-profile-modal";
import { useHasMounted } from "@/hooks/use-has-mounted";
import { cn } from "@/lib/utils";

/** Layout Timeline Figma mobile + desktop (tanpa navbar kiri / tanpa footer ungu guest) */
export function TimelineLayout({
  children,
  wide = false,
}: {
  children: React.ReactNode;
  wide?: boolean;
}) {
  const mounted = useHasMounted();

  return (
    <div className="min-h-screen bg-black text-neutral-100">
      <TimelineHeader />
      <main
        className={cn(
          "mx-auto w-full pb-28 pt-0 md:pb-28 md:pt-6",
          wide ? "max-w-5xl px-3 md:px-4" : "max-w-[470px] px-0 md:px-0"
        )}
      >
        {children}
      </main>
      {mounted && <BottomNav />}
      <CreatePostModal />
      <LikedByModal />
      <EditProfileModal />
    </div>
  );
}
