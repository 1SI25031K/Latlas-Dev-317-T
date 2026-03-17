"use client";

import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { routing } from "@/i18n/routing";

export function SettingsLanguageSelect() {
  const t = useTranslations("locale");
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useLocale();

  const locales = routing.locales;

  return (
    <select
      value={currentLocale}
      onChange={(e) => {
        const nextLocale = e.target.value;
        router.replace(pathname, { locale: nextLocale });
      }}
      className="mt-2 w-full max-w-xs rounded-lg border px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
      style={{
        backgroundColor: "var(--dashboard-card)",
        borderColor: "var(--dashboard-border)",
        color: "var(--dashboard-text)",
      }}
    >
      {locales.map((locale) => (
        <option key={locale} value={locale}>
          {t(locale)}
        </option>
      ))}
    </select>
  );
}
