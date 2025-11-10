import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev';

export interface AuthenticatedRequest extends Request {
  user?: any;
}

/**
 * Lightweight JWT auth middleware used for the initial protected /app endpoint.
 * This middleware does NOT require a DB connection — it only verifies the token signature
 * and attaches the token payload to req.user. Later PRs will replace this with DB-backed sessions.
 */
export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const auth = req.headers.authorization;
    let token: string | undefined;
    if (auth && auth.startsWith('Bearer ')) token = auth.split(' ')[1];
    if (!token && (req as any).session && (req as any).session.token) token = (req as any).session.token;
    if (!token) return res.status(401).json({ error: 'missing_token' });

    const payload: any = jwt.verify(token, JWT_SECRET);
    if (!payload || !payload.sub) return res.status(401).json({ error: 'invalid_token' });

    req.user = { id: payload.sub, role: payload.role || 'VOLUNTEER' };
    return next();
  } catch (err: any) {
    console.error('auth error', err?.message);
    return res.status(401).json({ error: 'unauthorized', details: err?.message });
  }
}