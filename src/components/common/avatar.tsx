import React from "react";
import Image from "next/image";
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

export function Avatar({ src, alt = "Avatar", name = "", size = "md", className }: AvatarProps) {
  const [imageError, setImageError] = React.useState(false);
  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U";

  const showFallback = !src || imageError;

  return (
    <div
      className={cn(
        "relative rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center font-semibold bg-gradient-to-tr from-purple-700 via-indigo-600 to-violet-500 text-white shadow-inner",
        sizeClasses[size],
        className
      )}
    >
      {!showFallback ? (
        <Image
          src={src!}
          alt={alt}
          fill
          sizes="(max-width: 768px) 50px, 80px"
          className="object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}
