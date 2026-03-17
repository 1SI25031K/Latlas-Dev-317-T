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

export type Class = {
  id: string;
  name: string;
  teacher_id: string;
  access_code: string;
  password_hash: string;
  created_at: string;
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
