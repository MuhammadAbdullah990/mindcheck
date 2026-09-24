# MindCheck — Development Roadmap & Phases

---

## 📅 Timeline Overview

```
Week 1          Week 2          Week 3          Week 4          Week 5          Week 6
┌───────────┐   ┌───────────┐   ┌───────────┐   ┌───────────┐   ┌───────────┐   ┌───────────┐
│  PHASE 1  │   │  PHASE 2  │   │  PHASE 3  │   │  PHASE 3  │   │  PHASE 4  │   │  PHASE 5  │
│  Setup &  │   │  Backend  │   │  Frontend │   │  Frontend │   │  Enhanced │   │  Testing  │
│  Infra    │   │  API      │   │  Core     │   │  Results  │   │  Features │   │  Deploy   │
└───────────┘   └───────────┘   └───────────┘   └───────────┘   └───────────┘   └───────────┘
```

---

## 🔵 PHASE 1: Setup & Infrastructure (Week 1)

### Goals
- [ ] Project scaffolding complete
- [ ] Database provisioned and connected
- [ ] GitHub repo with CI/CD pipeline
- [ ] Development environment fully working

### Tasks

#### Day 1-2: Project Initialization
```bash
# 1. Create monorepo structure
mkdir mindcheck && cd mindcheck
git init

# 2. Frontend setup
npm create vite@latest client -- --template react-ts
cd client
npm install react-router-dom zustand react-hook-form recharts framer-motion
npm install -D tailwindcss @tailwindcss/forms postcss autoprefixer
npx tailwindcss init -p

# 3. Backend setup
mkdir ../server && cd ../server
npm init -y
npm install express cors helmet express-rate-limit jsonwebtoken bcryptjs
npm install @prisma/client zod dotenv
npm install -D typescript @types/express @types/cors @types/jsonwebtoken
npm install -D @types/bcryptjs prisma ts-node nodemon
npx tsc --init
npx prisma init
```

#### Day 3-4: Database & Schema
- [ ] Create Neon PostgreSQL database (free tier)
- [ ] Write Prisma schema (from 04_DATABASE_SCHEMA.md)
- [ ] Run initial migration: `npx prisma migrate dev --name init`
- [ ] Write seed script with assessment data
- [ ] Run seed: `npx prisma db seed`

#### Day 5: DevOps
- [ ] Create GitHub repository
- [ ] Set up `.env.example` files
- [ ] Create GitHub Actions CI workflow
- [ ] Set up ESLint + Prettier configs
- [ ] Write README.md with setup instructions

### Deliverable
✅ Running dev environment — `npm run dev` starts both client & server

---

## 🟢 PHASE 2: Backend API (Week 2)

### Goals
- [ ] All API endpoints functional
- [ ] Scoring algorithms implemented
- [ ] Authentication working
- [ ] API fully testable with Thunder Client / curl

### Tasks

#### Day 1-2: Core API Structure
- [ ] Express app setup with middleware (cors, helmet, rate-limit)
- [ ] Error handling middleware
- [ ] Request validation with Zod
- [ ] Route structure: /api/auth, /api/assessments, /api/sessions, /api/results, /api/resources

#### Day 3: Authentication
- [ ] POST /api/auth/register (password hashing, JWT generation)
- [ ] POST /api/auth/login (credential verification)
- [ ] GET /api/auth/me (token verification middleware)
- [ ] Anonymous token support (UUID-based)

#### Day 4-5: Assessment & Scoring Engine
- [ ] GET /api/assessments (list all)
- [ ] GET /api/assessments/:slug (with questions)
- [ ] POST /api/sessions (start assessment)
- [ ] POST /api/sessions/:id/responses (submit answers)
- [ ] POST /api/sessions/:id/complete (trigger scoring)
- [ ] Scoring service:
  - PHQ-9: Sum all items (0-27), classify severity
  - GAD-7: Sum all items (0-21), classify severity  
  - PSS-10: Reverse score items 4,5,7,8 then sum (0-40)
  - DASS-21: Group by subscale, sum each, multiply by 2, classify per subscale

#### Day 5: Results & Resources
- [ ] GET /api/results/:id (detailed result)
- [ ] GET /api/results/history (user history)
- [ ] GET /api/resources (filtered by category/severity)
- [ ] Critical flag detection (PHQ-9 Q9, DASS-21 items 10,17,21)

### Deliverable
✅ Fully functional REST API — all endpoints return correct data

---

## 🟡 PHASE 3: Frontend Core (Week 3-4)

### Goals
- [ ] All pages implemented
- [ ] Questionnaire flow complete
- [ ] Results display working
- [ ] Connected to backend API

### Tasks

#### Week 3, Day 1-2: Layout & Navigation
- [ ] Tailwind CSS configuration (custom colors, fonts)
- [ ] Layout components (Header, Footer, CrisisBanner)
- [ ] React Router setup with all routes
- [ ] Home page with assessment cards
- [ ] About page with methodology & disclaimers

#### Week 3, Day 3-4: Questionnaire Engine
- [ ] Assessment intro/detail page
- [ ] Question card component (one-at-a-time display)
- [ ] Response option selector with visual feedback
- [ ] Progress bar component
- [ ] Navigation (previous/next) with answer memory
- [ ] Exit confirmation modal
- [ ] Auto-advance option after selection

#### Week 3, Day 5: API Integration
- [ ] API client service (fetch wrapper with auth headers)
- [ ] Zustand stores (assessmentStore, sessionStore, authStore)
- [ ] Connect questionnaire flow to session API
- [ ] Submit responses and receive results

#### Week 4, Day 1-3: Results Pages
- [ ] Score display with animated counter
- [ ] Severity gauge/bar visualization
- [ ] Severity color coding
- [ ] Interpretation text display
- [ ] Recommendation cards
- [ ] Resource cards with links
- [ ] DASS-21 multi-subscale results layout
- [ ] Crisis alert overlay (triggered by critical flags)

#### Week 4, Day 4-5: Auth & Resources
- [ ] Login/Register pages
- [ ] Auth state management (Zustand + localStorage)
- [ ] Protected route wrapper
- [ ] Resources page (filterable by category)
- [ ] Crisis resources always-visible section

### Deliverable
✅ Full user journey — select test → answer questions → see results → view resources

---

## 🟠 PHASE 4: Enhanced Features (Week 5)

### Goals
- [ ] Progress tracking dashboard
- [ ] Responsive design polished
- [ ] Accessibility audit passed
- [ ] Performance optimized

### Tasks

#### Day 1-2: Progress Dashboard
- [ ] History table of past screenings
- [ ] Score-over-time line chart (Recharts)
- [ ] Filter by assessment type
- [ ] Trend indicator ("Your scores are improving!")
- [ ] Export results option (browser print / PDF)

#### Day 3: Polish & Responsiveness
- [ ] Mobile layout testing & fixes
- [ ] Tablet layout adjustments
- [ ] Touch-friendly button sizes (min 44×44px)
- [ ] Loading skeletons
- [ ] Empty states
- [ ] Error states with retry

#### Day 4: Accessibility
- [ ] Add ARIA labels to all interactive elements
- [ ] Keyboard navigation testing (tab order)
- [ ] Screen reader testing
- [ ] Color contrast verification (4.5:1 minimum)
- [ ] Focus indicators visible
- [ ] Reduced motion support

#### Day 5: Performance
- [ ] Code splitting (React.lazy for route pages)
- [ ] Image optimization
- [ ] API response caching
- [ ] Lighthouse audit (target > 90 all categories)

### Deliverable
✅ Production-quality UI with accessibility and performance

---

## 🔴 PHASE 5: Testing, Security & Deployment (Week 6)

### Goals
- [ ] Unit & integration tests passing
- [ ] Security hardened
- [ ] Deployed to production (free tier)
- [ ] Monitoring set up

### Tasks

#### Day 1-2: Testing
- [ ] Backend unit tests (Vitest):
  - Scoring algorithm tests (all 4 instruments)
  - API route tests
  - Auth middleware tests
  - Input validation tests
- [ ] Frontend component tests:
  - Question card rendering
  - Score calculation display
  - Crisis alert trigger logic
- [ ] E2E tests (Playwright):
  - Full screening flow (start → complete → results)
  - Auth flow (register → login → dashboard)
  - Crisis resource display

#### Day 3: Security
- [ ] SQL injection test (via Prisma — largely handled)
- [ ] XSS prevention (React handles, verify edge cases)
- [ ] CSRF protection
- [ ] Rate limiting verification
- [ ] Input sanitization
- [ ] JWT expiry & refresh
- [ ] Environment variable security
- [ ] HTTPS enforcement

#### Day 4: Deployment
- [ ] Deploy frontend to Vercel:
  - Connect GitHub repo
  - Set environment variables
  - Configure custom domain (optional)
- [ ] Deploy backend to Render:
  - Connect GitHub repo
  - Set environment variables
  - Configure health check endpoint
- [ ] Database already on Neon (from Phase 1)
- [ ] Run production migrations
- [ ] Run production seed
- [ ] Smoke test all endpoints

#### Day 5: Monitoring & Launch
- [ ] Set up Sentry (free tier) for error tracking
- [ ] Set up UptimeRobot for uptime monitoring
- [ ] Create privacy policy page
- [ ] Create terms of service page
- [ ] Final cross-browser testing
- [ ] Final mobile testing
- [ ] Update README with production URLs
- [ ] 🚀 LAUNCH

### Deliverable
✅ Live, monitored, production application at $0/month cost

---

## 📋 Definition of Done — MVP

| Feature | Status |
|---------|--------|
| PHQ-9 screening works end-to-end | ⬜ |
| GAD-7 screening works end-to-end | ⬜ |
| PSS-10 screening works end-to-end | ⬜ |
| DASS-21 screening works end-to-end (3 subscales) | ⬜ |
| Scores calculated correctly | ⬜ |
| Severity bands displayed correctly | ⬜ |
| Crisis resources shown when needed | ⬜ |
| Resources page populated | ⬜ |
| Anonymous access works | ⬜ |
| User registration/login works | ⬜ |
| Progress tracking dashboard works | ⬜ |
| Mobile responsive | ⬜ |
| Accessible (WCAG 2.1 AA) | ⬜ |
| Deployed and live | ⬜ |
| Monitoring active | ⬜ |

---

## 🔮 Future Enhancements (Post-MVP)

| Feature | Priority |
|---------|----------|
| Multi-language support (Urdu/Arabic) | High |
| PDF report download | Medium |
| Email results to user | Medium |
| Provider dashboard (bulk screening) | Medium |
| WHO-5 Wellbeing Index | Low |
| Burnout Assessment (MBI) | Low |
| PWA support (offline capable) | Low |
| Dark mode | Low |
| Gamification (streaks, badges) | Low |
