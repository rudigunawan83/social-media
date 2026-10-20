"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store";

/** Root selalu ke Timeline (Figma before/after login di /feed) */
export default function HomePage() {
  const router = useRouter();
  const { isLoading } = useAppSelector((s) => s.auth);

  useEffect(() => {
    if (!isLoading) {
      router.replace("/feed");
    }
  }, [isLoading, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
    </div>
  );
}
