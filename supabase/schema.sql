-- Latlas Teacher Dashboard - Phase 1
-- Run this in Supabase SQL Editor

-- Role enum
CREATE TYPE user_role AS ENUM ('teacher', 'student');

-- Profiles (1:1 with auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  role user_role NOT NULL DEFAULT 'teacher',
  email TEXT,
  title TEXT,
  department TEXT,
  avatar_url TEXT,
  onboarding_completed_at TIMESTAMPTZ,
  profile_updated_at TIMESTAMPTZ,
  share_avatar_with_students BOOLEAN NOT NULL DEFAULT false
);

-- Classes
CREATE TABLE IF NOT EXISTS classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  teacher_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  access_code TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS: teachers manage own classes
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Teachers can manage own classes" ON classes;
CREATE POLICY "Teachers can manage own classes"
  ON classes FOR ALL
  USING (auth.uid() = teacher_id);

-- RLS: users can read/update own profile
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
