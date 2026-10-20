"use client";

import { useEffect, useState } from "react";

/** Hindari mismatch SSR/client untuk UI yang bergantung auth / localStorage / waktu lokal */
export function useHasMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  return mounted;
}
