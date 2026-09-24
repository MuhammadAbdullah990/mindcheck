import { Link } from 'react-router-dom';

export function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold text-slate-900">Terms of use</h1>
      <p className="mt-2 text-sm text-slate-500">Last updated: September 2026</p>

      <section className="mt-8 space-y-6 text-slate-700">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Acceptable use</h2>
          <p className="mt-3 leading-relaxed">
            MindCheck is provided free of charge for personal, non-commercial use. You may take as
            many screenings as you like. Automated, scripted, or bulk use of the service is not
            permitted.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-slate-900">No medical advice</h2>
          <p className="mt-3 leading-relaxed">
            Nothing on this site is medical advice, diagnosis, or treatment. The screening
            instruments used here are validated for screening purposes but have not been applied to
            your individual situation. Always consult a qualified healthcare professional about
            medical concerns.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-slate-900">Not an emergency service</h2>
          <p className="mt-3 leading-relaxed">
            MindCheck is not monitored and cannot respond to messages. Do not use it if you are in
            immediate danger — call your local emergency number instead. Crisis lines are available
            on every page of this site and on the{' '}
            <Link to="/resources" className="font-medium text-primary hover:underline">
              resources page
            </Link>
            .
          </p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-slate-900">Availability</h2>
          <p className="mt-3 leading-relaxed">
            The service is provided "as is" and without warranty. We aim to keep it available, but
            it may be interrupted. Scores produced by a screening should be treated as indicative
            only.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-slate-900">Limitation of liability</h2>
          <p className="mt-3 leading-relaxed">
            To the maximum extent permitted by law, the maintainers of MindCheck are not liable for
            any indirect or consequential loss arising from use of this site, including any decision
            you make based on a screening result.
          </p>
        </div>
      </section>
    </div>
  );
}
