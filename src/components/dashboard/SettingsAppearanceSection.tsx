"use client";

import { useTranslations } from "next-intl";
import { useDashboardSettings } from "@/components/dashboard/DashboardSettingsContext";
import {
  THEME_IDS,
  FONT_SIZE_IDS,
  type ThemeId,
  type FontSizeId,
} from "@/lib/theme-constants";

const THEME_TRANSLATION_KEYS: Record<ThemeId, string> = {
  light: "themeLight",
  dark: "themeDark",
  system: "themeSystem",
};

const FONT_SIZE_KEYS: Record<FontSizeId, string> = {
  small: "fontSizeSmall",
  medium: "fontSizeMedium",
  large: "fontSizeLarge",
};

export function SettingsAppearanceSection() {
  const t = useTranslations("settings");
  const { theme, fontSize, iconAnimation, setTheme, setFontSize, setIconAnimation } =
    useDashboardSettings();

  return (
    <>
      <section
        className="mt-6 rounded-lg border p-4"
        style={{
          backgroundColor: "var(--dashboard-card)",
          borderColor: "var(--dashboard-border)",
          color: "var(--dashboard-text)",
        }}
      >
        <h2
          className="text-sm font-medium uppercase tracking-wider"
          style={{ color: "var(--dashboard-text-muted)" }}
        >
          {t("appearance")}
        </h2>

        <div className="mt-4">
          <h3 className="text-sm font-medium" style={{ color: "var(--dashboard-text)" }}>
            {t("background")}
          </h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {THEME_IDS.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => setTheme(id)}
                className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                  theme === id
                    ? "border-green-500 bg-green-500/10 text-green-400 ring-1 ring-green-500"
                    : "border-[var(--dashboard-border)] bg-[var(--dashboard-card)] hover:opacity-90"
                }`}
                style={{
                  color: theme === id ? undefined : "var(--dashboard-text)",
                }}
              >
                {t(THEME_TRANSLATION_KEYS[id])}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-sm font-medium" style={{ color: "var(--dashboard-text)" }}>
            {t("fontSize")}
          </h3>
          <div className="mt-2 flex items-center gap-3">
            <input
              type="range"
              min={0}
              max={2}
              step={1}
              value={FONT_SIZE_IDS.indexOf(fontSize)}
              onChange={(e) => setFontSize(FONT_SIZE_IDS[Number(e.target.value)])}
              className="h-2 w-32 flex-shrink-0 accent-green-500"
            />
            <span className="text-sm" style={{ color: "var(--dashboard-text-muted)" }}>
              {t(FONT_SIZE_KEYS[fontSize])}
            </span>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-sm font-medium" style={{ color: "var(--dashboard-text)" }}>
            {t("iconAnimations")}
          </h3>
          <label className="mt-2 flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={iconAnimation}
              onChange={(e) => setIconAnimation(e.target.checked)}
              className="h-4 w-4 rounded border accent-green-500"
              style={{ borderColor: "var(--dashboard-border)" }}
            />
            <span className="text-sm" style={{ color: "var(--dashboard-text)" }}>
              {t("iconAnimationsDescription")}
            </span>
          </label>
        </div>
      </section>
    </>
  );
}
