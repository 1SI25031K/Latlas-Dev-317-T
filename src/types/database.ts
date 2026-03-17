export type UserRole = "teacher" | "student";

export type Profile = {
  id: string;
  full_name: string | null;
  role: UserRole;
  email: string | null;
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
};
