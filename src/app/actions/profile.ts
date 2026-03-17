"use server";

import { createClient } from "@/lib/supabase/server";

const PROFILE_UPDATE_COOLDOWN_MS = 24 * 60 * 60 * 1000;

export async function updateProfileFromSettings(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user.id) {
    return { error: "Unauthorized" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("profile_updated_at")
    .eq("id", session.user.id)
    .single();

  if (profile?.profile_updated_at) {
    const last = new Date(profile.profile_updated_at).getTime();
    if (Date.now() - last < PROFILE_UPDATE_COOLDOWN_MS) {
      return { error: "profileUpdateLimit" };
    }
  }

  const full_name = (formData.get("full_name") as string)?.trim() || null;
  const title = (formData.get("title") as string)?.trim() || null;
  const department = (formData.get("department") as string)?.trim() || null;
  const avatar_url = (formData.get("avatar_url") as string)?.trim() || null;
  const share_avatar_with_students =
    formData.get("share_avatar_with_students") === "on" ||
    formData.get("share_avatar_with_students") === "true";

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name,
      title,
      department,
      avatar_url: avatar_url || null,
      share_avatar_with_students,
      profile_updated_at: new Date().toISOString(),
    })
    .eq("id", session.user.id);

  if (error) {
    return { error: error.message };
  }

  return {};
}
