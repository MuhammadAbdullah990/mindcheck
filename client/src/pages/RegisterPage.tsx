import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const MIN_PASSWORD = 8;

export function RegisterPage() {
  const navigate = useNavigate();
  const { register, isLoading, error } = useAuthStore();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const tooShort = password.length > 0 && password.length < MIN_PASSWORD;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (password.length < MIN_PASSWORD) return;
    if (await register(email, password, displayName.trim() || undefined)) {
      navigate('/dashboard', { replace: true });
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-3xl font-bold text-slate-900">Create an account</h1>
      <p className="mt-2 text-slate-600">
        An account is optional — it only exists to let you revisit your history across devices.
        We ask for an email and nothing else.
      </p>

      <form onSubmit={submit} className="mt-8 space-y-4" noValidate>
        <div>
          <label htmlFor="displayName" className="block text-sm font-medium text-slate-800">
            Name <span className="font-normal text-slate-400">(optional)</span>
          </label>
          <input
            id="displayName"
            name="name"
            type="text"
            autoComplete="name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-slate-900"
          />
        </div>

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
            autoComplete="new-password"
            required
            minLength={MIN_PASSWORD}
            aria-describedby={tooShort ? 'password-hint' : undefined}
            aria-invalid={tooShort || undefined}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-slate-900"
          />
          {tooShort && (
            <p id="password-hint" className="mt-1 text-sm text-severity-red">
              Use at least {MIN_PASSWORD} characters.
            </p>
          )}
        </div>

        {error && (
          <p role="alert" className="rounded-lg bg-severity-red/10 p-3 text-sm text-severity-red">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isLoading || tooShort}
          className="min-h-12 w-full rounded-xl bg-primary px-6 py-3 font-semibold text-white transition-colors hover:bg-primary-light disabled:opacity-60"
        >
          {isLoading ? 'Creating…' : 'Create account'}
        </button>
      </form>

      <p className="mt-6 text-sm text-slate-600">
        Already registered?{' '}
        <Link to="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
