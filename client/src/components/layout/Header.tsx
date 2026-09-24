import { Link, NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
    isActive ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
  }`;

export function Header() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3" aria-label="Main">
        <Link to="/" className="flex items-center gap-2 text-lg font-bold text-slate-900">
          <span aria-hidden="true">🧠</span>
          MindCheck
        </Link>

        <div className="flex items-center gap-1">
          <NavLink to="/" end className={navLinkClass}>
            Home
          </NavLink>
          <NavLink to="/resources" className={navLinkClass}>
            Resources
          </NavLink>
          <NavLink to="/about" className={navLinkClass}>
            About
          </NavLink>
          {user ? (
            <>
              <NavLink to="/dashboard" className={navLinkClass}>
                History
              </NavLink>
              <button
                type="button"
                onClick={logout}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              >
                Sign out
              </button>
            </>
          ) : (
            <NavLink to="/login" className={navLinkClass}>
              Sign in
            </NavLink>
          )}
        </div>
      </nav>
    </header>
  );
}
