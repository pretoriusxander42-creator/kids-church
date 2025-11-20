/*
  # Add child tracking fields
  
  1. Changes
    - Add last_check_in timestamp to track last visit
    - Add is_archived boolean for soft archival
    - Add archived_at timestamp
    - Add archived_reason text field
  
  2. Indexes
    - Add index on last_check_in for performance
    - Add index on is_archived for filtering
*/

-- Add new columns to children table
ALTER TABLE children 
ADD COLUMN IF NOT EXISTS last_check_in timestamptz,
ADD COLUMN IF NOT EXISTS is_archived boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS archived_at timestamptz,
ADD COLUMN IF NOT EXISTS archived_reason text;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_children_last_check_in ON children(last_check_in);
CREATE INDEX IF NOT EXISTS idx_children_is_archived ON children(is_archived);
CREATE INDEX IF NOT EXISTS idx_children_archived_at ON children(archived_at);

-- Update existing children with their last check-in from check_ins table
UPDATE children 
SET last_check_in = (
  SELECT MAX(check_in_time) 
  FROM check_ins 
  WHERE check_ins.child_id = children.id
)
WHERE EXISTS (
  SELECT 1 
  FROM check_ins 
  WHERE check_ins.child_id = children.id
);

COMMENT ON COLUMN children.last_check_in IS 'Timestamp of last check-in, updated automatically';
COMMENT ON COLUMN children.is_archived IS 'Soft delete flag for inactive children';
COMMENT ON COLUMN children.archived_at IS 'When the child was archived';
COMMENT ON COLUMN children.archived_reason IS 'Reason for archiving (e.g., moved away, inactive)';
