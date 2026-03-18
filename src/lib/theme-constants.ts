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
  // legacy (kept for backward compatibility with earlier wallpaperOn implementation)
  wallpaperOn: "latlas-wallpaper-on",
  // background mode for dashboard main area
  backgroundMode: "latlas-background-mode",
  backgroundColor: "latlas-background-color",
  sidebarCollapsed: "latlas-sidebar-collapsed",
  headerClockFont: "latlas-header-clock-font",
  headerClock24Hour: "latlas-header-clock-24-hour",
  headerClockShowSeconds: "latlas-header-clock-show-seconds",
  headerClockLarge: "latlas-header-clock-large",
  headerClockVisible: "latlas-header-clock-visible",
} as const;

export const DEFAULT_HEADER_CLOCK_FONT_ID = 0;
export const DEFAULT_HEADER_CLOCK_24_HOUR = true;
export const DEFAULT_HEADER_CLOCK_SHOW_SECONDS = false;
export const DEFAULT_HEADER_CLOCK_LARGE = false;
export const DEFAULT_HEADER_CLOCK_VISIBLE = true;

export const DEFAULT_ICON_ANIMATION = true;
export const DEFAULT_WALLPAPER_ON = false;

export const BACKGROUND_MODES = ["theme", "solid", "daily"] as const;
export type BackgroundMode = (typeof BACKGROUND_MODES)[number];

export const DEFAULT_BACKGROUND_MODE: BackgroundMode = "theme";
export const DEFAULT_SOLID_BACKGROUND_COLOR = "#3B82F6";

export const DEFAULT_SIDEBAR_COLLAPSED = false;

export const DEFAULT_THEME: ThemeId = "system";
export const DEFAULT_FONT_SIZE: FontSizeId = "medium";
