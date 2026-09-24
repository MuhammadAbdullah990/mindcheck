import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useSessionStore } from '../store/sessionStore';
import { getAssessment } from '@shared/questionnaires';

export function AssessmentIntroPage() {
  const { slug = '' } = useParams();
  const navigate = useNavigate();
  const { loadAssessment, startSession, error } = useSessionStore();
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  // Prefer the API (so the DB stays authoritative for metadata) but fall back
  // to the bundled definition so the page still renders if the API is down.
  const definition = getAssessment(slug);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      await loadAssessment(slug);
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [slug, loadAssessment]);

  const begin = async () => {
    setStarting(true);
    const sessionId = await startSession(slug);
    setStarting(false);
    if (sessionId) navigate(`/questionnaire/${slug}`);
  };

  if (!definition) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Assessment not found</h1>
        <p className="mt-3 text-slate-600">We could not find a screening called “{slug}”.</p>
        <Link to="/" className="mt-6 inline-block font-medium text-primary hover:underline">
          ← Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <Link to="/" className="text-sm font-medium text-primary hover:underline">
        ← All screenings
      </Link>

      <h1 className="mt-4 text-3xl font-bold text-slate-900">{definition.name}</h1>
      <p className="text-slate-500">{definition.fullName}</p>
      <p className="mt-4 leading-relaxed text-slate-700">{definition.description}</p>

      <div className="mt-6 grid grid-cols-3 gap-3 text-center">
        {[
          { label: 'Questions', value: String(definition.totalItems) },
          { label: 'Time', value: `~${definition.estimatedTime} min` },
          { label: 'Recall period', value: definition.timeframe },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-slate-200 bg-white p-3">
            <p className="text-sm font-semibold text-slate-900">{stat.value}</p>
            <p className="text-xs text-slate-500">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="font-semibold text-slate-900">Instructions</h2>
        <p className="mt-2 leading-relaxed text-slate-700">{definition.instructions}</p>
        <p className="mt-4 text-sm text-slate-500">
          There are no right or wrong answers — answer based on how you have actually been feeling.
        </p>
      </div>

      {definition.questions.some((q) => q.isCritical) && (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-semibold">A note before you begin</p>
          <p className="mt-1 leading-relaxed">
            One of the questions asks about thoughts of self-harm. If that applies to you, please
            reach out to a crisis line —{' '}
            <a href="tel:988" className="font-semibold underline">
              call or text 988 (US)
            </a>{' '}
            or{' '}
            <a href="tel:0311-7786264" className="font-semibold underline">
              0311-7786264 (Pakistan)
            </a>
            . You do not have to handle this alone.
          </p>
        </div>
      )}

      {error && <p className="mt-4 text-sm text-severity-red">{error}</p>}

      <button
        type="button"
        onClick={begin}
        disabled={starting || loading}
        className="mt-8 min-h-12 w-full rounded-xl bg-primary px-6 py-3 font-semibold text-white transition-colors hover:bg-primary-light disabled:cursor-not-allowed disabled:opacity-60"
      >
        {starting ? 'Starting…' : 'Begin screening'}
      </button>

      <p className="mt-6 text-center text-xs leading-relaxed text-slate-500">
        MindCheck is a screening tool, not a diagnosis. Results are not a substitute for
        professional care.
      </p>
    </div>
  );
}
