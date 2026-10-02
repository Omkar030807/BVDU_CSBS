import {
  ArrowRight,
  CheckCircle2,
  Database,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Brand } from '../components/Brand';
import { useAuth } from '../hooks/useAuth';
import { useHealth } from '../hooks/useHealth';

interface LoginLocationState {
  from?: { pathname?: string };
  sessionError?: string | null;
}

export const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const { user, isLoading: isSessionLoading, login } = useAuth();
  const { health, isLoading: isHealthLoading } = useHealth();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LoginLocationState | null;
  const isConnected = health?.database.status === 'connected';

  if (!isSessionLoading && user) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      await login({ email, password });
      const destination = state?.from?.pathname?.startsWith('/')
        ? state.from.pathname
        : '/dashboard';
      navigate(destination, { replace: true });
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Sign in failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-visual" aria-label="Hospital system introduction">
        <div className="login-visual__glow login-visual__glow--one" />
        <div className="login-visual__glow login-visual__glow--two" />
        <div className="login-visual__content">
          <Brand light />
          <div className="login-visual__message">
            <span className="login-visual__tag">Clinical operations, protected</span>
            <h1>One secure place for better hospital coordination.</h1>
            <p>
              Role-aware access keeps clinical and operational tools available to the right staff,
              while PostgreSQL preserves one reliable source of truth.
            </p>
            <div className="login-visual__checks">
              <span><CheckCircle2 size={18} /> Role-based access control</span>
              <span><CheckCircle2 size={18} /> Bcrypt password protection</span>
              <span><CheckCircle2 size={18} /> HTTP-only secure sessions</span>
            </div>
          </div>
          <p className="login-visual__footer">MediCore HMS · College PBL Edition</p>
        </div>
      </section>

      <section className="login-panel">
        <div className="login-panel__mobile-brand"><Brand /></div>
        <div className="login-card">
          <div className="login-card__heading">
            <span className="login-card__icon"><ShieldCheck size={23} /></span>
            <p className="eyebrow">Secure staff access</p>
            <h2>Welcome back</h2>
            <p>Sign in with your assigned hospital account.</p>
          </div>

          {(formError || state?.sessionError) && (
            <div className="form-error" role="alert">
              <strong>Sign in unsuccessful</strong>
              <span>{formError ?? state?.sessionError}</span>
            </div>
          )}

          <form className="login-form" onSubmit={(event) => void handleSubmit(event)}>
            <label htmlFor="email">Email address</label>
            <div className="input-wrap">
              <Mail size={18} />
              <input
                id="email"
                type="email"
                autoComplete="username"
                placeholder="name@hospital.org"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="label-row"><label htmlFor="password">Password</label></div>
            <div className="input-wrap">
              <LockKeyhole size={18} />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={isSubmitting}
                required
              />
              <button
                type="button"
                className="input-action"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword((visible) => !visible)}
                disabled={isSubmitting}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <button className="button button--primary button--wide" type="submit" disabled={isSubmitting || isSessionLoading}>
              {isSubmitting ? <><LoaderCircle className="spin" size={18} /> Signing in…</> : <>Sign in securely <ArrowRight size={18} /></>}
            </button>
          </form>

          {import.meta.env.DEV && (
            <details className="test-credentials">
              <summary>Development test accounts</summary>
              <div>
                <p><strong>Admin</strong><code>admin@medicore.test</code></p>
                <p><strong>Doctor</strong><code>doctor@medicore.test</code></p>
                <p><strong>Receptionist</strong><code>reception@medicore.test</code></p>
                <p><strong>Password</strong><code>Value supplied during db:seed</code></p>
              </div>
            </details>
          )}

          <div className="login-health" aria-live="polite">
            <Database size={16} />
            <span>
              {isHealthLoading ? 'Checking platform…' : isConnected ? 'API and database connected' : 'Platform unavailable'}
            </span>
            <i className={isConnected ? 'online' : ''} />
          </div>
        </div>
      </section>
    </main>
  );
};
