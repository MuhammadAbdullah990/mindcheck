import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSessionStore } from '../store/sessionStore';

const CATEGORY_LABEL: Record<string, string> = {
  depression: 'Depression',
  anxiety: 'Anxiety',
  stress: 'Stress',
  general: 'Combined',
};

export function HomePage() {
  const { assessments, assessmentsLoading, fetchAssessments } = useSessionStore();

  useEffect(() => {
    // Fall back to the bundled definitions if the API is unreachable, so the
    // landing page still works offline / before the server is running.
    if (assessments.length === 0) void fetchAssessments();
  }, [assessments.length, fetchAssessments]);

  return (
    <div>
      {/* Hero */}
      <section className="mx-auto max-w-3xl px-4 py-16 text-center sm:py-24">
        <span className="text-5xl" aria-hidden="true">
          🌿
        </span>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          Take a moment for your mental health
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-slate-600">
          Free, private, and scientifically validated screenings. No account needed.
        </p>
        <a
          href="#screenings"
          className="mt-8 inline-flex min-h-11 items-center rounded-xl bg-primary px-6 py-3 font-semibold text-white transition-colors hover:bg-primary-light"
        >
          Start a screening
        </a>
      </section>

      {/* How it works */}
      <section className="border-y border-slate-200 bg-white py-12" aria-labelledby="how-it-works">
        <div className="mx-auto max-w-5xl px-4">
          <h2 id="how-it-works" className="text-center text-2xl font-bold text-slate-900">
            How it works
          </h2>
          <ol className="mt-8 grid gap-8 sm:grid-cols-3">
            {[
              { n: '1', title: 'Choose a screening', body: 'Pick the tool that matches what you want to check on.' },
              { n: '2', title: 'Answer honestly', body: 'Your answers stay private. Nothing is shared with anyone.' },
              { n: '3', title: 'Get your results', body: 'See your score, what it means, and where to get support.' },
            ].map((step) => (
              <li key={step.n} className="text-center">
                <span
                  className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-primary text-lg font-bold text-white"
                  aria-hidden="true"
                >
                  {step.n}
                </span>
                <h3 className="mt-4 font-semibold text-slate-900">{step.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Assessments */}
      <section id="screenings" className="mx-auto max-w-5xl px-4 py-16" aria-labelledby="screenings-heading">
        <h2 id="screenings-heading" className="text-2xl font-bold text-slate-900">
          Available screenings
        </h2>
        <p className="mt-2 text-slate-600">All four instruments are widely used in clinical practice and research.</p>

        {assessmentsLoading && assessments.length === 0 ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-48 animate-pulse rounded-2xl bg-slate-200" aria-hidden="true" />
            ))}
          </div>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {assessments.map((a) => (
              <article
                key={a.slug}
                className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-md"
              >
                <h3 className="text-lg font-bold text-slate-900">{a.name}</h3>
                <p className="text-sm font-medium text-primary">
                  {a.subscales.length > 0 ? 'Combined' : CATEGORY_LABEL[a.slug] ?? 'Screening'}
                </p>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600">{a.description}</p>
                <p className="mt-4 text-xs text-slate-500">
                  {a.totalItems} questions · about {a.estimatedTime} min
                </p>
                <Link
                  to={`/assessment/${a.slug}`}
                  className="mt-4 inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-4 py-2 font-medium text-white transition-colors hover:bg-primary-light"
                >
                  Start <span aria-hidden="true">→</span>
                </Link>
              </article>
            ))}
          </div>
        )}

        {assessments.length === 0 && !assessmentsLoading && (
          <p className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            The assessment list could not be loaded. Please check that the API is running, or{' '}
            <Link to="/about" className="font-medium underline">
              read about the instruments
            </Link>
            .
          </p>
        )}
      </section>
    </div>
  );
}
