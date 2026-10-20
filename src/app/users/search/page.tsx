"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { LoadingSpinner } from "@/components/common/state-views";

/** Redirect lama /users/search → /search (Figma) */
function RedirectSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const q = searchParams.get("q");
    const qs = q ? `?q=${encodeURIComponent(q)}&tab=people` : "?tab=people";
    router.replace(`/search${qs}`);
  }, [router, searchParams]);

  return <LoadingSpinner />;
}

export default function SearchUsersPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <RedirectSearch />
    </Suspense>
  );
}
