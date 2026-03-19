import { setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ClassListWithDetail } from "@/components/dashboard/ClassListWithDetail";
import { CreateClassForm } from "@/components/dashboard/CreateClassForm";
import type { Class } from "@/types/database";
import { profileGreetingName } from "@/lib/profile-display";

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
    .select("*")
    .eq("id", session.user.id)
    .single();

  const { data: classesData } = await supabase
    .from("classes")
    .select("*")
    .eq("teacher_id", session.user.id)
    .order("created_at", { ascending: false });

  const classes = (classesData ?? []) as Class[];
  const t = await getTranslations("dashboard");
  const displayName =
    profileGreetingName(
      (profile as { first_name?: string | null })?.first_name,
      (profile as { middle_name?: string | null })?.middle_name,
      (profile as { last_name?: string | null })?.last_name,
      profile?.full_name ?? null
    ) ||
    session.user.email ||
    t("profile");

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
        <ClassListWithDetail classes={classes} />
      )}
    </div>
  );
}
