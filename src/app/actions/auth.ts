"use server";

import { createClient } from "@/lib/supabase/server";
import type { ProfileInsert } from "@/types/database";

export async function ensureProfile(userId: string, email: string | undefined, fullName: string | null) {
  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .single();

  if (existing) return;

  const insert: ProfileInsert = {
    id: userId,
    email: email ?? null,
    full_name: fullName,
    role: "teacher",
  };
  await supabase.from("profiles").upsert(insert, { onConflict: "id" });
}
