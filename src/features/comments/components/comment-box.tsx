"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Send, Trash2, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { commentsApi } from "../api/comments";
import { queryKeys } from "@/lib/query-keys";
import { Avatar } from "@/components/common/avatar";
import { RelativeTime } from "@/components/common/relative-time";
import { useAppSelector } from "@/store";
import { LoadingSpinner, EmptyState } from "@/components/common/state-views";
import { LoadMoreButton } from "@/components/common/load-more-button";
import { Comment } from "@/types/models";

interface CommentBoxProps {
  postId: number;
  postAuthorId?: number;
}

export function CommentBox({ postId, postAuthorId }: CommentBoxProps) {
  const queryClient = useQueryClient();
  const { user: currentUser, isAuthenticated } = useAppSelector((s) => s.auth);
  const [newComment, setNewComment] = useState("");
  const [page, setPage] = useState(1);
  const [comments, setComments] = useState<Comment[]>([]);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: queryKeys.posts.comments(postId, page),
    queryFn: async () => {
      const result = await commentsApi.getComments(postId, page, 20);
      setComments((prev) => {
        if (page === 1) return result.items;
        const ids = new Set(prev.map((c) => c.id));
        return [...prev, ...result.items.filter((c) => !ids.has(c.id))];
      });
      return result;
    },
  });

  const list = comments.length > 0 ? comments : data?.items || [];

  const addMutation = useMutation({
    mutationFn: (text: string) => commentsApi.createComment(postId, text),
    onSuccess: (created) => {
      setNewComment("");
      setComments((prev) => [created, ...prev]);
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.comments(postId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.detail(postId) });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (commentId: number) => commentsApi.deleteComment(commentId),
    onSuccess: (_data, commentId) => {
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.comments(postId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.detail(postId) });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || addMutation.isPending) return;
    addMutation.mutate(newComment.trim());
  };

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-sm font-semibold text-neutral-200">
        Comments ({data?.total ?? list.length})
      </h3>

      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="flex items-center gap-2.5">
          <Avatar
            src={currentUser?.avatarUrl}
            name={currentUser?.name || currentUser?.username}
            size="sm"
          />
          <div className="relative flex-1">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="w-full rounded-xl border border-white/10 bg-black px-3.5 py-2 pr-10 text-sm text-neutral-100 placeholder-neutral-500 focus:border-white/30 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!newComment.trim() || addMutation.isPending}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-neutral-300 hover:text-white disabled:opacity-40"
            >
              {addMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </div>
        </form>
      ) : (
        <div className="rounded-xl border border-white/8 bg-black/40 p-3 text-center text-xs text-neutral-400">
          <Link href="/login" className="font-semibold text-white hover:underline">
            Log in
          </Link>{" "}
          to leave a comment.
        </div>
      )}

      <div className="flex flex-col gap-3 pt-1">
        {isLoading && page === 1 && <LoadingSpinner />}
        {!isLoading && list.length === 0 && (
          <EmptyState title="Belum ada komentar" description="Jadilah yang pertama berkomentar." />
        )}
        {list.map((comment) => {
          const canDelete =
            currentUser &&
            (currentUser.id === comment.authorId || currentUser.id === postAuthorId);

          return (
            <div
              key={comment.id}
              className="group flex items-start justify-between gap-3 rounded-xl border border-white/5 bg-black/30 p-3"
            >
              <div className="flex min-w-0 flex-1 items-start gap-2.5">
                <Link href={`/profile/${comment.author?.username || ""}`}>
                  <Avatar
                    src={comment.author?.avatarUrl}
                    name={comment.author?.name || comment.author?.username}
                    size="sm"
                  />
                </Link>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/profile/${comment.author?.username || ""}`}
                      className="text-xs font-semibold text-neutral-100 hover:underline"
                    >
                      {comment.author?.name || comment.author?.username || "User"}
                    </Link>
                      <span className="text-[10px] text-neutral-500">
                        <RelativeTime date={comment.createdAt} />
                      </span>
                  </div>
                  <p className="mt-1 break-words text-xs leading-relaxed text-neutral-300">
                    {comment.text}
                  </p>
                </div>
              </div>

              {canDelete && (
                <button
                  onClick={() => deleteMutation.mutate(comment.id)}
                  disabled={deleteMutation.isPending}
                  title="Delete comment"
                  className="rounded p-1 text-neutral-500 opacity-0 transition-opacity hover:text-red-400 group-hover:opacity-100"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          );
        })}

        <LoadMoreButton
          hasMore={data?.hasMore}
          isLoading={isFetching && page > 1}
          onClick={() => setPage((p) => p + 1)}
        />
      </div>
    </div>
  );
}
