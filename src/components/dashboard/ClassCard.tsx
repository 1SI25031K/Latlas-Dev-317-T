import { useTranslations, useLocale } from "next-intl";
import type { Class } from "@/types/database";

type ClassCardProps = {
  classItem: Class;
};

export function ClassCard({ classItem }: ClassCardProps) {
  const t = useTranslations("class");
  const locale = useLocale();

  const created = new Date(classItem.created_at);
  const dateStr = created.toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div
      className="rounded-lg border p-4 shadow-sm transition-shadow hover:shadow-md"
      style={{
        backgroundColor: "var(--dashboard-card)",
        borderColor: "var(--dashboard-border)",
        color: "var(--dashboard-text)",
      }}
    >
      <h3 className="truncate text-lg font-semibold" style={{ color: "var(--dashboard-text)" }}>
        {classItem.name}
      </h3>
      <dl className="mt-2 space-y-1 text-sm" style={{ color: "var(--dashboard-text-muted)" }}>
        <div className="flex items-center gap-2">
          <dt className="font-medium">{t("accessCode")}:</dt>
          <dd className="font-mono">{classItem.access_code}</dd>
        </div>
        <div className="flex items-center gap-2">
          <dt className="font-medium">{t("createdAt")}:</dt>
          <dd>{dateStr}</dd>
        </div>
      </dl>
    </div>
  );
}
