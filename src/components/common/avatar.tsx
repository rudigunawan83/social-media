"use client";

import React from "react";
import { cn } from "@/lib/utils";

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

function isUsableImageSrc(src?: string | null): src is string {
  if (!src || typeof src !== "string") return false;
  const value = src.trim();
  if (!value) return false;
  return (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("blob:") ||
    value.startsWith("data:") ||
    value.startsWith("/")
  );
}

export function Avatar({ src, alt = "Avatar", name = "", size = "md", className }: AvatarProps) {
  const [imageError, setImageError] = React.useState(false);

  React.useEffect(() => {
    setImageError(false);
  }, [src]);

  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U";

  const showFallback = !isUsableImageSrc(src) || imageError;

  return (
    <div
      className={cn(
        "relative flex flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-neutral-800 font-semibold text-neutral-100 ring-1 ring-white/10",
        sizeClasses[size],
        className
      )}
    >
      {!showFallback ? (
        // Native img: avatar URL dari BE/Cloudinary sering dinamis & tidak selalu cocok next/image optimizer
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          className="absolute inset-0 h-full w-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}
