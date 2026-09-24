# MindCheck — Database Schema Design

---

## Entity Relationship Overview

```
┌─────────┐       ┌──────────────┐       ┌──────────────┐
│  users  │──1:N──│  sessions    │──1:N──│  responses   │
└─────────┘       └──────┬───────┘       └──────────────┘
                         │
                         │1:1
                         ▼
                  ┌──────────────┐
                  │   results    │
                  └──────────────┘

┌──────────────┐       ┌──────────────┐
│ assessments  │       │  resources   │
│ (seed data)  │       │ (seed data)  │
└──────────────┘       └──────────────┘
```

---

## Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ──────────────────────────────────────
// USER (optional — anonymous use allowed)
// ──────────────────────────────────────
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  passwordHash  String
  displayName   String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  sessions      Session[]

  @@map("users")
}

// ──────────────────────────────────────
// ASSESSMENT — defines each questionnaire
// ──────────────────────────────────────
model Assessment {
  id            String    @id @default(cuid())
  slug          String    @unique          // "phq9", "gad7", "pss10", "dass21"
  name          String                     // "PHQ-9"
  fullName      String                     // "Patient Health Questionnaire-9"
  description   String
  instructions  String                     // Instructions shown to user
  timeframe     String                     // "last 2 weeks", "last month"
  estimatedTime Int                        // minutes
  totalItems    Int                        // number of questions
  maxScore      Int                        // maximum possible score
  subscales     String[]                   // ["depression","anxiety","stress"] for DASS-21
  isActive      Boolean   @default(true)
  createdAt     DateTime  @default(now())

  sessions      Session[]

  @@map("assessments")
}

// ──────────────────────────────────────
// SESSION — one attempt at a questionnaire
// ──────────────────────────────────────
model Session {
  id            String        @id @default(cuid())
  
  // Either linked to a user OR anonymous (tracked by anon token)
  userId        String?
  user          User?         @relation(fields: [userId], references: [id], onDelete: SetNull)
  anonToken     String?       // UUID for anonymous users (stored in browser)

  assessmentId  String
  assessment    Assessment    @relation(fields: [assessmentId], references: [id])

  status        SessionStatus @default(IN_PROGRESS)
  startedAt     DateTime      @default(now())
  completedAt   DateTime?

  responses     Response[]
  result        Result?

  @@index([userId])
  @@index([anonToken])
  @@map("sessions")
}

enum SessionStatus {
  IN_PROGRESS
  COMPLETED
  ABANDONED
}

// ──────────────────────────────────────
// RESPONSE — individual answer to a question
// ──────────────────────────────────────
model Response {
  id            String    @id @default(cuid())
  sessionId     String
  session       Session   @relation(fields: [sessionId], references: [id], onDelete: Cascade)

  questionNum   Int       // 1-based question number
  questionText  String    // Stored for record-keeping
  answerValue   Int       // Raw numeric value (0-3 or 0-4)
  answerLabel   String    // "Not at all", "Several days", etc.

  createdAt     DateTime  @default(now())

  @@unique([sessionId, questionNum])
  @@map("responses")
}

// ──────────────────────────────────────
// RESULT — computed scores for a session
// ──────────────────────────────────────
model Result {
  id              String    @id @default(cuid())
  sessionId       String    @unique
  session         Session   @relation(fields: [sessionId], references: [id], onDelete: Cascade)

  // Overall score
  totalScore      Int
  maxPossible     Int
  severityLevel   String    // "minimal", "mild", "moderate", "severe", etc.
  severityColor   String    // "green", "yellow", "orange", "red"

  // Subscale scores (for DASS-21)
  subscaleScores  Json?     // { depression: {raw:X, scaled:Y, severity:"..."}, ... }

  // Flags
  criticalFlag    Boolean   @default(false)  // true if crisis items triggered
  flaggedItems    Int[]                       // question numbers that triggered flags

  // Functional impairment (optional follow-up)
  difficultyLevel String?   // "not difficult", "somewhat", "very", "extremely"

  createdAt       DateTime  @default(now())

  @@map("results")
}

// ──────────────────────────────────────
// RESOURCE — curated mental health resources
// ──────────────────────────────────────
model Resource {
  id            String         @id @default(cuid())
  title         String
  description   String
  url           String?
  phone         String?
  type          ResourceType
  category      String         // "depression", "anxiety", "stress", "crisis", "general"
  severityMin   String         // Show for this severity and above
  country       String         @default("global")
  isActive      Boolean        @default(true)
  sortOrder     Int            @default(0)
  createdAt     DateTime       @default(now())

  @@map("resources")
}

enum ResourceType {
  HOTLINE
  WEBSITE
  APP
  ARTICLE
  VIDEO
  ORGANIZATION
  SELF_HELP
}
```

---

## Seed Data Example

```typescript
// prisma/seed.ts — Assessment seed data

const assessments = [
  {
    slug: "phq9",
    name: "PHQ-9",
    fullName: "Patient Health Questionnaire-9",
    description: "A widely-used screening tool for depression that helps evaluate the severity of depressive symptoms.",
    instructions: "Over the last 2 weeks, how often have you been bothered by any of the following problems?",
    timeframe: "last 2 weeks",
    estimatedTime: 3,
    totalItems: 9,
    maxScore: 27,
    subscales: [],
  },
  {
    slug: "gad7",
    name: "GAD-7",
    fullName: "Generalized Anxiety Disorder-7",
    description: "A validated screening tool that measures the severity of generalized anxiety symptoms.",
    instructions: "Over the last 2 weeks, how often have you been bothered by the following problems?",
    timeframe: "last 2 weeks",
    estimatedTime: 2,
    totalItems: 7,
    maxScore: 21,
    subscales: [],
  },
  {
    slug: "pss10",
    name: "PSS-10",
    fullName: "Perceived Stress Scale (10-item)",
    description: "Measures the degree to which situations in your life are appraised as stressful over the past month.",
    instructions: "The questions ask about your feelings and thoughts during the last month. Indicate how often you felt or thought a certain way.",
    timeframe: "last month",
    estimatedTime: 3,
    totalItems: 10,
    maxScore: 40,
    subscales: [],
  },
  {
    slug: "dass21",
    name: "DASS-21",
    fullName: "Depression Anxiety Stress Scales (21-item)",
    description: "Measures three related negative emotional states — depression, anxiety, and stress — giving you a score for each.",
    instructions: "Please read each statement and indicate how much it applied to you over the past week. There are no right or wrong answers.",
    timeframe: "past week",
    estimatedTime: 5,
    totalItems: 21,
    maxScore: 126, // 21 items × 3 max × 2 multiplier
    subscales: ["depression", "anxiety", "stress"],
  },
];
```

---

## Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Anonymous access | Yes, via `anonToken` | Reduce friction, privacy-first |
| Store question text in responses | Yes | Audit trail if questions ever change |
| Subscale scores as JSON | Yes | Flexible for DASS-21's 3 subscales |
| Soft delete | No, hard delete | Minimize stored data for privacy |
| Critical flags | Boolean + item list | Fast crisis detection on results page |
