"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { X, Upload, User as UserIcon, Loader2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAppDispatch, useAppSelector } from "@/store";
import { setEditProfileModalOpen } from "@/store/uiSlice";
import { setUser } from "@/store/authSlice";
import { usersApi } from "../api/users";
import { queryKeys } from "@/lib/query-keys";
import { Avatar } from "@/components/common/avatar";
import { isValidUser } from "@/lib/normalize";
import { User } from "@/types/models";

function readStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("sociality_user");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as User;
    return isValidUser(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function pickBestUser(...candidates: Array<User | null | undefined>): User | null {
  for (const c of candidates) {
    if (isValidUser(c)) return c;
  }
  return null;
}

type EditProfileFormProps = {
  user: User;
  onClose: () => void;
};

function EditProfileForm({ user, onClose }: EditProfileFormProps) {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  const [name, setName] = useState(user.name || "");
  const [username, setUsername] = useState(user.username || "");
  const [phone, setPhone] = useState(user.phone || "");
  const [bio, setBio] = useState(user.bio || "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user.avatarUrl || null);
  const [errorMessage, setErrorMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      formData.append("name", name.trim());
      formData.append("username", username.trim());
      formData.append("phone", phone.trim());
      formData.append("bio", bio.trim());
      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }
      return usersApi.updateMyProfile(formData);
    },
    onSuccess: (updatedUser) => {
      const merged: User = isValidUser(updatedUser)
        ? {
            ...user,
            ...updatedUser,
            name: updatedUser.name || name.trim() || user.name,
            username: updatedUser.username || username.trim() || user.username,
            phone: updatedUser.phone ?? (phone.trim() || user.phone),
            bio: updatedUser.bio ?? (bio.trim() || user.bio),
            avatarUrl: updatedUser.avatarUrl || avatarPreview || user.avatarUrl,
          }
        : {
            ...user,
            name: name.trim(),
            username: username.trim(),
            phone: phone.trim() || null,
            bio: bio.trim() || null,
            avatarUrl: avatarPreview || user.avatarUrl,
          };

      dispatch(setUser(merged));
      queryClient.setQueryData(queryKeys.auth.me, merged);
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
      if (merged.username) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.users.profile(merged.username),
        });
      }
      onClose();
    },
    onError: (err: unknown) => {
      const ax = err as { response?: { data?: { message?: string } }; message?: string };
      setErrorMessage(
        ax.response?.data?.message || ax.message || "Failed to update profile"
      );
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        updateMutation.mutate();
      }}
      className="flex flex-col gap-4 overflow-y-auto p-5"
    >
      {errorMessage && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
          {errorMessage}
        </div>
      )}

      <div className="flex items-center gap-4">
        <div className="relative">
          <Avatar
            src={avatarPreview}
            name={name || username || "User"}
            size="xl"
            className="ring-2 ring-white/15"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 rounded-full bg-violet-600 p-1.5 text-white shadow transition-transform hover:scale-105"
            title="Change photo"
          >
            <Upload className="h-3.5 w-3.5" />
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
          <p className="text-sm font-medium text-neutral-200">Profile Photo</p>
          <p className="text-xs text-neutral-400">JPG, PNG, or WEBP (max 5MB)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-neutral-300">
            Display Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full rounded-xl border border-white/10 bg-black px-3 py-2 text-sm text-neutral-100 focus:border-violet-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-neutral-300">
            Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full rounded-xl border border-white/10 bg-black px-3 py-2 text-sm text-neutral-100 focus:border-violet-500 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-neutral-300">
          Phone Number (Optional)
        </label>
        <input
          type="text"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="e.g. 08123456789"
          className="w-full rounded-xl border border-white/10 bg-black px-3 py-2 text-sm text-neutral-100 focus:border-violet-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-neutral-300">Bio</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Tell us about yourself..."
          rows={2}
          className="w-full resize-none rounded-xl border border-white/10 bg-black px-3 py-2 text-sm text-neutral-100 focus:border-violet-500 focus:outline-none"
        />
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm text-neutral-300 transition-colors hover:text-white"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={updateMutation.isPending || !name.trim() || !username.trim()}
          className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2 text-sm font-semibold text-white shadow-md hover:bg-violet-500 disabled:opacity-50"
        >
          {updateMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Save Changes
        </button>
      </div>
    </form>
  );
}

export function EditProfileModal() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const isOpen = useAppSelector((s) => s.ui.isEditProfileModalOpen);
  const currentUser = useAppSelector((s) => s.auth.user);

  const { data: freshProfile, isFetching, isError, error, refetch } = useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: () => usersApi.getMyProfile(),
    enabled: isOpen,
    staleTime: 0,
  });

  // Sync hasil fetch valid ke Redux + cache
  useEffect(() => {
    if (!isOpen || !isValidUser(freshProfile)) return;
    dispatch(setUser(freshProfile));
    queryClient.setQueryData(queryKeys.auth.me, freshProfile);
  }, [isOpen, freshProfile, dispatch, queryClient]);

  const formUser = useMemo(() => {
    if (!isOpen) return null;
    const cached = queryClient.getQueryData<User>(queryKeys.auth.me);
    return pickBestUser(freshProfile, cached, currentUser, readStoredUser());
  }, [isOpen, freshProfile, currentUser, queryClient]);

  const handleClose = () => {
    dispatch(setEditProfileModalOpen(false));
  };

  if (!isOpen) return null;

  const errMsg =
    (error as { response?: { data?: { message?: string } }; message?: string } | null)
      ?.response?.data?.message ||
    (error as { message?: string } | null)?.message;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="glass-panel flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 p-4">
          <h2 className="flex items-center gap-2 text-base font-semibold text-neutral-100">
            <UserIcon className="h-5 w-5 text-neutral-300" />
            Edit Profile
          </h2>
          <button
            onClick={handleClose}
            className="rounded-full p-1 text-neutral-400 transition-colors hover:bg-white/5 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {formUser ? (
          <EditProfileForm
            key={`${formUser.id}-${formUser.username}-${formUser.updatedAt || ""}`}
            user={formUser}
            onClose={handleClose}
          />
        ) : (
          <div className="flex flex-col items-center gap-3 p-8 text-center">
            {isFetching ? (
              <>
                <Loader2 className="h-6 w-6 animate-spin text-violet-400" />
                <p className="text-sm text-neutral-400">Loading profile...</p>
              </>
            ) : (
              <>
                <p className="text-sm text-neutral-300">
                  {isError ? errMsg || "Failed to load profile" : "Profile data not found"}
                </p>
                <button
                  type="button"
                  onClick={() => refetch()}
                  className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-500"
                >
                  Retry
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
