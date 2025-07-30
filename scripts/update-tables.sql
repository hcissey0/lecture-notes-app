-- Add download_count and anonymous_uploads columns
ALTER TABLE notes ADD COLUMN IF NOT EXISTS download_count INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS anonymous_uploads BOOLEAN DEFAULT false;

-- Update existing notes to have download_count = 0
UPDATE notes SET download_count = 0 WHERE download_count IS NULL;

-- Update existing profiles to have anonymous_uploads = false
UPDATE profiles SET anonymous_uploads = false WHERE anonymous_uploads IS NULL;
