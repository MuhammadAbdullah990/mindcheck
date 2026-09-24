import { create } from 'zustand';
import { api, getAnonToken } from '../lib/api';
import type { AssessmentDefinition, Question, ResponseOption } from '@shared/questionnaires';
import type { SubscaleScore, Interpretation, Recommendation } from '@shared/scoring';

export type AssessmentSummary = {
  id: string;
  slug: string;
  name: string;
  fullName: string;
  description: string;
  timeframe: string;
  estimatedTime: number;
  totalItems: number;
  maxScore: number;
  subscales: string[];
};

export type Resource = {
  id: string;
  title: string;
  description: string;
  url: string | null;
  phone: string | null;
  type: string;
  category: string;
  country: string;
};

export type ResultData = {
  resultId: string;
  assessmentSlug: string;
  assessmentName: string;
  totalScore: number;
  maxPossible: number;
  percentage?: number;
  severityLevel: string;
  severityColor: string;
  criticalFlag: boolean;
  flaggedItems: number[];
  subscaleScores: SubscaleScore[] | null;
  interpretation: Interpretation;
  recommendations: Recommendation[];
  resources: Resource[];
  /** Present on the detail fetch (not on the completion response). */
  responses?: { questionNum: number; answerValue: number }[];
};

/** Shape of `GET /results/:resultId` before it is normalised into ResultData. */
type ResultDetailResponse = Omit<ResultData, 'resultId' | 'assessmentSlug' | 'assessmentName'> & {
  id: string;
  assessment: { name: string; slug: string; fullName: string };
};

type SessionState = {
  // Catalogue
  assessments: AssessmentSummary[];
  assessmentsLoading: boolean;

  // Active screening
  definition: AssessmentDefinition | null;
  sessionId: string | null;
  answers: Record<number, { value: number; label: string }>;
  currentIndex: number;
  submitting: boolean;
  error: string | null;
  /** Set when a critical item is answered, so the UI can react immediately. */
  criticalAlert: boolean;

  // Result
  result: ResultData | null;

  fetchAssessments: () => Promise<void>;
  loadAssessment: (slug: string) => Promise<AssessmentDefinition | null>;
  startSession: (slug: string) => Promise<string | null>;
  answer: (question: Question, option: ResponseOption) => Promise<void>;
  goTo: (index: number) => void;
  next: () => void;
  previous: () => void;
  complete: () => Promise<ResultData | null>;
  /**
   * Loads a result by id. Used when a results URL is opened directly (a
   * refresh, or a shared link) — the in-memory result is gone but the server
   * still has it, keyed by the anon token or account.
   */
  fetchResult: (resultId: string) => Promise<ResultData | null>;
  reset: () => void;
};

export const useSessionStore = create<SessionState>((set, get) => ({
  assessments: [],
  assessmentsLoading: false,

  definition: null,
  sessionId: null,
  answers: {},
  currentIndex: 0,
  submitting: false,
  error: null,
  criticalAlert: false,

  result: null,

  fetchAssessments: async () => {
    set({ assessmentsLoading: true, error: null });
    try {
      const assessments = await api.get<AssessmentSummary[]>('/assessments');
      set({ assessments, assessmentsLoading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Could not load assessments',
        assessmentsLoading: false,
      });
    }
  },

  loadAssessment: async (slug) => {
    set({ error: null });
    try {
      const definition = await api.get<AssessmentDefinition>(`/assessments/${slug}`);
      // `next()` clamps against `definition.totalItems`, so this must be
      // stored — returning it without persisting left the index pinned at 0
      // and the questionnaire unable to advance.
      set({ definition });
      return definition;
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Could not load assessment' });
      return null;
    }
  },

  startSession: async (slug) => {
    set({ error: null });
    try {
      const data = await api.post<{ sessionId: string }>('/sessions', {
        assessmentSlug: slug,
        anonToken: getAnonToken(),
      });
      set({ sessionId: data.sessionId, answers: {}, currentIndex: 0, criticalAlert: false });
      return data.sessionId;
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Could not start session' });
      return null;
    }
  },

  /**
   * Records an answer locally and persists it to the server. The local update
   * happens first so the UI advances immediately; a failed save is surfaced
   * rather than swallowed so the user can retry.
   */
  answer: async (question, option) => {
    const { sessionId, answers } = get();
    if (!sessionId) return;

    set({
      answers: { ...answers, [question.number]: { value: option.value, label: option.label } },
      error: null,
    });

    try {
      const res = await api.post<{ criticalAlert: boolean }>(`/sessions/${sessionId}/responses`, {
        questionNum: question.number,
        answerValue: option.value,
        answerLabel: option.label,
      });
      if (res.criticalAlert) {
        set({ criticalAlert: true });
      }
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Could not save your answer' });
    }
  },

  goTo: (index) => set({ currentIndex: index }),
  next: () => set((s) => ({ currentIndex: Math.min(s.currentIndex + 1, (s.definition?.totalItems ?? 1) - 1) })),
  previous: () => set((s) => ({ currentIndex: Math.max(s.currentIndex - 1, 0) })),

  complete: async () => {
    const { sessionId } = get();
    if (!sessionId) return null;
    set({ submitting: true, error: null });
    try {
      const result = await api.post<ResultData>(`/sessions/${sessionId}/complete`);
      set({ result, submitting: false });
      return result;
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Could not complete assessment', submitting: false });
      return null;
    }
  },

  fetchResult: async (resultId) => {
    set({ error: null });
    try {
      const detail = await api.get<ResultDetailResponse>(`/results/${resultId}`);
      const { id, assessment, ...rest } = detail;
      const result: ResultData = {
        ...rest,
        resultId: id,
        assessmentSlug: assessment.slug,
        assessmentName: assessment.name,
      };
      set({ result });
      return result;
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Could not load this result' });
      return null;
    }
  },

  reset: () =>
    set({
      definition: null,
      sessionId: null,
      answers: {},
      currentIndex: 0,
      error: null,
      criticalAlert: false,
      result: null,
    }),
}));
