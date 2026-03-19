-- Remove display_name if a previous migration added it (表示名廃止)
ALTER TABLE profiles DROP COLUMN IF EXISTS display_name;
