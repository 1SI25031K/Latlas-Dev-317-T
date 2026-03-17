import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { SettingsAppearanceSection } from "@/components/dashboard/SettingsAppearanceSection";

type Props = { params: Promise<{ locale: string }> };

export default async function SettingsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("settings");
  const tLocale = await getTranslations("locale");

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-900">{t("title")}</h1>

      <section className="mt-6 rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="text-sm font-medium uppercase tracking-wider text-gray-500">
          {t("language")}
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          {locale === "ja" ? tLocale("ja") : tLocale("en")}
        </p>
        <div className="mt-3 flex gap-2">
          <Link
            href="/dashboard/settings"
            locale="ja"
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {tLocale("ja")}
          </Link>
          <Link
            href="/dashboard/settings"
            locale="en"
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {tLocale("en")}
          </Link>
        </div>
      </section>

      <SettingsAppearanceSection />
    </div>
  );
}
