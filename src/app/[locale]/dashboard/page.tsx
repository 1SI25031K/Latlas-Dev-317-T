import { setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ClassCard } from "@/components/dashboard/ClassCard";
import { CreateClassForm } from "@/components/dashboard/CreateClassForm";
import type { Class } from "@/types/database";

type Props = { params: Promise<{ locale: string }> };

export default async function DashboardPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect(`/${locale}/login`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", session.user.id)
    .single();

  const { data: classesData } = await supabase
    .from("classes")
    .select("*")
    .eq("teacher_id", session.user.id)
    .order("created_at", { ascending: false });

  const classes = (classesData ?? []) as Class[];
  const t = await getTranslations("dashboard");
  const displayName = profile?.full_name || session.user.email || t("profile");

  return (
    <div className="p-6" style={{ color: "var(--dashboard-text)" }}>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: "var(--dashboard-text)" }}>
            {t("greeting", { name: displayName })}
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--dashboard-text-muted)" }}>
            {t("title")}
          </p>
        </div>
        <CreateClassForm />
      </div>
      {classes.length === 0 ? (
        <div
          className="rounded-lg border p-8 text-center transition-shadow"
          style={{
            backgroundColor: "var(--dashboard-card)",
            borderColor: "var(--dashboard-border)",
            color: "var(--dashboard-text-muted)",
          }}
        >
          <p className="font-medium" style={{ color: "var(--dashboard-text)" }}>
            {t("noClasses")}
          </p>
          <p className="mt-1 text-sm">{t("createFirstClass")}</p>
          <div className="mt-4">
            <CreateClassForm />
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {classes.map((c) => (
            <ClassCard key={c.id} classItem={c} />
          ))}
        </div>
      )}
    </div>
  );
}
