import React from "react";
import { AlertCircle, FolderX, Loader2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 p-8 text-neutral-300",
        className
      )}
    >
      <Loader2 className="h-8 w-8 animate-spin" />
      <span className="text-sm font-medium text-neutral-500">Loading...</span>
    </div>
  );
}

export function EmptyState({
  title = "No data found",
  description = "Nothing to display right now.",
  action,
  className,
}: {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-2xl border border-white/8 bg-[#121212] p-8 text-center",
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5 text-neutral-400">
        <FolderX className="h-6 w-6" />
      </div>
      <h3 className="text-base font-semibold text-neutral-100">{title}</h3>
      <p className="max-w-sm text-sm text-neutral-500">{description}</p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export function ErrorState({
  message = "Failed to load content.",
  onRetry,
  className,
}: {
  message?: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-2xl border border-red-500/20 bg-[#121212] p-6 text-center",
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-400">
        <AlertCircle className="h-6 w-6" />
      </div>
      <p className="text-sm text-red-300">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 rounded-lg bg-red-500/20 px-4 py-2 text-xs font-semibold text-red-300 transition-colors hover:bg-red-500/30"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Retry
        </button>
      )}
    </div>
  );
}
