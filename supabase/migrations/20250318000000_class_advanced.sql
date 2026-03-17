-- Add advanced class settings: schedule, icon_id, color_hex, description
ALTER TABLE classes
  ADD COLUMN IF NOT EXISTS schedule JSONB,
  ADD COLUMN IF NOT EXISTS icon_id TEXT,
  ADD COLUMN IF NOT EXISTS color_hex TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT;
