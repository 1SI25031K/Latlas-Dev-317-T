import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";

type Props = { params: Promise<{ locale: string }> };

export default async function MonitoringPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("monitoring");

  return (
    <div className="p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">{t("title")}</h1>
        <p className="mt-1 text-gray-600">{t("subtitle")}</p>
      </header>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg border border-gray-200 bg-white p-6 animate-pulse"
          >
            <div className="mb-3 h-4 w-3/4 rounded bg-gray-200" />
            <div className="mb-2 h-3 w-full rounded bg-gray-100" />
            <div className="mb-2 h-3 w-5/6 rounded bg-gray-100" />
            <div className="h-3 w-4/6 rounded bg-gray-100" />
          </div>
        ))}
      </div>
    </div>
  );
}
