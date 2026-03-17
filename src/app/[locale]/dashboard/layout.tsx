import { setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { DashboardThemeWrapper } from "@/components/dashboard/DashboardSettingsContext";
import type { Class } from "@/types/database";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function DashboardLayout({ children, params }: Props) {
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

  const { data: classes = [] } = await supabase
    .from("classes")
    .select("*")
    .eq("teacher_id", session.user.id)
    .order("created_at", { ascending: false });

  return (
    <DashboardThemeWrapper locale={locale}>
      <Sidebar
        locale={locale}
        classes={(classes as Class[]) || []}
        profileName={profile?.full_name ?? null}
        userEmail={session.user.email ?? null}
      />
      <main className="flex-1 overflow-auto">{children}</main>
    </DashboardThemeWrapper>
  );
}
