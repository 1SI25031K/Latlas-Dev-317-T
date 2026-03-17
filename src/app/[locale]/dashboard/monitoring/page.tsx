import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";

type Props = { params: Promise<{ locale: string }> };

export default async function MonitoringPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("monitoring");

  return (
    <div className="p-6" style={{ color: "var(--dashboard-text)" }}>
      <header className="mb-6">
        <h1 className="text-2xl font-semibold" style={{ color: "var(--dashboard-text)" }}>
          {t("title")}
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--dashboard-text-muted)" }}>
          {t("subtitle")}
        </p>
      </header>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-lg border p-6"
            style={{
              backgroundColor: "var(--dashboard-card)",
              borderColor: "var(--dashboard-border)",
            }}
          >
            <div
              className="mb-3 h-4 w-3/4 rounded"
              style={{ backgroundColor: "var(--dashboard-border)" }}
            />
            <div
              className="mb-2 h-3 w-full rounded opacity-80"
              style={{ backgroundColor: "var(--dashboard-border)" }}
            />
            <div
              className="mb-2 h-3 w-5/6 rounded opacity-80"
              style={{ backgroundColor: "var(--dashboard-border)" }}
            />
            <div
              className="h-3 w-4/6 rounded opacity-80"
              style={{ backgroundColor: "var(--dashboard-border)" }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
