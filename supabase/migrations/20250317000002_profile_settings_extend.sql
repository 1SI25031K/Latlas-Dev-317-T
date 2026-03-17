-- Profile settings: last update time (for 24h limit) and share avatar with students
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS profile_updated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS share_avatar_with_students BOOLEAN NOT NULL DEFAULT false;
