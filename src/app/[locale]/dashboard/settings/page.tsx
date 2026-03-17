import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { SettingsAppearanceSection } from "@/components/dashboard/SettingsAppearanceSection";
import { SettingsLanguageSelect } from "@/components/dashboard/SettingsLanguageSelect";
import { SettingsProfileSection } from "@/components/dashboard/SettingsProfileSection";

type Props = { params: Promise<{ locale: string }> };

export default async function SettingsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("settings");

  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const { data: profile } = session
    ? await supabase
        .from("profiles")
        .select("full_name, title, department, avatar_url, share_avatar_with_students, profile_updated_at")
        .eq("id", session.user.id)
        .single()
    : { data: null };

  return (
    <div className="p-6" style={{ color: "var(--dashboard-text)" }}>
      <h1 className="text-2xl font-semibold" style={{ color: "var(--dashboard-text)" }}>
        {t("title")}
      </h1>

      <SettingsProfileSection profile={profile} />

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
