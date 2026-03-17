import { useTranslations } from "next-intl";
import type { Class } from "@/types/database";

type ClassCardProps = {
  classItem: Class;
};

export function ClassCard({ classItem }: ClassCardProps) {
  const t = useTranslations("class");

  const created = new Date(classItem.created_at);
  const dateStr = created.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow">
      <h3 className="truncate text-lg font-semibold text-gray-900">
        {classItem.name}
      </h3>
      <dl className="mt-2 space-y-1 text-sm text-gray-600">
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
