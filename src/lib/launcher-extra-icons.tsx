"use client";

import React from "react";
import type { IconType } from "react-icons";
import { FileText, Table2, Presentation, NotebookPen, PenTool } from "lucide-react";
import { LAUNCHER_SI_ICONS } from "@/lib/app-launcher";

function lucideIcon(Comp: typeof FileText): IconType {
  return ((props: { size?: number; color?: string; className?: string }) =>
    React.createElement(Comp, {
      size: props.size ?? 24,
      color: props.color,
      className: props.className,
      strokeWidth: 2.25,
    })) as IconType;
}

/** Microsoft / Whiteboard presets (no Simple Icons equivalents) */
export const LAUNCHER_EXTRA_ICONS: Record<string, { Icon: IconType; defaultColor: string }> = {
  LATLAS_MS_WORD: { Icon: lucideIcon(FileText), defaultColor: "#185ABD" },
  LATLAS_MS_EXCEL: { Icon: lucideIcon(Table2), defaultColor: "#217346" },
  LATLAS_MS_POWERPOINT: { Icon: lucideIcon(Presentation), defaultColor: "#B7472A" },
  LATLAS_MS_ONENOTE: { Icon: lucideIcon(NotebookPen), defaultColor: "#7719AA" },
  LATLAS_MS_WHITEBOARD: { Icon: lucideIcon(PenTool), defaultColor: "#0078D4" },
};

export function getLauncherIconMeta(
  iconKey: string
): { Icon: IconType; defaultColor: string } | undefined {
  return LAUNCHER_SI_ICONS[iconKey] ?? LAUNCHER_EXTRA_ICONS[iconKey];
}
