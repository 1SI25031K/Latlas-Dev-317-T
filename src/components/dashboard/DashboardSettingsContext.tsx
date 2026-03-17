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
  STORAGE_KEYS,
  type ThemeId,
  type FontSizeId,
} from "@/lib/theme-constants";

type DashboardSettingsState = {
  theme: ThemeId;
  fontSize: FontSizeId;
  setTheme: (v: ThemeId) => void;
  setFontSize: (v: FontSizeId) => void;
};

const DashboardSettingsContext = createContext<DashboardSettingsState | null>(
  null
);

function readTheme(): ThemeId {
  if (typeof window === "undefined") return DEFAULT_THEME;
  const v = localStorage.getItem(STORAGE_KEYS.theme);
  if (v && THEME_BG[v as ThemeId]) return v as ThemeId;
  return DEFAULT_THEME;
}

function readFontSize(): FontSizeId {
  if (typeof window === "undefined") return DEFAULT_FONT_SIZE;
  const v = localStorage.getItem(STORAGE_KEYS.fontSize);
  if (v === "small" || v === "medium" || v === "large") return v;
  return DEFAULT_FONT_SIZE;
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
};

export function DashboardThemeWrapper({ children }: DashboardThemeWrapperProps) {
  const [theme, setThemeState] = useState<ThemeId>(DEFAULT_THEME);
  const [fontSize, setFontSizeState] = useState<FontSizeId>(DEFAULT_FONT_SIZE);

  useEffect(() => {
    setThemeState(readTheme());
    setFontSizeState(readFontSize());
  }, []);

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

  const value = useMemo(
    () => ({
      theme,
      fontSize,
      setTheme,
      setFontSize,
    }),
    [theme, fontSize, setTheme, setFontSize]
  );

  const bg = THEME_BG[theme];
  const isDark = theme === "dark";

  return (
    <DashboardSettingsContext.Provider value={value}>
      <div
        data-theme={theme}
        data-font-size={fontSize}
        className="flex h-screen overflow-hidden dashboard-theme-root"
        style={{
          background: bg,
          color: isDark ? "#ededed" : undefined,
        }}
      >
        {children}
      </div>
    </DashboardSettingsContext.Provider>
  );
}
