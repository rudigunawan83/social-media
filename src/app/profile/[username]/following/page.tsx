"use client";

import React, { use } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { MainLayout } from "@/components/layout/main-layout";
import { FollowList } from "@/features/follow/components/follow-list";
import { followApi } from "@/features/follow/api/follow";
import { queryKeys } from "@/lib/query-keys";

export default function UserFollowingPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username: raw } = use(params);
  const username = decodeURIComponent(raw);

  return (
    <MainLayout>
      <div className="mb-5 flex items-center gap-3">
        <Link
          href={`/profile/${username}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <h1 className="text-lg font-semibold text-white">@{username} · Following</h1>
      </div>
      <FollowList
        queryKey={queryKeys.users.following(username)}
        fetcher={(page, limit) => followApi.getUserFollowing(username, page, limit)}
        emptyTitle="Belum mengikuti siapapun"
        emptyDescription={`@${username} belum mengikuti siapapun.`}
      />
    </MainLayout>
  );
}
