/**
 * Profile title (役職) option IDs for dropdown.
 * Display labels: settings.profileTitle* and onboarding.title*
 */
export const PROFILE_TITLE_IDS = [
  "professor",
  "associate_professor",
  "lecturer",
  "ta",
  "other",
] as const;

export type ProfileTitleId = (typeof PROFILE_TITLE_IDS)[number];

/** Value to store when no selection (empty). */
export const PROFILE_TITLE_EMPTY = "";

/** Settings namespace i18n keys for each title. */
export const PROFILE_TITLE_SETTINGS_KEYS: Record<ProfileTitleId, string> = {
  professor: "profileTitleProfessor",
  associate_professor: "profileTitleAssociateProfessor",
  lecturer: "profileTitleLecturer",
  ta: "profileTitleTa",
  other: "profileTitleOther",
};

/** Onboarding namespace i18n keys for each title. */
export const PROFILE_TITLE_ONBOARDING_KEYS: Record<ProfileTitleId, string> = {
  professor: "titleProfessor",
  associate_professor: "titleAssociateProfessor",
  lecturer: "titleLecturer",
  ta: "titleTa",
  other: "titleOther",
};
