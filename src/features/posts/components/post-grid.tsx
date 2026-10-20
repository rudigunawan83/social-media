"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, MessageCircle } from "lucide-react";
import { Post } from "@/types/models";
import { cn } from "@/lib/utils";

export function PostGrid({ posts, tight = false }: { posts: Post[]; tight?: boolean }) {
  return (
    <div className={cn("grid grid-cols-3", tight ? "gap-[2px]" : "gap-1 sm:gap-2")}>
      {posts.map((post) => (
        <Link
          key={post.id}
          href={`/posts/${post.id}`}
          className={cn(
            "group relative aspect-square overflow-hidden bg-[#111]",
            tight ? "rounded-none" : "rounded-sm sm:rounded-lg"
          )}
        >
          {post.imageUrl ? (
            <Image
              src={post.imageUrl}
              alt={post.caption || "Post"}
              fill
              sizes="(max-width: 768px) 33vw, 220px"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[10px] text-neutral-500">
              No image
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center gap-4 bg-black/55 opacity-0 transition-opacity group-hover:opacity-100">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-white">
              <Heart className="h-4 w-4 fill-white" />
              {post.likesCount ?? 0}
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-white">
              <MessageCircle className="h-4 w-4 fill-white" />
              {post.commentsCount ?? 0}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
