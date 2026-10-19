"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { X, Upload, Image as ImageIcon, Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppDispatch, useAppSelector } from "@/store";
import { setCreatePostModalOpen } from "@/store/uiSlice";
import { postsApi } from "../api/posts";
import { queryKeys } from "@/lib/query-keys";

export function CreatePostModal() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const isOpen = useAppSelector((s) => s.ui.isCreatePostModalOpen);

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClose = () => {
    dispatch(setCreatePostModalOpen(false));
    setFile(null);
    setPreviewUrl(null);
    setCaption("");
    setErrorMessage("");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (selected.size > 5 * 1024 * 1024) {
        setErrorMessage("Image size must be less than 5MB");
        return;
      }
      setFile(selected);
      setPreviewUrl(URL.createObjectURL(selected));
      setErrorMessage("");
    }
  };

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error("Please select an image");
      const formData = new FormData();
      formData.append("image", file);
      if (caption.trim()) {
        formData.append("caption", caption.trim());
      }
      return await postsApi.createPost(formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.feed.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
      handleClose();
    },
    onError: (err: any) => {
      setErrorMessage(
        err.response?.data?.message || err.message || "Failed to create post"
      );
    },
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl border border-slate-700">
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-purple-400" />
            Create New Post
          </h2>
          <button
            onClick={handleClose}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            createMutation.mutate();
          }}
          className="p-5 flex flex-col gap-4"
        >
          {errorMessage && (
            <div className="p-3 text-xs rounded-lg bg-red-500/10 border border-red-500/30 text-red-300">
              {errorMessage}
            </div>
          )}

          {/* Image Uploader & Preview */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="relative border-2 border-dashed border-slate-700 hover:border-purple-500/50 rounded-xl p-4 flex flex-col items-center justify-center min-h-[220px] bg-slate-900/50 cursor-pointer overflow-hidden transition-colors"
          >
            <input
              type="file"
              ref={fileInputRef}
              accept="image/png,image/jpeg,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />
            {previewUrl ? (
              <div className="relative w-full h-56">
                <Image
                  src={previewUrl}
                  alt="Preview"
                  fill
                  className="object-contain rounded-lg"
                />
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-center text-slate-400">
                <div className="p-3 rounded-full bg-purple-500/10 text-purple-400">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-sm font-medium text-slate-200">
                  Click or drag image here
                </p>
                <p className="text-xs text-slate-500">JPG, PNG, or WEBP (Max 5MB)</p>
              </div>
            )}
          </div>

          {/* Caption */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Caption
            </label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Write a caption..."
              rows={3}
              className="w-full px-3 py-2 text-sm rounded-xl bg-slate-900/80 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm text-slate-300 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!file || createMutation.isPending}
              className="px-5 py-2 text-sm font-semibold rounded-xl gradient-primary text-white shadow-md hover:shadow-purple-500/25 disabled:opacity-50 flex items-center gap-2"
            >
              {createMutation.isPending && (
                <Loader2 className="w-4 h-4 animate-spin" />
              )}
              Share Post
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
