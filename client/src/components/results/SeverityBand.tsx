/** Colour bands shown under every score, so a number isn't read without context. */
const BAND_STYLES: Record<string, string> = {
  green: 'border-severity-green bg-severity-green/10 text-severity-green',
  yellow: 'border-severity-yellow bg-severity-yellow/10 text-severity-yellow',
  orange: 'border-severity-orange bg-severity-orange/10 text-severity-orange',
  red: 'border-severity-red bg-severity-red/10 text-severity-red',
  darkred: 'border-severity-darkred bg-severity-darkred/10 text-severity-darkred',
};

type Band = {
  /** Upper bound of the band, inclusive. */
  max: number;
  label: string;
  color: string;
};

/**
 * The scale strip beneath a score. `bands` are ordered low → high; the
 * active one is highlighted. Displaying the whole range is deliberate: it
 * makes the score legible instead of leaving a bare number to interpret.
 */
export function SeverityBand({ bands, score }: { bands: Band[]; score: number }) {
  return (
    <div>
      <div className="flex overflow-hidden rounded-lg border border-slate-200" role="img" aria-label={`Score ${score}, shown against the full severity range`}>
        {bands.map((b) => {
          const active = score <= b.max;
          return (
            <div
              key={b.label}
              className={`flex-1 px-1 py-1.5 text-center text-[10px] font-medium sm:text-xs ${
                active ? BAND_STYLES[b.color] : 'bg-white text-slate-400'
              } ${b.color === 'green' ? 'rounded-l-lg' : ''} ${
                b.color === 'darkred' ? 'rounded-r-lg' : ''
              }`}
            >
              <span className="block truncate">{b.label}</span>
            </div>
          );
        })}
      </div>
      <div className="mt-1 flex justify-between text-[10px] text-slate-400 sm:text-xs">
        <span>0</span>
        <span>{bands[bands.length - 1]?.max}</span>
      </div>
    </div>
  );
}

export const PHQ9_BANDS: Band[] = [
  { max: 4, label: 'Minimal', color: 'green' },
  { max: 9, label: 'Mild', color: 'yellow' },
  { max: 14, label: 'Moderate', color: 'orange' },
  { max: 19, label: 'Mod. severe', color: 'red' },
  { max: 27, label: 'Severe', color: 'darkred' },
];

export const GAD7_BANDS: Band[] = [
  { max: 4, label: 'Minimal', color: 'green' },
  { max: 9, label: 'Mild', color: 'yellow' },
  { max: 14, label: 'Moderate', color: 'orange' },
  { max: 21, label: 'Severe', color: 'red' },
];

export const PSS10_BANDS: Band[] = [
  { max: 13, label: 'Low', color: 'green' },
  { max: 26, label: 'Moderate', color: 'yellow' },
  { max: 40, label: 'High', color: 'red' },
];

export const DASS21_BANDS: Band[] = [
  { max: 9, label: 'Normal', color: 'green' },
  { max: 13, label: 'Mild', color: 'yellow' },
  { max: 20, label: 'Moderate', color: 'orange' },
  { max: 27, label: 'Severe', color: 'red' },
  { max: 42, label: 'Extremely severe', color: 'darkred' },
];

export function bandsFor(slug: string): Band[] {
  switch (slug) {
    case 'phq9':
      return PHQ9_BANDS;
    case 'gad7':
      return GAD7_BANDS;
    case 'pss10':
      return PSS10_BANDS;
    case 'dass21':
      return DASS21_BANDS;
    default:
      return PHQ9_BANDS;
  }
}
