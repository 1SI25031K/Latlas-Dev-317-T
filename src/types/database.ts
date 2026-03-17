export type UserRole = "teacher" | "student";

export type Profile = {
  id: string;
  full_name: string | null;
  role: UserRole;
  email: string | null;
  title: string | null;
  department: string | null;
  avatar_url: string | null;
  onboarding_completed_at: string | null;
  profile_updated_at: string | null;
  share_avatar_with_students: boolean;
};

/** 0=Sun, 1=Mon, ... 6=Sat */
export type ClassScheduleSlot = {
  dayOfWeek: number;
  startTime: string; // "HH:mm"
  endTime: string;   // "HH:mm"
};

export type ClassSchedule = {
  slots: ClassScheduleSlot[];
  termStart?: string; // "YYYY-MM-DD"
  termEnd?: string;   // "YYYY-MM-DD"
};

export type Class = {
  id: string;
  name: string;
  teacher_id: string;
  access_code: string;
  password_hash: string;
  created_at: string;
  schedule?: ClassSchedule | null;
  icon_id?: string | null;
  color_hex?: string | null;
  description?: string | null;
};

export type ClassInsert = Omit<Class, "id" | "created_at"> & {
  id?: string;
  created_at?: string;
};

export type ProfileInsert = {
  id: string;
  full_name?: string | null;
  role?: UserRole;
  email?: string | null;
  title?: string | null;
  department?: string | null;
  avatar_url?: string | null;
  onboarding_completed_at?: string | null;
  profile_updated_at?: string | null;
  share_avatar_with_students?: boolean;
};
