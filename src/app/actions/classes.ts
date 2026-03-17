"use server";

import { createClient } from "@/lib/supabase/server";
import { generateAccessCode, generateRandomPassword, hashPassword } from "@/lib/utils";
import { ensureProfile } from "@/app/actions/auth";

export type CreateClassResult = { error?: string; accessCode?: string; password?: string };

export async function createClass(name: string): Promise<CreateClassResult> {
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

  const { error } = await supabase.from("classes").insert({
    name: name.trim(),
    teacher_id: user.id,
    access_code: accessCode,
    password_hash: passwordHash,
  });

  if (error) {
    return { error: error.message };
  }
  return { accessCode, password };
}
