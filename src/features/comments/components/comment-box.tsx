"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Send, Trash2, Loader2, MessageSquare } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { commentsApi } from "../api/comments";
import { queryKeys } from "@/lib/query-keys";
import { Avatar } from "@/components/common/avatar";
import { formatRelativeTime } from "@/lib/utils";
import { useAppSelector } from "@/store";
import { LoadingSpinner, EmptyState } from "@/components/common/state-views";

interface CommentBoxProps {
  postId: number;
  postAuthorId?: number;
}

export function CommentBox({ postId, postAuthorId }: CommentBoxProps) {
  const queryClient = useQueryClient();
  const { user: currentUser, isAuthenticated } = useAppSelector((s) => s.auth);
  const [newComment, setNewComment] = useState("");
  const [page, setPage] = useState(1);

  const { data: comments, isLoading, refetch } = useQuery({
    queryKey: queryKeys.posts.comments(postId, page),
    queryFn: () => commentsApi.getComments(postId, page, 20),
  });

  const addMutation = useMutation({
    mutationFn: (text: string) => commentsApi.createComment(postId, text),
    onSuccess: () => {
      setNewComment("");
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.comments(postId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.detail(postId) });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (commentId: number) => commentsApi.deleteComment(commentId),
    onSuccess: () => {
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
      <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
        <MessageSquare className="w-4 h-4 text-purple-400" />
        Comments ({comments?.length || 0})
      </h3>

      {/* Comment Input Composer */}
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
              className="w-full pl-3.5 pr-10 py-2 text-sm rounded-xl bg-slate-900/80 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
            />
            <button
              type="submit"
              disabled={!newComment.trim() || addMutation.isPending}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-purple-400 hover:text-purple-300 disabled:opacity-40 transition-opacity"
            >
              {addMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </form>
      ) : (
        <div className="p-3 text-xs text-center rounded-xl bg-slate-900/60 border border-slate-800 text-slate-400">
          <Link href="/login" className="text-purple-400 font-semibold hover:underline">
            Log in
          </Link>{" "}
          to leave a comment.
        </div>
      )}

      {/* Comments List */}
      <div className="flex flex-col gap-3 pt-2">
        {isLoading && <LoadingSpinner />}
        {!isLoading && (!comments || comments.length === 0) && (
          <EmptyState
            title="No comments yet"
            description="Be the first to share your thoughts!"
          />
        )}
        {comments &&
          comments.map((comment) => {
            const canDelete =
              currentUser &&
              (currentUser.id === comment.authorId || currentUser.id === postAuthorId);

            return (
              <div
                key={comment.id}
                className="flex items-start justify-between gap-3 p-3 rounded-xl bg-slate-900/40 hover:bg-slate-900/70 border border-slate-800/50 transition-colors group"
              >
                <div className="flex items-start gap-2.5 min-w-0 flex-1">
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
                        className="text-xs font-semibold text-slate-200 hover:text-purple-400 transition-colors"
                      >
                        {comment.author?.name || comment.author?.username || "User"}
                      </Link>
                      <span className="text-[10px] text-slate-500">
                        {formatRelativeTime(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed break-words">
                      {comment.text}
                    </p>
                  </div>
                </div>

                {canDelete && (
                  <button
                    onClick={() => deleteMutation.mutate(comment.id)}
                    disabled={deleteMutation.isPending}
                    title="Delete comment"
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-red-400 transition-opacity rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
}
