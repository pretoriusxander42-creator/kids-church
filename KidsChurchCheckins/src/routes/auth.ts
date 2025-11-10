import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth';
import { getClient, assertProvider } from '../services/oidc';

const prisma = new PrismaClient();
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'dev';

// POST /auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'missing credentials' });
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.passwordHash) return res.status(401).json({ error: 'invalid credentials' });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'invalid credentials' });
  const token = jwt.sign({ sub: user.id, role: user.role }, JWT_SECRET, {
    expiresIn: '8h'
  });
  if ((req as any).session) (req as any).session.token = token;
  res.json({ token, user: { id: user.id, name: user.name, role: user.role, email: user.email } });
});

// GET /auth/me
router.get('/me', requireAuth, async (req: any, res) => {
  const user = req.user;
  const safe = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    oauthProvider: user.oauthProvider || null,
    oauthSubject: user.oauthSubject || null
  };
  res.json({ user: safe });
});

// Account linking (manual subject) - kept for compatibility
function assertProviderSimple(provider: any): asserts provider is 'google' | 'microsoft' {
  if (provider !== 'google' && provider !== 'microsoft') {
    throw new Error('unsupported provider');
  }
}

const LinkBody = z.object({
  provider: z.string(),
  subject: z.string().min(1)
});

// POST /auth/link (manual subject)
router.post('/link', requireAuth, async (req: any, res) => {
  const parse = LinkBody.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.errors });
  const { provider, subject } = parse.data;
  try {
    assertProviderSimple(provider);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
  try {
    const existing = await prisma.user.findFirst({
      where: {
        oauthProvider: provider,
        oauthSubject: subject
      }
    });
    if (existing && existing.id !== req.user.id) {
      return res.status(409).json({ error: 'provider_already_linked', userId: existing.id });
    }

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        oauthProvider: provider,
        oauthSubject: subject
      }
    });

    const token = jwt.sign({ sub: updated.id, role: updated.role }, JWT_SECRET, {
      expiresIn: '8h'
    });
    if ((req as any).session) (req as any).session.token = token;

    res.json({
      user: {
        id: updated.id,
        email: updated.email,
        name: updated.name,
        oauthProvider: updated.oauthProvider,
        oauthSubject: updated.oauthSubject
      }
    });
  } catch (err: any) {
    console.error('link error', err);
    res.status(500).json({ error: err?.message || 'link_failed' });
  }
});

// Link using provider accessToken (secure validation)
const LinkWithTokenBody = z.object({
  provider: z.string(),
  accessToken: z.string().min(10)
});

/**
 * POST /auth/link/with-token
 * Body: { provider, accessToken }
 *
 * - Verifies accessToken with provider (client.userinfo)
 * - Extracts provider subject and email
 * - If another user has the same provider+subject -> 409
 * - Otherwise updates current user's oauthProvider + oauthSubject (link)
 */
router.post('/link/with-token', requireAuth, async (req: any, res) => {
  const parsed = LinkWithTokenBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.errors });
  const { provider, accessToken } = parsed.data;
  try {
    assertProvider(provider);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }

  try {
    const client = await getClient(provider as 'google' | 'microsoft');
    // call userinfo to validate access token and retrieve subject
    const userinfo: any = await client.userinfo(accessToken);
    const providerSub = String(userinfo.sub || userinfo.id || '');
    const email = String(userinfo.email || '');

    if (!providerSub) {
      return res.status(400).json({ error: 'failed_to_extract_provider_subject' });
    }

    // conflict check
    const existing = await prisma.user.findFirst({
      where: {
        oauthProvider: provider,
        oauthSubject: providerSub
      }
    });
    if (existing && existing.id !== req.user.id) {
      return res.status(409).json({ error: 'provider_already_linked', userId: existing.id });
    }

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: { oauthProvider: provider, oauthSubject: providerSub, name: userinfo.name || undefined }
    });

    const token = jwt.sign({ sub: updated.id, role: updated.role }, JWT_SECRET, {
      expiresIn: '8h'
    });
    if ((req as any).session) (req as any).session.token = token;

    res.json({
      user: {
        id: updated.id,
        email: updated.email,
        name: updated.name,
        oauthProvider: updated.oauthProvider,
        oauthSubject: updated.oauthSubject
      }
    });
  } catch (err: any) {
    console.error('link/with-token error', err);
    return res.status(500).json({ error: err?.message || 'link_with_token_failed' });
  }
});

// Unlink provider
const UnlinkBody = z.object({
  provider: z.string()
});

router.delete('/link', requireAuth, async (req: any, res) => {
  const parse = UnlinkBody.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.errors });
  const { provider } = parse.data;
  try {
    assertProviderSimple(provider);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ error: 'user_not_found' });

    if (user.oauthProvider !== provider) {
      return res.status(400).json({ error: 'provider_not_linked' });
    }

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        oauthProvider: null,
        oauthSubject: null
      }
    });

    const token = jwt.sign({ sub: updated.id, role: updated.role }, JWT_SECRET, {
      expiresIn: '8h'
    });
    if ((req as any).session) (req as any).session.token = token;

    res.json({ user: { id: updated.id, email: updated.email, name: updated.name, oauthProvider: updated.oauthProvider } });
  } catch (err: any) {
    console.error('unlink error', err);
    res.status(500).json({ error: err?.message || 'unlink_failed' });
  }
});

export default router;