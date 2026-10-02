import { ArrowLeft, ShieldX } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const UnauthorizedPage = () => {
  const { user } = useAuth();

  return (
    <section className="unauthorized-card panel">
      <span><ShieldX size={29} /></span>
      <p className="eyebrow">Access denied</p>
      <h2>This area is not available to your role.</h2>
      <p>
        You are signed in as <strong>{user?.role}</strong>. The requested page requires a different
        authorization level.
      </p>
      <Link className="button button--primary" to="/dashboard"><ArrowLeft size={16} /> Return to dashboard</Link>
    </section>
  );
};
