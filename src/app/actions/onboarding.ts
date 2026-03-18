"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

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

  const full_name = (formData.get("full_name") as string)?.trim() || null;
  const title = (formData.get("title") as string)?.trim() || null;
  const department = (formData.get("department") as string)?.trim() || null;
  const avatar_url = (formData.get("avatar_url") as string)?.trim() || null;

  const { error } = await supabase
    .from("profiles")
    .upsert(
      {
        id: session.user.id,
        full_name,
        title,
        department,
        avatar_url,
        onboarding_completed_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/${locale}/dashboard`, "layout");
  revalidatePath(`/${locale}/onboarding`);
  return { ok: true };
}
