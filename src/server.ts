import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import csurf from 'csurf';
import helmet from 'helmet';
import * as Sentry from '@sentry/node';
import { httpLogger, logger } from './middleware/logger.js';

// Note: .js extensions required for ES module imports in TypeScript
import healthRouter from './routes/health.js';
import appRouter from './routes/app.js';
import authRouter from './routes/auth.js';
import childrenRouter from './routes/children.js';
import parentsRouter from './routes/parents.js';
import checkinsRouter from './routes/checkins.js';
import classesRouter from './routes/classes.js';
import specialNeedsRouter from './routes/specialNeeds.js';
import statisticsRouter from './routes/statistics.js';
import settingsRouter from './routes/settings.js';

dotenv.config();

// Environment variable validation
const requiredEnv = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'PORT',
  'SESSION_SECRET',
  'JWT_SECRET',
];
const missingEnv = requiredEnv.filter((key) => !process.env[key] || process.env[key]?.includes('your-'));
if (missingEnv.length > 0) {
  logger.error({ missingEnv }, 'Missing or invalid environment variables');
  console.error('\n❌ Missing or invalid environment variables:');
  console.error('   ' + missingEnv.join(', '));
  console.error('\n📝 Please update your .env file with actual values.');
  console.error('   See .env.example for reference.');
  console.error('\nFor Supabase credentials:');
  console.error('   1. Go to https://app.supabase.com');
  console.error('   2. Select your project');
  console.error('   3. Go to Settings → API');
  console.error('   4. Copy URL and anon key\n');
  process.exit(1);
}

const app = express();

// Sentry (optional): enabled when SENTRY_DSN is provided
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
  });
  app.use(Sentry.Handlers.requestHandler());
}


// Middleware
// Helmet with CSP in production
const isProd = process.env.NODE_ENV === 'production';
const connectOrigins = (process.env.CSP_CONNECT_ORIGINS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const cspDirectives: Record<string, string[]> = {
  defaultSrc: ["'self'"],
  scriptSrc: ["'self'"],
  styleSrc: ["'self'", "'unsafe-inline'"],
  imgSrc: ["'self'", 'data:'],
  fontSrc: ["'self'", 'data:'],
  connectSrc: ["'self'", ...connectOrigins],
};

app.use(
  helmet({
    contentSecurityPolicy: isProd ? { directives: cspDirectives } : false,
  })
);

// CORS: lock down origins in production; allow all in development for convenience
const corsOrigins = (process.env.CORS_ORIGIN || '').split(',').map((s) => s.trim()).filter(Boolean);
app.use(
  cors({
    origin: isProd && corsOrigins.length > 0 ? corsOrigins : true,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// HTTP request logging with unique request IDs
app.use(httpLogger);

// CSRF protection (disabled for API-only usage with JWT)
// Note: We use JWT tokens for auth, not cookies, so CSRF is not needed
// If you want to enable CSRF, uncomment below and add cookie handling to frontend
// app.use(csurf({ cookie: true }));

// Serve static files
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, '../public')));

// Routes
// Basic rate limiting for auth endpoints
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5, standardHeaders: true, legacyHeaders: false });
const registerLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 3, standardHeaders: true, legacyHeaders: false });
app.use('/auth/login', loginLimiter);
app.use('/auth/register', registerLimiter);

app.use('/health', healthRouter);
app.use('/auth', authRouter);
app.use('/app', appRouter);
app.use('/api/children', childrenRouter);
app.use('/api/parents', parentsRouter);
app.use('/api/checkins', checkinsRouter);
app.use('/api/classes', classesRouter);
app.use('/api/special-needs', specialNeedsRouter);
app.use('/api/statistics', statisticsRouter);
app.use('/api/settings', settingsRouter);

// Generic error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  logger.error({ err }, 'Unhandled error');
  res.status(500).json({ error: err?.message || 'Internal server error' });
});

// Sentry error handler last
if (process.env.SENTRY_DSN) {
  app.use(Sentry.Handlers.errorHandler());
}

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  logger.info({ port: PORT }, 'Server started successfully');
});
