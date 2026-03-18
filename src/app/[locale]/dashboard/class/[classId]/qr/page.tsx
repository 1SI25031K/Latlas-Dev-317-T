import { setRequestLocale } from "next-intl/server";
import { redirect, notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { ClassJoinQrCode } from "@/components/dashboard/ClassJoinQrCode";
import type { ClassSchedule } from "@/types/database";
import { isClassTermEnded } from "@/lib/class-term";

type Props = { params: Promise<{ locale: string; classId: string }> };

export default async function ClassQrPage({ params }: Props) {
  const { locale, classId } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("class");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/${locale}/login`);
  }

  const { data: row, error } = await supabase
    .from("classes")
    .select("id, access_code, teacher_id, schedule")
    .eq("id", classId)
    .single();

  if (error || !row || (row.teacher_id as string) !== user.id) {
    notFound();
  }

  const expired = isClassTermEnded(row.schedule as ClassSchedule | null);

  return (
    <div
      className="flex min-h-[50vh] flex-col items-center justify-center p-6"
      style={{ color: "var(--dashboard-text)" }}
    >
      <div
        className="rounded-2xl border p-6 shadow-lg"
        style={{
          backgroundColor: "var(--dashboard-card)",
          borderColor: "var(--dashboard-border)",
        }}
      >
        {expired ? (
          <p className="max-w-sm text-center text-sm" style={{ color: "var(--dashboard-text-muted)" }}>
            {t("expiredNoJoin")}
          </p>
        ) : (
          <ClassJoinQrCode accessCode={row.access_code} password={null} size={320} />
        )}
      </div>
    </div>
  );
}
