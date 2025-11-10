import cron from "node-cron";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

/**
 * Compute irregular flags:
 * - Irregular = has not attended at least once in the last 4 Sundays
 * - We compute last 4 Sunday dates (including last Sunday <= today)
 */
function getLastNSundays(n: number, reference = new Date()) {
  const sundays: Date[] = [];
  // Find most recent Sunday (0 = Sunday)
  const ref = new Date(reference);
  let delta = ref.getDay(); // 0..6
  const lastSunday = new Date(ref);
  lastSunday.setDate(ref.getDate() - delta);
  lastSunday.setHours(0, 0, 0, 0);
  let cur = lastSunday;
  for (let i = 0; i < n; i++) {
    const d = new Date(cur);
    sundays.push(d);
    cur = new Date(cur);
    cur.setDate(cur.getDate() - 7);
  }
  return sundays;
}

export async function computeIrregularFlags() {
  console.log("Starting computeIrregularFlags job", new Date().toISOString());
  try {
    const last4 = getLastNSundays(4);
    // For each child, check if they have any attendance on any of those dates
    const children = await prisma.child.findMany({ where: { archivedAt: null } });
    for (const child of children) {
      // count attendances for those dates
      const count = await prisma.attendance.count({
        where: {
          childId: child.id,
          date: { in: last4 }
        }
      });
      const isIrregular = count === 0;
      const lastAtt = await prisma.attendance.findFirst({
        where: { childId: child.id },
        orderBy: { date: "desc" }
      });
      const lastAttDate = lastAtt ? lastAtt.date : null;
      // upsert SystemFlag
      const existing = await prisma.systemFlag.findUnique({ where: { childId: child.id } });
      if (existing) {
        await prisma.systemFlag.update({
          where: { childId: child.id },
          data: {
            irregular: isIrregular,
            lastAttendedAt: lastAttDate || undefined,
            reason: isIrregular ? 'missed_last_4_sundays' : null
          }
        });
      } else {
        await prisma.systemFlag.create({
          data: {
            childId: child.id,
            irregular: isIrregular,
            lastAttendedAt: lastAttDate || undefined,
            reason: isIrregular ? 'missed_last_4_sundays' : null
          }
        });
      }
    }
    console.log("computeIrregularFlags completed at", new Date().toISOString());
  } catch (err: any) {
    console.error("computeIrregularFlags error", err);
  }
}

/**
 * Start the scheduled job. Default: weekly at Monday 08:05 UTC
 * Adjust cron expression as needed for your timezone or testing.
 */
export function startFlagsJob() {
  // run once on startup
  computeIrregularFlags().catch((e) => console.error(e));
  // schedule weekly on Monday at 08:05
  cron.schedule("5 8 * * 1", () => {
    computeIrregularFlags().catch((e) => console.error(e));
  });
  console.log("Scheduled computeIrregularFlags (weekly Monday 08:05 UTC)");
}