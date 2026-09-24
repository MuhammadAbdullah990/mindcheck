# MindCheck — Wireframes & UI Design

---

## 🎨 Design Philosophy

**Core Principles:**
- **Calming, not clinical** — Soft colors, rounded shapes, warm language
- **Accessible** — WCAG 2.1 AA, keyboard navigable, screen-reader friendly
- **Mobile-first** — Most users will access on phones
- **Non-judgmental** — Supportive tone, never alarming language about scores
- **Privacy-forward** — No login required, clear data handling

---

## 🎨 Color Palette

```
Primary:       #4F46E5  (Indigo — trust, calm)
Primary Light: #818CF8  (Light indigo)
Secondary:     #10B981  (Emerald — health, growth)
Background:    #F8FAFC  (Soft gray-white)
Surface:       #FFFFFF  (White cards)
Text Primary:  #1E293B  (Slate 800)
Text Secondary:#64748B  (Slate 500)
Text Muted:    #94A3B8  (Slate 400)

Severity Colors:
  Green:       #10B981  (Minimal/Normal)
  Yellow:      #F59E0B  (Mild)
  Orange:      #F97316  (Moderate)
  Red:         #EF4444  (Severe)
  Dark Red:    #DC2626  (Extremely Severe)

Accent:        #8B5CF6  (Violet — used sparingly)
Crisis Banner: #FEF2F2  bg + #DC2626 text (soft red background)
```

---

## 📱 Screen Wireframes

### 1. Landing Page / Home

```
┌──────────────────────────────────────────────┐
│  🧠 MindCheck          [About] [Login]       │
├──────────────────────────────────────────────┤
│                                              │
│       ╭──────────────────────────╮           │
│       │   🌿                     │           │
│       │   Take a moment for      │           │
│       │   your mental health     │           │
│       │                          │           │
│       │   Free, private, and     │           │
│       │   scientifically         │           │
│       │   validated screenings   │           │
│       │                          │           │
│       │   [ Start a Screening ]  │           │
│       ╰──────────────────────────╯           │
│                                              │
│  ── How It Works ──────────────────────────  │
│                                              │
│  ①  Choose a      ②  Answer        ③  Get   │
│     screening        honestly &       your   │
│     tool             privately       results  │
│                                              │
│  ── Available Screenings ─────────────────   │
│                                              │
│  ┌──────────┐  ┌──────────┐                  │
│  │ PHQ-9    │  │ GAD-7    │                  │
│  │ Depress. │  │ Anxiety  │                  │
│  │ 9 Qs     │  │ 7 Qs     │                  │
│  │ ~3 min   │  │ ~2 min   │                  │
│  │ [Start →]│  │ [Start →]│                  │
│  └──────────┘  └──────────┘                  │
│  ┌──────────┐  ┌──────────┐                  │
│  │ PSS-10   │  │ DASS-21  │                  │
│  │ Stress   │  │ Combined │                  │
│  │ 10 Qs    │  │ 21 Qs    │                  │
│  │ ~3 min   │  │ ~5 min   │                  │
│  │ [Start →]│  │ [Start →]│                  │
│  └──────────┘  └──────────┘                  │
│                                              │
│  ── Important Notice ─────────────────────   │
│  This tool is not a substitute for           │
│  professional medical advice, diagnosis,     │
│  or treatment.                               │
│                                              │
├──────────────────────────────────────────────┤
│  🆘 In crisis? Call 988 | Text HOME→741741  │
└──────────────────────────────────────────────┘
```

### 2. Assessment Introduction Screen

```
┌──────────────────────────────────────────────┐
│  ← Back           MindCheck                  │
├──────────────────────────────────────────────┤
│                                              │
│     ╭──────────────────────────────╮         │
│     │                              │         │
│     │   📋 PHQ-9                   │         │
│     │   Patient Health             │         │
│     │   Questionnaire              │         │
│     │                              │         │
│     │   Screens for: Depression    │         │
│     │   Questions: 9               │         │
│     │   Time: ~3 minutes           │         │
│     │   Timeframe: Last 2 weeks    │         │
│     │                              │         │
│     ╰──────────────────────────────╯         │
│                                              │
│     📝 About This Screening                  │
│     The PHQ-9 helps evaluate how             │
│     often you've been bothered by            │
│     common symptoms of depression.           │
│     It's used by doctors worldwide.          │
│                                              │
│     🔒 Your Privacy                          │
│     • No data is shared with anyone          │
│     • No login required                      │
│     • Results are shown only to you          │
│     • You can take it anonymously            │
│                                              │
│     ⚠️ Disclaimer                            │
│     This is a screening tool, not a          │
│     diagnosis. Please consult a              │
│     professional for medical advice.         │
│                                              │
│         ╭────────────────────╮               │
│         │   Begin Screening  │               │
│         ╰────────────────────╯               │
│                                              │
├──────────────────────────────────────────────┤
│  🆘 Crisis? 988 | Text HOME → 741741        │
└──────────────────────────────────────────────┘
```

### 3. Questionnaire Screen (One Question at a Time)

```
┌──────────────────────────────────────────────┐
│  ← Back           PHQ-9           ✕ Exit     │
├──────────────────────────────────────────────┤
│                                              │
│  Question 3 of 9                             │
│  ████████████░░░░░░░░░░░░░  33%              │
│                                              │
│  ┌────────────────────────────────────────┐  │
│  │                                        │  │
│  │  Over the last 2 weeks, how often      │  │
│  │  have you been bothered by:            │  │
│  │                                        │  │
│  │  "Trouble falling or staying asleep,   │  │
│  │   or sleeping too much"                │  │
│  │                                        │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  ┌────────────────────────────────────────┐  │
│  │  ○  Not at all                         │  │
│  ├────────────────────────────────────────┤  │
│  │  ◉  Several days               ✓      │  │  ← selected
│  ├────────────────────────────────────────┤  │
│  │  ○  More than half the days            │  │
│  ├────────────────────────────────────────┤  │
│  │  ○  Nearly every day                   │  │
│  └────────────────────────────────────────┘  │
│                                              │
│                                              │
│    [← Previous]              [Next →]        │
│                                              │
├──────────────────────────────────────────────┤
│  🆘 Crisis? 988 | Text HOME → 741741        │
└──────────────────────────────────────────────┘
```

### 4. Results Screen (Single-Scale: PHQ-9/GAD-7/PSS-10)

```
┌──────────────────────────────────────────────┐
│  🧠 MindCheck                   [Dashboard]  │
├──────────────────────────────────────────────┤
│                                              │
│     Your PHQ-9 Results                       │
│     Completed: Sep 23, 2026                  │
│                                              │
│     ╭──────────────────────────────╮         │
│     │                              │         │
│     │        Score: 14 / 27        │         │
│     │                              │         │
│     │     ╭──────────────╮         │         │
│     │     │      🟠      │         │         │
│     │     │   MODERATE   │         │         │
│     │     ╰──────────────╯         │         │
│     │                              │         │
│     │  ──────────────────────────  │         │
│     │  🟢    🟡    🟠    🔴   🔴🔴  │         │
│     │  0-4  5-9  10-14 15-19 20+  │         │
│     │             ▲                │         │
│     │         You are here         │         │
│     │                              │         │
│     ╰──────────────────────────────╯         │
│                                              │
│     📖 What This Means                       │
│     ─────────────────────                    │
│     Your responses suggest moderate          │
│     symptoms of depression. This doesn't     │
│     mean you have clinical depression,       │
│     but it does suggest that speaking        │
│     with a mental health professional        │
│     could be helpful.                        │
│                                              │
│     💡 Recommended Next Steps                │
│     ─────────────────────                    │
│     ✓ Consider speaking with a counselor     │
│     ✓ Practice self-care routines            │
│     ✓ Reach out to someone you trust         │
│     ✓ Retake this screening in 2 weeks       │
│                                              │
│     📚 Helpful Resources                     │
│     ┌──────────────────────────────────┐     │
│     │ 🌐 Find a Therapist (free dir.)  │     │
│     │ 📖 Understanding Depression       │     │
│     │ 🧘 Free Mindfulness App          │     │
│     │ 📞 Warmline Directory            │     │
│     └──────────────────────────────────┘     │
│                                              │
│     ╭────────────────╮ ╭────────────────╮    │
│     │ Take Another   │ │ Save Results   │    │
│     │ Screening      │ │ (Create Acct)  │    │
│     ╰────────────────╯ ╰────────────────╯    │
│                                              │
│     ⚠️ Disclaimer: This screening is not     │
│     a diagnosis. Please consult a qualified  │
│     healthcare provider.                     │
│                                              │
├──────────────────────────────────────────────┤
│  🆘 Crisis? 988 | Text HOME → 741741        │
└──────────────────────────────────────────────┘
```

### 5. DASS-21 Results (Multi-Subscale)

```
┌──────────────────────────────────────────────┐
│  🧠 MindCheck                   [Dashboard]  │
├──────────────────────────────────────────────┤
│                                              │
│     Your DASS-21 Results                     │
│     Completed: Sep 23, 2026                  │
│                                              │
│  ┌────────────────────────────────────────┐  │
│  │  Depression         Anxiety            │  │
│  │  Score: 18 (×2)     Score: 10 (×2)     │  │
│  │  ┌──────────┐       ┌──────────┐       │  │
│  │  │    🟠    │       │    🟠    │       │  │
│  │  │ MODERATE │       │ MODERATE │       │  │
│  │  └──────────┘       └──────────┘       │  │
│  │                                        │  │
│  │  Stress                                │  │
│  │  Score: 22 (×2)                        │  │
│  │  ┌──────────┐                          │  │
│  │  │    🟠    │                          │  │
│  │  │ MODERATE │                          │  │
│  │  └──────────┘                          │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  📊 Score Breakdown                          │
│  ┌────────────────────────────────────────┐  │
│  │ Depression  ████████████░░░░  18/42    │  │
│  │ Anxiety     ██████░░░░░░░░░  10/42    │  │
│  │ Stress      ████████████░░░  22/42    │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  (... interpretation & resources below ...)  │
│                                              │
├──────────────────────────────────────────────┤
│  🆘 Crisis? 988 | Text HOME → 741741        │
└──────────────────────────────────────────────┘
```

### 6. Progress Dashboard (Logged-in Users)

```
┌──────────────────────────────────────────────┐
│  🧠 MindCheck    [Screenings] [Resources]    │
│                  [Dashboard]  [Logout]        │
├──────────────────────────────────────────────┤
│                                              │
│  📊 Your Progress                            │
│                                              │
│  Filter: [PHQ-9 ▾]  Period: [All time ▾]    │
│                                              │
│  ┌────────────────────────────────────────┐  │
│  │  PHQ-9 Score Over Time                 │  │
│  │                                        │  │
│  │  27│                                   │  │
│  │    │                                   │  │
│  │  20│         •                         │  │
│  │    │        ╱ ╲                        │  │
│  │  15│       ╱   ╲                      │  │
│  │    │      •     ╲                     │  │
│  │  10│              •─────•             │  │
│  │    │                     ╲            │  │
│  │   5│                      •           │  │
│  │    │                                   │  │
│  │   0│                                   │  │
│  │    └────┬────┬────┬────┬────┬────     │  │
│  │       Aug  Aug  Sep  Sep  Sep         │  │
│  │        1   15    1   15   23          │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  📋 Past Screenings                          │
│  ┌─────────┬───────┬──────────┬──────────┐  │
│  │ Date    │ Test  │ Score    │ Severity │  │
│  ├─────────┼───────┼──────────┼──────────┤  │
│  │ Sep 23  │ PHQ-9 │  5/27   │ 🟡 Mild  │  │
│  │ Sep 15  │ PHQ-9 │ 10/27   │ 🟠 Mod   │  │
│  │ Sep 1   │ PHQ-9 │ 10/27   │ 🟠 Mod   │  │
│  │ Aug 15  │ PHQ-9 │ 18/27   │ 🔴 M.Sev │  │
│  │ Aug 1   │ PHQ-9 │ 14/27   │ 🟠 Mod   │  │
│  └─────────┴───────┴──────────┴──────────┘  │
│                                              │
│  🎉 Your scores have been trending down!     │
│  Keep up the great work.                     │
│                                              │
├──────────────────────────────────────────────┤
│  🆘 Crisis? 988 | Text HOME → 741741        │
└──────────────────────────────────────────────┘
```

### 7. Crisis Alert Overlay (Triggered Automatically)

```
┌──────────────────────────────────────────────┐
│                                              │
│  ╔════════════════════════════════════════╗   │
│  ║                                        ║   │
│  ║   💙 You don't have to face this       ║   │
│  ║      alone                             ║   │
│  ║                                        ║   │
│  ║   Your responses suggest you may       ║   │
│  ║   be going through a really tough      ║   │
│  ║   time. Help is available right now.   ║   │
│  ║                                        ║   │
│  ║   📞 988 Suicide & Crisis Lifeline     ║   │
│  ║      Call or text: 988                 ║   │
│  ║      [ Call Now ]                      ║   │
│  ║                                        ║   │
│  ║   💬 Crisis Text Line                  ║   │
│  ║      Text HOME to 741741              ║   │
│  ║      [ Text Now ]                      ║   │
│  ║                                        ║   │
│  ║   🇵🇰 Umang Helpline                   ║   │
│  ║      0311-7786264                      ║   │
│  ║      [ Call Now ]                      ║   │
│  ║                                        ║   │
│  ║   ──────────────────────────────────   ║   │
│  ║                                        ║   │
│  ║   [ Continue to my results ]           ║   │
│  ║                                        ║   │
│  ╚════════════════════════════════════════╝   │
│                                              │
└──────────────────────────────────────────────┘
```

---

## 📱 Responsive Breakpoints

| Breakpoint | Width | Layout |
|-----------|-------|--------|
| Mobile | < 640px | Single column, stacked cards |
| Tablet | 640–1024px | 2-column card grid |
| Desktop | > 1024px | 2-3 column, centered max-width container |

---

## 🎯 Interaction Patterns

1. **Question Navigation:** One question per screen with smooth slide transition
2. **Selection Feedback:** Haptic-style visual pulse when option selected
3. **Auto-Advance:** Optional — after selecting, auto-move to next question (with 500ms delay)
4. **Progress Bar:** Fills smoothly as user progresses
5. **Back Navigation:** Always available, preserves previous answers
6. **Exit Confirmation:** "Are you sure? Your progress will be lost." modal
7. **Score Reveal:** Animated counter (0 → final score) for engagement
8. **Severity Gauge:** Animated arc/gauge that fills to the user's level
