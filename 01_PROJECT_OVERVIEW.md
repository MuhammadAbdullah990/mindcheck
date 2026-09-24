# MindCheck — Mental Health Screening Tool
## Project Overview & Vision

---

## 🎯 What Are We Building?

**MindCheck** is a free, web-based mental health screening platform that allows users to
take scientifically-validated psychological questionnaires, receive instant scored results
with severity interpretations, and get connected to appropriate free resources.

### The Problem
- Mental health stigma prevents people from seeking initial evaluation
- Access to screening tools is often locked behind clinical settings
- Many people don't know if what they're feeling warrants professional attention
- Existing online tools are either poorly made, paywalled, or lack scientific validity

### Our Solution
A clean, calming, mobile-friendly web app that:
- Provides **4 validated screening instruments** (PHQ-9, GAD-7, PSS-10, DASS-21)
- Generates **instant, private results** with no login required
- Explains scores in **plain, empathetic language**
- Recommends **free resources** based on severity level
- Shows **crisis resources immediately** when severe scores detected
- Optionally lets users **track progress over time** (with free account)
- Costs **$0 to host and maintain** using free-tier services

### What It Is NOT
⚠️ This is **NOT** a diagnostic tool. It does **NOT** replace professional evaluation.
Every screen will carry clear disclaimers that results are for informational purposes only.

---

## 👥 Target Users

| User Type | Use Case |
|-----------|----------|
| Individuals | Self-assessment, deciding whether to seek help |
| Students | Quick mental health check during stressful periods |
| Healthcare workers | Preliminary screening tool for patients |
| NGOs/Educators | Community mental health awareness programs |

---

## 🧪 Included Screening Instruments

| Instrument | Measures | Items | Time |
|------------|----------|-------|------|
| **PHQ-9** | Depression | 9 questions | ~3 min |
| **GAD-7** | Anxiety | 7 questions | ~2 min |
| **PSS-10** | Perceived Stress | 10 questions | ~3 min |
| **DASS-21** | Depression, Anxiety & Stress (3-in-1) | 21 questions | ~5 min |

All four instruments are **public domain / freely available** for clinical and research use.

---

## 🏗️ High-Level Architecture

```
┌─────────────────────────────────────────────────────┐
│                    USER (Browser)                     │
│                                                       │
│  ┌─────────┐  ┌──────────┐  ┌─────────┐  ┌────────┐ │
│  │  Home   │  │  Take    │  │ Results │  │Progress│ │
│  │  Page   │  │  Test    │  │  Page   │  │Tracker │ │
│  └────┬────┘  └────┬─────┘  └────┬────┘  └───┬────┘ │
│       │            │             │            │       │
└───────┼────────────┼─────────────┼────────────┼──────┘
        │            │             │            │
   ┌────▼────────────▼─────────────▼────────────▼─────┐
   │              REACT FRONTEND (Vercel)              │
   │         TypeScript + Tailwind CSS                 │
   │         React Router + React Hook Form            │
   └──────────────────────┬────────────────────────────┘
                          │ REST API
   ┌──────────────────────▼────────────────────────────┐
   │            EXPRESS.JS BACKEND (Render)             │
   │         TypeScript + Prisma ORM                   │
   │         JWT Auth + Scoring Engine                 │
   └──────────────────────┬────────────────────────────┘
                          │
   ┌──────────────────────▼────────────────────────────┐
   │          POSTGRESQL DATABASE (Neon)                │
   │       Users, Assessments, Results, Resources      │
   └───────────────────────────────────────────────────┘
```

---

## 📱 Key Screens

1. **Landing Page** — Calming hero, choose a screening tool, crisis hotline banner
2. **Assessment Selection** — Cards for each test with description & time estimate
3. **Questionnaire Screen** — One question at a time, progress bar, back/next
4. **Results Screen** — Score, severity band, visual gauge, interpretation, resources
5. **Resources Page** — Curated free resources, hotlines, articles
6. **Progress Dashboard** — Score history chart (requires free account)
7. **About Page** — Methodology, disclaimers, privacy policy
