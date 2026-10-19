"use client";

import React from "react";
import { Sidebar } from "./sidebar";
import { BottomNav } from "./bottom-nav";
import { CreatePostModal } from "@/features/posts/components/create-post-modal";
import { LikedByModal } from "@/features/likes/components/liked-by-modal";
import { EditProfileModal } from "@/features/users/components/edit-profile-modal";

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#0b0f19] text-slate-100">
      <Sidebar />
      <main className="flex-1 min-w-0 pb-20 md:pb-8 flex flex-col items-center">
        <div className="w-full max-w-2xl px-4 py-6 md:py-8">{children}</div>
      </main>
      <BottomNav />
      {/* Global Modals */}
      <CreatePostModal />
      <LikedByModal />
      <EditProfileModal />
    </div>
  );
}
