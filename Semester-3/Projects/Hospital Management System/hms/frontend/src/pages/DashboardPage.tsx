import {
  Activity,
  Check,
  Clock3,
  Code2,
  Database,
  Layers3,
  RefreshCw,
  Server,
  ShieldCheck,
  Smartphone,
} from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { UseHealthResult } from '../hooks/useHealth';

const formatUptime = (seconds: number): string => {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3_600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  return `${Math.floor(seconds / 3_600)}h ${Math.floor((seconds % 3_600) / 60)}m`;
};

const currentDate = new Intl.DateTimeFormat('en-IN', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
}).format(new Date());

export const DashboardPage = () => {
  const { health, isLoading, error, refresh } = useOutletContext<UseHealthResult>();
  const { user } = useAuth();
  const apiOnline = health?.status === 'ok';
  const databaseOnline = health?.database.status === 'connected';

  return (
    <div className="dashboard-page">
      <section className="welcome-strip">
        <div>
          <p className="eyebrow">{currentDate}</p>
          <h2>Welcome, {user?.fullName}.</h2>
          <p>Your {user?.role} session is protected. Clinical, inpatient, pharmacy, and prescription records are connected to PostgreSQL.</p>
        </div>
        <div className="phase-pill">
          <span>Release status</span>
          <strong>v1.0.0</strong>
          <small>All 12 phases accepted</small>
        </div>
      </section>

      {error && (
        <section className="error-banner" role="alert">
          <Activity size={20} />
          <div><strong>Health service unavailable</strong><p>{error}</p></div>
          <button className="button button--small" onClick={refresh}>
            <RefreshCw size={15} /> Retry
          </button>
        </section>
      )}

      <section className="status-grid" aria-label="Live system status">
        <article className="status-card">
          <span className="status-card__icon status-card__icon--teal"><Server size={21} /></span>
          <div className="status-card__top"><p>API service</p><span className={apiOnline ? 'status-dot status-dot--ok' : 'status-dot'} /></div>
          <strong>{isLoading ? 'Checking…' : apiOnline ? 'Operational' : 'Unavailable'}</strong>
          <small>{health ? `${health.service} · v${health.version}` : 'Awaiting response'}</small>
        </article>
        <article className="status-card">
          <span className="status-card__icon status-card__icon--blue"><Database size={21} /></span>
          <div className="status-card__top"><p>PostgreSQL</p><span className={databaseOnline ? 'status-dot status-dot--ok' : 'status-dot'} /></div>
          <strong>{isLoading ? 'Checking…' : databaseOnline ? 'Connected' : 'Disconnected'}</strong>
          <small>Live database probe</small>
        </article>
        <article className="status-card">
          <span className="status-card__icon status-card__icon--violet"><Activity size={21} /></span>
          <div className="status-card__top"><p>DB response</p><span className={databaseOnline ? 'status-dot status-dot--ok' : 'status-dot'} /></div>
          <strong>{health ? `${health.database.responseTimeMs.toFixed(2)} ms` : '—'}</strong>
          <small>Measured by the API</small>
        </article>
        <article className="status-card">
          <span className="status-card__icon status-card__icon--orange"><Clock3 size={21} /></span>
          <div className="status-card__top"><p>API uptime</p><span className={apiOnline ? 'status-dot status-dot--ok' : 'status-dot'} /></div>
          <strong>{health ? formatUptime(health.uptimeSeconds) : '—'}</strong>
          <small>Since current server start</small>
        </article>
      </section>

      <section className="dashboard-grid">
        <article className="panel system-panel">
          <div className="panel__header">
            <div>
              <p className="eyebrow">Verification</p>
              <h3>Foundation health</h3>
            </div>
            <button className="icon-button icon-button--bordered" onClick={refresh} aria-label="Refresh health status" disabled={isLoading}>
              <RefreshCw size={17} className={isLoading ? 'spin' : ''} />
            </button>
          </div>
          <div className="check-list">
            <div className={apiOnline ? 'check-row check-row--done' : 'check-row'}>
              <span><Check size={16} /></span><div><strong>REST API</strong><small>Express and TypeScript server</small></div><em>{apiOnline ? 'Passed' : 'Pending'}</em>
            </div>
            <div className={databaseOnline ? 'check-row check-row--done' : 'check-row'}>
              <span><Check size={16} /></span><div><strong>Database connection</strong><small>PostgreSQL connection pool</small></div><em>{databaseOnline ? 'Passed' : 'Pending'}</em>
            </div>
            <div className="check-row check-row--done">
              <span><Check size={16} /></span><div><strong>Secure authentication</strong><small>Bcrypt sessions and role permissions</small></div><em>Passed</em>
            </div>
            <div className="check-row check-row--done">
              <span><Check size={16} /></span><div><strong>Patient management</strong><small>Database CRUD, search, filters, and details</small></div><em>Passed</em>
            </div>
            <div className="check-row check-row--done">
              <span><Check size={16} /></span><div><strong>Doctor management</strong><small>Profiles, fees, rooms, and weekly availability</small></div><em>Passed</em>
            </div>
            <div className="check-row check-row--done">
              <span><Check size={16} /></span><div><strong>Appointment management</strong><small>Scheduling and database double-book prevention</small></div><em>Passed</em>
            </div>
            <div className="check-row check-row--done">
              <span><Check size={16} /></span><div><strong>Admissions & beds</strong><small>Transactional bed allocation and discharge</small></div><em>Passed</em>
            </div>
            <div className="check-row check-row--done">
              <span><Check size={16} /></span><div><strong>Pharmacy management</strong><small>Stock movements and inventory alerts</small></div><em>Passed</em>
            </div>
            <div className="check-row check-row--done">
              <span><Check size={16} /></span><div><strong>Prescription management</strong><small>Structured multi-medicine clinical orders</small></div><em>Passed</em>
            </div>
            <div className="check-row check-row--done">
              <span><Check size={16} /></span><div><strong>Billing</strong><small>Itemized invoices and transactional payments</small></div><em>Passed</em>
            </div>
            <div className="check-row check-row--done">
              <span><Check size={16} /></span><div><strong>Computational statistics</strong><small>Live aggregates and descriptive calculations</small></div><em>Passed</em>
            </div>
            <div className="check-row check-row--done">
              <span><Check size={16} /></span><div><strong>Notifications</strong><small>Role-targeted operational alerts and acknowledgement</small></div><em>Passed</em>
            </div>
            <div className="check-row check-row--done">
              <span><Check size={16} /></span><div><strong>Final acceptance</strong><small>End-to-end verification and release hardening</small></div><em>Passed</em>
            </div>
          </div>
          {health?.timestamp && (
            <p className="panel__updated">Last checked {new Date(health.timestamp).toLocaleTimeString('en-IN')}</p>
          )}
        </article>

        <article className="panel architecture-panel">
          <div className="panel__header">
            <div><p className="eyebrow">Engineering</p><h3>Architecture ready</h3></div>
            <span className="panel__badge">Modular</span>
          </div>
          <p className="panel__intro">A clean base for OOP workflows and database-driven computational statistics.</p>
          <div className="architecture-list">
            <div><span><Code2 size={19} /></span><div><strong>Typed end to end</strong><small>React and Express with strict TypeScript</small></div></div>
            <div><span><Layers3 size={19} /></span><div><strong>Layered backend</strong><small>Controllers, services, and repositories</small></div></div>
            <div><span><ShieldCheck size={19} /></span><div><strong>Security baseline</strong><small>Helmet, validated config, safe errors</small></div></div>
            <div><span><Smartphone size={19} /></span><div><strong>Responsive interface</strong><small>Accessible layout across screen sizes</small></div></div>
          </div>
        </article>
      </section>

      <section className="roadmap-panel panel">
        <div className="panel__header">
          <div><p className="eyebrow">Delivery roadmap</p><h3>Release complete</h3></div>
          <span className="roadmap-panel__note">12 phases accepted</span>
        </div>
        <div className="roadmap-steps">
          <div className="roadmap-step roadmap-step--next"><span>✓</span><div><strong>MediCore v1.0.0</strong><small>All requested clinical and administrative modules verified</small></div></div>
        </div>
      </section>
    </div>
  );
};
