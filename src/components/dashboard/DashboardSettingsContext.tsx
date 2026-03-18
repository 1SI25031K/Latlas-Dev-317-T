"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
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
  DEFAULT_HEADER_CLOCK_FONT_ID,
  DEFAULT_HEADER_CLOCK_24_HOUR,
  DEFAULT_HEADER_CLOCK_SHOW_SECONDS,
  DEFAULT_HEADER_CLOCK_LARGE,
  DEFAULT_HEADER_CLOCK_VISIBLE,
  type ThemeId,
  type FontSizeId,
  type ResolvedThemeId,
  type BackgroundMode,
} from "@/lib/theme-constants";
import { clampClockFontId, type HeaderClockFontId } from "@/lib/header-clock";
import {
  parseDashboardUiSettings,
  mergeDashboardUiState,
  mergeDashboardUiStateForHydration,
  applyDashboardUiSettingsToStorage,
} from "@/lib/dashboard-ui-settings";
import { persistDashboardUiSettings } from "@/app/actions/dashboard-ui-settings";

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
  clockFontId: HeaderClockFontId;
  setClockFontId: (v: HeaderClockFontId) => void;
  clock24Hour: boolean;
  setClock24Hour: (v: boolean) => void;
  clockShowSeconds: boolean;
  setClockShowSeconds: (v: boolean) => void;
  clockLarge: boolean;
  setClockLarge: (v: boolean) => void;
  clockVisible: boolean;
  setClockVisible: (v: boolean) => void;
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

function readClockFontId(): HeaderClockFontId {
  if (typeof window === "undefined") return DEFAULT_HEADER_CLOCK_FONT_ID;
  const v = localStorage.getItem(STORAGE_KEYS.headerClockFont);
  const n = v != null ? parseInt(v, 10) : NaN;
  return Number.isFinite(n) ? clampClockFontId(n) : DEFAULT_HEADER_CLOCK_FONT_ID;
}

function readClock24Hour(): boolean {
  if (typeof window === "undefined") return DEFAULT_HEADER_CLOCK_24_HOUR;
  const v = localStorage.getItem(STORAGE_KEYS.headerClock24Hour);
  if (v === "false") return false;
  if (v === "true") return true;
  return DEFAULT_HEADER_CLOCK_24_HOUR;
}

function readClockShowSeconds(): boolean {
  if (typeof window === "undefined") return DEFAULT_HEADER_CLOCK_SHOW_SECONDS;
  const v = localStorage.getItem(STORAGE_KEYS.headerClockShowSeconds);
  if (v === "true") return true;
  if (v === "false") return false;
  return DEFAULT_HEADER_CLOCK_SHOW_SECONDS;
}

function readClockLarge(): boolean {
  if (typeof window === "undefined") return DEFAULT_HEADER_CLOCK_LARGE;
  const v = localStorage.getItem(STORAGE_KEYS.headerClockLarge);
  if (v === "true") return true;
  if (v === "false") return false;
  return DEFAULT_HEADER_CLOCK_LARGE;
}

function readClockVisible(): boolean {
  if (typeof window === "undefined") return DEFAULT_HEADER_CLOCK_VISIBLE;
  const v = localStorage.getItem(STORAGE_KEYS.headerClockVisible);
  if (v === "false") return false;
  if (v === "true") return true;
  return DEFAULT_HEADER_CLOCK_VISIBLE;
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
  /** Raw JSON from profiles.dashboard_ui_settings */
  initialDashboardUiSettings?: unknown;
};

const PERSIST_DEBOUNCE_MS = 500;
const PERSIST_READY_MS = 400;

export function DashboardThemeWrapper({
  children,
  locale,
  initialDashboardUiSettings,
}: DashboardThemeWrapperProps) {
  const parsedServer = useMemo(
    () => parseDashboardUiSettings(initialDashboardUiSettings),
    [initialDashboardUiSettings]
  );

  const initialMerged = useMemo(
    () => mergeDashboardUiStateForHydration(parsedServer),
    [parsedServer]
  );

  function hydrationResolvedTheme(t: ThemeId): ResolvedThemeId {
    if (t === "light" || t === "dark") return t;
    return "light";
  }

  const [theme, setThemeState] = useState<ThemeId>(initialMerged.theme);
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedThemeId>(() =>
    hydrationResolvedTheme(initialMerged.theme)
  );
  const [fontSize, setFontSizeState] = useState<FontSizeId>(DEFAULT_FONT_SIZE);
  const [iconAnimation, setIconAnimationState] =
    useState<boolean>(DEFAULT_ICON_ANIMATION);
  const [backgroundMode, setBackgroundModeState] = useState<BackgroundMode>(
    initialMerged.backgroundMode
  );
  const [backgroundColor, setBackgroundColorState] = useState<string>(
    initialMerged.backgroundColor
  );
  const [sidebarCollapsed, setSidebarCollapsedState] =
    useState<boolean>(DEFAULT_SIDEBAR_COLLAPSED);
  const [clockFontId, setClockFontIdState] = useState<HeaderClockFontId>(
    initialMerged.clockFontId
  );
  const [clock24Hour, setClock24HourState] = useState<boolean>(
    initialMerged.clock24Hour
  );
  const [clockShowSeconds, setClockShowSecondsState] = useState<boolean>(
    initialMerged.clockShowSeconds
  );
  const [clockLarge, setClockLargeState] = useState<boolean>(
    initialMerged.clockLarge
  );
  const [clockVisible, setClockVisibleState] = useState<boolean>(
    initialMerged.clockVisible
  );

  const persistReadyRef = useRef(false);
  const persistTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useLayoutEffect(() => {
    if (parsedServer) {
      applyDashboardUiSettingsToStorage(parsedServer);
      setResolvedTheme(
        getResolvedTheme(mergeDashboardUiStateForHydration(parsedServer).theme)
      );
    } else {
      const m = mergeDashboardUiState(null);
      setThemeState(m.theme);
      setBackgroundModeState(m.backgroundMode);
      setBackgroundColorState(m.backgroundColor);
      setClockFontIdState(m.clockFontId);
      setClock24HourState(m.clock24Hour);
      setClockShowSecondsState(m.clockShowSeconds);
      setClockLargeState(m.clockLarge);
      setClockVisibleState(m.clockVisible);
      setResolvedTheme(getResolvedTheme(m.theme));
    }
  }, [parsedServer]);

  useEffect(() => {
    setFontSizeState(readFontSize());
    setIconAnimationState(readIconAnimation());
    setSidebarCollapsedState(readSidebarCollapsed());
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      persistReadyRef.current = true;
    }, PERSIST_READY_MS);
    return () => clearTimeout(t);
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

  const queuePersist = useCallback(() => {
    if (!persistReadyRef.current) return;
    if (persistTimerRef.current) clearTimeout(persistTimerRef.current);
    persistTimerRef.current = setTimeout(() => {
      persistTimerRef.current = null;
      void persistDashboardUiSettings({
        theme,
        backgroundMode,
        backgroundColor,
        clockFontId,
        clock24Hour,
        clockShowSeconds,
        clockLarge,
        clockVisible,
      });
    }, PERSIST_DEBOUNCE_MS);
  }, [
    theme,
    backgroundMode,
    backgroundColor,
    clockFontId,
    clock24Hour,
    clockShowSeconds,
    clockLarge,
    clockVisible,
  ]);

  useEffect(() => {
    queuePersist();
    return () => {
      if (persistTimerRef.current) clearTimeout(persistTimerRef.current);
    };
  }, [queuePersist]);

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

  const setClockFontId = useCallback((v: HeaderClockFontId) => {
    setClockFontIdState(v);
    try {
      localStorage.setItem(STORAGE_KEYS.headerClockFont, String(v));
    } catch {}
  }, []);

  const setClock24Hour = useCallback((v: boolean) => {
    setClock24HourState(v);
    try {
      localStorage.setItem(STORAGE_KEYS.headerClock24Hour, v ? "true" : "false");
    } catch {}
  }, []);

  const setClockShowSeconds = useCallback((v: boolean) => {
    setClockShowSecondsState(v);
    try {
      localStorage.setItem(STORAGE_KEYS.headerClockShowSeconds, v ? "true" : "false");
    } catch {}
  }, []);

  const setClockLarge = useCallback((v: boolean) => {
    setClockLargeState(v);
    try {
      localStorage.setItem(STORAGE_KEYS.headerClockLarge, v ? "true" : "false");
    } catch {}
  }, []);

  const setClockVisible = useCallback((v: boolean) => {
    setClockVisibleState(v);
    try {
      localStorage.setItem(STORAGE_KEYS.headerClockVisible, v ? "true" : "false");
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
      clockFontId,
      setClockFontId,
      clock24Hour,
      setClock24Hour,
      clockShowSeconds,
      setClockShowSeconds,
      clockLarge,
      setClockLarge,
      clockVisible,
      setClockVisible,
    }),
    [
      theme,
      resolvedTheme,
      fontSize,
      iconAnimation,
      backgroundMode,
      backgroundColor,
      sidebarCollapsed,
      clockFontId,
      clock24Hour,
      clockShowSeconds,
      clockLarge,
      clockVisible,
      setTheme,
      setFontSize,
      setIconAnimation,
      setBackgroundMode,
      setBackgroundColor,
      setSidebarCollapsed,
      setClockFontId,
      setClock24Hour,
      setClockShowSeconds,
      setClockLarge,
      setClockVisible,
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
