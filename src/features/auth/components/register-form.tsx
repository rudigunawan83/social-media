"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Eye, EyeOff, Loader2, Sparkles } from "lucide-react";
import { authApi } from "../api/auth";
import { cn } from "@/lib/utils";

const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers and underscores"),
    email: z.string().email("Invalid email address"),
    phone: z.string().optional(),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm password must be at least 6 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    defaultValues: {
      name: "",
      username: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
    resolver: async (values) => {
      const result = registerSchema.safeParse(values);
      if (result.success) {
        return { values: result.data, errors: {} };
      }
      const fieldErrors: Record<string, any> = {};
      result.error.issues.forEach((issue) => {
        const path = String(issue.path[0] || "");
        if (path && !fieldErrors[path]) {
          fieldErrors[path] = { type: issue.code, message: issue.message };
        }
      });
      return { values: {}, errors: fieldErrors };
    },
  });

  const onSubmit = async (values: RegisterFormData) => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      await authApi.register({
        name: values.name,
        username: values.username,
        email: values.email,
        phone: values.phone || undefined,
        password: values.password,
      });
      router.push("/login?registered=true");
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.message || "Registration failed. Try a different username or email."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[420px] mx-auto p-6 md:p-8 rounded-2xl bg-[#121827]/95 border border-slate-800 shadow-2xl backdrop-blur-md">
      {/* Header: Logo + Title */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="text-lg font-bold text-white tracking-wide">Sociality</span>
        </div>
        <h1 className="text-xl font-bold text-white">Register</h1>
      </div>

      {errorMessage && (
        <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-medium">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
        {/* Name */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Name</label>
          <input
            type="text"
            {...register("name")}
            placeholder="Enter your name"
            className={cn(
              "w-full px-3.5 py-2.5 bg-[#0f172a] rounded-xl text-xs text-slate-100 placeholder-slate-500 border transition-colors focus:outline-none",
              errors.name
                ? "border-red-500 focus:border-red-500"
                : "border-slate-800 focus:border-purple-500"
            )}
          />
          {errors.name && (
            <p className="text-[11px] text-red-400 mt-1">{errors.name.message}</p>
          )}
        </div>

        {/* Username */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Username</label>
          <input
            type="text"
            {...register("username")}
            placeholder="Enter your username"
            className={cn(
              "w-full px-3.5 py-2.5 bg-[#0f172a] rounded-xl text-xs text-slate-100 placeholder-slate-500 border transition-colors focus:outline-none",
              errors.username
                ? "border-red-500 focus:border-red-500"
                : "border-slate-800 focus:border-purple-500"
            )}
          />
          {errors.username && (
            <p className="text-[11px] text-red-400 mt-1">{errors.username.message}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Email</label>
          <input
            type="email"
            {...register("email")}
            placeholder="Enter your email"
            className={cn(
              "w-full px-3.5 py-2.5 bg-[#0f172a] rounded-xl text-xs text-slate-100 placeholder-slate-500 border transition-colors focus:outline-none",
              errors.email
                ? "border-red-500 focus:border-red-500"
                : "border-slate-800 focus:border-purple-500"
            )}
          />
          {errors.email && (
            <p className="text-[11px] text-red-400 mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Number Phone */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Number Phone</label>
          <input
            type="text"
            {...register("phone")}
            placeholder="Enter your number phone"
            className={cn(
              "w-full px-3.5 py-2.5 bg-[#0f172a] rounded-xl text-xs text-slate-100 placeholder-slate-500 border transition-colors focus:outline-none",
              errors.phone
                ? "border-red-500 focus:border-red-500"
                : "border-slate-800 focus:border-purple-500"
            )}
          />
          {errors.phone && (
            <p className="text-[11px] text-red-400 mt-1">{errors.phone.message}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              {...register("password")}
              placeholder="Enter your password"
              className={cn(
                "w-full pl-3.5 pr-10 py-2.5 bg-[#0f172a] rounded-xl text-xs text-slate-100 placeholder-slate-500 border transition-colors focus:outline-none",
                errors.password
                  ? "border-red-500 focus:border-red-500"
                  : "border-slate-800 focus:border-purple-500"
              )}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors p-1 cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-[11px] text-red-400 mt-1">{errors.password.message}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Confirm Password</label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              {...register("confirmPassword")}
              placeholder="Enter your confirm password"
              className={cn(
                "w-full pl-3.5 pr-10 py-2.5 bg-[#0f172a] rounded-xl text-xs text-slate-100 placeholder-slate-500 border transition-colors focus:outline-none",
                errors.confirmPassword
                  ? "border-red-500 focus:border-red-500"
                  : "border-slate-800 focus:border-purple-500"
              )}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors p-1 cursor-pointer"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-[11px] text-red-400 mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          id="submit-register-btn"
          disabled={isLoading}
          className="w-full mt-3 py-2.5 rounded-xl bg-[#7c3aed] hover:bg-[#6d28d9] font-semibold text-xs text-white shadow-lg shadow-purple-600/30 hover:shadow-purple-600/50 active:scale-[0.99] disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          <span>Submit</span>
        </button>
      </form>

      {/* Footer */}
      <div className="mt-5 text-center text-xs text-slate-400">
        Already have an account?{" "}
        <Link href="/login" className="text-purple-400 font-semibold hover:underline">
          Log in
        </Link>
      </div>
    </div>
  );
}
