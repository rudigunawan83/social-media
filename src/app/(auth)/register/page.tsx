import React from "react";
import { RegisterForm } from "@/features/auth/components/register-form";

export const metadata = {
  title: "Register — Sociality",
};

export default function RegisterPage() {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-black p-4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(255,255,255,0.06),_transparent_55%)]" />
      <div className="relative z-10 w-full py-8">
        <RegisterForm />
      </div>
    </div>
  );
}
