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

export type RegenerateClassPasswordResult = {
  error?: string;
  password?: string;
};

export async function regenerateClassPassword(
  classId: string
): Promise<RegenerateClassPasswordResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Unauthorized" };
  }

  const { data: row, error: fetchError } = await supabase
    .from("classes")
    .select("id, teacher_id")
    .eq("id", classId)
    .single();

  if (fetchError || !row) {
    return { error: fetchError?.message ?? "Class not found" };
  }
  if ((row.teacher_id as string) !== user.id) {
    return { error: "Forbidden" };
  }

  const password = generateRandomPassword(10);
  const passwordHash = hashPassword(password);

  const { error: updateError } = await supabase
    .from("classes")
    .update({ password_hash: passwordHash })
    .eq("id", classId);

  if (updateError) {
    return { error: updateError.message };
  }
  return { password };
}

export type RegenerateClassAccessCodeResult = {
  error?: string;
  accessCode?: string;
  password?: string;
};

export async function regenerateClassAccessCode(
  classId: string
): Promise<RegenerateClassAccessCodeResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Unauthorized" };
  }

  const { data: row, error: fetchError } = await supabase
    .from("classes")
    .select("id, teacher_id")
    .eq("id", classId)
    .single();

  if (fetchError || !row) {
    return { error: fetchError?.message ?? "Class not found" };
  }
  if ((row.teacher_id as string) !== user.id) {
    return { error: "Forbidden" };
  }

  const accessCode = generateAccessCode(6);
  const password = generateRandomPassword(10);
  const passwordHash = hashPassword(password);

  const { error: updateError } = await supabase
    .from("classes")
    .update({
      access_code: accessCode,
      password_hash: passwordHash,
    })
    .eq("id", classId);

  if (updateError) {
    return { error: updateError.message };
  }
  return { accessCode, password };
}

export type UpdateClassPayload = {
  name?: string;
  description?: string | null;
  icon_id?: string | null;
  color_hex?: string | null;
  schedule?: ClassSchedule | null;
};

export type UpdateClassResult = { error?: string };

export async function updateClass(
  classId: string,
  payload: UpdateClassPayload
): Promise<UpdateClassResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Unauthorized" };
  }

  const { data: row, error: fetchError } = await supabase
    .from("classes")
    .select("id, teacher_id")
    .eq("id", classId)
    .single();

  if (fetchError || !row) {
    return { error: fetchError?.message ?? "Class not found" };
  }
  if ((row.teacher_id as string) !== user.id) {
    return { error: "Forbidden" };
  }

  const updates: Record<string, unknown> = {};
  if (payload.name !== undefined) updates.name = payload.name.trim();
  if (payload.description !== undefined) updates.description = payload.description?.trim() || null;
  if (payload.icon_id !== undefined) updates.icon_id = payload.icon_id || null;
  if (payload.color_hex !== undefined) updates.color_hex = payload.color_hex || null;
  if (payload.schedule !== undefined) updates.schedule = payload.schedule;

  if (Object.keys(updates).length === 0) {
    return {};
  }

  const { error: updateError } = await supabase
    .from("classes")
    .update(updates)
    .eq("id", classId);

  if (updateError) {
    return { error: updateError.message };
  }
  return {};
}

export type DeleteClassResult = { error?: string };

export async function deleteClass(classId: string): Promise<DeleteClassResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Unauthorized" };
  }

  const { data: row, error: fetchError } = await supabase
    .from("classes")
    .select("id, teacher_id")
    .eq("id", classId)
    .single();

  if (fetchError || !row) {
    return { error: fetchError?.message ?? "Class not found" };
  }
  if ((row.teacher_id as string) !== user.id) {
    return { error: "Forbidden" };
  }

  const { error: deleteError } = await supabase.from("classes").delete().eq("id", classId);

  if (deleteError) {
    return { error: deleteError.message };
  }
  return {};
}
