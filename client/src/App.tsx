import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Layout, RequireAuth } from './components/layout/Layout';
import { HomePage } from './pages/HomePage';
import { AssessmentIntroPage } from './pages/AssessmentIntroPage';
import { QuestionnairePage } from './pages/QuestionnairePage';
import { ResultsPage } from './pages/ResultsPage';
import { ResourcesPage } from './pages/ResourcesPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AboutPage } from './pages/AboutPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { TermsPage } from './pages/TermsPage';

// Recharts is ~400 kB and is only needed by the dashboard. Anonymous users —
// who are the overwhelming majority — never load it.
const DashboardPage = lazy(() =>
  import('./pages/DashboardPage').then((m) => ({ default: m.DashboardPage })),
);

function RouteFallback() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 text-center text-slate-600" aria-busy="true">
      Loading…
    </div>
  );
}

function NotFoundPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center">
      <p className="text-6xl font-bold text-primary">404</p>
      <h1 className="mt-4 text-2xl font-bold text-slate-900">Page not found</h1>
      <p className="mt-3 text-slate-600">
        The page you were looking for does not exist or has moved.
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-primary px-5 py-2.5 font-medium text-white hover:bg-primary-light"
      >
        Back to home
      </Link>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="assessment/:slug" element={<AssessmentIntroPage />} />
          <Route path="questionnaire/:slug" element={<QuestionnairePage />} />
          <Route path="results/:resultId" element={<ResultsPage />} />
          <Route path="resources" element={<ResourcesPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="privacy" element={<PrivacyPage />} />
          <Route path="terms" element={<TermsPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />

          {/* History is per-account; everything above is anonymous-friendly. */}
          <Route element={<RequireAuth />}>
            <Route
              path="dashboard"
              element={
                <Suspense fallback={<RouteFallback />}>
                  <DashboardPage />
                </Suspense>
              }
            />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
