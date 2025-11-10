import express from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { requireAuth } from "../middleware/auth";
const prisma = new PrismaClient();
const router = express.Router();

// B3: /attendance/signin
const SignIn = z.object({
  childId: z.string().optional(),
  tagNumber: z.number(),
  className: z.string(),
  serviceTime: z.string().optional(),
  override: z.boolean().optional()
});

router.post("/signin", requireAuth, async (req, res) => {
  const parsed = SignIn.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.errors });
  const data = parsed.data;
  const date = new Date();
  // normalize to midnight (service Date)
  date.setHours(0, 0, 0, 0);

  // enforce tag uniqueness per date
  try {
    const existing = await prisma.tagUsage.findFirst({
      where: { date, tagNumber: data.tagNumber }
    });

    if (existing && !data.override) {
      // return conflict, caller can prompt and re-POST with override=true
      return res.status(409).json({ error: "tag_already_used", tagUsageId: existing.id });
    }

    // If override=true: delete the previous TagUsage and create an override log
    if (existing && data.override) {
      // delete the previous tag usage record (we keep an audit)
      await prisma.tagUsage.delete({ where: { id: existing.id } });
      await prisma.tagOverrideLog.create({
        data: {
          date,
          tagNumber: data.tagNumber,
          previousTagUsageId: existing.id,
          note: `Overridden by user ${req.user?.id || 'unknown'}`,
          createdByUserId: req.user?.id || null
        }
      });
    }

    // create new TagUsage (will succeed because either none existed or we deleted it)
    await prisma.tagUsage.create({ data: { date, tagNumber: data.tagNumber } });

    const attendance = await prisma.attendance.create({
      data: {
        childId: data.childId || undefined,
        date,
        serviceTime: data.serviceTime || "09:00",
        className: data.className,
        tagNumber: data.tagNumber
      }
    });

    res.json(attendance);
  } catch (err: any) {
    console.error('signin error', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;