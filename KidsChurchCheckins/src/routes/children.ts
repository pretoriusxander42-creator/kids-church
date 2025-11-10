import express from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { requireAuth, requireRole } from "../middleware/auth";
const prisma = new PrismaClient();
const router = express.Router();

const ChildCreate = z.object({
  firstName: z.string().min(1),
  lastName: z.string().optional(),
  dob: z.string().optional(),
  gender: z.string().optional(),
  grade: z.number().optional(),
  parentId: z.string()
});

router.post("/", requireAuth, async (req, res) => {
  const parsed = ChildCreate.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.errors });
  const data: any = parsed.data;
  if (data.dob) data.dob = new Date(data.dob);
  try {
    const child = await prisma.child.create({ data });
    res.json(child);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/", requireAuth, async (req, res) => {
  const q = String(req.query.q || "");
  const where = q
    ? {
        OR: [
          { firstName: { contains: q, mode: "insensitive" } },
          { lastName: { contains: q, mode: "insensitive" } }
        ]
      }
    : undefined;
  const children = await prisma.child.findMany({ where });
  res.json(children);
});

// Admin-only restore archived child
router.post("/:id/restore", requireAuth, requireRole("ADMIN"), async (req, res) => {
  const id = req.params.id;
  try {
    const child = await prisma.child.findUnique({ where: { id } });
    if (!child) return res.status(404).json({ error: "not_found" });
    if (!child.archivedAt) return res.status(400).json({ error: "not_archived" });
    const updated = await prisma.child.update({ where: { id }, data: { archivedAt: null } });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;