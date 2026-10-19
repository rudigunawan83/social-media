import React from "react";
import { AlertCircle, FolderX, Loader2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8 gap-3 text-purple-400", className)}>
      <Loader2 className="w-8 h-8 animate-spin" />
      <span className="text-sm font-medium text-slate-400">Loading...</span>
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
    <div className={cn("glass-panel rounded-2xl p-8 flex flex-col items-center text-center justify-center gap-3", className)}>
      <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400">
        <FolderX className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-slate-200">{title}</h3>
      <p className="text-sm text-slate-400 max-w-sm">{description}</p>
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
    <div className={cn("glass-panel border-red-500/20 rounded-2xl p-6 flex flex-col items-center text-center justify-center gap-3", className)}>
      <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-400">
        <AlertCircle className="w-6 h-6" />
      </div>
      <p className="text-sm text-red-300">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Retry
        </button>
      )}
    </div>
  );
}
