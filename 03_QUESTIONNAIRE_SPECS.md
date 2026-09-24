# MindCheck — Questionnaire Specifications

---

## ⚠️ Important Notes
- All four instruments are **freely available** for use in clinical practice, education, and research
- PHQ-9 and GAD-7 were developed by Drs. Kroenke, Spitzer & Williams — free to use without permission
- PSS-10 was developed by Dr. Sheldon Cohen — freely available
- DASS-21 was developed by Lovibond & Lovibond — freely available from UNSW

---

## 1️⃣ PHQ-9 (Patient Health Questionnaire-9) — Depression

### Purpose
Screens for the presence and severity of **depression**. Based on DSM criteria for major depressive disorder.

### Instructions to User
> *"Over the **last 2 weeks**, how often have you been bothered by any of the following problems?"*

### Response Options (same for all 9 items)

| Response | Points |
|----------|--------|
| Not at all | 0 |
| Several days | 1 |
| More than half the days | 2 |
| Nearly every day | 3 |

### Questions

| # | Question |
|---|----------|
| 1 | Little interest or pleasure in doing things |
| 2 | Feeling down, depressed, or hopeless |
| 3 | Trouble falling or staying asleep, or sleeping too much |
| 4 | Feeling tired or having little energy |
| 5 | Poor appetite or overeating |
| 6 | Feeling bad about yourself — or that you are a failure or have let yourself or your family down |
| 7 | Trouble concentrating on things, such as reading the newspaper or watching television |
| 8 | Moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual |
| 9 | Thoughts that you would be better off dead, or of hurting yourself in some way |

### ⚠️ Critical Item: Question 9
If a user scores **1 or higher on Question 9**, the system must:
1. Immediately display crisis resources (988 Suicide & Crisis Lifeline, Crisis Text Line)
2. Show a supportive message encouraging them to reach out
3. Still complete the assessment normally

### Scoring (Total: 0–27)

| Score Range | Severity | Color Code | Recommended Action |
|-------------|----------|------------|-------------------|
| 0–4 | Minimal / None | 🟢 Green | Self-care resources |
| 5–9 | Mild | 🟡 Yellow | Self-help, watchful waiting, consider counseling |
| 10–14 | Moderate | 🟠 Orange | Counseling recommended, possible medication |
| 15–19 | Moderately Severe | 🔴 Red | Active treatment recommended |
| 20–27 | Severe | 🔴🔴 Dark Red | Immediate treatment, specialist referral |

### Follow-up Question (Optional — after scoring)
> *"If you checked off any problems, how difficult have these problems made it for you to do your work, take care of things at home, or get along with other people?"*
- Not difficult at all
- Somewhat difficult
- Very difficult
- Extremely difficult

---

## 2️⃣ GAD-7 (Generalized Anxiety Disorder-7) — Anxiety

### Purpose
Screens for the presence and severity of **generalized anxiety disorder**.

### Instructions to User
> *"Over the **last 2 weeks**, how often have you been bothered by the following problems?"*

### Response Options (same for all 7 items)

| Response | Points |
|----------|--------|
| Not at all | 0 |
| Several days | 1 |
| More than half the days | 2 |
| Nearly every day | 3 |

### Questions

| # | Question |
|---|----------|
| 1 | Feeling nervous, anxious, or on edge |
| 2 | Not being able to stop or control worrying |
| 3 | Worrying too much about different things |
| 4 | Trouble relaxing |
| 5 | Being so restless that it is hard to sit still |
| 6 | Becoming easily annoyed or irritable |
| 7 | Feeling afraid, as if something awful might happen |

### Scoring (Total: 0–21)

| Score Range | Severity | Color Code | Recommended Action |
|-------------|----------|------------|-------------------|
| 0–4 | Minimal | 🟢 Green | Self-care resources |
| 5–9 | Mild | 🟡 Yellow | Monitor, self-help techniques |
| 10–14 | Moderate | 🟠 Orange | Counseling recommended |
| 15–21 | Severe | 🔴 Red | Active treatment, specialist referral |

### Follow-up Question (Optional)
> *"If you checked off any problems, how difficult have these problems made it for you to do your work, take care of things at home, or get along with other people?"*
- Not difficult at all
- Somewhat difficult
- Very difficult
- Extremely difficult

---

## 3️⃣ PSS-10 (Perceived Stress Scale — 10 Item) — Stress

### Purpose
Measures the degree to which situations in one's life are appraised as **stressful**. Unlike DASS-21, this measures *perceived* stress rather than symptoms.

### Instructions to User
> *"The questions in this scale ask you about your feelings and thoughts during **the last month**. In each case, please indicate how often you felt or thought a certain way."*

### Response Options (same for all 10 items)

| Response | Points |
|----------|--------|
| Never | 0 |
| Almost never | 1 |
| Sometimes | 2 |
| Fairly often | 3 |
| Very often | 4 |

### Questions

| # | Question | Scoring |
|---|----------|---------|
| 1 | In the last month, how often have you been upset because of something that happened unexpectedly? | **Normal** |
| 2 | In the last month, how often have you felt that you were unable to control the important things in your life? | **Normal** |
| 3 | In the last month, how often have you felt nervous and "stressed"? | **Normal** |
| 4 | In the last month, how often have you felt confident about your ability to handle your personal problems? | **⚡ REVERSE** |
| 5 | In the last month, how often have you felt that things were going your way? | **⚡ REVERSE** |
| 6 | In the last month, how often have you found that you could not cope with all the things that you had to do? | **Normal** |
| 7 | In the last month, how often have you been able to control irritations in your life? | **⚡ REVERSE** |
| 8 | In the last month, how often have you felt that you were on top of things? | **⚡ REVERSE** |
| 9 | In the last month, how often have you been angered because of things that were outside of your control? | **Normal** |
| 10 | In the last month, how often have you felt difficulties were piling up so high that you could not overcome them? | **Normal** |

### ⚡ Reverse Scoring (Items 4, 5, 7, 8)
For these items, the scoring is flipped:
- Very often = 0, Fairly often = 1, Sometimes = 2, Almost never = 3, Never = 4

**Formula:** Reverse score = 4 − original score

### Scoring (Total: 0–40)

| Score Range | Severity | Color Code | Recommended Action |
|-------------|----------|------------|-------------------|
| 0–13 | Low Stress | 🟢 Green | Maintain current coping strategies |
| 14–26 | Moderate Stress | 🟡 Yellow | Stress management techniques recommended |
| 27–40 | High Perceived Stress | 🔴 Red | Professional support recommended |

---

## 4️⃣ DASS-21 (Depression Anxiety Stress Scales — 21 Item) — Combined

### Purpose
Measures three related negative emotional states: **Depression**, **Anxiety**, and **Stress**. Provides separate scores for each subscale.

### Instructions to User
> *"Please read each statement and select a number 0, 1, 2 or 3 which indicates how much the statement applied to you **over the past week**. There are no right or wrong answers. Do not spend too much time on any statement."*

### Response Options (same for all 21 items)

| Response | Points |
|----------|--------|
| Did not apply to me at all | 0 |
| Applied to me to some degree, or some of the time | 1 |
| Applied to me to a considerable degree, or a good part of time | 2 |
| Applied to me very much, or most of the time | 3 |

### Questions & Subscale Mapping

| # | Question | Subscale |
|---|----------|----------|
| 1 | I found it hard to wind down | **Stress** |
| 2 | I was aware of dryness of my mouth | **Anxiety** |
| 3 | I couldn't seem to experience any positive feeling at all | **Depression** |
| 4 | I experienced breathing difficulty (e.g., excessively rapid breathing, breathlessness in the absence of physical exertion) | **Anxiety** |
| 5 | I found it difficult to work up the initiative to do things | **Depression** |
| 6 | I tended to over-react to situations | **Stress** |
| 7 | I experienced trembling (e.g., in the hands) | **Anxiety** |
| 8 | I felt that I was using a lot of nervous energy | **Stress** |
| 9 | I was worried about situations in which I might panic and make a fool of myself | **Anxiety** |
| 10 | I felt that I had nothing to look forward to | **Depression** |
| 11 | I found myself getting agitated | **Stress** |
| 12 | I found it difficult to relax | **Stress** |
| 13 | I felt down-hearted and blue | **Depression** |
| 14 | I was intolerant of anything that kept me from getting on with what I was doing | **Stress** |
| 15 | I felt I was close to panic | **Anxiety** |
| 16 | I was unable to become enthusiastic about anything | **Depression** |
| 17 | I felt I wasn't worth much as a person | **Depression** |
| 18 | I felt that I was rather touchy | **Stress** |
| 19 | I was aware of the action of my heart in the absence of physical exertion (e.g., sense of heart rate increase, heart missing a beat) | **Anxiety** |
| 20 | I felt scared without any good reason | **Anxiety** |
| 21 | I felt that life was meaningless | **Depression** |

### Subscale Item Groups

| Subscale | Item Numbers | # Items |
|----------|-------------|---------|
| **Depression** | 3, 5, 10, 13, 16, 17, 21 | 7 |
| **Anxiety** | 2, 4, 7, 9, 15, 19, 20 | 7 |
| **Stress** | 1, 6, 8, 11, 12, 14, 18 | 7 |

### ⚠️ CRITICAL: Score Multiplication
DASS-21 raw scores must be **multiplied by 2** to match the full DASS-42 severity labels:

```
Final Score = Sum of subscale items × 2
```

### Scoring — Depression Subscale (multiply by 2 first)

| Score (×2) | Severity | Color Code |
|-----------|----------|------------|
| 0–9 | Normal | 🟢 Green |
| 10–13 | Mild | 🟡 Yellow |
| 14–20 | Moderate | 🟠 Orange |
| 21–27 | Severe | 🔴 Red |
| 28+ | Extremely Severe | 🔴🔴 Dark Red |

### Scoring — Anxiety Subscale (multiply by 2 first)

| Score (×2) | Severity | Color Code |
|-----------|----------|------------|
| 0–7 | Normal | 🟢 Green |
| 8–9 | Mild | 🟡 Yellow |
| 10–14 | Moderate | 🟠 Orange |
| 15–19 | Severe | 🔴 Red |
| 20+ | Extremely Severe | 🔴🔴 Dark Red |

### Scoring — Stress Subscale (multiply by 2 first)

| Score (×2) | Severity | Color Code |
|-----------|----------|------------|
| 0–14 | Normal | 🟢 Green |
| 15–18 | Mild | 🟡 Yellow |
| 19–25 | Moderate | 🟠 Orange |
| 26–33 | Severe | 🔴 Red |
| 34+ | Extremely Severe | 🔴🔴 Dark Red |

### ⚠️ Critical Items: DASS-21
If a user scores high on items **10, 17, or 21** (Depression subscale items about hopelessness and worthlessness), display crisis resources proactively.

---

## 🆘 Crisis Resources (Displayed When Needed)

These must be shown **immediately** when critical items are flagged:

### International
| Resource | Contact | Method |
|----------|---------|--------|
| **988 Suicide & Crisis Lifeline** (US) | 988 | Call or Text |
| **Crisis Text Line** (US) | Text HOME to 741741 | Text |
| **Befrienders Worldwide** | befrienders.org | Directory |
| **International Association for Suicide Prevention** | https://www.iasp.info/resources/Crisis_Centres/ | Directory |

### Pakistan-Specific (based on user's location)
| Resource | Contact | Method |
|----------|---------|--------|
| **Umang Mental Health Helpline** | 0311-7786264 | Call |
| **Rozan Counseling** | 0800-22-444 | Call |
| **Taskeen** | taskeen.org | Online counseling |

### Always-Visible Crisis Banner
A persistent but non-intrusive banner at the bottom of every page:
> "If you're in crisis, please reach out: **988** (US) | **0311-7786264** (Pakistan) | [More resources →]"
