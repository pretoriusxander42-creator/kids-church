import { Router } from 'express';
import jwt from 'jsonwebtoken';

const router = Router();

router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  if (email === 'admin@example.com' && password === 'admin') {
    const secret = process.env.JWT_SECRET || 'dev-secret';
    const token = jwt.sign(
      { sub: 'admin-user', role: 'ADMIN', email },
      secret,
      { expiresIn: '8h' }
    );

    return res.json({
      token,
      user: {
        id: 'admin-user',
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'ADMIN',
      },
    });
  }

  return res.status(401).json({ error: 'Invalid credentials' });
});

export default router;
