"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { TimelineLayout } from "@/components/layout/timeline-layout";
import { FollowList } from "@/features/follow/components/follow-list";
import { followApi } from "@/features/follow/api/follow";
import { queryKeys } from "@/lib/query-keys";
import { useAppSelector } from "@/store";

export default function MyFollowersPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAppSelector((s) => s.auth);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login?returnTo=/me/followers");
    }
  }, [isAuthenticated, isLoading, router]);

  if (!isAuthenticated && !isLoading) return null;

  return (
    <TimelineLayout>
      <div className="mb-5 flex items-center gap-3 px-4 md:px-0">
        <Link
          href="/me"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <h1 className="text-lg font-semibold text-white">Followers</h1>
      </div>
      <FollowList
        queryKey={queryKeys.users.myFollowers()}
        fetcher={(page, limit) => followApi.getMyFollowers(page, limit)}
        emptyTitle="Belum ada followers"
        emptyDescription="Saat orang mengikuti Anda, mereka akan muncul di sini."
      />
    </TimelineLayout>
  );
}
