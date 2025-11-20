-- Add class_assignment column to children table
-- This allows children to be assigned to specific classrooms

ALTER TABLE children 
ADD COLUMN IF NOT EXISTS class_assignment uuid REFERENCES classes(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_children_class_assignment ON children(class_assignment);

COMMENT ON COLUMN children.class_assignment IS 'FK to classes table - which classroom this child is assigned to';
