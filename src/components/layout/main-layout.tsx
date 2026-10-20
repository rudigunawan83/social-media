"use client";

import React from "react";
import { Sidebar } from "./sidebar";
import { BottomNav } from "./bottom-nav";
import { CreatePostModal } from "@/features/posts/components/create-post-modal";
import { LikedByModal } from "@/features/likes/components/liked-by-modal";
import { EditProfileModal } from "@/features/users/components/edit-profile-modal";

export function MainLayout({
  children,
  wide = false,
}: {
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="flex min-h-screen bg-black text-neutral-100">
      <Sidebar />
      <main className="flex min-w-0 flex-1 flex-col items-center pb-20 md:pb-8">
        <div className={`w-full px-3 py-5 md:px-4 md:py-8 ${wide ? "max-w-5xl" : "max-w-xl"}`}>
          {children}
        </div>
      </main>
      <BottomNav />
      <CreatePostModal />
      <LikedByModal />
      <EditProfileModal />
    </div>
  );
}
