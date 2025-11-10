import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';

import healthRouter from './routes/health';
import appRouter from './routes/app';

dotenv.config();

const app = express();
app.use(cors());
app.use(json());
app.use(
  cookieSession({
    name: 'session',
    keys: [process.env.SESSION_SECRET || 'dev'],
    maxAge: 24 * 60 * 60 * 1000
  })
);

app.use('/health', healthRouter);
app.use('/app', appRouter);

// Generic error handler
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error(err);
  res.status(500).json({ error: err?.message || 'server error' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});