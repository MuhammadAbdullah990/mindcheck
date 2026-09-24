import { useEffect, useRef } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { CrisisBanner } from './CrisisBanner';
import { useAuthStore } from '../../store/authStore';

/**
 * Redirects to /login when a route requires an account. `from` is preserved so
 * the user lands back where they were after signing in.
 */
export function RequireAuth() {
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center text-slate-600">
        Loading…
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Sign in to view this</h1>
        <p className="mt-3 text-slate-600">
          Screening history is tied to your account. You can still take any screening without one.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            to="/login"
            state={{ from: location.pathname }}
            className="inline-flex min-h-11 items-center rounded-xl bg-primary px-5 py-2.5 font-medium text-white hover:bg-primary-light"
          >
            Sign in
          </Link>
          <Link
            to="/register"
            className="inline-flex min-h-11 items-center rounded-xl border border-slate-300 px-5 py-2.5 font-medium text-slate-700 hover:bg-slate-50"
          >
            Create account
          </Link>
        </div>
      </div>
    );
  }

  return <Outlet />;
}

/**
 * App shell. Scrolls to the top on every navigation — without this, moving
 * from a long results page to the questionnaire keeps the old scroll offset
 * and the user lands mid-page.
 */
export function Layout() {
  const location = useLocation();
  const restore = useAuthStore((s) => s.restore);
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    void restore();
  }, [restore]);

  useEffect(() => {
    mainRef.current?.scrollIntoView({ block: 'start' });
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:font-medium focus:text-primary focus:shadow"
      >
        Skip to content
      </a>

      <CrisisBanner />
      <Header />

      <main id="main" ref={mainRef} className="flex-1 focus:outline-none" tabIndex={-1}>
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}
