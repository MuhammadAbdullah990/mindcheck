import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <p className="text-sm font-medium text-slate-700">
          MindCheck is a screening tool, not a diagnostic service.
        </p>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">
          Results from these questionnaires do not constitute a medical diagnosis. Only a qualified
          healthcare professional can diagnose a mental health condition. If you are in immediate
          danger, contact your local emergency number.
        </p>
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <Link to="/about" className="text-primary hover:underline">
            About &amp; methodology
          </Link>
          <Link to="/resources" className="text-primary hover:underline">
            Crisis resources
          </Link>
          <Link to="/privacy" className="text-primary hover:underline">
            Privacy
          </Link>
          <Link to="/terms" className="text-primary hover:underline">
            Terms
          </Link>
          <span className="text-slate-400">PHQ-9 · GAD-7 · PSS-10 · DASS-21</span>
        </div>
      </div>
    </footer>
  );
}
