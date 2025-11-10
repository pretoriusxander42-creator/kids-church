# Kids Church Check-in System

This repository implements the Kids Church Check-in system with TypeScript, Express, and Postgres.

## Purpose of this initial PR (A1/tooling-ci)

- Add TypeScript toolchain and developer tooling (ESLint, Prettier)
- Add GitHub Actions CI that provisions Postgres service, builds TypeScript, and runs tests
- Add a minimal Express server with:
  - GET /health
  - GET /app (protected endpoint - requires JWT Bearer token)
- Provide .env.example and developer instructions

## How to run locally

1. Copy `.env.example` → `.env` and set your environment variables
2. Install dependencies:
   ```bash
   npm ci
   ```
3. Start dev server:
   ```bash
   npm run dev
   ```
4. Test health endpoint:
   ```
   GET http://localhost:4000/health
   ```
5. Test protected endpoint:
   ```
   GET http://localhost:4000/app
   ```
   With header: `Authorization: Bearer <token>`

   For development, you can create a token using JWT_SECRET from .env:
   - Example payload: `{ "sub": "dev-user", "role": "ADMIN" }`
   - Sign with JWT_SECRET

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run tests

## What's next

After this PR merges:
- Add Prisma schema + migrations + seed
- Implement full authentication with database
- Add more features and endpoints
