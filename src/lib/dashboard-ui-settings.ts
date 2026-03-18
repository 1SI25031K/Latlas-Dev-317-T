import {
  STORAGE_KEYS,
  DEFAULT_THEME,
  DEFAULT_BACKGROUND_MODE,
  DEFAULT_SOLID_BACKGROUND_COLOR,
  DEFAULT_HEADER_CLOCK_FONT_ID,
  DEFAULT_HEADER_CLOCK_24_HOUR,
  DEFAULT_HEADER_CLOCK_SHOW_SECONDS,
  DEFAULT_HEADER_CLOCK_LARGE,
  DEFAULT_HEADER_CLOCK_VISIBLE,
  type ThemeId,
  type BackgroundMode,
  BACKGROUND_MODES,
} from "@/lib/theme-constants";
import { clampClockFontId, type HeaderClockFontId } from "@/lib/header-clock";

export type DashboardUiSettingsPersisted = {
  theme?: ThemeId;
  backgroundMode?: BackgroundMode;
  backgroundColor?: string;
  clockFontId?: HeaderClockFontId;
  clock24Hour?: boolean;
  clockShowSeconds?: boolean;
  clockLarge?: boolean;
  clockVisible?: boolean;
};

function isThemeId(v: unknown): v is ThemeId {
  return v === "light" || v === "dark" || v === "system";
}

function isBackgroundMode(v: unknown): v is BackgroundMode {
  return typeof v === "string" && (BACKGROUND_MODES as readonly string[]).includes(v);
}

export function parseDashboardUiSettings(raw: unknown): DashboardUiSettingsPersisted | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const out: DashboardUiSettingsPersisted = {};
  if (isThemeId(o.theme)) out.theme = o.theme;
  if (isBackgroundMode(o.backgroundMode)) out.backgroundMode = o.backgroundMode;
  if (typeof o.backgroundColor === "string" && o.backgroundColor.trim()) {
    out.backgroundColor = o.backgroundColor.trim();
  }
  if (typeof o.clockFontId === "number" && Number.isFinite(o.clockFontId)) {
    out.clockFontId = clampClockFontId(o.clockFontId);
  }
  if (typeof o.clock24Hour === "boolean") out.clock24Hour = o.clock24Hour;
  if (typeof o.clockShowSeconds === "boolean") out.clockShowSeconds = o.clockShowSeconds;
  if (typeof o.clockLarge === "boolean") out.clockLarge = o.clockLarge;
  if (typeof o.clockVisible === "boolean") out.clockVisible = o.clockVisible;
  return Object.keys(out).length ? out : null;
}

export function applyDashboardUiSettingsToStorage(s: DashboardUiSettingsPersisted): void {
  try {
    if (s.theme) localStorage.setItem(STORAGE_KEYS.theme, s.theme);
    if (s.backgroundMode) localStorage.setItem(STORAGE_KEYS.backgroundMode, s.backgroundMode);
    if (s.backgroundColor) localStorage.setItem(STORAGE_KEYS.backgroundColor, s.backgroundColor);
    if (s.clockFontId !== undefined)
      localStorage.setItem(STORAGE_KEYS.headerClockFont, String(s.clockFontId));
    if (s.clock24Hour !== undefined)
      localStorage.setItem(STORAGE_KEYS.headerClock24Hour, s.clock24Hour ? "true" : "false");
    if (s.clockShowSeconds !== undefined)
      localStorage.setItem(
        STORAGE_KEYS.headerClockShowSeconds,
        s.clockShowSeconds ? "true" : "false"
      );
    if (s.clockLarge !== undefined)
      localStorage.setItem(STORAGE_KEYS.headerClockLarge, s.clockLarge ? "true" : "false");
    if (s.clockVisible !== undefined)
      localStorage.setItem(STORAGE_KEYS.headerClockVisible, s.clockVisible ? "true" : "false");
  } catch {
    /* ignore */
  }
}

export function collectDashboardUiSettingsFromStorage(): DashboardUiSettingsPersisted {
  if (typeof window === "undefined") return {};
  const theme = localStorage.getItem(STORAGE_KEYS.theme);
  const backgroundMode = localStorage.getItem(STORAGE_KEYS.backgroundMode);
  const backgroundColor = localStorage.getItem(STORAGE_KEYS.backgroundColor);
  const clockFont = localStorage.getItem(STORAGE_KEYS.headerClockFont);
  const out: DashboardUiSettingsPersisted = {};
  if (isThemeId(theme)) out.theme = theme;
  if (isBackgroundMode(backgroundMode)) out.backgroundMode = backgroundMode;
  if (backgroundColor?.trim()) out.backgroundColor = backgroundColor.trim();
  const n = clockFont != null ? parseInt(clockFont, 10) : NaN;
  if (Number.isFinite(n)) out.clockFontId = clampClockFontId(n);
  const c24 = localStorage.getItem(STORAGE_KEYS.headerClock24Hour);
  if (c24 === "true" || c24 === "false") out.clock24Hour = c24 === "true";
  const cs = localStorage.getItem(STORAGE_KEYS.headerClockShowSeconds);
  if (cs === "true" || cs === "false") out.clockShowSeconds = cs === "true";
  const cl = localStorage.getItem(STORAGE_KEYS.headerClockLarge);
  if (cl === "true" || cl === "false") out.clockLarge = cl === "true";
  const cv = localStorage.getItem(STORAGE_KEYS.headerClockVisible);
  if (cv === "true" || cv === "false") out.clockVisible = cv === "true";
  return out;
}

/** Server + client first paint: no localStorage (avoids hydration mismatch). */
export function mergeDashboardUiStateForHydration(
  parsed: DashboardUiSettingsPersisted | null
): {
  theme: ThemeId;
  backgroundMode: BackgroundMode;
  backgroundColor: string;
  clockFontId: HeaderClockFontId;
  clock24Hour: boolean;
  clockShowSeconds: boolean;
  clockLarge: boolean;
  clockVisible: boolean;
} {
  return {
    theme: parsed?.theme ?? DEFAULT_THEME,
    backgroundMode: parsed?.backgroundMode ?? DEFAULT_BACKGROUND_MODE,
    backgroundColor: parsed?.backgroundColor ?? DEFAULT_SOLID_BACKGROUND_COLOR,
    clockFontId: parsed?.clockFontId ?? DEFAULT_HEADER_CLOCK_FONT_ID,
    clock24Hour: parsed?.clock24Hour ?? DEFAULT_HEADER_CLOCK_24_HOUR,
    clockShowSeconds: parsed?.clockShowSeconds ?? DEFAULT_HEADER_CLOCK_SHOW_SECONDS,
    clockLarge: parsed?.clockLarge ?? DEFAULT_HEADER_CLOCK_LARGE,
    clockVisible: parsed?.clockVisible ?? DEFAULT_HEADER_CLOCK_VISIBLE,
  };
}

export function mergeDashboardUiState(
  parsed: DashboardUiSettingsPersisted | null
): {
  theme: ThemeId;
  backgroundMode: BackgroundMode;
  backgroundColor: string;
  clockFontId: HeaderClockFontId;
  clock24Hour: boolean;
  clockShowSeconds: boolean;
  clockLarge: boolean;
  clockVisible: boolean;
} {
  const client = typeof window !== "undefined";
  return {
    theme: parsed?.theme ?? (client ? readThemeFromStorage() : DEFAULT_THEME),
    backgroundMode: parsed?.backgroundMode ?? (client ? readBgModeFromStorage() : DEFAULT_BACKGROUND_MODE),
    backgroundColor: parsed?.backgroundColor ?? (client ? readBgColorFromStorage() : DEFAULT_SOLID_BACKGROUND_COLOR),
    clockFontId: parsed?.clockFontId ?? (client ? readClockFontFromStorage() : DEFAULT_HEADER_CLOCK_FONT_ID),
    clock24Hour: parsed?.clock24Hour ?? (client ? readClock24FromStorage() : DEFAULT_HEADER_CLOCK_24_HOUR),
    clockShowSeconds:
      parsed?.clockShowSeconds ?? (client ? readClockSecFromStorage() : DEFAULT_HEADER_CLOCK_SHOW_SECONDS),
    clockLarge: parsed?.clockLarge ?? (client ? readClockLargeFromStorage() : DEFAULT_HEADER_CLOCK_LARGE),
    clockVisible: parsed?.clockVisible ?? (client ? readClockVisFromStorage() : DEFAULT_HEADER_CLOCK_VISIBLE),
  };
}

function readThemeFromStorage(): ThemeId {
  const v = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEYS.theme) : null;
  if (isThemeId(v)) return v;
  return DEFAULT_THEME;
}

function readBgModeFromStorage(): BackgroundMode {
  const v =
    typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEYS.backgroundMode) : null;
  if (isBackgroundMode(v)) return v;
  return DEFAULT_BACKGROUND_MODE;
}

function readBgColorFromStorage(): string {
  const v =
    typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEYS.backgroundColor) : null;
  if (typeof v === "string" && v.trim()) return v;
  return DEFAULT_SOLID_BACKGROUND_COLOR;
}

function readClockFontFromStorage(): HeaderClockFontId {
  const v =
    typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEYS.headerClockFont) : null;
  const n = v != null ? parseInt(v, 10) : NaN;
  return Number.isFinite(n) ? clampClockFontId(n) : DEFAULT_HEADER_CLOCK_FONT_ID;
}

function readClock24FromStorage(): boolean {
  const v =
    typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEYS.headerClock24Hour) : null;
  if (v === "false") return false;
  if (v === "true") return true;
  return DEFAULT_HEADER_CLOCK_24_HOUR;
}

function readClockSecFromStorage(): boolean {
  const v =
    typeof window !== "undefined"
      ? localStorage.getItem(STORAGE_KEYS.headerClockShowSeconds)
      : null;
  if (v === "true") return true;
  if (v === "false") return false;
  return DEFAULT_HEADER_CLOCK_SHOW_SECONDS;
}

function readClockLargeFromStorage(): boolean {
  const v =
    typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEYS.headerClockLarge) : null;
  if (v === "true") return true;
  if (v === "false") return false;
  return DEFAULT_HEADER_CLOCK_LARGE;
}

function readClockVisFromStorage(): boolean {
  const v =
    typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEYS.headerClockVisible) : null;
  if (v === "false") return false;
  if (v === "true") return true;
  return DEFAULT_HEADER_CLOCK_VISIBLE;
}
