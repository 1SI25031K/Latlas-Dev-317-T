"use client";

import { useTranslations } from "next-intl";
import { useDashboardSettings } from "@/components/dashboard/DashboardSettingsContext";
import {
  THEME_IDS,
  FONT_SIZE_IDS,
  THEME_BG,
  type ThemeId,
  type FontSizeId,
} from "@/lib/theme-constants";

const THEME_TRANSLATION_KEYS: Record<ThemeId, string> = {
  light: "themeLight",
  dark: "themeDark",
  gray: "themeGray",
  blue: "themeBlue",
  green: "themeGreen",
  teal: "themeTeal",
  red: "themeRed",
  orange: "themeOrange",
  yellow: "themeYellow",
  amber: "themeAmber",
  purple: "themePurple",
  pink: "themePink",
  indigo: "themeIndigo",
  cyan: "themeCyan",
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
      <section className="mt-6 rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="text-sm font-medium uppercase tracking-wider text-gray-500">
          {t("appearance")}
        </h2>

        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-700">{t("background")}</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {THEME_IDS.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => setTheme(id)}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                  theme === id
                    ? "border-blue-600 bg-blue-50 text-blue-700 ring-1 ring-blue-600"
                    : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span
                  className="h-4 w-4 shrink-0 rounded-full border border-gray-300"
                  style={{ background: THEME_BG[id] }}
                />
                {t(THEME_TRANSLATION_KEYS[id])}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-700">{t("fontSize")}</h3>
          <div className="mt-2 flex gap-2">
            {FONT_SIZE_IDS.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => setFontSize(id)}
                className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                  fontSize === id
                    ? "border-blue-600 bg-blue-50 text-blue-700 ring-1 ring-blue-600"
                    : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                }`}
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
