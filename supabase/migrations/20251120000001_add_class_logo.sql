-- Add logo_url field to classes table
ALTER TABLE classes ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- Add comment
COMMENT ON COLUMN classes.logo_url IS 'URL to the classroom logo/image';
