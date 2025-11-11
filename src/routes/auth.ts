import { Router } from 'express';
import { loginUser, registerUser } from '../services/auth.js';

const router = Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const result = await loginUser(email, password);

  if (result.error) {
    return res.status(401).json({ error: result.error });
  }

  return res.json(result);
});

router.post('/register', async (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    return res
      .status(400)
      .json({ error: 'Email, password, and name are required' });
  }

  if (password.length < 6) {
    return res
      .status(400)
      .json({ error: 'Password must be at least 6 characters' });
  }

  const result = await registerUser(email, password, name);

  if (result.error) {
    return res.status(400).json({ error: result.error });
  }

  const loginResult = await loginUser(email, password);

  if (loginResult.error) {
    return res.status(401).json({ error: 'Registration successful but login failed' });
  }

  return res.status(201).json(loginResult);
});

export default router;
