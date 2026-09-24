# MindCheck — Technology Stack (100% FREE)

---

## 🎨 Frontend

| Technology | Purpose | Why This? |
|-----------|---------|-----------|
| **React 18+** | UI Framework | Component-based, massive ecosystem, free |
| **TypeScript** | Type Safety | Catches bugs early, better DX |
| **Vite** | Build Tool | Fastest dev server, zero config |
| **Tailwind CSS** | Styling | Utility-first, responsive, accessible |
| **React Router v6** | Navigation | Client-side routing, SPA experience |
| **React Hook Form** | Form Handling | Performance, validation, minimal re-renders |
| **Recharts** | Charts | Free, React-native, progress visualization |
| **Zustand** | State Management | Tiny, simple, no boilerplate |
| **Framer Motion** | Animations | Smooth transitions between questions |

**Frontend Hosting:** Vercel (Free Tier)
- 100 GB bandwidth/month
- Automatic HTTPS
- Auto-deploy from GitHub
- Serverless functions available
- Custom domain support (free)

---

## ⚙️ Backend

| Technology | Purpose | Why This? |
|-----------|---------|-----------|
| **Node.js 20+** | Runtime | JavaScript everywhere, fast I/O |
| **Express.js** | API Framework | Minimal, flexible, well-documented |
| **TypeScript** | Type Safety | Shared types with frontend |
| **Prisma** | ORM | Type-safe database queries, migrations |
| **bcryptjs** | Password Hashing | Secure password storage |
| **jsonwebtoken** | Authentication | Stateless JWT auth tokens |
| **cors** | Security | Cross-origin request handling |
| **helmet** | Security | HTTP security headers |
| **express-rate-limit** | Security | API abuse prevention |
| **zod** | Validation | Request body validation |

**Backend Hosting:** Render (Free Tier)
- 750 hours/month free
- Auto-deploy from GitHub
- Free TLS certificates
- Spins down after 15 min inactivity (cold starts ~30s)
- 512 MB RAM

---

## 🗄️ Database

| Technology | Purpose | Why This? |
|-----------|---------|-----------|
| **PostgreSQL** | Primary Database | Reliable, free, ACID-compliant |
| **Prisma Migrate** | Schema Migrations | Version-controlled schema changes |

**Database Hosting:** Neon (Free Tier)
- 0.5 GB storage
- 1 project with 10 branches
- Autoscaling compute
- Connection pooling built-in
- No cold starts on database
- **Best free PostgreSQL option available**

**Alternative:** Supabase Free Tier (500 MB, includes auth features)

---

## 🔧 Development Tools (All Free)

| Tool | Purpose |
|------|---------|
| **VS Code** | Code editor |
| **Git + GitHub** | Version control & hosting |
| **ESLint + Prettier** | Code quality & formatting |
| **Vitest** | Unit testing (fast, Vite-native) |
| **Playwright** | End-to-end testing |
| **Thunder Client / Insomnia** | API testing (VS Code extension) |
| **dbdiagram.io** | Database schema design |
| **Figma** | UI/UX design (free tier) |
| **Excalidraw** | Wireframing & diagrams |

---

## 📊 Monitoring & Analytics (All Free)

| Service | Purpose | Free Tier |
|---------|---------|-----------|
| **Sentry** | Error tracking | 5K events/month |
| **UptimeRobot** | Uptime monitoring | 50 monitors, 5-min checks |
| **Plausible CE** or **Umami** | Privacy-friendly analytics | Self-hosted (free) |
| **GitHub Actions** | CI/CD pipeline | 2,000 min/month free |

---

## 🌐 Domain & DNS

| Option | Cost |
|--------|------|
| **GitHub Pages subdomain** | Free (username.github.io) |
| **Vercel subdomain** | Free (project.vercel.app) |
| **Freenom alternatives** | Free subdomains available |
| **is-a.dev** | Free .is-a.dev subdomain for devs |

---

## 💰 Total Cost Breakdown

| Service | Monthly Cost |
|---------|-------------|
| Vercel (Frontend) | **$0** |
| Render (Backend) | **$0** |
| Neon (Database) | **$0** |
| GitHub (Code) | **$0** |
| Sentry (Monitoring) | **$0** |
| UptimeRobot (Uptime) | **$0** |
| Domain (subdomain) | **$0** |
| **TOTAL** | **$0/month** |

---

## 📁 Project Structure

```
mindcheck/
├── client/                    # React Frontend
│   ├── public/
│   │   ├── favicon.ico
│   │   └── manifest.json
│   ├── src/
│   │   ├── assets/            # Images, icons
│   │   ├── components/        # Reusable UI components
│   │   │   ├── ui/            # Button, Card, Input, Modal
│   │   │   ├── layout/        # Header, Footer, Sidebar
│   │   │   ├── questionnaire/ # QuestionCard, ProgressBar, OptionSelector
│   │   │   └── results/       # ScoreGauge, SeverityBand, ResourceCard
│   │   ├── pages/             # Route-level pages
│   │   │   ├── HomePage.tsx
│   │   │   ├── AssessmentPage.tsx
│   │   │   ├── QuestionnairePage.tsx
│   │   │   ├── ResultsPage.tsx
│   │   │   ├── ResourcesPage.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   └── AboutPage.tsx
│   │   ├── data/              # Questionnaire definitions (JSON)
│   │   │   ├── phq9.ts
│   │   │   ├── gad7.ts
│   │   │   ├── pss10.ts
│   │   │   └── dass21.ts
│   │   ├── hooks/             # Custom React hooks
│   │   ├── lib/               # Scoring algorithms, API client
│   │   ├── store/             # Zustand state stores
│   │   ├── types/             # TypeScript type definitions
│   │   ├── utils/             # Helper functions
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css          # Tailwind directives
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── server/                    # Express Backend
│   ├── src/
│   │   ├── controllers/       # Request handlers
│   │   │   ├── auth.controller.ts
│   │   │   ├── assessment.controller.ts
│   │   │   └── result.controller.ts
│   │   ├── middleware/         # Auth, validation, rate-limit
│   │   ├── routes/            # API route definitions
│   │   ├── services/          # Business logic & scoring
│   │   │   ├── scoring.service.ts
│   │   │   └── resource.service.ts
│   │   ├── prisma/            # Database schema & migrations
│   │   │   └── schema.prisma
│   │   ├── types/             # Shared types
│   │   ├── utils/             # Helpers
│   │   ├── config/            # Environment config
│   │   └── app.ts             # Express app setup
│   ├── tsconfig.json
│   └── package.json
│
├── shared/                    # Shared types & constants
│   └── types.ts
│
├── docs/                      # Project documentation
│   ├── PLANNING.md
│   ├── WIREFRAMES.md
│   ├── DATABASE_SCHEMA.md
│   ├── API_SPEC.md
│   └── QUESTIONNAIRES.md
│
├── .github/
│   └── workflows/
│       └── ci.yml             # GitHub Actions CI/CD
│
├── .gitignore
├── README.md
└── package.json               # Root workspace config
```
