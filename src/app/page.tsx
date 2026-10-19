"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store";

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAppSelector((s) => s.auth);

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.replace("/feed");
      } else {
        router.replace("/explore");
      }
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
    </div>
  );
}
