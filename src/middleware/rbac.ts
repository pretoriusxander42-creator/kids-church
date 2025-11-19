import '../env.js';
import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    roles: string[];
  };
}

// Verify JWT token and attach user to request
export async function authenticateUser(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    // All authenticated users have full access - no need to fetch roles
    req.user = {
      id: decoded.sub,
      email: decoded.email,
      roles: ['admin'], // Grant admin role to all users for compatibility
    };

    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// Check if user has required role
// UPDATED: All authenticated users now have full access
export function requireRole(...allowedRoles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Allow all authenticated users - role check disabled
    next();
  };
}

// Role hierarchy check (super_admin > admin > teacher > parent)
// UPDATED: All authenticated users now have full access
const roleHierarchy: { [key: string]: number } = {
  super_admin: 4,
  admin: 3,
  teacher: 2,
  parent: 1,
};

export function requireMinRole(minRole: string) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Allow all authenticated users - role hierarchy check disabled
    next();
  };
}
