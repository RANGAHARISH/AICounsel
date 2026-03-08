# AICounsel – Legal AI Helper Tools

## Environment (.env)

| Variable | Purpose |
|----------|---------|
| `GROQ_API_KEY` | Groq API for legal document analysis |
| `DATABASE_URL` | Neon PostgreSQL connection string (auth, users, sessions, admin) |
| `BETTER_AUTH_SECRET` | 32+ char secret for auth cookies (generate: `openssl rand -base64 32`) |
| `BETTER_AUTH_URL` | Site base URL for OAuth callbacks (e.g. `http://localhost:3000` in dev) |
| `ADMIN_EMAIL` | Admin email for bootstrap (e.g. `harish.r7791@gmail.com`) – used to grant admin role on first signup |

---

## Phase 0: Landing, Auth & Admin

### 0.1 Landing Page

- Hero section explaining value: instant contract review in plain English
- Feature highlights (risk flags, unfair clauses, “Should I sign?” score)
- CTA: Sign up / Log in
- Simple, professional layout (legal-appropriate tone)

### 0.2 Authentication (Better Auth)

- **Library**: `better-auth` with PostgreSQL adapter
- **Database**: Neon Postgres via `DATABASE_URL`
- **Stack**: Next.js 15+, App Router

**Auth config (`lib/auth.ts`):**
- `betterAuth({ database: DATABASE_URL, ... })`
- Credentials (email/password) + optional OAuth (Google)
- Session management (cookies, `session` table with `ipAddress`, `userAgent`)
- Route: `app/api/auth/[...all]/route.ts`

**Client**: `better-auth/client` + `createAuthClient`

**Schema/migrate:**
```bash
npx @better-auth/cli generate
npx @better-auth/cli migrate
```

### 0.3 Admin & Login Tracking

- **Admin plugin**: `admin()` from `better-auth/plugins`
- **Admin user**: `harish.r7791@gmail.com` – bootstrap via seed or set `role: "admin"` in `user` table after first signup (Better Auth `adminUserIds` uses `userId`, not email)
- **Session tracking**: Built-in `session` table stores:
  - `ipAddress`, `userAgent`, `expiresAt`, `userId`
- **Admin features**:
  - User list (search, filter, sort)
  - User roles (admin / user)
  - Revoke sessions, ban/unban
  - (Optional) Better Auth Console for login history and analytics

**Config:** Use role-based admin (`user.role === "admin"`). Grant admin via `ADMIN_EMAIL` bootstrap on first signup.

**Admin-only routes**: Middleware or server checks using `auth.api.getSession` + role check.

**Phase 0 implementation checklist:**
1. Next.js project + `better-auth` + `@neondatabase/serverless` or `pg` for Neon
2. Add `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `ADMIN_EMAIL` to `.env`
3. Auth config + API route + client setup
4. Run `npx @better-auth/cli migrate`
5. Landing page with Sign up / Log in
6. Admin bootstrap: on first signup, if `email === process.env.ADMIN_EMAIL` then set `role: "admin"`
7. Admin dashboard (or Better Auth Console) for user/session visibility

---

## Phase 1: Legal Document Analysis

### 1.1 Legal Document "Plain English" Translator + Risk Highlighter

**The Problem:**
- People sign leases, employment contracts, NDAs without understanding terms
- Lawyers charge $300–500/hour just to review
- 90% of small business owners don’t read contracts they sign

**Why It’s Valuable:**
- People would pay $50–200 for instant contract review before signing
- Highlights: unfair clauses, financial risks, what you’re agreeing to

**MVP:** Upload contract → Get plain English summary → Red flags highlighted → “Should I sign this?” score