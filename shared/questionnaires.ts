// MindCheck — Questionnaire definitions (single source of truth)
// Used by the client UI. The server seeds its `assessments` table from the
// equivalent data in server/src/data/questionnaires.ts (kept in sync manually).

export type ResponseOption = {
  value: number;
  label: string;
};

export type Question = {
  number: number;
  text: string;
  isCritical: boolean;
  subscale: string | null;
};

export type AssessmentDefinition = {
  slug: string;
  name: string;
  fullName: string;
  description: string;
  instructions: string;
  timeframe: string;
  estimatedTime: number;
  totalItems: number;
  maxScore: number;
  subscales: string[];
  questions: Question[];
  responseOptions: ResponseOption[];
  hasFunctionalImpairmentQuestion: boolean;
};

const FREQUENCY_4: ResponseOption[] = [
  { value: 0, label: "Not at all" },
  { value: 1, label: "Several days" },
  { value: 2, label: "More than half the days" },
  { value: 3, label: "Nearly every day" },
];

const PSS_OPTIONS: ResponseOption[] = [
  { value: 0, label: "Never" },
  { value: 1, label: "Almost never" },
  { value: 2, label: "Sometimes" },
  { value: 3, label: "Fairly often" },
  { value: 4, label: "Very often" },
];

const DASS_OPTIONS: ResponseOption[] = [
  { value: 0, label: "Did not apply to me at all" },
  { value: 1, label: "Applied to me to some degree, or some of the time" },
  { value: 2, label: "Applied to me to a considerable degree, or a good part of time" },
  { value: 3, label: "Applied to me very much, or most of the time" },
];

// ────────────────────────────────────────────── PHQ-9
export const phq9: AssessmentDefinition = {
  slug: "phq9",
  name: "PHQ-9",
  fullName: "Patient Health Questionnaire-9",
  description:
    "A widely-used screening tool for depression that helps evaluate the severity of depressive symptoms.",
  instructions:
    "Over the last 2 weeks, how often have you been bothered by any of the following problems?",
  timeframe: "last 2 weeks",
  estimatedTime: 3,
  totalItems: 9,
  maxScore: 27,
  subscales: [],
  hasFunctionalImpairmentQuestion: true,
  responseOptions: FREQUENCY_4,
  questions: [
    { number: 1, text: "Little interest or pleasure in doing things", isCritical: false, subscale: null },
    { number: 2, text: "Feeling down, depressed, or hopeless", isCritical: false, subscale: null },
    { number: 3, text: "Trouble falling or staying asleep, or sleeping too much", isCritical: false, subscale: null },
    { number: 4, text: "Feeling tired or having little energy", isCritical: false, subscale: null },
    { number: 5, text: "Poor appetite or overeating", isCritical: false, subscale: null },
    {
      number: 6,
      text: "Feeling bad about yourself — or that you are a failure or have let yourself or your family down",
      isCritical: false,
      subscale: null,
    },
    {
      number: 7,
      text: "Trouble concentrating on things, such as reading the newspaper or watching television",
      isCritical: false,
      subscale: null,
    },
    {
      number: 8,
      text: "Moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual",
      isCritical: false,
      subscale: null,
    },
    {
      number: 9,
      text: "Thoughts that you would be better off dead, or of hurting yourself in some way",
      isCritical: true,
      subscale: null,
    },
  ],
};

// ────────────────────────────────────────────── GAD-7
export const gad7: AssessmentDefinition = {
  slug: "gad7",
  name: "GAD-7",
  fullName: "Generalized Anxiety Disorder-7",
  description:
    "A validated screening tool that measures the severity of generalized anxiety symptoms.",
  instructions:
    "Over the last 2 weeks, how often have you been bothered by the following problems?",
  timeframe: "last 2 weeks",
  estimatedTime: 2,
  totalItems: 7,
  maxScore: 21,
  subscales: [],
  hasFunctionalImpairmentQuestion: true,
  responseOptions: FREQUENCY_4,
  questions: [
    { number: 1, text: "Feeling nervous, anxious, or on edge", isCritical: false, subscale: null },
    { number: 2, text: "Not being able to stop or control worrying", isCritical: false, subscale: null },
    { number: 3, text: "Worrying too much about different things", isCritical: false, subscale: null },
    { number: 4, text: "Trouble relaxing", isCritical: false, subscale: null },
    { number: 5, text: "Being so restless that it is hard to sit still", isCritical: false, subscale: null },
    { number: 6, text: "Becoming easily annoyed or irritable", isCritical: false, subscale: null },
    { number: 7, text: "Feeling afraid, as if something awful might happen", isCritical: false, subscale: null },
  ],
};

// ────────────────────────────────────────────── PSS-10
export const pss10: AssessmentDefinition = {
  slug: "pss10",
  name: "PSS-10",
  fullName: "Perceived Stress Scale (10-item)",
  description:
    "Measures the degree to which situations in your life are appraised as stressful over the past month.",
  instructions:
    "The questions in this scale ask you about your feelings and thoughts during the last month. In each case, please indicate how often you felt or thought a certain way.",
  timeframe: "last month",
  estimatedTime: 3,
  totalItems: 10,
  maxScore: 40,
  subscales: [],
  hasFunctionalImpairmentQuestion: false,
  responseOptions: PSS_OPTIONS,
  questions: [
    {
      number: 1,
      text: "In the last month, how often have you been upset because of something that happened unexpectedly?",
      isCritical: false,
      subscale: null,
    },
    {
      number: 2,
      text: "In the last month, how often have you felt that you were unable to control the important things in your life?",
      isCritical: false,
      subscale: null,
    },
    {
      number: 3,
      text: 'In the last month, how often have you felt nervous and "stressed"?',
      isCritical: false,
      subscale: null,
    },
    {
      number: 4,
      text: "In the last month, how often have you felt confident about your ability to handle your personal problems?",
      isCritical: false,
      subscale: null,
    },
    {
      number: 5,
      text: "In the last month, how often have you felt that things were going your way?",
      isCritical: false,
      subscale: null,
    },
    {
      number: 6,
      text: "In the last month, how often have you found that you could not cope with all the things that you had to do?",
      isCritical: false,
      subscale: null,
    },
    {
      number: 7,
      text: "In the last month, how often have you been able to control irritations in your life?",
      isCritical: false,
      subscale: null,
    },
    {
      number: 8,
      text: "In the last month, how often have you felt that you were on top of things?",
      isCritical: false,
      subscale: null,
    },
    {
      number: 9,
      text: "In the last month, how often have you been angered because of things that were outside of your control?",
      isCritical: false,
      subscale: null,
    },
    {
      number: 10,
      text: "In the last month, how often have you felt difficulties were piling up so high that you could not overcome them?",
      isCritical: false,
      subscale: null,
    },
  ],
};

// ────────────────────────────────────────────── DASS-21
export const dass21: AssessmentDefinition = {
  slug: "dass21",
  name: "DASS-21",
  fullName: "Depression Anxiety Stress Scales (21-item)",
  description:
    "Measures three related negative emotional states — depression, anxiety, and stress — giving you a score for each.",
  instructions:
    "Please read each statement and indicate how much it applied to you over the past week. There are no right or wrong answers.",
  timeframe: "past week",
  estimatedTime: 5,
  totalItems: 21,
  maxScore: 126,
  subscales: ["depression", "anxiety", "stress"],
  hasFunctionalImpairmentQuestion: false,
  responseOptions: DASS_OPTIONS,
  questions: [
    { number: 1, text: "I found it hard to wind down", isCritical: false, subscale: "stress" },
    { number: 2, text: "I was aware of dryness of my mouth", isCritical: false, subscale: "anxiety" },
    {
      number: 3,
      text: "I couldn't seem to experience any positive feeling at all",
      isCritical: false,
      subscale: "depression",
    },
    {
      number: 4,
      text: "I experienced breathing difficulty (e.g., excessively rapid breathing, breathlessness in the absence of physical exertion)",
      isCritical: false,
      subscale: "anxiety",
    },
    {
      number: 5,
      text: "I found it difficult to work up the initiative to do things",
      isCritical: false,
      subscale: "depression",
    },
    { number: 6, text: "I tended to over-react to situations", isCritical: false, subscale: "stress" },
    { number: 7, text: "I experienced trembling (e.g., in the hands)", isCritical: false, subscale: "anxiety" },
    {
      number: 8,
      text: "I felt that I was using a lot of nervous energy",
      isCritical: false,
      subscale: "stress",
    },
    {
      number: 9,
      text: "I was worried about situations in which I might panic and make a fool of myself",
      isCritical: false,
      subscale: "anxiety",
    },
    { number: 10, text: "I felt that I had nothing to look forward to", isCritical: true, subscale: "depression" },
    { number: 11, text: "I found myself getting agitated", isCritical: false, subscale: "stress" },
    { number: 12, text: "I found it difficult to relax", isCritical: false, subscale: "stress" },
    { number: 13, text: "I felt down-hearted and blue", isCritical: false, subscale: "depression" },
    {
      number: 14,
      text: "I was intolerant of anything that kept me from getting on with what I was doing",
      isCritical: false,
      subscale: "stress",
    },
    { number: 15, text: "I felt I was close to panic", isCritical: false, subscale: "anxiety" },
    {
      number: 16,
      text: "I was unable to become enthusiastic about anything",
      isCritical: false,
      subscale: "depression",
    },
    { number: 17, text: "I felt I wasn't worth much as a person", isCritical: true, subscale: "depression" },
    { number: 18, text: "I felt that I was rather touchy", isCritical: false, subscale: "stress" },
    {
      number: 19,
      text: "I was aware of the action of my heart in the absence of physical exertion (e.g., sense of heart rate increase, heart missing a beat)",
      isCritical: false,
      subscale: "anxiety",
    },
    { number: 20, text: "I felt scared without any good reason", isCritical: false, subscale: "anxiety" },
    { number: 21, text: "I felt that life was meaningless", isCritical: true, subscale: "depression" },
  ],
};

export const ASSESSMENTS: AssessmentDefinition[] = [phq9, gad7, pss10, dass21];

export function getAssessment(slug: string): AssessmentDefinition | undefined {
  return ASSESSMENTS.find((a) => a.slug === slug);
}
