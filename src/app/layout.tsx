import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sociality — Connect, Share & Explore",
  description: "A sleek, modern social media platform built with Next.js and TypeScript.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-[#0b0f19] text-[#f8fafc] antialiased selection:bg-purple-600 selection:text-white`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
