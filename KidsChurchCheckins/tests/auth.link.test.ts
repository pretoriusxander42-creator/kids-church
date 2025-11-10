import express from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { vi, describe, it, beforeEach, afterEach, expect } from 'vitest';

// Mock @prisma/client to control DB operations in tests
vi.mock('@prisma/client', async () => {
  const actual = await vi.importActual<any>('@prisma/client');
  // Provide a PrismaClient stub with user methods we can override
  class PrismaClientStub {
    user: any;
    constructor() {
      // default stub implementations; tests will override as needed
      this.user = {
        findUnique: vi.fn(),
        findFirst: vi.fn(),
        update: vi.fn(),
        upsert: vi.fn()
      };
    }
  }
  return { PrismaClient: PrismaClientStub, ...actual };
});

// Mock oidc service to avoid network calls
vi.mock('../src/services/oidc', async () => {
  return {
    getClient: vi.fn(),
    assertProvider: (p: any) => {
      if (p !== 'google' && p !== 'microsoft') throw new Error('unsupported provider');
    }
  };
});

const prismaModule = await vi.importMock<any>('@prisma/client');
const { PrismaClient } = prismaModule;
const prisma = new PrismaClient();

const oidc = await vi.importMock<any>('../src/services/oidc');

import authRouter from '../src/routes/auth';
import { requireAuth } from '../src/middleware/auth';

// Build a minimal app to mount the router
function buildApp() {
  const app = express();
  app.use(express.json());
  // minimal session support (cookie-session not necessary for tests using bearer token)
  app.use((req, _res, next) => {
    (req as any).session = {};
    next();
  });
  app.use('/auth', authRouter);
  // Expose a health endpoint for sanity
  app.get('/health', (_req, res) => res.json({ ok: true }));
  return app;
}

describe('Auth linking endpoints', () => {
  let app: any;
  const JWT_SECRET = process.env.JWT_SECRET || 'dev';

  beforeEach(() => {
    app = buildApp();
    // reset prisma method implementations
    prisma.user.findUnique.mockReset();
    prisma.user.findFirst.mockReset();
    prisma.user.update.mockReset();
    prisma.user.upsert.mockReset();
    (oidc.getClient as any).mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('links provider with valid access token (link/with-token success)', async () => {
    // Mock current user resolution in requireAuth middleware
    prisma.user.findUnique.mockImplementation(({ where }: any) => {
      if (where && where.id) {
        return { id: where.id, email: 'me@example.com', role: 'VOLUNTEER' };
      }
      return null;
    });

    // No conflicting user for provider+subject
    prisma.user.findFirst.mockResolvedValue(null);

    // Update returns updated user
    prisma.user.update.mockImplementation(({ where, data }: any) => {
      return { id: where.id, email: 'me@example.com', name: data.name || 'Me', oauthProvider: data.oauthProvider, oauthSubject: data.oauthSubject, role: 'VOLUNTEER' };
    });

    // Mock OIDC client userinfo to return provider subject and email
    const fakeClient = {
      userinfo: async (accessToken: string) => {
        return { sub: 'prov-sub-123', email: 'me@example.com', name: 'Me From Provider' };
      }
    };
    (oidc.getClient as any).mockResolvedValue(fakeClient);

    // create JWT for current user id
    const token = jwt.sign({ sub: 'current-user-id', role: 'VOLUNTEER' }, JWT_SECRET, { expiresIn: '8h' });

    const resp = await request(app)
      .post('/auth/link/with-token')
      .set('Authorization', `Bearer ${token}`)
      .send({ provider: 'google', accessToken: 'valid-token' });

    expect(resp.status).toBe(200);
    expect(resp.body.user).toBeDefined();
    expect(resp.body.user.oauthProvider).toBe('google');
    expect(resp.body.user.oauthSubject).toBe('prov-sub-123');

    // Ensure we called userinfo
    expect((oidc.getClient as any)).toHaveBeenCalledWith('google');
  });

  it('returns 409 when provider subject already linked to another user', async () => {
    prisma.user.findUnique.mockImplementation(({ where }: any) => {
      if (where && where.id) {
        return { id: where.id, email: 'me@example.com', role: 'VOLUNTEER' };
      }
      return null;
    });

    // Simulate existing user with same provider+subject
    prisma.user.findFirst.mockResolvedValue({ id: 'other-user-id', email: 'other@example.com' });

    const fakeClient = {
      userinfo: async () => {
        return { sub: 'prov-sub-123', email: 'other@example.com', name: 'Other' };
      }
    };
    (oidc.getClient as any).mockResolvedValue(fakeClient);

    const token = jwt.sign({ sub: 'current-user-id', role: 'VOLUNTEER' }, JWT_SECRET, { expiresIn: '8h' });

    const resp = await request(app)
      .post('/auth/link/with-token')
      .set('Authorization', `Bearer ${token}`)
      .send({ provider: 'google', accessToken: 'valid-token' });

    expect(resp.status).toBe(409);
    expect(resp.body.error).toBe('provider_already_linked');
  });

  it('unlink provider successfully', async () => {
    // current user has provider attached
    prisma.user.findUnique.mockResolvedValue({ id: 'current-user-id', email: 'me@example.com', oauthProvider: 'google', role: 'VOLUNTEER' });
    prisma.user.update.mockImplementation(({ where, data }: any) => {
      return { id: where.id, email: 'me@example.com', name: 'Me', oauthProvider: null };
    });

    const token = jwt.sign({ sub: 'current-user-id', role: 'VOLUNTEER' }, JWT_SECRET, { expiresIn: '8h' });

    const resp = await request(app)
      .delete('/auth/link')
      .set('Authorization', `Bearer ${token}`)
      .send({ provider: 'google' });

    expect(resp.status).toBe(200);
    expect(resp.body.user).toBeDefined();
    expect(resp.body.user.oauthProvider).toBeNull();
  });
});