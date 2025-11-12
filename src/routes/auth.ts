import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { validate, schemas } from '../middleware/validation.js';
import { 
  loginUser, 
  registerUser, 
  verifyEmail, 
  resendVerificationEmail,
  requestPasswordReset,
  resetPassword 
} from '../services/auth.js';


const router = Router();

// Rate limiting middleware
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: { error: 'Too many login attempts. Please try again later.' },
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit each IP to 3 requests per windowMs
  message: { error: 'Too many registration attempts. Please try again later.' },
});

router.post('/login', loginLimiter, validate(schemas.login), async (req, res) => {
  const { email, password } = req.body;

  const result = await loginUser(email, password);

  if (result.error) {
    return res.status(401).json({ error: result.error });
  }

  return res.json(result);
});

router.post('/register', registerLimiter, validate(schemas.register), async (req, res) => {
  const { email, password, name } = req.body;

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

// Email verification endpoint
router.get('/verify-email/:token', async (req, res) => {
  const { token } = req.params;

  if (!token) {
    return res.status(400).json({ error: 'Verification token is required' });
  }

  const result = await verifyEmail(token);

  if (result.error) {
    return res.status(400).json({ error: result.error });
  }

  return res.json({ success: true, message: 'Email verified successfully' });
});

// Resend verification email
router.post('/resend-verification', validate(schemas.email), async (req, res) => {
  const { email } = req.body;

  const result = await resendVerificationEmail(email);

  if (result.error) {
    return res.status(400).json({ error: result.error });
  }

  return res.json({ success: true, message: 'Verification email sent' });
});

// Password reset request
router.post('/forgot-password', validate(schemas.email), async (req, res) => {
  const { email } = req.body;

  const result = await requestPasswordReset(email);

  if (result.error) {
    return res.status(500).json({ error: result.error });
  }

  return res.json({ 
    success: true, 
    message: 'If that email exists, a password reset link has been sent' 
  });
});

// Reset password with token
router.post('/reset-password/:token', validate(schemas.passwordReset), async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const result = await resetPassword(token, password);

  if (result.error) {
    return res.status(400).json({ error: result.error });
  }

  return res.json({ success: true, message: 'Password reset successfully' });
});

export default router;