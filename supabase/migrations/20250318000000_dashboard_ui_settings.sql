-- Optional: enables cross-device sync of dashboard customize settings (theme, clock, etc.).
-- Run in Supabase SQL Editor if not already applied. Safe to re-run (IF NOT EXISTS).
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS dashboard_ui_settings JSONB;
