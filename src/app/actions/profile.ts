"use server";

import { createClient } from "@/lib/supabase/server";
import {
  buildTeacherPublicProfile,
  formatOfficialName,
  parseStudentContactJson,
  type TeacherPublicProfile,
} from "@/lib/profile-display";
import type { ProfileAffiliation } from "@/types/database";

const PROFILE_UPDATE_COOLDOWN_MS = 24 * 60 * 60 * 1000;

function trimOrNull(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t || null;
}

export async function getTeacherPublicProfilePreview(): Promise<TeacherPublicProfile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) return null;

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  const { data: affs, error: affErr } = await supabase
    .from("profile_affiliations")
    .select("*")
    .eq("user_id", user.id)
    .order("sort_order", { ascending: true });

  let affList: ProfileAffiliation[] = (affs as ProfileAffiliation[]) ?? [];
  if (affErr || !affList.length) {
    const p = profile as { department?: string | null; title?: string | null } | null;
    if (p && (p.department?.trim() || p.title?.trim())) {
      affList = [
        {
          id: "legacy",
          user_id: user.id,
          sort_order: 0,
          affiliation: p.department ?? "",
          title_at_affiliation: p.title ?? "",
          created_at: "",
        },
      ];
    } else {
      affList = [];
    }
  }

  return buildTeacherPublicProfile(
    profile as Parameters<typeof buildTeacherPublicProfile>[0],
    affList,
    user.email ?? null
  );
}

/**
 * Student-facing teacher profile. When student auth exists, extend with class membership check.
 * Currently only safe for same-user preview; other teacherId returns null without service role.
 */
export async function getTeacherPublicProfileForTeacherId(
  teacherId: string
): Promise<TeacherPublicProfile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id || user.id !== teacherId) return null;

  return getTeacherPublicProfilePreview();
}

export async function updateProfileFromSettings(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user.id) {
    return { error: "Unauthorized" };
  }

  const userId = session.user.id;

  const { data: profile } = await supabase
    .from("profiles")
    .select("profile_updated_at")
    .eq("id", userId)
    .single();

  if (profile?.profile_updated_at) {
    const last = new Date(profile.profile_updated_at as string).getTime();
    if (Date.now() - last < PROFILE_UPDATE_COOLDOWN_MS) {
      return { error: "profileUpdateLimit" };
    }
  }

  const first_name = trimOrNull(formData.get("first_name"));
  const middle_name = trimOrNull(formData.get("middle_name"));
  const last_name = trimOrNull(formData.get("last_name"));
  const dobRaw = trimOrNull(formData.get("date_of_birth"));
  const contact_email = trimOrNull(formData.get("contact_email"));
  const phone = trimOrNull(formData.get("phone"));
  const email_visible_to_students =
    formData.get("email_visible_to_students") === "on" ||
    formData.get("email_visible_to_students") === "true";
  const share_avatar_with_students =
    formData.get("share_avatar_with_students") === "on" ||
    formData.get("share_avatar_with_students") === "true";
  const avatar_url = trimOrNull(formData.get("avatar_url"));

  const student_contact_json = {
    office: trimOrNull(formData.get("contact_office")) ?? "",
    office_hours: trimOrNull(formData.get("contact_office_hours")) ?? "",
    contact_url: trimOrNull(formData.get("contact_url")) ?? "",
    note: trimOrNull(formData.get("contact_note")) ?? "",
  };

  let affiliations: Array<{ affiliation: string; title_at_affiliation: string }> = [];
  const rawAff = formData.get("affiliations_json");
  if (typeof rawAff === "string" && rawAff.trim()) {
    try {
      const parsed = JSON.parse(rawAff) as unknown;
      if (!Array.isArray(parsed)) return { error: "Invalid affiliations" };
      affiliations = parsed.map((row) => {
        if (!row || typeof row !== "object") return { affiliation: "", title_at_affiliation: "" };
        const r = row as Record<string, unknown>;
        return {
          affiliation: typeof r.affiliation === "string" ? r.affiliation.trim() : "",
          title_at_affiliation:
            typeof r.title_at_affiliation === "string" ? r.title_at_affiliation.trim() : "",
        };
      });
    } catch {
      return { error: "Invalid affiliations" };
    }
  }

  const full_name = formatOfficialName(first_name, middle_name, last_name) || null;
  const firstAff = affiliations[0];
  const legacy_title = firstAff?.title_at_affiliation || null;
  const legacy_department = firstAff?.affiliation || null;

  const updatedAt = new Date().toISOString();
  const extendedUpdate = {
    first_name,
    middle_name,
    last_name,
    full_name,
    date_of_birth: dobRaw || null,
    contact_email,
    phone,
    email_visible_to_students,
    avatar_url: avatar_url || null,
    share_avatar_with_students,
    student_contact_json,
    title: legacy_title,
    department: legacy_department,
    profile_updated_at: updatedAt,
  } as Record<string, unknown>;

  let { error: upErr } = await supabase.from("profiles").update(extendedUpdate).eq("id", userId);

  if (upErr?.message?.includes("column") || upErr?.message?.includes("schema cache")) {
    ({ error: upErr } = await supabase
      .from("profiles")
      .update({
        full_name,
        title: legacy_title,
        department: legacy_department,
        avatar_url: avatar_url || null,
        share_avatar_with_students,
        profile_updated_at: updatedAt,
      } as Record<string, unknown>)
      .eq("id", userId));
  }

  if (upErr) {
    return { error: upErr.message };
  }

  const { error: delErr } = await supabase.from("profile_affiliations").delete().eq("user_id", userId);

  if (!delErr && affiliations.length > 0) {
    const rows = affiliations.map((a, i) => ({
      user_id: userId,
      sort_order: i,
      affiliation: a.affiliation,
      title_at_affiliation: a.title_at_affiliation,
    }));
    const { error: insErr } = await supabase.from("profile_affiliations").insert(rows);
    if (insErr) return { error: insErr.message };
  }

  return {};
}
