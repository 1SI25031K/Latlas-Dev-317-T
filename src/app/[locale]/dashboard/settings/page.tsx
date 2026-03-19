import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { SettingsAppearanceSection } from "@/components/dashboard/SettingsAppearanceSection";
import { SettingsLanguageSelect } from "@/components/dashboard/SettingsLanguageSelect";
import { SettingsAccountPreview } from "@/components/dashboard/SettingsAccountPreview";
import { profileGreetingName } from "@/lib/profile-display";

type Props = { params: Promise<{ locale: string }> };

export default async function SettingsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("settings");

  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  let displayName: string | null = null;
  let avatarUrl: string | null = null;

  if (session?.user.id) {
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
    if (profile) {
      displayName = profileGreetingName(
        (profile as { first_name?: string | null }).first_name,
        (profile as { middle_name?: string | null }).middle_name,
        (profile as { last_name?: string | null }).last_name,
        (profile as { full_name?: string | null }).full_name ?? null
      );
      avatarUrl = (profile as { avatar_url?: string | null }).avatar_url ?? null;
    }
  }

  return (
    <div className="p-6" style={{ color: "var(--dashboard-text)" }}>
      <h1 className="text-2xl font-semibold" style={{ color: "var(--dashboard-text)" }}>
        {t("title")}
      </h1>

      <SettingsAccountPreview
        displayName={displayName}
        email={session?.user.email ?? null}
        avatarUrl={avatarUrl}
      />

      <section
        className="mt-6 rounded-lg border p-4"
        style={{
          backgroundColor: "var(--dashboard-card)",
          borderColor: "var(--dashboard-border)",
        }}
      >
        <h2
          className="text-sm font-medium uppercase tracking-wider"
          style={{ color: "var(--dashboard-text-muted)" }}
        >
          {t("language")}
        </h2>
        <SettingsLanguageSelect />
      </section>

      <SettingsAppearanceSection />
    </div>
  );
}
