# MindCheck — Scoring Algorithms (Implementation Reference)

---

## TypeScript Scoring Engine

```typescript
// server/src/services/scoring.service.ts

// ============================================================
// TYPES
// ============================================================

interface ScoringResult {
  totalScore: number;
  maxPossible: number;
  severityLevel: string;
  severityColor: string;
  criticalFlag: boolean;
  flaggedItems: number[];
  subscaleScores: SubscaleScore[] | null;
  interpretation: Interpretation;
  recommendations: string[];
}

interface SubscaleScore {
  name: string;
  rawScore: number;
  scaledScore: number;  // after multiplication
  maxPossible: number;
  severityLevel: string;
  severityColor: string;
}

interface Interpretation {
  summary: string;
  detail: string;
  disclaimer: string;
}

interface ResponseItem {
  questionNum: number;
  answerValue: number;
}

// ============================================================
// PHQ-9 SCORING
// ============================================================

function scorePHQ9(responses: ResponseItem[]): ScoringResult {
  const totalScore = responses.reduce((sum, r) => sum + r.answerValue, 0);
  const maxPossible = 27;

  // Critical item check: Question 9 (self-harm)
  const q9 = responses.find(r => r.questionNum === 9);
  const criticalFlag = q9 ? q9.answerValue >= 1 : false;
  const flaggedItems = criticalFlag ? [9] : [];

  // Severity classification
  let severityLevel: string;
  let severityColor: string;

  if (totalScore <= 4) {
    severityLevel = "minimal";
    severityColor = "green";
  } else if (totalScore <= 9) {
    severityLevel = "mild";
    severityColor = "yellow";
  } else if (totalScore <= 14) {
    severityLevel = "moderate";
    severityColor = "orange";
  } else if (totalScore <= 19) {
    severityLevel = "moderately severe";
    severityColor = "red";
  } else {
    severityLevel = "severe";
    severityColor = "darkred";
  }

  return {
    totalScore,
    maxPossible,
    severityLevel,
    severityColor,
    criticalFlag,
    flaggedItems,
    subscaleScores: null,
    interpretation: getPHQ9Interpretation(totalScore, severityLevel),
    recommendations: getPHQ9Recommendations(severityLevel, criticalFlag),
  };
}

// ============================================================
// GAD-7 SCORING
// ============================================================

function scoreGAD7(responses: ResponseItem[]): ScoringResult {
  const totalScore = responses.reduce((sum, r) => sum + r.answerValue, 0);
  const maxPossible = 21;

  let severityLevel: string;
  let severityColor: string;

  if (totalScore <= 4) {
    severityLevel = "minimal";
    severityColor = "green";
  } else if (totalScore <= 9) {
    severityLevel = "mild";
    severityColor = "yellow";
  } else if (totalScore <= 14) {
    severityLevel = "moderate";
    severityColor = "orange";
  } else {
    severityLevel = "severe";
    severityColor = "red";
  }

  return {
    totalScore,
    maxPossible,
    severityLevel,
    severityColor,
    criticalFlag: false,
    flaggedItems: [],
    subscaleScores: null,
    interpretation: getGAD7Interpretation(totalScore, severityLevel),
    recommendations: getGAD7Recommendations(severityLevel),
  };
}

// ============================================================
// PSS-10 SCORING
// ============================================================

const PSS_REVERSE_ITEMS = [4, 5, 7, 8]; // These are reverse-scored

function scorePSS10(responses: ResponseItem[]): ScoringResult {
  // Apply reverse scoring to items 4, 5, 7, 8
  const scoredResponses = responses.map(r => {
    if (PSS_REVERSE_ITEMS.includes(r.questionNum)) {
      return { ...r, answerValue: 4 - r.answerValue }; // Reverse: 0↔4, 1↔3, 2=2
    }
    return r;
  });

  const totalScore = scoredResponses.reduce((sum, r) => sum + r.answerValue, 0);
  const maxPossible = 40;

  let severityLevel: string;
  let severityColor: string;

  if (totalScore <= 13) {
    severityLevel = "low stress";
    severityColor = "green";
  } else if (totalScore <= 26) {
    severityLevel = "moderate stress";
    severityColor = "yellow";
  } else {
    severityLevel = "high perceived stress";
    severityColor = "red";
  }

  return {
    totalScore,
    maxPossible,
    severityLevel,
    severityColor,
    criticalFlag: false,
    flaggedItems: [],
    subscaleScores: null,
    interpretation: getPSS10Interpretation(totalScore, severityLevel),
    recommendations: getPSS10Recommendations(severityLevel),
  };
}

// ============================================================
// DASS-21 SCORING
// ============================================================

// Subscale item mapping
const DASS21_SUBSCALES = {
  depression: [3, 5, 10, 13, 16, 17, 21],  // 7 items
  anxiety:    [2, 4, 7, 9, 15, 19, 20],     // 7 items
  stress:     [1, 6, 8, 11, 12, 14, 18],    // 7 items
};

// Critical depression items (hopelessness, worthlessness)
const DASS21_CRITICAL_ITEMS = [10, 17, 21];

// Severity thresholds (applied AFTER multiplying by 2)
const DASS21_SEVERITY = {
  depression: [
    { max: 9,  level: "normal",           color: "green" },
    { max: 13, level: "mild",             color: "yellow" },
    { max: 20, level: "moderate",         color: "orange" },
    { max: 27, level: "severe",           color: "red" },
    { max: 42, level: "extremely severe", color: "darkred" },
  ],
  anxiety: [
    { max: 7,  level: "normal",           color: "green" },
    { max: 9,  level: "mild",             color: "yellow" },
    { max: 14, level: "moderate",         color: "orange" },
    { max: 19, level: "severe",           color: "red" },
    { max: 42, level: "extremely severe", color: "darkred" },
  ],
  stress: [
    { max: 14, level: "normal",           color: "green" },
    { max: 18, level: "mild",             color: "yellow" },
    { max: 25, level: "moderate",         color: "orange" },
    { max: 33, level: "severe",           color: "red" },
    { max: 42, level: "extremely severe", color: "darkred" },
  ],
};

function scoreDASS21(responses: ResponseItem[]): ScoringResult {
  const subscaleScores: SubscaleScore[] = [];
  let overallCriticalFlag = false;
  const flaggedItems: number[] = [];

  // Check critical items
  for (const itemNum of DASS21_CRITICAL_ITEMS) {
    const response = responses.find(r => r.questionNum === itemNum);
    if (response && response.answerValue >= 2) {
      overallCriticalFlag = true;
      flaggedItems.push(itemNum);
    }
  }

  // Score each subscale
  for (const [scaleName, itemNums] of Object.entries(DASS21_SUBSCALES)) {
    const scaleResponses = responses.filter(r => itemNums.includes(r.questionNum));
    const rawScore = scaleResponses.reduce((sum, r) => sum + r.answerValue, 0);
    const scaledScore = rawScore * 2; // DASS-21 → DASS-42 conversion
    const maxPossible = 42; // 7 items × 3 max × 2 multiplier

    // Find severity level
    const thresholds = DASS21_SEVERITY[scaleName as keyof typeof DASS21_SEVERITY];
    const threshold = thresholds.find(t => scaledScore <= t.max) || thresholds[thresholds.length - 1];

    subscaleScores.push({
      name: scaleName,
      rawScore,
      scaledScore,
      maxPossible,
      severityLevel: threshold.level,
      severityColor: threshold.color,
    });
  }

  // Overall severity is the worst across subscales
  const severityOrder = ["normal", "mild", "moderate", "severe", "extremely severe"];
  const colorOrder = ["green", "yellow", "orange", "red", "darkred"];
  const worstIndex = Math.max(
    ...subscaleScores.map(s => severityOrder.indexOf(s.severityLevel))
  );

  const totalRaw = responses.reduce((sum, r) => sum + r.answerValue, 0);

  return {
    totalScore: totalRaw * 2,
    maxPossible: 126,
    severityLevel: severityOrder[worstIndex],
    severityColor: colorOrder[worstIndex],
    criticalFlag: overallCriticalFlag,
    flaggedItems,
    subscaleScores,
    interpretation: getDASS21Interpretation(subscaleScores),
    recommendations: getDASS21Recommendations(subscaleScores, overallCriticalFlag),
  };
}

// ============================================================
// MASTER SCORING FUNCTION
// ============================================================

function calculateScore(assessmentSlug: string, responses: ResponseItem[]): ScoringResult {
  switch (assessmentSlug) {
    case "phq9":   return scorePHQ9(responses);
    case "gad7":   return scoreGAD7(responses);
    case "pss10":  return scorePSS10(responses);
    case "dass21": return scoreDASS21(responses);
    default:
      throw new Error(`Unknown assessment: ${assessmentSlug}`);
  }
}
```

---

## Scoring Validation Test Cases

### PHQ-9
| Input (9 answers) | Total | Expected Severity |
|-------------------|-------|-------------------|
| All 0s: [0,0,0,0,0,0,0,0,0] | 0 | minimal |
| All 1s: [1,1,1,1,1,1,1,1,1] | 9 | mild |
| Mixed: [2,2,1,2,1,2,1,1,0] | 12 | moderate |
| High: [3,2,3,2,3,2,2,2,1] | 20 | severe |
| Q9=1, rest=0: [0,0,0,0,0,0,0,0,1] | 1 | minimal + CRITICAL FLAG |

### GAD-7
| Input (7 answers) | Total | Expected Severity |
|-------------------|-------|-------------------|
| All 0s | 0 | minimal |
| All 1s | 7 | mild |
| [2,2,2,2,1,1,1] | 11 | moderate |
| All 3s | 21 | severe |

### PSS-10
| Input (10 answers, raw) | After Reverse | Total | Expected |
|------------------------|---------------|-------|----------|
| All 0s | Items 4,5,7,8 → 4 | 16 | moderate |
| All 4s | Items 4,5,7,8 → 0 | 24 | moderate |
| [4,4,4,0,0,4,0,0,4,4] | Reversed: [4,4,4,4,4,4,4,4,4,4] | 40 | high |
| [0,0,0,4,4,0,4,4,0,0] | Reversed: [0,0,0,0,0,0,0,0,0,0] | 0 | low |

### DASS-21
| Subscale | Raw Sum | ×2 | Expected Severity |
|----------|---------|-----|-------------------|
| Depression: all 0s | 0 | 0 | normal |
| Depression: all 2s | 14 | 28 | extremely severe |
| Anxiety: all 1s | 7 | 14 | moderate |
| Stress: all 1s | 7 | 14 | normal |
| Stress: all 2s | 14 | 28 | severe |
