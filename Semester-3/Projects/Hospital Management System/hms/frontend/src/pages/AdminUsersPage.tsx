import { AlertCircle, CheckCircle2, RefreshCw, ShieldCheck, UserRoundCog } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { listUsersRequest } from '../services/authApi';
import type { AuthUser } from '../types/auth';

const roleClass = (role: AuthUser['role']): string => role.toLowerCase();

export const AdminUsersPage = () => {
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      setUsers(await listUsersRequest());
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load users.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { void loadUsers(); }, [loadUsers]);

  return (
    <div className="dashboard-page">
      <section className="page-heading">
        <div>
          <p className="eyebrow">Admin access</p>
          <h2>Users and roles</h2>
          <p>Accounts and authorization roles loaded directly from PostgreSQL.</p>
        </div>
        <button className="button button--small" onClick={() => void loadUsers()} disabled={isLoading}>
          <RefreshCw className={isLoading ? 'spin' : ''} size={15} /> Refresh
        </button>
      </section>

      <section className="access-summary">
        <article><span><UserRoundCog size={20} /></span><div><strong>{users.length}</strong><small>Database accounts</small></div></article>
        <article><span><CheckCircle2 size={20} /></span><div><strong>{users.filter((user) => user.isActive).length}</strong><small>Active accounts</small></div></article>
        <article><span><ShieldCheck size={20} /></span><div><strong>3</strong><small>Authorization roles</small></div></article>
      </section>

      <section className="panel users-panel">
        <div className="panel__header">
          <div><p className="eyebrow">Access directory</p><h3>Hospital staff accounts</h3></div>
          <span className="panel__badge">Admin only</span>
        </div>

        {error ? (
          <div className="table-state table-state--error"><AlertCircle size={25} /><strong>Could not load users</strong><p>{error}</p></div>
        ) : isLoading ? (
          <div className="table-state"><RefreshCw className="spin" size={25} /><strong>Loading accounts…</strong></div>
        ) : users.length === 0 ? (
          <div className="table-state"><UserRoundCog size={25} /><strong>No user accounts found</strong></div>
        ) : (
          <div className="table-scroll">
            <table className="users-table">
              <thead><tr><th>User</th><th>Role</th><th>Status</th><th>Permissions</th><th>Last login</th></tr></thead>
              <tbody>
                {users.map((account) => (
                  <tr key={account.id}>
                    <td><div className="user-cell"><span>{account.fullName.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()}</span><div><strong>{account.fullName}</strong><small>{account.email}</small></div></div></td>
                    <td><span className={`role-badge role-badge--${roleClass(account.role)}`}>{account.role}</span></td>
                    <td><span className={`account-status${account.isActive ? ' account-status--active' : ''}`}><i />{account.isActive ? 'Active' : 'Disabled'}</span></td>
                    <td>{account.permissions.length}</td>
                    <td>{account.lastLoginAt ? new Date(account.lastLoginAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : 'Never'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};
