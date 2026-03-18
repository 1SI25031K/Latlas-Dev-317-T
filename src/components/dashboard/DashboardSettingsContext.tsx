"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  THEME_BG,
  DEFAULT_THEME,
  DEFAULT_FONT_SIZE,
  DEFAULT_ICON_ANIMATION,
  STORAGE_KEYS,
  BACKGROUND_MODES,
  DEFAULT_BACKGROUND_MODE,
  DEFAULT_SOLID_BACKGROUND_COLOR,
  DEFAULT_SIDEBAR_COLLAPSED,
  DEFAULT_WALLPAPER_ON,
  type ThemeId,
  type FontSizeId,
  type ResolvedThemeId,
  type BackgroundMode,
} from "@/lib/theme-constants";

type DashboardSettingsState = {
  theme: ThemeId;
  resolvedTheme: ResolvedThemeId;
  fontSize: FontSizeId;
  iconAnimation: boolean;
  backgroundMode: BackgroundMode;
  backgroundColor: string;
  sidebarCollapsed: boolean;
  setTheme: (v: ThemeId) => void;
  setFontSize: (v: FontSizeId) => void;
  setIconAnimation: (v: boolean) => void;
  setBackgroundMode: (v: BackgroundMode) => void;
  setBackgroundColor: (v: string) => void;
  setSidebarCollapsed: (v: boolean) => void;
};

const DashboardSettingsContext = createContext<DashboardSettingsState | null>(
  null
);

function readTheme(): ThemeId {
  if (typeof window === "undefined") return DEFAULT_THEME;
  const v = localStorage.getItem(STORAGE_KEYS.theme);
  if (v === "light" || v === "dark" || v === "system") return v;
  return DEFAULT_THEME;
}

function readFontSize(): FontSizeId {
  if (typeof window === "undefined") return DEFAULT_FONT_SIZE;
  const v = localStorage.getItem(STORAGE_KEYS.fontSize);
  if (v === "small" || v === "medium" || v === "large") return v;
  return DEFAULT_FONT_SIZE;
}

function readIconAnimation(): boolean {
  if (typeof window === "undefined") return DEFAULT_ICON_ANIMATION;
  const v = localStorage.getItem(STORAGE_KEYS.iconAnimation);
  if (v === "false") return false;
  if (v === "true") return true;
  return DEFAULT_ICON_ANIMATION;
}

function readWallpaperOnLegacy(): boolean {
  if (typeof window === "undefined") return DEFAULT_WALLPAPER_ON;
  const v = localStorage.getItem(STORAGE_KEYS.wallpaperOn);
  if (v === "false") return false;
  if (v === "true") return true;
  return DEFAULT_WALLPAPER_ON;
}

function readBackgroundMode(): BackgroundMode {
  if (typeof window === "undefined") return DEFAULT_BACKGROUND_MODE;
  const v = localStorage.getItem(STORAGE_KEYS.backgroundMode);
  if (v && BACKGROUND_MODES.includes(v as BackgroundMode)) {
    return v as BackgroundMode;
  }

  // legacy migration: wallpaperOn(true) => daily, otherwise theme
  return readWallpaperOnLegacy() ? "daily" : "theme";
}

function readBackgroundColor(): string {
  if (typeof window === "undefined") return DEFAULT_SOLID_BACKGROUND_COLOR;
  const v = localStorage.getItem(STORAGE_KEYS.backgroundColor);
  if (typeof v === "string" && v.trim().length > 0) return v;
  return DEFAULT_SOLID_BACKGROUND_COLOR;
}

function readSidebarCollapsed(): boolean {
  if (typeof window === "undefined") return DEFAULT_SIDEBAR_COLLAPSED;
  const v = localStorage.getItem(STORAGE_KEYS.sidebarCollapsed);
  if (v === "false") return false;
  if (v === "true") return true;
  return DEFAULT_SIDEBAR_COLLAPSED;
}

function getResolvedTheme(theme: ThemeId): ResolvedThemeId {
  if (theme === "light" || theme === "dark") return theme;
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function useDashboardSettings() {
  const ctx = useContext(DashboardSettingsContext);
  if (!ctx)
    throw new Error(
      "useDashboardSettings must be used within DashboardThemeWrapper"
    );
  return ctx;
}

type DashboardThemeWrapperProps = {
  children: ReactNode;
  locale?: string;
};

export function DashboardThemeWrapper({ children, locale }: DashboardThemeWrapperProps) {
  const [theme, setThemeState] = useState<ThemeId>(DEFAULT_THEME);
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedThemeId>("light");
  const [fontSize, setFontSizeState] = useState<FontSizeId>(DEFAULT_FONT_SIZE);
  const [iconAnimation, setIconAnimationState] = useState<boolean>(DEFAULT_ICON_ANIMATION);
  const [backgroundMode, setBackgroundModeState] = useState<BackgroundMode>(DEFAULT_BACKGROUND_MODE);
  const [backgroundColor, setBackgroundColorState] = useState<string>(DEFAULT_SOLID_BACKGROUND_COLOR);
  const [sidebarCollapsed, setSidebarCollapsedState] = useState<boolean>(DEFAULT_SIDEBAR_COLLAPSED);

  useEffect(() => {
    setThemeState(readTheme());
    setFontSizeState(readFontSize());
    setIconAnimationState(readIconAnimation());
    setBackgroundModeState(readBackgroundMode());
    setBackgroundColorState(readBackgroundColor());
    setSidebarCollapsedState(readSidebarCollapsed());
  }, []);

  useEffect(() => {
    const resolved = getResolvedTheme(theme);
    setResolvedTheme(resolved);

    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => setResolvedTheme(getResolvedTheme("system"));
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  const setTheme = useCallback((v: ThemeId) => {
    setThemeState(v);
    try {
      localStorage.setItem(STORAGE_KEYS.theme, v);
    } catch {}
  }, []);

  const setFontSize = useCallback((v: FontSizeId) => {
    setFontSizeState(v);
    try {
      localStorage.setItem(STORAGE_KEYS.fontSize, v);
    } catch {}
  }, []);

  const setIconAnimation = useCallback((v: boolean) => {
    setIconAnimationState(v);
    try {
      localStorage.setItem(STORAGE_KEYS.iconAnimation, v ? "true" : "false");
    } catch {}
  }, []);

  const setBackgroundMode = useCallback((v: BackgroundMode) => {
    setBackgroundModeState(v);
    try {
      localStorage.setItem(STORAGE_KEYS.backgroundMode, v);
    } catch {}
  }, []);

  const setBackgroundColor = useCallback((v: string) => {
    setBackgroundColorState(v);
    try {
      localStorage.setItem(STORAGE_KEYS.backgroundColor, v);
    } catch {}
  }, []);

  const setSidebarCollapsed = useCallback((v: boolean) => {
    setSidebarCollapsedState(v);
    try {
      localStorage.setItem(STORAGE_KEYS.sidebarCollapsed, v ? "true" : "false");
    } catch {}
  }, []);

  const value = useMemo(
    () => ({
      theme,
      resolvedTheme,
      fontSize,
      iconAnimation,
      setTheme,
      setFontSize,
      setIconAnimation,
      backgroundMode,
      backgroundColor,
      sidebarCollapsed,
      setBackgroundMode,
      setBackgroundColor,
      setSidebarCollapsed,
    }),
    [
      theme,
      resolvedTheme,
      fontSize,
      iconAnimation,
      backgroundMode,
      backgroundColor,
      sidebarCollapsed,
      setTheme,
      setFontSize,
      setIconAnimation,
      setBackgroundMode,
      setBackgroundColor,
      setSidebarCollapsed,
    ]
  );

  const bg = THEME_BG[resolvedTheme];
  const textColor = resolvedTheme === "dark" ? "#c9d1d9" : undefined;

  return (
    <DashboardSettingsContext.Provider value={value}>
      <div
        data-theme={resolvedTheme}
        data-font-size={fontSize}
        data-locale={locale}
        className="flex h-screen w-full overflow-hidden dashboard-theme-root"
        style={{
          background: bg,
          color: textColor,
        }}
      >
        {children}
      </div>
    </DashboardSettingsContext.Provider>
  );
}
