-- Add view_count column to notes table
ALTER TABLE notes ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- Update existing notes to have view_count = 0
UPDATE notes SET view_count = 0 WHERE view_count IS NULL;
