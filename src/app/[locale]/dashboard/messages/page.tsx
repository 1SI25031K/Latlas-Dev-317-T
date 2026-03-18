import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";

type Props = { params: Promise<{ locale: string }> };

export default async function MessagesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("messagesPage");

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
      <div
        className="rounded-2xl border p-8 text-center text-sm"
        style={{
          backgroundColor: "var(--dashboard-card)",
          borderColor: "var(--dashboard-border)",
          color: "var(--dashboard-text-muted)",
        }}
      >
        {t("placeholder")}
      </div>
    </div>
  );
}
