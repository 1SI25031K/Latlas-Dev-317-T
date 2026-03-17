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
  const { theme, fontSize, setTheme, setFontSize } = useDashboardSettings();

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
                    ? "border-blue-500 bg-blue-500/10 text-blue-400 ring-1 ring-blue-500"
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
          <div className="mt-2 flex gap-2">
            {FONT_SIZE_IDS.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => setFontSize(id)}
                className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                  fontSize === id
                    ? "border-blue-500 bg-blue-500/10 text-blue-400 ring-1 ring-blue-500"
                    : "border-[var(--dashboard-border)] bg-[var(--dashboard-card)] hover:opacity-90"
                }`}
                style={{
                  color: fontSize === id ? undefined : "var(--dashboard-text)",
                }}
              >
                {t(FONT_SIZE_KEYS[id])}
              </button>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
