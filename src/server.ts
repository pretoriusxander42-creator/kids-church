import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieSession from 'cookie-session';
import csurf from 'csurf';
import helmet from 'helmet';

// Note: .js extensions required for ES module imports in TypeScript
import healthRouter from './routes/health.js';
import appRouter from './routes/app.js';
import authRouter from './routes/auth.js';

dotenv.config();

// Environment variable validation
const requiredEnv = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'PORT',
  'SESSION_SECRET',
  'JWT_SECRET',
  'DATABASE_URL',
];
const missingEnv = requiredEnv.filter((key) => !process.env[key]);
if (missingEnv.length > 0) {
  console.error('Missing required environment variables:', missingEnv.join(', '));
  process.exit(1);
}

const app = express();


// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(
  cookieSession({
    name: 'session',
    keys: [process.env.SESSION_SECRET || 'dev-secret'],
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  })
);

// CSRF protection
app.use(csurf({ cookie: true }));

// Serve static files
app.use(express.static('public'));

// Routes
app.use('/health', healthRouter);
app.use('/auth', authRouter);
app.use('/app', appRouter);
app.use('/api/children', (await import('./routes/children.js')).default);
app.use('/api/parents', (await import('./routes/parents.js')).default);
app.use('/api/checkins', (await import('./routes/checkins.js')).default);
app.use('/api/classes', (await import('./routes/classes.js')).default);
app.use('/api/special-needs', (await import('./routes/specialNeeds.js')).default);
app.use('/api/statistics', (await import('./routes/statistics.js')).default);

// Generic error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: err?.message || 'Internal server error' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
