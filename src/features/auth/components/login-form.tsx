"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { authApi } from "../api/auth";
import { useAppDispatch } from "@/store";
import { setCredentials } from "@/store/authSlice";
import { SocialityLogo } from "@/components/common/sociality-logo";
import { cn } from "@/lib/utils";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const returnTo = searchParams.get("returnTo") || "/feed";
  const justRegistered = searchParams.get("registered") === "true";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    defaultValues: { email: "", password: "" },
    resolver: async (values) => {
      const result = loginSchema.safeParse(values);
      if (result.success) return { values: result.data, errors: {} };
      const fieldErrors: Record<string, { type: string; message: string }> = {};
      result.error.issues.forEach((issue) => {
        const path = String(issue.path[0] || "");
        if (path && !fieldErrors[path]) {
          fieldErrors[path] = { type: String(issue.code), message: issue.message };
        }
      });
      return { values: {}, errors: fieldErrors };
    },
  });

  const onSubmit = async (values: LoginFormData) => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const res = await authApi.login(values);
      if (res.token) {
        dispatch(setCredentials({ token: res.token, user: res.user }));
        localStorage.setItem("sociality_token", res.token);
        if (res.user) localStorage.setItem("sociality_user", JSON.stringify(res.user));
        window.location.href = returnTo || "/feed";
      } else {
        setErrorMessage(res.message || "Invalid credentials. Please try again.");
      }
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string } } };
      setErrorMessage(
        ax.response?.data?.message || "Login failed. Check your email or password."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const inputBase =
    "w-full rounded-xl border bg-[#0a0a0a] px-3.5 py-3 text-sm text-white placeholder-neutral-500 outline-none transition";

  return (
    <div className="w-full rounded-2xl border border-white/10 bg-[#121212]/95 p-6 shadow-2xl backdrop-blur-md sm:p-8">
      {/* Logo + Welcome — Figma */}
      <div className="mb-7 text-center">
        <div className="mb-3 flex justify-center">
          <SocialityLogo markClassName="h-6 w-6" textClassName="text-lg font-semibold" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Welcome Back!</h1>
      </div>

      {justRegistered && (
        <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-center text-xs font-medium text-emerald-300">
          Account created successfully! Please sign in.
        </div>
      )}

      {errorMessage && (
        <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs font-medium text-red-300">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-200">Email</label>
          <input
            type="email"
            autoComplete="email"
            {...register("email")}
            placeholder="Enter your email"
            className={cn(
              inputBase,
              errors.email
                ? "border-red-500 focus:border-red-500"
                : "border-white/15 focus:border-violet-500"
            )}
          />
          {errors.email && (
            <p className="mt-1.5 text-xs text-red-400">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-200">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              {...register("password")}
              placeholder="Enter your password"
              className={cn(
                inputBase,
                "pr-11",
                errors.password
                  ? "border-red-500 focus:border-red-500"
                  : "border-white/15 focus:border-violet-500"
              )}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer p-1 text-neutral-400 transition hover:text-white"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1.5 text-xs text-red-400">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          id="submit-login-btn"
          disabled={isLoading}
          className="mt-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-violet-600 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/30 transition hover:bg-violet-500 active:scale-[0.99] disabled:opacity-50"
        >
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          <span>Login</span>
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-neutral-400">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-semibold text-violet-400 hover:text-violet-300 hover:underline">
          Register
        </Link>
      </p>
    </div>
  );
}
