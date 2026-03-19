-- Extended profile fields, affiliations, student contact JSON

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS first_name TEXT,
  ADD COLUMN IF NOT EXISTS middle_name TEXT,
  ADD COLUMN IF NOT EXISTS last_name TEXT,
  ADD COLUMN IF NOT EXISTS date_of_birth DATE,
  ADD COLUMN IF NOT EXISTS email_visible_to_students BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS contact_email TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS student_contact_json JSONB NOT NULL DEFAULT '{}'::jsonb;

CREATE TABLE IF NOT EXISTS profile_affiliations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  sort_order INT NOT NULL DEFAULT 0,
  affiliation TEXT NOT NULL DEFAULT '',
  title_at_affiliation TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profile_affiliations_user ON profile_affiliations(user_id);

ALTER TABLE profile_affiliations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own profile_affiliations" ON profile_affiliations;
CREATE POLICY "Users manage own profile_affiliations"
  ON profile_affiliations FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Backfill official name from legacy full_name
UPDATE profiles
SET last_name = NULLIF(trim(full_name), '')
WHERE last_name IS NULL AND first_name IS NULL
  AND full_name IS NOT NULL AND trim(full_name) != '';

-- Backfill one affiliation row from legacy title/department (only if none exist)
INSERT INTO profile_affiliations (user_id, sort_order, affiliation, title_at_affiliation)
SELECT p.id, 0,
  COALESCE(NULLIF(trim(p.department), ''), ''),
  COALESCE(NULLIF(trim(p.title), ''), '')
FROM profiles p
WHERE NOT EXISTS (SELECT 1 FROM profile_affiliations pa WHERE pa.user_id = p.id)
  AND (
    (p.department IS NOT NULL AND trim(p.department) != '')
    OR (p.title IS NOT NULL AND trim(p.title) != '')
  );
