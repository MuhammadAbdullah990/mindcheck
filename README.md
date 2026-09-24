# MindCheck

Free, privacy-first mental health screening. Take a validated questionnaire,
get a plain-language result, and see where to go next — no account required.

> **This is a screening tool, not a diagnosis.** Only a qualified healthcare
> provider can diagnose a mental health condition. If you are in crisis, call
> **988** (Suicide & Crisis Lifeline, US) or your local emergency number.

| Instrument | Measures | Items | Range |
|---|---|---|---|
| [PHQ-9](https://www.phqscreen.com/) | Depression severity | 9 | 0–27 |
| [GAD-7](https://www.hcp.med.harvard.edu/ncs/ftpdir/uq/gad7.html) | Anxiety severity | 7 | 0–21 |
| [PSS-10](https://www.apa.org/docs/parasites/2017-12/Stress-PSS-10.pdf) | Perceived stress | 10 | 0–40 |
| DASS-21 | Depression + anxiety + stress subscales | 21 | 0–42 per subscale |

## How it works

1. Pick an assessment, answer the questions, submit.
2. The server scores it and returns a severity level, a written interpretation,
   and tailored next steps.
3. If a crisis item is endorsed, a crisis alert appears **immediately** — before
   the questionnaire is even finished — and persists on the results page.
4. Optionally create an account to keep a history and track trends over time.

Anonymous use is first-class: a random token in `localStorage` scopes each
screening to the browser that created it. No login, no email, no tracking.

## Stack

| | |
|---|---|
| Frontend | React 19, Vite 8, TypeScript, Tailwind CSS v4, Zustand, React Router 7, Recharts, Framer Motion |
| Backend | Node, Express 5, TypeScript, Zod, JWT + bcrypt, Helmet, rate limiting |
| Database | PostgreSQL on [Neon](https://neon.tech), via Prisma 6 |
| Hosting | Vercel (client) + Render (server) — **$0/month** |
| Tests | Vitest (unit), Playwright (E2E) |

### Repository layout

```
client/     React SPA (Vite)
server/     Express API + Prisma
shared/     Questionnaires + scoring engine — imported by BOTH workspaces
```

`shared/` is the important one. Question text, response options, and the scoring
algorithms live in exactly one place and are compiled into both the browser and
the API. If they could drift, the score a user sees might not match the score the
server computed — a patient-safety bug, not a cosmetic one. Never duplicate that
logic; import it.

```
shared/questionnaires.ts   canonical question text and response scales
shared/scoring.ts          scorePHQ9, scoreGAD7, scorePSS10, scoreDASS21
```

## Local setup

Requires **Node 22+** and a PostgreSQL database (Neon's free tier is enough).

```bash
npm install

# 1. Point the API at your database.
cp server/.env.example server/.env
#    Then edit server/.env and paste your Neon connection string + a JWT secret.
#    Generate a secret with:
#    node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"

# 2. Point the client at the API.
cp client/.env.example client/.env.local

# 3. Create the schema and load the questionnaire + resource reference data.
npm run db:setup

# 4. Run both.
npm run dev
```

Client at http://localhost:5173, API at http://localhost:3001.

## Scripts

| Command | Does |
|---|---|
| `npm run dev` | Client + server together, with reload |
| `npm run build` | Type-check and build both workspaces |
| `npm test` | Unit tests (Vitest, both workspaces) |
| `npm run test:e2e` | Playwright end-to-end tests (needs a live database) |
| `npm run typecheck` | Type-check without emitting |
| `npm run db:migrate` | Create/apply a migration in development |
| `npm run db:deploy` | Apply pending migrations (production) |
| `npm run db:seed` | Load reference data |
| `npm run db:setup` | Generate client + migrate + seed |

## API

All routes are under `/api`. Authenticated endpoints accept
`Authorization: Bearer <jwt>`; anonymous ones use the `X-Anon-Token` header.

| Method | Route | Notes |
|---|---|---|
| `GET` | `/health` | Liveness check |
| `GET` | `/assessments` | The four instruments |
| `POST` | `/auth/register` / `/auth/login` | Returns a JWT |
| `GET` | `/auth/me` | Current user |
| `POST` | `/sessions` | Start a screening (anon or authenticated) |
| `GET` | `/sessions/:id` | Progress, including any crisis alert so far |
| `POST` | `/sessions/:id/responses` | Submit one or many answers |
| `PATCH` | `/sessions/:id/difficulty` | Set the questionnaire's difficulty tier |
| `POST` | `/sessions/:id/complete` | Score it; requires every question answered |
| `GET` | `/results/:id` | Full result, including interpretation and resources |
| `GET` | `/results/history` | Past screenings (auth required) |
| `GET` | `/resources` | Support resources, filterable by type/category |

Errors use a consistent envelope — `{ "success": false, "error": { "code", "message", "details"? } }` — so the client can show something specific rather than a generic failure.

## Testing

```bash
npm test          # 50 unit tests
npm run test:e2e  # 7 browser tests, exercises the real API
```

The E2E specs deliberately cover the clinical-safety properties, not just
layout: that a crisis alert appears the moment a crisis item is endorsed, that a
partial questionnaire cannot be scored, and that one anonymous browser cannot
read another's result.

## Deployment

### Client → Vercel

Import the repository. With the included `client/vercel.json` the defaults are
already right. Set one environment variable:

| Variable | Value |
|---|---|
| `VITE_API_URL` | `https://<your-render-service>.onrender.com/api` |

Vite inlines `VITE_*` variables at **build** time, so redeploy after changing it.
`vercel.json` handles the SPA rewrite (deep links like `/results/abc` must fall
through to `index.html`, not 404) and marks hashed assets immutable.

### Server → Render

Create a Web Service from the repo:

| Setting | Value |
|---|---|
| Root directory | *(repo root)* |
| Build command | `npm ci && npm run db:generate && npm run build --workspace server` |
| Start command | `npm run start --workspace server` |
| Health check path | `/api/health` |

Environment variables:

| Variable | Notes |
|---|---|
| `DATABASE_URL` | Neon pooled connection string |
| `JWT_SECRET` | 32+ random characters — **use a different one than local** |
| `JWT_EXPIRES_IN` | `7d` |
| `CORS_ORIGIN` | Your Vercel URL, e.g. `https://mindcheck.vercel.app` |
| `CLIENT_URL` | Same as above |
| `NODE_ENV` | `production` |
| `PORT` | Leave unset — Render provides it |

Set **Release Command** to `npm run postdeploy --workspace server`, which runs
`prisma migrate deploy && prisma db seed`. The seed is idempotent (upserts), so
running it on every release is safe. Without it, a brand-new database has no
schema and no assessment rows.

First deploy order: deploy the server (or run migrations once by hand), then
deploy the client with the resulting API URL.

## Privacy

- Anonymous by default — no account, no email, no analytics, no third-party
  trackers.
- Results are readable only by the browser that created them (anon token) or by
  the signed-in user who owns them. The server re-checks ownership on every
  request; a token alone is not sufficient.
- Passwords are bcrypt-hashed (12 rounds). JWTs are re-validated against the
  database on each request, so a deleted account cannot keep using a live token.
- Deleting your account deletes your results.

This is a self-reported screening, not a clinical record. Do not enter anything
you would not want stored on someone else's server.

## Planning documents

The original design documents are kept alongside the code, and are the source of
truth for clinical and product decisions:

| Document | Contents |
|---|---|
| [01_PROJECT_OVERVIEW.md](./01_PROJECT_OVERVIEW.md) | Vision, users, architecture |
| [02_TECHNOLOGY_STACK.md](./02_TECHNOLOGY_STACK.md) | Stack rationale and cost analysis |
| [03_QUESTIONNAIRE_SPECS.md](./03_QUESTIONNAIRE_SPECS.md) | Every question, option, and severity band |
| [04_DATABASE_SCHEMA.md](./04_DATABASE_SCHEMA.md) | Schema and seed data |
| [05_API_SPECIFICATION.md](./05_API_SPECIFICATION.md) | Endpoints, auth, errors |
| [06_WIREFRAMES_UI.md](./06_WIREFRAMES_UI.md) | Screen wireframes and palette |
| [07_DEVELOPMENT_ROADMAP.md](./07_DEVELOPMENT_ROADMAP.md) | Build phases |
| [08_SCORING_ALGORITHMS.md](./08_SCORING_ALGORITHMS.md) | Scoring reference and test vectors |

If you change a question, a response scale, or a severity cutoff, update
`shared/` and the relevant planning document together.

## License

For educational and demonstration use. The instruments themselves are in the
public domain or freely licensed by their authors; see the links above.
