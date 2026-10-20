"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function LoadMoreButton({
  hasMore,
  isLoading,
  onClick,
  className,
}: {
  hasMore?: boolean;
  isLoading?: boolean;
  onClick: () => void;
  className?: string;
}) {
  if (!hasMore) return null;

  return (
    <div className={cn("flex justify-center pt-4 pb-2", className)}>
      <button
        type="button"
        onClick={onClick}
        disabled={isLoading}
        className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-xs font-semibold text-neutral-200 transition hover:bg-white/10 disabled:opacity-50"
      >
        {isLoading ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Loading...
          </span>
        ) : (
          "Load more"
        )}
      </button>
    </div>
  );
}
