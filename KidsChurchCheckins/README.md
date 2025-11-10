```markdown
# Kids Church Check-in — Starter Repo

This repository implements the Kids Church Check‑in system.

Purpose of this initial PR (A1/tooling-ci)
- Add TypeScript toolchain and developer tooling (ESLint, Prettier, Husky).
- Add GitHub Actions CI that provisions Postgres (for later PRs), runs Prisma generate/migrate (safe), builds TypeScript, runs unit tests.
- Add a minimal Express server with:
  - GET /health
  - GET /app (protected endpoint - requires JWT Bearer token)
- Provide .env.example and developer instructions.

How to run locally
1. Copy `.env.example` → `.env` and set your DATABASE_URL and secrets.
2. Install:
   - npm ci
3. Start dev server:
   - npm run dev
4. Health:
   - GET http://localhost:4000/health
5. Protected endpoint:
   - GET http://localhost:4000/app with header Authorization: Bearer <token>
   - For dev you can create a token using JWT_SECRET from .env:
     - e.g. payload { "sub": "dev-user", "role": "ADMIN" } signed with JWT_SECRET.

What's next (after this PR merges)
- Add Prisma schema + first migration + seed (Milestone A2).
- Implement auth with DB (bcrypt + sessions) and /auth/me tests (Milestone A3).
- Continue with Milestone B features.
```