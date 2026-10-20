import React, { Suspense } from "react";
import { LoginForm } from "@/features/auth/components/login-form";

export const metadata = {
  title: "Login — Sociality",
};

export default function LoginPage() {
  return (
    <div className="relative flex min-h-dvh w-full items-center justify-center overflow-hidden bg-black px-4 py-10 sm:px-6">
      {/* Ambient purple glow — Figma web + mobile */}
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[-20%] left-1/2 h-[55vh] w-[120vw] -translate-x-1/2 rounded-full bg-violet-600/45 blur-[100px] sm:bottom-[-25%] sm:h-[70vh] sm:w-[90vw] sm:bg-violet-600/35 sm:blur-[140px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[5%] left-[15%] hidden h-[40vh] w-[40vw] rounded-full bg-indigo-500/20 blur-[120px] sm:block"
      />

      <div className="relative z-10 w-full max-w-[420px]">
        <Suspense
          fallback={
            <div className="rounded-2xl border border-white/10 bg-[#121212]/90 p-8 text-center text-sm text-neutral-500">
              Loading...
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
