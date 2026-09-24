import { Link } from 'react-router-dom';

/**
 * Persistent crisis support bar. Present on every page (06_WIREFRAMES_UI.md):
 * someone reading a concerning score should always be one click from help,
 * without having to ask for it.
 */
export function CrisisBanner() {
  return (
    <div className="bg-crisis-bg border-b border-severity-red/20 px-4 py-2.5 text-center text-sm">
      <p className="text-crisis-text">
        <span className="font-semibold">If you are in crisis, please reach out.</span>{' '}
        <a href="tel:988" className="font-semibold underline underline-offset-2">
          Call or text 988 (US)
        </a>{' '}
        <span className="text-severity-red/60">·</span>{' '}
        <a href="tel:0311-7786264" className="font-semibold underline underline-offset-2">
          0311-7786264 (Pakistan)
        </a>{' '}
        <span className="text-severity-red/60">·</span>{' '}
        <Link to="/resources" className="font-semibold underline underline-offset-2">
          More resources
        </Link>
      </p>
    </div>
  );
}
