import { setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { DashboardThemeWrapper } from "@/components/dashboard/DashboardSettingsContext";
import { DashboardOnboardingOverlay } from "@/components/dashboard/DashboardOnboardingOverlay";
import { DashboardMfaGate } from "@/components/dashboard/DashboardMfaGate";
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
    .select("full_name, avatar_url, onboarding_completed_at")
    .eq("id", session.user.id)
    .single();

  const { data: classes = [] } = await supabase
    .from("classes")
    .select("*")
    .eq("teacher_id", session.user.id)
    .order("created_at", { ascending: false });

  const needsOnboarding = !profile?.onboarding_completed_at;

  return (
    <DashboardThemeWrapper locale={locale}>
      <DashboardMfaGate>
        <DashboardOnboardingOverlay needsOnboarding={needsOnboarding} locale={locale}>
          <Sidebar
          locale={locale}
          classes={(classes as Class[]) || []}
          profileName={profile?.full_name ?? null}
          userEmail={session.user.email ?? null}
          avatarUrl={profile?.avatar_url ?? null}
        />
        <main className="flex-1 overflow-auto">{children}</main>
        </DashboardOnboardingOverlay>
      </DashboardMfaGate>
    </DashboardThemeWrapper>
  );
}
