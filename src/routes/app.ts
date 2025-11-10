import { Router } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, (req: AuthRequest, res) => {
  res.json({
    message: 'Hello Dashboard',
    user: req.user,
  });
});

export default router;
