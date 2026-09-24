import { Link } from 'react-router-dom';
import { ASSESSMENTS } from '@shared/questionnaires';

export function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold text-slate-900">About MindCheck</h1>
      <p className="mt-4 leading-relaxed text-slate-700">
        MindCheck is a free, privacy-first screening tool for depression, anxiety, and stress. It
        uses four instruments that are widely used in clinical practice and research, and it is
        built so that taking a screening costs nothing and requires no account.
      </p>

      <section className="mt-10">
        <h2 className="text-xl font-bold text-slate-900">What we are — and are not</h2>
        <div className="mt-4 space-y-3 text-slate-700">
          <p>
            <strong className="text-slate-900">MindCheck is a screening tool.</strong> It helps you
            notice patterns in how you have been feeling and decide whether support would be
            worthwhile. It is not a diagnosis, and no score here can tell you whether you have a
            mental health condition. Only a qualified healthcare professional can do that.
          </p>
          <p>
            <strong className="text-slate-900">MindCheck is not a crisis service.</strong> We cannot
            see your answers, cannot respond to messages, and cannot intervene. If you are in
            immediate danger, contact your local emergency number. Crisis lines are listed on every
            page of this site.
          </p>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-bold text-slate-900">The instruments</h2>
        <dl className="mt-4 space-y-5">
          {ASSESSMENTS.map((a) => (
            <div key={a.slug} className="rounded-2xl border border-slate-200 bg-white p-5">
              <dt className="font-semibold text-slate-900">
                {a.name} — <span className="font-normal text-slate-500">{a.fullName}</span>
              </dt>
              <dd className="mt-2 text-sm leading-relaxed text-slate-700">{a.description}</dd>
              <dd className="mt-3 text-sm text-slate-500">
                {a.totalItems} questions · about {a.estimatedTime} minutes ·{' '}
                {a.timeframe}
                {a.questions.some((q) => q.isCritical) && ' · includes a safety question'}
              </dd>
              <dd className="mt-3">
                <Link
                  to={`/assessment/${a.slug}`}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Start this screening →
                </Link>
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-bold text-slate-900">How your data is handled</h2>
        <p className="mt-3 leading-relaxed text-slate-700">
          Screenings can be taken anonymously. We store answers against a random identifier held in
          your browser, not tied to your name, email, or IP history. An account is optional and is
          only used to let you revisit history. We do not sell data, run ads, or build profiles. See
          the <Link to="/privacy" className="font-medium text-primary hover:underline">privacy policy</Link>{' '}
          for details.
        </p>
      </section>
    </div>
  );
}
