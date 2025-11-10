import express from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
const prisma = new PrismaClient();
const router = express.Router();

const ParentCreate = z.object({
  name: z.string().min(1),
  mobile: z.string().min(6),
  email: z.string().email().optional(),
  crcMember: z.boolean().optional(),
  homecell: z.string().optional(),
  area: z.string().optional()
});

router.post("/", async (req, res) => {
  const parsed = ParentCreate.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.errors });
  try {
    const parent = await prisma.parent.create({ data: parsed.data });
    res.json(parent);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/", async (req, res) => {
  const parents = await prisma.parent.findMany({ include: { children: true } });
  res.json(parents);
});

export default router;