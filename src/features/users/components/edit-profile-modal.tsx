"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { X, Upload, User as UserIcon, Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppDispatch, useAppSelector } from "@/store";
import { setEditProfileModalOpen } from "@/store/uiSlice";
import { setUser } from "@/store/authSlice";
import { usersApi } from "../api/users";
import { queryKeys } from "@/lib/query-keys";
import { Avatar } from "@/components/common/avatar";

export function EditProfileModal() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const isOpen = useAppSelector((s) => s.ui.isEditProfileModalOpen);
  const currentUser = useAppSelector((s) => s.auth.user);

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || "");
      setUsername(currentUser.username || "");
      setPhone(currentUser.phone || "");
      setBio(currentUser.bio || "");
      setAvatarPreview(currentUser.avatarUrl || null);
    }
  }, [currentUser, isOpen]);

  const handleClose = () => {
    dispatch(setEditProfileModalOpen(false));
    setAvatarFile(null);
    setErrorMessage("");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (selected.size > 5 * 1024 * 1024) {
        setErrorMessage("Avatar file size must be less than 5MB");
        return;
      }
      setAvatarFile(selected);
      setAvatarPreview(URL.createObjectURL(selected));
      setErrorMessage("");
    }
  };

  const updateMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("username", username);
      if (phone) formData.append("phone", phone);
      if (bio) formData.append("bio", bio);
      if (avatarFile) formData.append("avatar", avatarFile);

      return await usersApi.updateMyProfile(formData);
    },
    onSuccess: (updatedUser) => {
      dispatch(setUser(updatedUser));
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.profile(username) });
      handleClose();
    },
    onError: (err: any) => {
      setErrorMessage(
        err.response?.data?.message || err.message || "Failed to update profile"
      );
    },
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl border border-slate-700">
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-purple-400" />
            Edit Profile
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
            updateMutation.mutate();
          }}
          className="p-5 flex flex-col gap-4"
        >
          {errorMessage && (
            <div className="p-3 text-xs rounded-lg bg-red-500/10 border border-red-500/30 text-red-300">
              {errorMessage}
            </div>
          )}

          {/* Avatar Edit */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar
                src={avatarPreview}
                name={name || username}
                size="xl"
                className="ring-2 ring-purple-500/30"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-1.5 rounded-full gradient-primary text-white shadow hover:scale-105 transition-transform"
                title="Change photo"
              >
                <Upload className="w-3.5 h-3.5" />
              </button>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/png,image/jpeg,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />
            <div>
              <p className="text-sm font-medium text-slate-200">Profile Photo</p>
              <p className="text-xs text-slate-400">JPG, PNG, or WEBP (max 5MB)</p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm rounded-xl bg-slate-900/80 border border-slate-700 text-slate-100 focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm rounded-xl bg-slate-900/80 border border-slate-700 text-slate-100 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Phone Number (Optional)
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 08123456789"
              className="w-full px-3 py-2 text-sm rounded-xl bg-slate-900/80 border border-slate-700 text-slate-100 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
              rows={2}
              className="w-full px-3 py-2 text-sm rounded-xl bg-slate-900/80 border border-slate-700 text-slate-100 focus:outline-none focus:border-purple-500 resize-none"
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
              disabled={updateMutation.isPending}
              className="px-5 py-2 text-sm font-semibold rounded-xl gradient-primary text-white shadow-md hover:shadow-purple-500/25 disabled:opacity-50 flex items-center gap-2"
            >
              {updateMutation.isPending && (
                <Loader2 className="w-4 h-4 animate-spin" />
              )}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
