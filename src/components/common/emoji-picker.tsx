"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Smile } from "lucide-react";
import { cn } from "@/lib/utils";

/** Grid 3×6 — Figma https://www.figma.com/design/5qL4zS8bo8geBn2aJfa239/Social-Media?node-id=41447-7111 */
const EMOJIS = [
  "😀",
  "😅",
  "🥰",
  "😇",
  "🙂",
  "😋",
  "🤪",
  "🤐",
  "😏",
  "🤗",
  "😴",
  "🙄",
  "🤫",
  "😪",
  "🥵",
  "😫",
  "😢",
  "😱",
] as const;

const PANEL_W = 248;

type EmojiPickerProps = {
  onSelect: (emoji: string) => void;
  className?: string;
};

export function EmojiPicker({ onSelect, className }: EmojiPickerProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const updatePosition = () => {
    const btn = btnRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const gap = 8;
    const panelH = panelRef.current?.offsetHeight ?? 140;
    let top = rect.top - panelH - gap;
    let left = rect.left;

    // Jika tidak muat di atas, tampilkan di bawah tombol
    if (top < 8) {
      top = rect.bottom + gap;
    }
    // Jaga agar tidak keluar kanan viewport
    const maxLeft = window.innerWidth - PANEL_W - 8;
    left = Math.max(8, Math.min(left, maxLeft));

    setPos({ top, left });
  };

  useLayoutEffect(() => {
    if (!open) return;
    updatePosition();
    const raf = requestAnimationFrame(() => updatePosition());
    const onScroll = () => updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (btnRef.current?.contains(t) || panelRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const panel =
    open && mounted
      ? createPortal(
          <div
            ref={panelRef}
            style={{
              position: "fixed",
              top: pos.top,
              left: pos.left,
              width: PANEL_W,
              zIndex: 100,
            }}
            className="rounded-2xl border border-white/10 bg-[#1c1c1c] p-2.5 shadow-2xl shadow-black/60"
            role="listbox"
            aria-label="Emoji picker"
          >
            <div
              className="grid gap-0.5"
              style={{ gridTemplateColumns: "repeat(6, minmax(0, 1fr))" }}
            >
              {EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => {
                    onSelect(emoji);
                    setOpen(false);
                  }}
                  className="flex aspect-square items-center justify-center rounded-xl text-[22px] leading-none transition hover:bg-white/10"
                  role="option"
                  style={{ fontFamily: "Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, sans-serif" }}
                >
                  <span className="select-none" aria-hidden>
                    {emoji}
                  </span>
                </button>
              ))}
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/15 text-neutral-300 transition hover:bg-white/5 hover:text-white",
          open && "border-white/25 bg-white/5 text-white",
          className
        )}
        aria-label="Emoji"
        aria-expanded={open}
      >
        <Smile className="h-5 w-5" strokeWidth={1.75} />
      </button>
      {panel}
    </>
  );
}
