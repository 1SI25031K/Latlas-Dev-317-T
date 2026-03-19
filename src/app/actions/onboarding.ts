"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { formatOfficialName } from "@/lib/profile-display";

export type CompleteOnboardingResult =
  | { ok: true }
  | { error: string }
  | { authRequired: true };

export async function completeOnboarding(
  formData: FormData
): Promise<CompleteOnboardingResult> {
  const locale = (formData.get("locale") as string) || "ja";
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user.id) {
    return { authRequired: true };
  }

  const userId = session.user.id;
  const first_name = (formData.get("first_name") as string)?.trim() || "";
  const last_name = (formData.get("last_name") as string)?.trim() || "";
  if (!first_name || !last_name) {
    return { error: "nameRequired" };
  }

  const middle_name = (formData.get("middle_name") as string)?.trim() || null;
  const title = (formData.get("title") as string)?.trim() || null;
  const department = (formData.get("department") as string)?.trim() || null;
  const avatar_url = (formData.get("avatar_url") as string)?.trim() || null;
  const share_avatar_with_students =
    formData.get("share_avatar_with_students") === "on" ||
    formData.get("share_avatar_with_students") === "true";

  const full_name = formatOfficialName(first_name, middle_name, last_name) || null;
  const completedAt = new Date().toISOString();

  const legacyRow = {
    id: userId,
    full_name,
    title,
    department,
    avatar_url,
    share_avatar_with_students,
    onboarding_completed_at: completedAt,
  };
  const extendedRow = {
    ...legacyRow,
    first_name,
    middle_name,
    last_name,
  };

  let { error } = await supabase
    .from("profiles")
    .upsert(extendedRow as Record<string, unknown>, { onConflict: "id" });

  if (error?.message?.includes("column") || error?.message?.includes("schema cache")) {
    ({ error } = await supabase
      .from("profiles")
      .upsert(legacyRow as Record<string, unknown>, { onConflict: "id" }));
  }

  if (error) {
    return { error: error.message };
  }

  const { error: delAffErr } = await supabase
    .from("profile_affiliations")
    .delete()
    .eq("user_id", userId);
  if (!delAffErr) {
    const { error: insAffErr } = await supabase.from("profile_affiliations").insert({
      user_id: userId,
      sort_order: 0,
      affiliation: department ?? "",
      title_at_affiliation: title ?? "",
    });
    if (insAffErr) return { error: insAffErr.message };
  }

  revalidatePath(`/${locale}/dashboard`, "layout");
  revalidatePath(`/${locale}/onboarding`);
  return { ok: true };
}
