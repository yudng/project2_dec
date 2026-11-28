import { useState } from 'react';
import { api, ApiException } from '../api/client';
import type { AuthSession } from '../types';

interface LoginFormProps {
  onSuccess: (session: AuthSession) => void;
  sessionNotice?: string | null;
}

export default function LoginForm({ onSuccess, sessionNotice }: LoginFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!username.trim() || !password) {
      setError('Please enter both username and password.');
      return;
    }
    setSubmitting(true);
    try {
      const session = await api.login(username.trim(), password);
      onSuccess(session);
    } catch (err) {
      setError(
        err instanceof ApiException
          ? err.message
          : 'Could not reach the server. Is the backend running on port 8080?',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>📦 Inventory Manager</h1>
        <p className="login-subtitle">Sign in to access warehouse inventory controls</p>

        {sessionNotice && <p className="form-error">{sessionNotice}</p>}
        {error && <p className="form-error" role="alert">{error}</p>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-field">
            <label htmlFor="login-username">Username</label>
            <input
              id="login-username"
              className="input"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              className="input"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button className="btn btn-primary login-submit" type="submit" disabled={submitting}>
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div className="demo-accounts">
          <p className="demo-title">Demo accounts (H2 seed):</p>
          <div className="demo-buttons">
            <button
              className="btn btn-small btn-ghost"
              type="button"
              onClick={() => {
                setUsername('admin');
                setPassword('admin123');
                setError(null);
              }}
            >
              Fill ADMIN (admin / admin123)
            </button>
            <button
              className="btn btn-small btn-ghost"
              type="button"
              onClick={() => {
                setUsername('staff');
                setPassword('staff123');
                setError(null);
              }}
            >
              Fill STAFF (staff / staff123)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
