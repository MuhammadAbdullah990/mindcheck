import { motion } from 'framer-motion';

const COLOR_MAP: Record<string, { bg: string; text: string; bar: string }> = {
  green: { bg: 'bg-severity-green/10', text: 'text-severity-green', bar: 'bg-severity-green' },
  yellow: { bg: 'bg-severity-yellow/10', text: 'text-severity-yellow', bar: 'bg-severity-yellow' },
  orange: { bg: 'bg-severity-orange/10', text: 'text-severity-orange', bar: 'bg-severity-orange' },
  red: { bg: 'bg-severity-red/10', text: 'text-severity-red', bar: 'bg-severity-red' },
  darkred: { bg: 'bg-severity-darkred/10', text: 'text-severity-darkred', bar: 'bg-severity-darkred' },
};

type Props = {
  score: number;
  max: number;
  severityColor: string;
  label?: string;
  size?: 'lg' | 'md';
};

export function ScoreGauge({ score, max, severityColor, label, size = 'lg' }: Props) {
  const color = COLOR_MAP[severityColor] ?? COLOR_MAP.green;
  const pct = max > 0 ? Math.min((score / max) * 100, 100) : 0;
  const dims = size === 'lg' ? 'h-4' : 'h-3';

  return (
    <div>
      {label && (
        <div className="mb-2 flex items-baseline justify-between gap-3">
          <span className="text-sm font-medium capitalize text-slate-700">{label}</span>
          <span className="text-sm font-semibold text-slate-900">
            {score}
            <span className="font-normal text-slate-500"> / {max}</span>
          </span>
        </div>
      )}
      <div
        className={`${dims} w-full overflow-hidden rounded-full bg-slate-200`}
        role="meter"
        aria-valuenow={score}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={`${label ?? 'Score'}: ${score} out of ${max}`}
      >
        <motion.div
          className={`h-full rounded-full ${color.bar}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

export function ScoreCard({
  score,
  max,
  severityLevel,
  severityColor,
}: {
  score: number;
  max: number;
  severityLevel: string;
  severityColor: string;
}) {
  const color = COLOR_MAP[severityColor] ?? COLOR_MAP.green;
  const pct = max > 0 ? Math.min((score / max) * 100, 100) : 0;

  return (
    <div className={`rounded-2xl p-6 text-center ${color.bg}`}>
      <p className="text-sm font-medium text-slate-600">Your score</p>
      <p className="mt-1 text-5xl font-bold text-slate-900">
        {score}
        <span className="text-2xl font-normal text-slate-500"> / {max}</span>
      </p>
      <p className={`mt-2 text-lg font-semibold capitalize ${color.text}`}>{severityLevel}</p>

      <div
        className="mt-5 h-3 w-full overflow-hidden rounded-full bg-white/70"
        role="meter"
        aria-valuenow={score}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={`Total score: ${score} out of ${max}`}
      >
        <motion.div
          className={`h-full rounded-full ${color.bar}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
