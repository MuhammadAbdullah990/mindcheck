import { Link } from 'react-router-dom';

type Props = { className?: string };

/**
 * Shown whenever a critical item is flagged (PHQ-9 Q9; DASS-21 items 10, 17,
 * 21). The message is deliberately direct: someone disclosing thoughts of
 * self-harm needs a clear path to help, not hedged clinical language.
 */
export function CrisisAlert({ className = '' }: Props) {
  return (
    <div
      className={`rounded-2xl border-2 border-severity-red bg-crisis-bg p-5 ${className}`}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl" aria-hidden="true">
          💙
        </span>
        <div>
          <h2 className="font-bold text-crisis-text">You are not alone in this</h2>
          <p className="mt-2 text-sm leading-relaxed text-severity-red">
            Your answer tells us you have been having thoughts of harming yourself. That is a sign
            of real distress, and it is worth support. Please consider reaching out to someone today
            — a crisis line, a doctor, or a person you trust.
          </p>

          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <a
                href="tel:988"
                className="font-semibold text-crisis-text underline underline-offset-2"
              >
                Call or text 988
              </a>{' '}
              <span className="text-severity-red/80">(US &amp; Canada, free, 24/7)</span>
            </li>
            <li>
              Text <span className="font-semibold">HOME</span> to{' '}
              <span className="font-semibold">741741</span> for the Crisis Text Line
            </li>
            <li>
              <a
                href="tel:0311-7786264"
                className="font-semibold text-crisis-text underline underline-offset-2"
              >
                0311-7786264
              </a>{' '}
              <span className="text-severity-red/80">(Umang Helpline, Pakistan)</span>
            </li>
            <li>
              <a
                href="tel:0800-22-444"
                className="font-semibold text-crisis-text underline underline-offset-2"
              >
                0800-22-444
              </a>{' '}
              <span className="text-severity-red/80">(Rozan Counseling, Pakistan)</span>
            </li>
          </ul>

          <p className="mt-4 text-sm text-severity-red">
            If you are in immediate danger, please call your local emergency number.{' '}
            <Link to="/resources" className="font-semibold underline underline-offset-2">
              See all crisis resources
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
