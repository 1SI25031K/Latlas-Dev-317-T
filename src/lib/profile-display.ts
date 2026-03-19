import type { ProfileAffiliation } from "@/types/database";

/** Official name shown to students (First Middle Last). */
export function formatOfficialName(
  first: string | null | undefined,
  middle: string | null | undefined,
  last: string | null | undefined
): string {
  return [first, middle, last]
    .map((s) => (typeof s === "string" ? s.trim() : ""))
    .filter(Boolean)
    .join(" ");
}

/** Latlas greeting: official name (First Middle Last), else legacy full_name. */
export function profileGreetingName(
  first: string | null | undefined,
  middle: string | null | undefined,
  last: string | null | undefined,
  fullName: string | null | undefined
): string | null {
  const official = formatOfficialName(first, middle, last);
  if (official) return official;
  const f = fullName?.trim();
  return f || null;
}

export type StudentContactJson = {
  office?: string;
  office_hours?: string;
  contact_url?: string;
  note?: string;
};

/** Shape returned to student-facing surfaces (and teacher preview). */
export type TeacherPublicProfile = {
  officialName: string;
  avatarUrl: string | null;
  affiliations: Array<{ affiliation: string; titleAtAffiliation: string }>;
  contactEmail: string | null;
  studentContact: StudentContactJson;
};

type ProfileRow = {
  first_name?: string | null;
  middle_name?: string | null;
  last_name?: string | null;
  full_name?: string | null;
  avatar_url?: string | null;
  share_avatar_with_students?: boolean;
  email_visible_to_students?: boolean;
  contact_email?: string | null;
  student_contact_json?: unknown;
};

export function buildTeacherPublicProfile(
  profile: ProfileRow | null,
  affiliations: ProfileAffiliation[],
  authEmail: string | null
): TeacherPublicProfile | null {
  if (!profile) return null;
  let official = formatOfficialName(profile.first_name, profile.middle_name, profile.last_name);
  if (!official && profile.full_name?.trim()) official = profile.full_name.trim();
  const avatarUrl =
    profile.share_avatar_with_students && profile.avatar_url?.trim()
      ? profile.avatar_url.trim()
      : null;
  const contact = (profile.student_contact_json || {}) as StudentContactJson;
  const studentContact: StudentContactJson = {
    ...(contact.office?.trim() && { office: contact.office.trim() }),
    ...(contact.office_hours?.trim() && { office_hours: contact.office_hours.trim() }),
    ...(contact.contact_url?.trim() && { contact_url: contact.contact_url.trim() }),
    ...(contact.note?.trim() && { note: contact.note.trim() }),
  };
  let contactEmail: string | null = null;
  if (profile.email_visible_to_students) {
    const ce = profile.contact_email?.trim();
    contactEmail = ce || authEmail?.trim() || null;
  }
  return {
    officialName: official || "—",
    avatarUrl,
    affiliations: affiliations
      .slice()
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((a) => ({
        affiliation: a.affiliation.trim(),
        titleAtAffiliation: a.title_at_affiliation.trim(),
      }))
      .filter((a) => a.affiliation || a.titleAtAffiliation),
    contactEmail,
    studentContact,
  };
}

export function parseStudentContactJson(raw: unknown): StudentContactJson {
  if (!raw || typeof raw !== "object") return {};
  const o = raw as Record<string, unknown>;
  const str = (k: string) => (typeof o[k] === "string" ? o[k] as string : "");
  return {
    office: str("office") || undefined,
    office_hours: str("office_hours") || undefined,
    contact_url: str("contact_url") || undefined,
    note: str("note") || undefined,
  };
}
