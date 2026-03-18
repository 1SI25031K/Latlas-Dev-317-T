"use server";

import { createClient } from "@/lib/supabase/server";
import type { DashboardUiSettingsPersisted } from "@/lib/dashboard-ui-settings";

export async function persistDashboardUiSettings(
  settings: DashboardUiSettingsPersisted
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("profiles")
    .update({ dashboard_ui_settings: settings } as Record<string, unknown>)
    .eq("id", user.id);

  if (error) return { error: error.message };
  return {};
}
