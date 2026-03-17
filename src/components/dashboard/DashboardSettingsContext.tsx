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
  type ThemeId,
  type FontSizeId,
  type ResolvedThemeId,
} from "@/lib/theme-constants";

type DashboardSettingsState = {
  theme: ThemeId;
  resolvedTheme: ResolvedThemeId;
  fontSize: FontSizeId;
  iconAnimation: boolean;
  setTheme: (v: ThemeId) => void;
  setFontSize: (v: FontSizeId) => void;
  setIconAnimation: (v: boolean) => void;
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

  useEffect(() => {
    setThemeState(readTheme());
    setFontSizeState(readFontSize());
    setIconAnimationState(readIconAnimation());
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

  const value = useMemo(
    () => ({
      theme,
      resolvedTheme,
      fontSize,
      iconAnimation,
      setTheme,
      setFontSize,
      setIconAnimation,
    }),
    [theme, resolvedTheme, fontSize, iconAnimation, setTheme, setFontSize, setIconAnimation]
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
