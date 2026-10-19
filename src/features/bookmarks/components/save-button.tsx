"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Bookmark } from "lucide-react";
import { useAppSelector } from "@/store";
import { bookmarksApi } from "../api/bookmarks";
import { queryKeys } from "@/lib/query-keys";
import { cn } from "@/lib/utils";

interface SaveButtonProps {
  postId: number;
  initialIsSaved?: boolean;
  className?: string;
}

export function SaveButton({
  postId,
  initialIsSaved = false,
  className,
}: SaveButtonProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAppSelector((s) => s.auth);

  const [isSaved, setIsSaved] = useState(initialIsSaved);

  const mutation = useMutation({
    mutationFn: async (saved: boolean) => {
      if (saved) {
        return await bookmarksApi.savePost(postId);
      } else {
        return await bookmarksApi.unsavePost(postId);
      }
    },
    onMutate: (newSaved) => {
      setIsSaved(newSaved);
    },
    onError: () => {
      setIsSaved(!isSaved);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.mySaved() });
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.detail(postId) });
    },
  });

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      router.push(`/login?returnTo=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    if (mutation.isPending) return;
    mutation.mutate(!isSaved);
  };

  return (
    <button
      onClick={handleToggle}
      disabled={mutation.isPending}
      title={isSaved ? "Remove from bookmarks" : "Save post"}
      className={cn(
        "p-1.5 rounded-full text-slate-400 hover:text-amber-400 hover:bg-amber-400/10 transition-all active:scale-75",
        className
      )}
    >
      <Bookmark
        className={cn(
          "w-5 h-5 transition-transform duration-200",
          isSaved ? "fill-amber-400 text-amber-400 scale-110" : "text-slate-300"
        )}
      />
    </button>
  );
}
