import { setRequestLocale } from "next-intl/server";
import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ClassJoinQrCode } from "@/components/dashboard/ClassJoinQrCode";

type Props = { params: Promise<{ locale: string; classId: string }> };

export default async function ClassQrPage({ params }: Props) {
  const { locale, classId } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/${locale}/login`);
  }

  const { data: row, error } = await supabase
    .from("classes")
    .select("id, access_code, teacher_id")
    .eq("id", classId)
    .single();

  if (error || !row || (row.teacher_id as string) !== user.id) {
    notFound();
  }

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
        <ClassJoinQrCode accessCode={row.access_code} password={null} size={320} />
      </div>
    </div>
  );
}
