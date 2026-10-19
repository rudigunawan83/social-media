import React, { Suspense } from "react";
import { LoginForm } from "@/features/auth/components/login-form";

export const metadata = {
  title: "Login — Sociality",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#0b0f19] relative overflow-hidden">
      {/* Decorative gradient glow backgrounds matching Figma */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 w-full">
        <Suspense fallback={<div className="text-center text-slate-400">Loading...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
