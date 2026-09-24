import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { api } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { ASSESSMENTS } from '@shared/questionnaires';

type HistoryRow = {
  id: string;
  assessment: string;
  assessmentSlug: string;
  totalScore: number;
  maxPossible: number;
  severityLevel: string;
  severityColor: string;
  criticalFlag: boolean;
  completedAt: string;
};

const COLOR_HEX: Record<string, string> = {
  green: '#10b981',
  yellow: '#f59e0b',
  orange: '#f97316',
  red: '#ef4444',
  darkred: '#dc2626',
};

const SLUG_LABEL: Record<string, string> = Object.fromEntries(
  ASSESSMENTS.map((a) => [a.slug, a.name]),
);

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

export function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const [rows, setRows] = useState<HistoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    const query = filter === 'all' ? '?limit=100' : `?assessment=${filter}&limit=100`;
    void (async () => {
      try {
        const data = await api.get<HistoryRow[]>(`/results/history${query}`);
        if (!cancelled) setRows(data);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Could not load your history');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [filter]);

  /**
   * Charted as *percentage of the maximum*, not raw score. PHQ-9 tops out at
   * 27 and PSS-10 at 40, so plotting raw scores on one axis would make a
   * stable-looking flat line out of two very different results.
   */
  const chartData = useMemo(() => {
    const byDate = new Map<string, Record<string, number | string>>();
    // Oldest → newest so the x-axis reads chronologically.
    for (const r of [...rows].reverse()) {
      const key = r.completedAt.slice(0, 10);
      const entry = byDate.get(key) ?? { date: formatDate(r.completedAt) };
      entry[r.assessmentSlug] = Math.round((r.totalScore / r.maxPossible) * 1000) / 10;
      byDate.set(key, entry);
    }
    return [...byDate.values()];
  }, [rows]);

  const chartSlugs = useMemo(() => {
    const present = new Set(rows.map((r) => r.assessmentSlug));
    return (filter === 'all' ? [...present] : [filter]).filter((s) => present.has(s));
  }, [rows, filter]);

  const latest = rows[0];

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-bold text-slate-900">
        {user ? `Hello, ${user.displayName ?? user.email}` : 'Your history'}
      </h1>
      <p className="mt-2 text-slate-600">
        Every screening you have completed with this account. Trends are most meaningful after two
        or more results.
      </p>

      <div className="mt-6 flex flex-wrap gap-2" role="tablist" aria-label="Filter by screening">
        <FilterChip active={filter === 'all'} onClick={() => setFilter('all')} label="All" />
        {ASSESSMENTS.map((a) => (
          <FilterChip
            key={a.slug}
            active={filter === a.slug}
            onClick={() => setFilter(a.slug)}
            label={a.name}
          />
        ))}
      </div>

      {error && (
        <p role="alert" className="mt-6 rounded-xl bg-severity-red/10 p-4 text-sm text-severity-red">
          {error}
        </p>
      )}

      {loading && (
        <div className="mt-6 space-y-3" aria-busy="true">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-slate-200" />
          ))}
        </div>
      )}

      {!loading && !error && rows.length === 0 && (
        <div className="mt-10 rounded-2xl border border-dashed border-slate-300 p-8 text-center">
          <p className="text-slate-700">No screenings yet.</p>
          <Link
            to="/"
            className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-primary px-5 py-2.5 font-medium text-white hover:bg-primary-light"
          >
            Take your first screening
          </Link>
        </div>
      )}

      {!loading && rows.length > 0 && (
        <>
          {latest && (
            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-sm text-slate-500">Most recent</p>
              <div className="mt-1 flex flex-wrap items-baseline gap-x-3">
                <span className="text-lg font-semibold text-slate-900">{latest.assessment}</span>
                <span className="text-sm text-slate-500">{formatDate(latest.completedAt)}</span>
              </div>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {latest.totalScore}
                <span className="text-lg font-normal text-slate-500"> / {latest.maxPossible}</span>
                <span
                  className="ml-3 text-lg font-semibold capitalize"
                  style={{ color: COLOR_HEX[latest.severityColor] ?? '#334155' }}
                >
                  {latest.severityLevel}
                </span>
              </p>
            </div>
          )}

          {chartData.length > 1 && (
            <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5" aria-labelledby="trend">
              <h2 id="trend" className="font-semibold text-slate-900">
                Score trend
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Shown as a percentage of each instrument's maximum, so different screenings can be
                compared on one axis.
              </p>
              <div className="mt-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      stroke="#94a3b8"
                      domain={[0, 100]}
                      unit="%"
                      label={{ value: '% of max', angle: -90, position: 'insideLeft', fontSize: 11 }}
                    />
                    <Tooltip
                      formatter={(v) => [`${v}%`, '']}
                      contentStyle={{ fontSize: 13, borderRadius: 8 }}
                    />
                    {chartSlugs.length > 1 && <Legend wrapperStyle={{ fontSize: 12 }} />}
                    {chartSlugs.map((slug) => (
                      <Line
                        key={slug}
                        type="monotone"
                        dataKey={slug}
                        name={SLUG_LABEL[slug] ?? slug}
                        stroke="#4f46e5"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        connectNulls
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </section>
          )}

          <section className="mt-6" aria-labelledby="past">
            <h2 id="past" className="text-lg font-semibold text-slate-900">
              Past screenings
            </h2>
            <ul className="mt-3 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
              {rows.map((r) => (
                <li key={r.id}>
                  <Link
                    to={`/results/${r.id}`}
                    className="flex items-center gap-4 p-4 transition-colors hover:bg-slate-50"
                  >
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: COLOR_HEX[r.severityColor] ?? '#94a3b8' }}
                      aria-hidden="true"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium text-slate-900">{r.assessment}</span>
                      <span className="block text-sm text-slate-500">
                        {new Date(r.completedAt).toLocaleString()}
                      </span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="block font-semibold text-slate-900">
                        {r.totalScore}/{r.maxPossible}
                      </span>
                      <span
                        className="block text-sm capitalize"
                        style={{ color: COLOR_HEX[r.severityColor] ?? '#334155' }}
                      >
                        {r.severityLevel}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`min-h-9 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
        active
          ? 'bg-primary text-white'
          : 'border border-slate-300 bg-white text-slate-600 hover:bg-slate-50'
      }`}
    >
      {label}
    </button>
  );
}
