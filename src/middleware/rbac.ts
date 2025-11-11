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

    // Fetch user roles from database
    const { data: roles, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', decoded.sub);

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch user roles' });
    }

    req.user = {
      id: decoded.sub,
      email: decoded.email,
      roles: roles.map((r) => r.role),
    };

    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// Check if user has required role
export function requireRole(...allowedRoles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const hasRole = req.user.roles.some((role) => allowedRoles.includes(role));

    if (!hasRole) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
}

// Role hierarchy check (super_admin > admin > teacher > parent)
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

    const userMaxLevel = Math.max(
      ...req.user.roles.map((role) => roleHierarchy[role] || 0)
    );
    const requiredLevel = roleHierarchy[minRole] || 0;

    if (userMaxLevel < requiredLevel) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
}
