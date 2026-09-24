import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSessionStore } from '../store/sessionStore';
import { getAssessment } from '@shared/questionnaires';
import { CrisisAlert } from '../components/results/CrisisAlert';

export function QuestionnairePage() {
  const { slug = '' } = useParams();
  const navigate = useNavigate();
  const {
    definition: storeDefinition,
    loadAssessment,
    sessionId,
    answers,
    currentIndex,
    answer,
    next,
    previous,
    goTo,
    complete,
    submitting,
    error,
    criticalAlert,
  } = useSessionStore();

  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [difficulty, setDifficulty] = useState<string | null>(null);

  // The bundle is authoritative for rendering; the API copy keeps metadata in
  // sync when reachable.
  const bundled = getAssessment(slug);
  const definition = storeDefinition ?? bundled;

  useEffect(() => {
    if (!storeDefinition) void loadAssessment(slug);
  }, [slug, storeDefinition, loadAssessment]);

  const question = definition?.questions[currentIndex];
  const answered = question ? answers[question.number] : undefined;
  const isLast = definition ? currentIndex === definition.totalItems - 1 : false;
  const progress = definition ? ((currentIndex + 1) / definition.totalItems) * 100 : 0;

  const allAnswered = useMemo(
    () => (definition ? definition.questions.every((q) => answers[q.number] !== undefined) : false),
    [definition, answers],
  );

  if (!definition) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center text-slate-600">
        Loading screening…
      </div>
    );
  }

  const submit = async () => {
    const result = await complete();
    if (result) navigate(`/results/${result.resultId}`, { replace: true });
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm text-slate-600">
          <span className="font-medium text-slate-900">{definition.name}</span>
          <span>
            Question {currentIndex + 1} of {definition.totalItems}
          </span>
        </div>
        <div
          className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200"
          role="progressbar"
          aria-valuenow={currentIndex + 1}
          aria-valuemin={1}
          aria-valuemax={definition.totalItems}
          aria-label={`Question ${currentIndex + 1} of ${definition.totalItems}`}
        >
          <motion.div
            className="h-full rounded-full bg-primary"
            initial={false}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Question */}
      <motion.div
        key={currentIndex}
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -24 }}
        transition={{ duration: 0.2 }}
      >
        <h1 className="text-xl font-semibold leading-snug text-slate-900 sm:text-2xl">
          {question?.text}
        </h1>

        {definition.subscales.length > 0 && question?.subscale && (
          <p className="mt-2 text-xs font-medium uppercase tracking-wide text-slate-400">
            {question.subscale}
          </p>
        )}

        {/* Options */}
        <fieldset className="mt-6 space-y-2.5">
          <legend className="sr-only">Select one answer</legend>
          {definition.responseOptions.map((option) => {
            const selected = answered?.value === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  if (!question) return;
                  void answer(question, option);
                  if (!isLast) next();
                }}
                aria-pressed={selected}
                className={`flex min-h-12 w-full items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition-colors ${
                  selected
                    ? 'border-primary bg-primary/5 font-medium text-primary'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-primary-light hover:bg-slate-50'
                }`}
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-xs ${
                    selected ? 'border-primary bg-primary text-white' : 'border-slate-300'
                  }`}
                  aria-hidden="true"
                >
                  {selected ? '✓' : option.value}
                </span>
                {option.label}
              </button>
            );
          })}
        </fieldset>
      </motion.div>

      {/* Crisis alert — appears as soon as a critical item is answered */}
      {criticalAlert && <CrisisAlert className="mt-6" />}

      {/* Navigation */}
      <div className="mt-8 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => (currentIndex === 0 ? setShowExitConfirm(true) : previous())}
          className="min-h-11 rounded-xl border border-slate-300 bg-white px-5 py-2.5 font-medium text-slate-700 transition-colors hover:bg-slate-50"
        >
          {currentIndex === 0 ? 'Exit' : 'Back'}
        </button>

        {isLast ? (
          <button
            type="button"
            onClick={submit}
            disabled={!allAnswered || submitting}
            className="min-h-11 rounded-xl bg-primary px-6 py-2.5 font-semibold text-white transition-colors hover:bg-primary-light disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? 'Scoring…' : 'See my results'}
          </button>
        ) : (
          <button
            type="button"
            onClick={next}
            disabled={!answered}
            className="min-h-11 rounded-xl bg-primary px-6 py-2.5 font-semibold text-white transition-colors hover:bg-primary-light disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        )}
      </div>

      {!isLast && !answered && (
        <p className="mt-3 text-center text-sm text-slate-500">Select an answer to continue.</p>
      )}

      {error && (
        <p role="alert" className="mt-4 rounded-lg bg-severity-red/10 p-3 text-sm text-severity-red">
          {error}
        </p>
      )}

      {/* Optional PHQ-9 / GAD-7 functional impairment follow-up */}
      {isLast && definition.hasFunctionalImpairmentQuestion && (
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="font-semibold text-slate-900">One last question</h2>
          <p className="mt-1 text-sm text-slate-600">
            If you checked off any problems, how difficult have they made it to work, take care of
            things at home, or get along with other people?
          </p>
          <div className="mt-3 space-y-2">
            {['not difficult', 'somewhat', 'very', 'extremely'].map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setDifficulty(level)}
                aria-pressed={difficulty === level}
                className={`min-h-11 w-full rounded-lg border-2 px-4 py-2 text-left text-sm capitalize transition-colors ${
                  difficulty === level
                    ? 'border-primary bg-primary/5 font-medium text-primary'
                    : 'border-slate-200 hover:border-primary-light'
                }`}
              >
                {level} difficult
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Exit confirmation */}
      {showExitConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="exit-title"
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 id="exit-title" className="text-lg font-semibold text-slate-900">
              Leave this screening?
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Your answers so far are saved, and you can come back and finish later from the same
              browser.
            </p>
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setShowExitConfirm(false)}
                className="min-h-11 flex-1 rounded-xl border border-slate-300 px-4 font-medium text-slate-700 hover:bg-slate-50"
              >
                Keep going
              </button>
              <Link
                to="/"
                onClick={() => setShowExitConfirm(false)}
                className="flex min-h-11 flex-1 items-center justify-center rounded-xl bg-slate-800 px-4 font-medium text-white hover:bg-slate-700"
              >
                Leave
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Jump to an answered question */}
      {Object.keys(answers).length > 1 && (
        <div className="mt-8 border-t border-slate-200 pt-4">
          <p className="text-xs font-medium text-slate-500">Jump to a question</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {definition.questions.map((q) => {
              const isAnswered = answers[q.number] !== undefined;
              const isCurrent = q.number === currentIndex + 1;
              return (
                <button
                  key={q.number}
                  type="button"
                  onClick={() => goTo(q.number - 1)}
                  aria-label={`Question ${q.number}${isAnswered ? ', answered' : ', not answered'}`}
                  aria-current={isCurrent ? 'step' : undefined}
                  className={`h-8 w-8 rounded-lg text-xs font-medium transition-colors ${
                    isCurrent
                      ? 'bg-primary text-white'
                      : isAnswered
                        ? 'bg-primary/20 text-primary hover:bg-primary/30'
                        : 'bg-slate-200 text-slate-500 hover:bg-slate-300'
                  }`}
                >
                  {q.number}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {!sessionId && (
        <p className="mt-6 text-center text-sm text-slate-500">
          No active session —{' '}
          <Link to={`/assessment/${slug}`} className="text-primary underline">
            start the screening
          </Link>
          .
        </p>
      )}
    </div>
  );
}
