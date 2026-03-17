"use server";

import { createClient } from "@/lib/supabase/server";
import { generateAccessCode, generateRandomPassword, hashPassword } from "@/lib/utils";
import { ensureProfile } from "@/app/actions/auth";
import type { ClassSchedule } from "@/types/database";

export type CreateClassPayload = {
  name: string;
  description?: string | null;
  icon_id?: string | null;
  color_hex?: string | null;
  schedule?: ClassSchedule | null;
};

export type CreateClassResult = {
  error?: string;
  accessCode?: string;
  password?: string;
  classId?: string;
  classSchedule?: ClassSchedule | null;
};

export async function createClass(payload: CreateClassPayload): Promise<CreateClassResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Unauthorized" };
  }

  await ensureProfile(
    user.id,
    user.email ?? undefined,
    (user.user_metadata?.full_name as string) ?? null
  );

  const accessCode = generateAccessCode(6);
  const password = generateRandomPassword(10);
  const passwordHash = hashPassword(password);

  const { data: inserted, error } = await supabase
    .from("classes")
    .insert({
      name: payload.name.trim(),
      teacher_id: user.id,
      access_code: accessCode,
      password_hash: passwordHash,
      description: payload.description?.trim() || null,
      icon_id: payload.icon_id || null,
      color_hex: payload.color_hex || null,
      schedule: payload.schedule ?? null,
    })
    .select("id, schedule")
    .single();

  if (error) {
    return { error: error.message };
  }
  return {
    accessCode,
    password,
    classId: inserted?.id,
    classSchedule: (inserted?.schedule as ClassSchedule | null) ?? null,
  };
}
