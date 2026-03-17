import { useTranslations, useLocale } from "next-intl";
import type { Class } from "@/types/database";
import { getClassIcon } from "@/lib/class-icon-options";

type ClassCardProps = {
  classItem: Class;
  onClick?: () => void;
};

export function ClassCard({ classItem, onClick }: ClassCardProps) {
  const t = useTranslations("class");
  const locale = useLocale();
  const Icon = getClassIcon(classItem.icon_id);
  const accentColor = classItem.color_hex || "var(--dashboard-border)";

  const created = new Date(classItem.created_at);
  const dateStr = created.toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const card = (
    <div
      className="rounded-lg border-l-4 border p-4 shadow-sm transition-shadow hover:shadow-md"
      style={{
        backgroundColor: "var(--dashboard-card)",
        borderColor: "var(--dashboard-border)",
        borderLeftColor: accentColor,
        color: "var(--dashboard-text)",
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${accentColor}25` }}
        >
          {Icon && <Icon className="h-5 w-5" style={{ color: accentColor }} />}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-lg font-semibold" style={{ color: "var(--dashboard-text)" }}>
            {classItem.name}
          </h3>
          {classItem.description && (
            <p className="mt-0.5 line-clamp-2 text-sm" style={{ color: "var(--dashboard-text-muted)" }}>
              {classItem.description}
            </p>
          )}
        </div>
      </div>
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

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="w-full cursor-pointer rounded-lg text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[var(--dashboard-card)]"
        style={{ padding: 0, border: "none", background: "none" }}
      >
        {card}
      </button>
    );
  }
  return card;
}
