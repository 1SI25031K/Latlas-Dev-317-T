"use client";

import { X } from "lucide-react";

type Props = {
  onClick: () => void;
  "aria-label": string;
  className?: string;
};

export function DashboardCloseButton({ onClick, "aria-label": ariaLabel, className = "" }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition-opacity hover:opacity-90 ${className}`}
      style={{
        borderColor: "var(--dashboard-border)",
        backgroundColor: "transparent",
        color: "var(--dashboard-text-muted)",
      }}
      aria-label={ariaLabel}
    >
      <X className="size-7 shrink-0" strokeWidth={2.75} aria-hidden />
    </button>
  );
}
