// MindCheck — Scoring engine
// Mirrors server/src/services/scoring.service.ts. The server remains the
// source of truth; this client copy is only for optimistic display and tests.

export type ResponseItem = {
  questionNum: number;
  answerValue: number;
};

export type SubscaleScore = {
  name: string;
  rawScore: number;
  scaledScore: number;
  maxPossible: number;
  severityLevel: string;
  severityColor: string;
};

export type Interpretation = {
  summary: string;
  detail: string;
  disclaimer: string;
};

export type Recommendation = {
  priority: number;
  text: string;
  type: "action" | "self-help" | "crisis";
};

export type ScoringResult = {
  totalScore: number;
  maxPossible: number;
  severityLevel: string;
  severityColor: string;
  criticalFlag: boolean;
  flaggedItems: number[];
  subscaleScores: SubscaleScore[] | null;
  interpretation: Interpretation;
  recommendations: Recommendation[];
};

const DISCLAIMER =
  "This screening is not a diagnosis. Only a qualified healthcare provider can diagnose a mental health condition.";

const PSS_REVERSE_ITEMS = [4, 5, 7, 8];

const DASS21_SUBSCALES: Record<string, number[]> = {
  depression: [3, 5, 10, 13, 16, 17, 21],
  anxiety: [2, 4, 7, 9, 15, 19, 20],
  stress: [1, 6, 8, 11, 12, 14, 18],
};

const DASS21_CRITICAL_ITEMS = [10, 17, 21];

const DASS21_SEVERITY: Record<string, { max: number; level: string; color: string }[]> = {
  depression: [
    { max: 9, level: "normal", color: "green" },
    { max: 13, level: "mild", color: "yellow" },
    { max: 20, level: "moderate", color: "orange" },
    { max: 27, level: "severe", color: "red" },
    { max: 42, level: "extremely severe", color: "darkred" },
  ],
  anxiety: [
    { max: 7, level: "normal", color: "green" },
    { max: 9, level: "mild", color: "yellow" },
    { max: 14, level: "moderate", color: "orange" },
    { max: 19, level: "severe", color: "red" },
    { max: 42, level: "extremely severe", color: "darkred" },
  ],
  stress: [
    { max: 14, level: "normal", color: "green" },
    { max: 18, level: "mild", color: "yellow" },
    { max: 25, level: "moderate", color: "orange" },
    { max: 33, level: "severe", color: "red" },
    { max: 42, level: "extremely severe", color: "darkred" },
  ],
};

const SEVERITY_ORDER = ["normal", "minimal", "mild", "moderate", "moderate stress", "severe", "very high", "extremely severe"];
const COLOR_ORDER = ["green", "green", "yellow", "orange", "yellow", "red", "red", "darkred"];

function sum(responses: ResponseItem[]): number {
  return responses.reduce((acc, r) => acc + r.answerValue, 0);
}

function find(responses: ResponseItem[], questionNum: number): ResponseItem | undefined {
  return responses.find((r) => r.questionNum === questionNum);
}

// ────────────────────────────────────────────── PHQ-9
export function scorePHQ9(responses: ResponseItem[]): ScoringResult {
  const totalScore = sum(responses);
  const maxPossible = 27;

  const q9 = find(responses, 9);
  const criticalFlag = q9 ? q9.answerValue >= 1 : false;
  const flaggedItems = criticalFlag ? [9] : [];

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
    interpretation: phq9Interpretation(totalScore, severityLevel),
    recommendations: phq9Recommendations(severityLevel, criticalFlag),
  };
}

function phq9Interpretation(total: number, severity: string): Interpretation {
  const summaries: Record<string, string> = {
    minimal: "Your responses suggest minimal or no symptoms of depression.",
    mild: "Your responses suggest mild symptoms of depression.",
    moderate: "Your responses suggest moderate symptoms of depression.",
    "moderately severe": "Your responses suggest moderately severe symptoms of depression.",
    severe: "Your responses suggest severe symptoms of depression.",
  };
  const details: Record<string, string> = {
    minimal:
      "A score of 4 or below falls in the minimal range. Many people score here during difficult periods and it does not indicate a problem.",
    mild:
      "A score between 5 and 9 falls in the mild range. Low-level depressive symptoms are common, and they may respond well to self-care, rest, and talking to someone you trust.",
    moderate:
      "A score between 10 and 14 falls in the moderate range. This level of symptoms is worth discussing with a mental health professional.",
    "moderately severe":
      "A score between 15 and 19 falls in the moderately severe range. It is a good idea to seek support from a counselor, therapist, or doctor.",
    severe:
      "A score of 20 or above falls in the severe range. Please consider reaching out to a mental health professional soon.",
  };
  return {
    summary: summaries[severity],
    detail:
      details[severity] +
      ` Your score of ${total} out of ${27} places you in the ${severity} band.`,
    disclaimer: DISCLAIMER,
  };
}

function phq9Recommendations(severity: string, critical: boolean): Recommendation[] {
  const recs: Recommendation[] = [];
  if (critical) {
    recs.push({
      priority: 1,
      text: "You indicated thoughts of self-harm. Please reach out to a crisis line or emergency service today — you do not have to handle this alone.",
      type: "crisis",
    });
  }
  if (severity === "severe" || severity === "moderately severe") {
    recs.push({
      priority: recs.length + 1,
      text: "Schedule an appointment with a mental health professional as soon as possible.",
      type: "action",
    });
  } else if (severity === "moderate") {
    recs.push({
      priority: recs.length + 1,
      text: "Consider scheduling an appointment with a mental health professional.",
      type: "action",
    });
  } else if (severity === "mild") {
    recs.push({
      priority: recs.length + 1,
      text: "Monitor how you feel and consider talking to a counselor if symptoms persist or worsen.",
      type: "self-help",
    });
  } else {
    recs.push({
      priority: recs.length + 1,
      text: "Maintain healthy habits — sleep, movement, and social connection protect your mental health.",
      type: "self-help",
    });
  }
  recs.push({
    priority: recs.length + 1,
    text: "Practice regular self-care: consistent sleep, exercise, and staying connected with people you trust.",
    type: "self-help",
  });
  return recs;
}

// ────────────────────────────────────────────── GAD-7
export function scoreGAD7(responses: ResponseItem[]): ScoringResult {
  const totalScore = sum(responses);
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
    interpretation: gad7Interpretation(totalScore, severityLevel),
    recommendations: gad7Recommendations(severityLevel),
  };
}

function gad7Interpretation(total: number, severity: string): Interpretation {
  const summaries: Record<string, string> = {
    minimal: "Your responses suggest minimal or no symptoms of anxiety.",
    mild: "Your responses suggest mild symptoms of anxiety.",
    moderate: "Your responses suggest moderate symptoms of anxiety.",
    severe: "Your responses suggest severe symptoms of anxiety.",
  };
  const details: Record<string, string> = {
    minimal:
      "A score of 4 or below falls in the minimal range. This is a typical result, and it does not indicate a disorder.",
    mild:
      "A score between 5 and 9 falls in the mild range. Techniques such as slow breathing, reducing caffeine, and regular sleep can help.",
    moderate:
      "A score between 10 and 14 falls in the moderate range. Anxiety at this level is often manageable with support from a counselor or therapist.",
    severe:
      "A score of 15 or above falls in the severe range. Please consider reaching out to a mental health professional.",
  };
  return {
    summary: summaries[severity],
    detail:
      details[severity] + ` Your score of ${total} out of ${21} places you in the ${severity} band.`,
    disclaimer: DISCLAIMER,
  };
}

function gad7Recommendations(severity: string): Recommendation[] {
  const recs: Recommendation[] = [];
  if (severity === "severe") {
    recs.push({
      priority: 1,
      text: "Reach out to a mental health professional for support and treatment options.",
      type: "action",
    });
  } else if (severity === "moderate") {
    recs.push({
      priority: 1,
      text: "Consider counseling or therapy to build tools for managing anxiety.",
      type: "action",
    });
  } else {
    recs.push({
      priority: 1,
      text: "Try daily relaxation practices — slow breathing, grounding exercises, and limiting caffeine.",
      type: "self-help",
    });
  }
  recs.push({
    priority: recs.length + 1,
    text: "Keep a regular sleep schedule and reduce alcohol and caffeine.",
    type: "self-help",
  });
  return recs;
}

// ────────────────────────────────────────────── PSS-10
export function scorePSS10(responses: ResponseItem[]): ScoringResult {
  const scored = responses.map((r) =>
    PSS_REVERSE_ITEMS.includes(r.questionNum)
      ? { ...r, answerValue: 4 - r.answerValue }
      : r,
  );
  const totalScore = sum(scored);
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
    interpretation: pss10Interpretation(totalScore, severityLevel),
    recommendations: pss10Recommendations(severityLevel),
  };
}

function pss10Interpretation(total: number, severity: string): Interpretation {
  const summaries: Record<string, string> = {
    "low stress": "Your responses suggest a relatively low level of perceived stress.",
    "moderate stress": "Your responses suggest a moderate level of perceived stress.",
    "high perceived stress": "Your responses suggest a high level of perceived stress.",
  };
  const details: Record<string, string> = {
    "low stress":
      "A score of 13 or below falls in the low range. You appear to be managing your stress well.",
    "moderate stress":
      "A score between 14 and 26 falls in the moderate range. Most people fall here, and stress management techniques are worth practising.",
    "high perceived stress":
      "A score of 27 or above falls in the high range. High perceived stress is associated with health problems — reaching out for support is worthwhile.",
  };
  return {
    summary: summaries[severity],
    detail:
      details[severity] +
      ` Your score of ${total} out of ${40} places you in the ${severity} band. (Items 4, 5, 7 and 8 are reverse-scored.)`,
    disclaimer:
      "This screening is not a diagnosis. The PSS-10 measures perceived stress, not any medical or psychiatric condition.",
  };
}

function pss10Recommendations(severity: string): Recommendation[] {
  const recs: Recommendation[] = [];
  if (severity === "high perceived stress") {
    recs.push({
      priority: 1,
      text: "Consider speaking with a mental health professional or a doctor about managing stress.",
      type: "action",
    });
  } else if (severity === "moderate stress") {
    recs.push({
      priority: 1,
      text: "Build regular stress management into your week — exercise, relaxation, and time outdoors.",
      type: "self-help",
    });
  } else {
    recs.push({
      priority: 1,
      text: "Keep up the coping strategies that are working for you.",
      type: "self-help",
    });
  }
  recs.push({
    priority: recs.length + 1,
    text: "Set boundaries at work and home, and protect your sleep.",
    type: "self-help",
  });
  return recs;
}

// ────────────────────────────────────────────── DASS-21
export function scoreDASS21(responses: ResponseItem[]): ScoringResult {
  const subscaleScores: SubscaleScore[] = [];
  const flaggedItems: number[] = [];

  for (const itemNum of DASS21_CRITICAL_ITEMS) {
    const r = find(responses, itemNum);
    if (r && r.answerValue >= 2) flaggedItems.push(itemNum);
  }
  const criticalFlag = flaggedItems.length > 0;

  for (const [name, itemNums] of Object.entries(DASS21_SUBSCALES)) {
    const scaleResponses = responses.filter((r) => itemNums.includes(r.questionNum));
    const rawScore = sum(scaleResponses);
    const scaledScore = rawScore * 2;
    const maxPossible = 42;
    const thresholds = DASS21_SEVERITY[name];
    const threshold = thresholds.find((t) => scaledScore <= t.max) ?? thresholds[thresholds.length - 1];
    subscaleScores.push({
      name,
      rawScore,
      scaledScore,
      maxPossible,
      severityLevel: threshold.level,
      severityColor: threshold.color,
    });
  }

  const worstIndex = Math.max(
    ...subscaleScores.map((s) => SEVERITY_ORDER.indexOf(s.severityLevel)),
  );
  const totalRaw = sum(responses);

  return {
    totalScore: totalRaw * 2,
    maxPossible: 126,
    severityLevel: SEVERITY_ORDER[worstIndex],
    severityColor: COLOR_ORDER[worstIndex],
    criticalFlag,
    flaggedItems,
    subscaleScores,
    interpretation: dass21Interpretation(subscaleScores),
    recommendations: dass21Recommendations(subscaleScores, criticalFlag),
  };
}

function dass21Interpretation(subscales: SubscaleScore[]): Interpretation {
  const byName = Object.fromEntries(subscales.map((s) => [s.name, s]));
  const dep = byName.depression;
  const anx = byName.anxiety;
  const str = byName.stress;
  const parts: string[] = [];
  parts.push(`Depression: ${dep.severityLevel} (${dep.scaledScore}/42)`);
  parts.push(`Anxiety: ${anx.severityLevel} (${anx.scaledScore}/42)`);
  parts.push(`Stress: ${str.severityLevel} (${str.scaledScore}/42)`);
  return {
    summary: "Your results across depression, anxiety and stress.",
    detail:
      `${parts.join(" · ")}. Scores are the raw subscale totals multiplied by 2, so they line up with the full-length DASS-42. ` +
      "Each area is scored separately because they can move independently — low stress with high depression, for example, is a common pattern.",
    disclaimer: DISCLAIMER,
  };
}

function dass21Recommendations(subscales: SubscaleScore[], critical: boolean): Recommendation[] {
  const recs: Recommendation[] = [];
  if (critical) {
    recs.push({
      priority: 1,
      text: "You indicated hopelessness, low self-worth, or meaninglessness. Please reach out to a crisis line or someone you trust — support is available.",
      type: "crisis",
    });
  }
  const worst = [...subscales].sort(
    (a, b) => SEVERITY_ORDER.indexOf(b.severityLevel) - SEVERITY_ORDER.indexOf(a.severityLevel),
  )[0];
  if (["severe", "extremely severe"].includes(worst.severityLevel)) {
    recs.push({
      priority: recs.length + 1,
      text: `Your ${worst.name} score is in the ${worst.severityLevel} range. Please reach out to a mental health professional.`,
      type: "action",
    });
  } else if (["moderate"].includes(worst.severityLevel)) {
    recs.push({
      priority: recs.length + 1,
      text: `Your ${worst.name} score is moderate. Talking to a counselor or therapist could be a useful next step.`,
      type: "action",
    });
  } else {
    recs.push({
      priority: recs.length + 1,
      text: "Keep up the habits that support you — sleep, movement, and connection with others.",
      type: "self-help",
    });
  }
  recs.push({
    priority: recs.length + 1,
    text: "Re-take this screening in a few weeks to see how things are tracking.",
    type: "self-help",
  });
  return recs;
}

// ────────────────────────────────────────────── Master
export function calculateScore(assessmentSlug: string, responses: ResponseItem[]): ScoringResult {
  switch (assessmentSlug) {
    case "phq9":
      return scorePHQ9(responses);
    case "gad7":
      return scoreGAD7(responses);
    case "pss10":
      return scorePSS10(responses);
    case "dass21":
      return scoreDASS21(responses);
    default:
      throw new Error(`Unknown assessment: ${assessmentSlug}`);
  }
}
