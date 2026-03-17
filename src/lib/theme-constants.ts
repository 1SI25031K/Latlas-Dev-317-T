export const THEME_IDS = [
  "light",
  "dark",
  "gray",
  "blue",
  "green",
  "teal",
  "red",
  "orange",
  "yellow",
  "amber",
  "purple",
  "pink",
  "indigo",
  "cyan",
] as const;

export type ThemeId = (typeof THEME_IDS)[number];

export const THEME_BG: Record<ThemeId, string> = {
  light: "#F5F5F7",
  dark: "#1a1a1a",
  gray: "#6b7280",
  blue: "#3b82f6",
  green: "#22c55e",
  teal: "#14b8a6",
  red: "#ef4444",
  orange: "#f97316",
  yellow: "#eab308",
  amber: "#f59e0b",
  purple: "#a855f7",
  pink: "#ec4899",
  indigo: "#6366f1",
  cyan: "#06b6d4",
};

export const FONT_SIZE_IDS = ["small", "medium", "large"] as const;
export type FontSizeId = (typeof FONT_SIZE_IDS)[number];

export const STORAGE_KEYS = {
  theme: "latlas-theme",
  fontSize: "latlas-font-size",
} as const;

export const DEFAULT_THEME: ThemeId = "light";
export const DEFAULT_FONT_SIZE: FontSizeId = "medium";
