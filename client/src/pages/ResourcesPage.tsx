import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { ResourceCard, isCrisisResource } from '../components/results/ResourceCard';
import { CrisisAlert } from '../components/results/CrisisAlert';
import type { Resource } from '../store/sessionStore';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'depression', label: 'Depression' },
  { key: 'anxiety', label: 'Anxiety' },
  { key: 'stress', label: 'Stress' },
  { key: 'general', label: 'General' },
];

export function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    const query = category === 'all' ? '' : `?category=${category}`;
    void (async () => {
      try {
        const data = await api.get<Resource[]>(`/resources${query}`);
        if (!cancelled) setResources(data);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Could not load resources');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [category]);

  const crisis = resources.filter(isCrisisResource);
  const rest = resources.filter((r) => !isCrisisResource(r));

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold text-slate-900">Support &amp; resources</h1>
      <p className="mt-3 leading-relaxed text-slate-600">
        Free and low-cost support, curated by category. Crisis lines are available at any time,
        whether or not you have taken a screening.
      </p>

      {/* Crisis lines are always listed at the top, unfiltered — someone
          arriving here in distress shouldn't have to pick a category first. */}
      <CrisisAlert className="mt-6" />

      {category !== 'all' && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-slate-900">Category resources</h2>
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2" role="tablist" aria-label="Filter resources by category">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            role="tab"
            aria-selected={category === f.key}
            onClick={() => setCategory(f.key)}
            className={`min-h-9 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              category === f.key
                ? 'bg-primary text-white'
                : 'border border-slate-300 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="mt-6 grid gap-3 sm:grid-cols-2" aria-busy="true">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-slate-200" />
          ))}
        </div>
      )}

      {error && (
        <p role="alert" className="mt-6 rounded-xl bg-severity-red/10 p-4 text-sm text-severity-red">
          {error}
        </p>
      )}

      {!loading && !error && (
        <>
          {category === 'all' && crisis.length > 0 && (
            <section className="mt-8" aria-labelledby="hotlines">
              <h2 id="hotlines" className="text-lg font-semibold text-slate-900">
                Crisis lines
              </h2>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {crisis.map((r) => (
                  <ResourceCard key={r.id} resource={r} />
                ))}
              </div>
            </section>
          )}

          {rest.length > 0 && (
            <section className="mt-8" aria-labelledby="programs">
              <h2 id="programs" className="text-lg font-semibold text-slate-900">
                {category === 'all' ? 'Programs & information' : 'Resources'}
              </h2>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {rest.map((r) => (
                  <ResourceCard key={r.id} resource={r} />
                ))}
              </div>
            </section>
          )}

          {resources.length === 0 && (
            <p className="mt-8 text-slate-600">No resources in this category yet.</p>
          )}
        </>
      )}

      <p className="mt-8 rounded-xl bg-amber-50 p-4 text-sm leading-relaxed text-amber-900">
        MindCheck is not a crisis service and cannot respond to messages. If you are in immediate
        danger, contact your local emergency number.
      </p>
    </div>
  );
}
