import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRelativeTime(dateString?: string): string {
  if (!dateString) return "";
  // Format mendekati Figma Timeline: "1 minutes ago"
  return dayjs(dateString).fromNow();
}
