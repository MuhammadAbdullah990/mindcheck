import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSessionStore } from '../store/sessionStore';
import { getAssessment } from '@shared/questionnaires';
import { CrisisAlert } from '../components/results/CrisisAlert';
import { ScoreCard, ScoreGauge } from '../components/results/ScoreGauge';
import { SeverityBand, bandsFor } from '../components/results/SeverityBand';
import { ResourceCard } from '../components/results/ResourceCard';
import type { Recommendation } from '@shared/scoring';

const REC_STYLES: Record<Recommendation['type'], string> = {
  crisis: 'border-severity-red bg-crisis-bg',
  action: 'border-primary bg-primary/5',
  'self-help': 'border-slate-200 bg-slate-50',
};

const REC_ICON: Record<Recommendation['type'], string> = {
  crisis: '🆘',
  action: '📋',
  'self-help': '🌱',
};

export function ResultsPage() {
  const { resultId = '' } = useParams();
  const { result, fetchResult, error } = useSessionStore();
  const [loading, setLoading] = useState(!result);

  useEffect(() => {
    // A refresh lands here with no in-memory result, so fall back to the API.
    // Ownership is enforced server-side via the account or anon token.
    if (result?.resultId === resultId) return;
    let cancelled = false;
    setLoading(true);
    void (async () => {
      await fetchResult(resultId);
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
    // Only the id should trigger a refetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resultId]);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center text-slate-600">
        Loading your results…
      </div>
    );
  }

  if (!result) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Results unavailable</h1>
        <p className="mt-3 text-slate-600">
          {error ??
            'We could not load this result. It may belong to a different browser, or the link may be incomplete.'}
        </p>
        <Link
          to="/"
          className="mt-6 inline-block font-medium text-primary hover:underline"
        >
          ← Back to home
        </Link>
      </div>
    );
  }

  const definition = getAssessment(result.assessmentSlug);
  const isDass = result.assessmentSlug === 'dass21';
  const hasSubscales = (result.subscaleScores?.length ?? 0) > 0;
  const crisisRecs = result.recommendations.filter((r) => r.type === 'crisis');
  const otherRecs = result.recommendations.filter((r) => r.type !== 'crisis');

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <p className="text-sm font-medium text-primary">{result.assessmentName}</p>
        <h1 className="mt-1 text-3xl font-bold text-slate-900">Your results</h1>

        {/* Crisis takes the top slot, always — never below the score. */}
        {(result.criticalFlag || crisisRecs.length > 0) && (
          <CrisisAlert className="mt-6" />
        )}

        {crisisRecs.map((rec, i) => (
          <p
            key={i}
            className="mt-3 rounded-xl border border-severity-red/40 bg-white p-4 text-sm font-medium text-severity-red"
          >
            {rec.text}
          </p>
        ))}

        {/* Score */}
        <div className="mt-6">
          {isDass && hasSubscales ? (
            // DASS-21 has no meaningful single total — the three subscales are
            // scored independently, so a headline number would mislead.
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-slate-900">Your subscale scores</h2>
              <p className="mt-1 text-sm text-slate-600">
                DASS-21 scores each area separately, doubled to match the 42-item version.
              </p>
              <div className="mt-5 space-y-5">
                {result.subscaleScores!.map((s) => (
                  <ScoreGauge
                    key={s.name}
                    label={s.name}
                    score={s.scaledScore}
                    max={s.maxPossible}
                    severityColor={s.severityColor}
                    size="md"
                  />
                ))}
              </div>
            </div>
          ) : (
            <ScoreCard
              score={result.totalScore}
              max={result.maxPossible}
              severityLevel={result.severityLevel}
              severityColor={result.severityColor}
            />
          )}
        </div>

        <div className="mt-4">
          <SeverityBand bands={bandsFor(result.assessmentSlug)} score={result.totalScore} />
        </div>

        {/* Interpretation */}
        <section className="mt-8" aria-labelledby="what-this-means">
          <h2 id="what-this-means" className="text-xl font-bold text-slate-900">
            What this means
          </h2>
          <p className="mt-3 text-lg font-medium text-slate-800">
            {result.interpretation.summary}
          </p>
          <p className="mt-3 leading-relaxed text-slate-600">{result.interpretation.detail}</p>
          <p className="mt-4 rounded-xl bg-amber-50 p-4 text-sm leading-relaxed text-amber-900">
            <strong>Important:</strong> {result.interpretation.disclaimer}
          </p>
        </section>

        {/* Recommendations */}
        {otherRecs.length > 0 && (
          <section className="mt-8" aria-labelledby="next-steps">
            <h2 id="next-steps" className="text-xl font-bold text-slate-900">
              Suggested next steps
            </h2>
            <ul className="mt-4 space-y-3">
              {otherRecs.map((rec, i) => (
                <li
                  key={i}
                  className={`flex items-start gap-3 rounded-xl border p-4 ${REC_STYLES[rec.type]}`}
                >
                  <span aria-hidden="true">{REC_ICON[rec.type]}</span>
                  <span className="text-sm leading-relaxed text-slate-800">{rec.text}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Resources */}
        {result.resources.length > 0 && (
          <section className="mt-8" aria-labelledby="support">
            <h2 id="support" className="text-xl font-bold text-slate-900">
              Support &amp; resources
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {result.resources.map((r) => (
                <ResourceCard key={r.id} resource={r} />
              ))}
            </div>
          </section>
        )}

        {/* Your answers — lets someone check what they actually reported. */}
        {definition && (result.responses?.length ?? 0) > 0 && (
          <details className="mt-8 rounded-xl border border-slate-200 bg-white p-4">
            <summary className="cursor-pointer font-medium text-slate-900">
              Review your answers
            </summary>
            <ol className="mt-4 space-y-3">
              {definition.questions.map((q) => {
                const given = result.responses?.find((r) => r.questionNum === q.number);
                const option = definition.responseOptions.find((o) => o.value === given?.answerValue);
                return (
                  <li key={q.number} className="text-sm">
                    <p className="text-slate-700">
                      <span className="font-medium text-slate-900">{q.number}.</span> {q.text}
                    </p>
                    <p className="mt-0.5 pl-5 text-slate-500">
                      <span aria-hidden="true">↳ </span>
                      {option?.label ?? 'No answer recorded'}
                      {q.isCritical && (
                        <span className="ml-1 text-xs text-severity-red">
                          (sensitive question)
                        </span>
                      )}
                    </p>
                  </li>
                );
              })}
            </ol>
          </details>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            to={`/assessment/${result.assessmentSlug}`}
            className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl bg-primary px-6 py-3 font-semibold text-white transition-colors hover:bg-primary-light"
          >
            Retake this screening
          </Link>
          <Link
            to="/"
            className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl border border-slate-300 px-6 py-3 font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            Try another screening
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
