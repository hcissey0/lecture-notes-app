-- Add email_notifications column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT true;

-- Update existing profiles to have email_notifications = true
UPDATE profiles SET email_notifications = true WHERE email_notifications IS NULL;

-- Ensure view_count column exists in notes table
ALTER TABLE notes ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- Update existing notes to have view_count = 0
UPDATE notes SET view_count = 0 WHERE view_count IS NULL;
