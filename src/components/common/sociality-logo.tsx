import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

const LOGO_SRC = "/logo.png";

export function SocialityLogoMark({
  className,
  title = "Sociality",
}: {
  className?: string;
  title?: string;
}) {
  return (
    <Image
      src={LOGO_SRC}
      alt={title}
      width={28}
      height={28}
      className={cn("h-7 w-7 shrink-0 object-contain", className)}
      priority
    />
  );
}

export function SocialityLogo({
  className,
  markClassName,
  textClassName,
  showWordmark = true,
}: {
  className?: string;
  markClassName?: string;
  textClassName?: string;
  showWordmark?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <SocialityLogoMark className={markClassName} />
      {showWordmark && (
        <span className={cn("text-lg font-semibold tracking-wide text-white", textClassName)}>
          Sociality
        </span>
      )}
    </span>
  );
}
