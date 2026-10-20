"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { resolveMediaUrl } from "@/lib/normalize";

interface AvatarProps {
  src?: string | null;
  alt?: string;
  name?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-14 h-14 text-base",
  xl: "w-20 h-20 text-xl",
};

export function Avatar({ src, alt = "Avatar", name = "", size = "md", className }: AvatarProps) {
  const [imageError, setImageError] = React.useState(false);
  const resolvedSrc = React.useMemo(() => resolveMediaUrl(src), [src]);

  React.useEffect(() => {
    setImageError(false);
  }, [resolvedSrc]);

  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .filter(Boolean)
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U";

  const showFallback = !resolvedSrc || imageError;

  return (
    <div
      className={cn(
        "relative flex flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-neutral-800 font-semibold text-neutral-100 ring-1 ring-white/10",
        sizeClasses[size],
        className
      )}
    >
      {!showFallback ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={resolvedSrc}
          src={resolvedSrc}
          alt={alt || name || "Avatar"}
          className="absolute inset-0 h-full w-full object-cover"
          referrerPolicy="no-referrer"
          onError={() => setImageError(true)}
        />
      ) : (
        <span aria-hidden>{initials}</span>
      )}
    </div>
  );
}
