export const THEME_IDS = ["light", "dark", "system"] as const;
export type ThemeId = (typeof THEME_IDS)[number];

export type ResolvedThemeId = "light" | "dark";

export const THEME_BG: Record<ResolvedThemeId, string> = {
  light: "#F5F5F7",
  dark: "#000000",
};

export const FONT_SIZE_IDS = ["small", "medium", "large"] as const;
export type FontSizeId = (typeof FONT_SIZE_IDS)[number];

export const STORAGE_KEYS = {
  theme: "latlas-theme",
  fontSize: "latlas-font-size",
  iconAnimation: "latlas-icon-animation",
  wallpaperOn: "latlas-wallpaper-on",
} as const;

export const DEFAULT_ICON_ANIMATION = true;
export const DEFAULT_WALLPAPER_ON = false;

export const DEFAULT_THEME: ThemeId = "system";
export const DEFAULT_FONT_SIZE: FontSizeId = "medium";
