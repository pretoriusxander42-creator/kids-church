-- Migration: add TagOverrideLog table
-- Generated on 2025-11-10

CREATE TABLE IF NOT EXISTS "TagOverrideLog" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  "date" TIMESTAMP(3) NOT NULL,
  "tagNumber" INTEGER NOT NULL,
  "previousTagUsageId" TEXT,
  "note" TEXT,
  "createdByUserId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT now()
);

-- Foreign key to TagUsage (optional, previousTagUsageId may be null)
ALTER TABLE "TagOverrideLog"
  ADD CONSTRAINT "TagOverrideLog_previousTagUsageId_fkey"
  FOREIGN KEY ("previousTagUsageId") REFERENCES "TagUsage"("id") ON DELETE SET NULL;

-- Foreign key to User for audit (optional)
ALTER TABLE "TagOverrideLog"
  ADD CONSTRAINT "TagOverrideLog_createdByUserId_fkey"
  FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS "TagOverrideLog_createdBy_idx" ON "TagOverrideLog" ("createdByUserId");
CREATE INDEX IF NOT EXISTS "TagOverrideLog_date_idx" ON "TagOverrideLog" ("date");