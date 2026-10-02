import { ArrowLeft, FileQuestion } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Brand } from '../components/Brand';

export const NotFoundPage = () => (
  <main className="not-found">
    <Brand />
    <div className="not-found__card">
      <span className="not-found__icon"><FileQuestion size={28} /></span>
      <p className="eyebrow">404 error</p>
      <h1>Page not found</h1>
      <p>The page you requested does not exist in the current HMS foundation.</p>
      <Link className="button button--primary" to="/dashboard">
        <ArrowLeft size={17} /> Return to dashboard
      </Link>
    </div>
  </main>
);
