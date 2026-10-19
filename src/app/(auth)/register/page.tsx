import React from "react";
import { RegisterForm } from "@/features/auth/components/register-form";

export const metadata = {
  title: "Register — Sociality",
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#0b0f19] relative overflow-hidden">
      {/* Figma ambient glow: Deep purple light on bottom and center */}
      <div className="absolute -bottom-40 -right-20 w-[600px] h-[600px] bg-purple-700/35 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-20 left-1/4 w-[450px] h-[450px] bg-indigo-700/25 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/4 right-1/3 w-[300px] h-[300px] bg-purple-900/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 w-full py-8">
        <RegisterForm />
      </div>
    </div>
  );
}
