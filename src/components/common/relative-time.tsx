"use client";

import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

/** Relative time aman hydration: server pakai tanggal tetap, client `fromNow()` */
export function RelativeTime({
  date,
  className,
}: {
  date?: string;
  className?: string;
}) {
  const [label, setLabel] = useState(() =>
    date ? dayjs(date).format("D MMM YYYY") : ""
  );

  useEffect(() => {
    if (!date) {
      setLabel("");
      return;
    }
    setLabel(dayjs(date).fromNow());
  }, [date]);

  if (!date) return null;
  return <span className={className}>{label}</span>;
}
