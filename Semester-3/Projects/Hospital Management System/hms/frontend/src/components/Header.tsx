import { Activity, Bell, LoaderCircle, LogOut, Menu } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { notificationsRequest } from '../services/notificationApi';
import type { AuthUser } from '../types/auth';
import type { HealthStatus } from '../types/health';

interface HeaderProps {
  onMenuClick: () => void;
  health: HealthStatus | null;
  isLoading: boolean;
  user: AuthUser;
  onLogout: () => Promise<void>;
}

export const Header = ({ onMenuClick, health, isLoading, user, onLogout }: HeaderProps) => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const location = useLocation();
  useEffect(() => {
    if (!user.permissions.includes('notifications')) return;
    let active = true;
    const refresh = () => void notificationsRequest(undefined, true).then((x) => { if (active) setUnreadNotifications(x.unreadCount); }).catch(() => undefined);
    refresh();
    const timer = window.setInterval(refresh, 60_000);
    return () => { active = false; window.clearInterval(timer); };
  }, [location.pathname, user.id, user.permissions]);
  const isOnline = health?.status === 'ok';
  const pageTitle = location.pathname === '/patients'
    ? 'Patient management'
    : location.pathname === '/doctors'
      ? 'Doctor management'
      : location.pathname === '/appointments'
        ? 'Appointment management'
        : location.pathname === '/admissions'
          ? 'Admissions and beds'
          : location.pathname === '/pharmacy'
            ? 'Pharmacy management'
            : location.pathname === '/prescriptions'
              ? 'Prescription management'
              : location.pathname === '/billing'
                ? 'Billing and payments'
                : location.pathname === '/statistics'
                  ? 'Computational statistics'
                  : location.pathname === '/notifications'
                    ? 'Operational notifications'
                    : location.pathname === '/admin/users'
        ? 'Users and roles'
        : 'System overview';
  const initials = user.fullName.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase();

  const handleLogout = async (): Promise<void> => {
    setIsLoggingOut(true);
    try { await onLogout(); } finally { setIsLoggingOut(false); }
  };

  return (
    <header className="app-header">
      <div className="app-header__title-wrap">
        <button className="icon-button app-header__menu" onClick={onMenuClick} aria-label="Open navigation"><Menu size={22} /></button>
        <div><p className="app-header__eyebrow">Administration portal</p><h1>{pageTitle}</h1></div>
      </div>

      <div className="app-header__right">
        <div className={`live-status${isOnline ? ' live-status--online' : ''}`}>
          <Activity size={17} />
          <div><small>System status</small><strong>{isLoading ? 'Checking…' : isOnline ? 'All systems operational' : 'Attention required'}</strong></div>
        </div>
        {user.permissions.includes('notifications') && <Link to="/notifications" className="icon-button header-notification" aria-label={`${unreadNotifications} unread notifications`} title="Notifications"><Bell size={18} />{unreadNotifications > 0 && <span>{unreadNotifications > 99 ? '99+' : unreadNotifications}</span>}</Link>}
        <div className="profile-chip">
          <span>{initials}</span>
          <div><strong>{user.fullName}</strong><small>{user.role}</small></div>
        </div>
        <button className="icon-button logout-button" onClick={() => void handleLogout()} disabled={isLoggingOut} aria-label="Sign out" title="Sign out">
          {isLoggingOut ? <LoaderCircle className="spin" size={18} /> : <LogOut size={18} />}
        </button>
      </div>
    </header>
  );
};
