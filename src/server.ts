import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieSession from 'cookie-session';

// Note: .js extensions required for ES module imports in TypeScript
import healthRouter from './routes/health.js';
import appRouter from './routes/app.js';
import authRouter from './routes/auth.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(
  cookieSession({
    name: 'session',
    keys: [process.env.SESSION_SECRET || 'dev-secret'],
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  })
);

// Serve static files
app.use(express.static('public'));

// Routes
app.use('/health', healthRouter);
app.use('/auth', authRouter);
app.use('/app', appRouter);

// Generic error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: err?.message || 'Internal server error' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
