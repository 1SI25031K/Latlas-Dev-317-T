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
    <div className="p-6" style={{ color: "var(--dashboard-text)" }}>
      <h1 className="text-2xl font-semibold" style={{ color: "var(--dashboard-text)" }}>
        {t("title")}
      </h1>

      <section
        className="mt-6 rounded-lg border p-4"
        style={{
          backgroundColor: "var(--dashboard-card)",
          borderColor: "var(--dashboard-border)",
        }}
      >
        <h2
          className="text-sm font-medium uppercase tracking-wider"
          style={{ color: "var(--dashboard-text-muted)" }}
        >
          {t("language")}
        </h2>
        <p className="mt-1 text-sm" style={{ color: "var(--dashboard-text-muted)" }}>
          {locale === "ja" ? tLocale("ja") : tLocale("en")}
        </p>
        <div className="mt-3 flex gap-2">
          <Link
            href="/dashboard/settings"
            locale="ja"
            className="rounded-lg border px-3 py-2 text-sm font-medium transition-colors hover:opacity-90"
            style={{
              backgroundColor: "var(--dashboard-card)",
              borderColor: "var(--dashboard-border)",
              color: "var(--dashboard-text)",
            }}
          >
            {tLocale("ja")}
          </Link>
          <Link
            href="/dashboard/settings"
            locale="en"
            className="rounded-lg border px-3 py-2 text-sm font-medium transition-colors hover:opacity-90"
            style={{
              backgroundColor: "var(--dashboard-card)",
              borderColor: "var(--dashboard-border)",
              color: "var(--dashboard-text)",
            }}
          >
            {tLocale("en")}
          </Link>
        </div>
      </section>

      <SettingsAppearanceSection />
    </div>
  );
}
