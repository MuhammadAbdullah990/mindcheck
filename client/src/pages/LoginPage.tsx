import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, error } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const redirectTo = (location.state as { from?: string } | null)?.from ?? '/dashboard';

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (await login(email, password)) navigate(redirectTo, { replace: true });
  };

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-3xl font-bold text-slate-900">Welcome back</h1>
      <p className="mt-2 text-slate-600">
        Sign in to see your screening history. You can still use every screening without an
        account.
      </p>

      <form onSubmit={submit} className="mt-8 space-y-4" noValidate>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-800">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-slate-900"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-800">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-slate-900"
          />
        </div>

        {error && (
          <p role="alert" className="rounded-lg bg-severity-red/10 p-3 text-sm text-severity-red">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="min-h-12 w-full rounded-xl bg-primary px-6 py-3 font-semibold text-white transition-colors hover:bg-primary-light disabled:opacity-60"
        >
          {isLoading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p className="mt-6 text-sm text-slate-600">
        No account yet?{' '}
        <Link to="/register" className="font-medium text-primary hover:underline">
          Create one
        </Link>
      </p>
    </div>
  );
}
