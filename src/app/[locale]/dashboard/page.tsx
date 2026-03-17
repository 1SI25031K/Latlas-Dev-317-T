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

  const { data: classesData } = await supabase
    .from("classes")
    .select("*")
    .eq("teacher_id", session.user.id)
    .order("created_at", { ascending: false });

  const classes = (classesData ?? []) as Class[];
  const t = await getTranslations("dashboard");

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">{t("title")}</h1>
        <CreateClassForm />
      </div>
      {classes.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-600">
          <p className="font-medium">{t("noClasses")}</p>
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
