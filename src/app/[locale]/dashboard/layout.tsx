import { setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { DashboardThemeWrapper } from "@/components/dashboard/DashboardSettingsContext";
import { DashboardTimerProvider } from "@/components/dashboard/DashboardTimerContext";
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

  const classList = (classes as Class[]) || [];

  return (
    <DashboardThemeWrapper locale={locale}>
      <DashboardMfaGate>
        <DashboardOnboardingOverlay needsOnboarding={needsOnboarding} locale={locale}>
          <DashboardTimerProvider>
            <div className="flex h-full min-h-screen w-full flex-col">
              <DashboardHeader
                locale={locale}
                profileName={profile?.full_name ?? null}
                userEmail={session.user.email ?? null}
                avatarUrl={profile?.avatar_url ?? null}
              />
              <DashboardShell
                sidebar={<Sidebar locale={locale} classes={classList} />}
              >
                {children}
              </DashboardShell>
            </div>
          </DashboardTimerProvider>
        </DashboardOnboardingOverlay>
      </DashboardMfaGate>
    </DashboardThemeWrapper>
  );
}
