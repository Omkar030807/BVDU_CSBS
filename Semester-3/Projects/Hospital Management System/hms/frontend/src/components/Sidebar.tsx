import {
  BarChart3,
  BedDouble,
  Bell,
  CalendarDays,
  ClipboardPlus,
  CreditCard,
  LayoutDashboard,
  Pill,
  ShieldCheck,
  Stethoscope,
  UserRoundCog,
  UsersRound,
  X,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Brand } from './Brand';

interface SidebarProps { isOpen: boolean; onClose: () => void; }

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const { user } = useAuth();

  return (
    <>
      <aside className={`sidebar${isOpen ? ' sidebar--open' : ''}`}>
        <div className="sidebar__top">
          <Brand light />
          <button className="icon-button sidebar__close" onClick={onClose} aria-label="Close navigation"><X size={20} /></button>
        </div>

        <nav className="sidebar__nav" aria-label="Primary navigation">
          <p className="sidebar__eyebrow">Workspace</p>
          <NavLink to="/dashboard" className={({ isActive }) => `nav-item${isActive ? ' nav-item--active' : ''}`} onClick={onClose}>
            <LayoutDashboard size={19} /><span>Dashboard</span>
          </NavLink>

          {user?.permissions.includes('notifications') && (
            <NavLink to="/notifications" className={({ isActive }) => `nav-item${isActive ? ' nav-item--active' : ''}`} onClick={onClose}>
              <Bell size={19} /><span>Notifications</span><small className="nav-item__live">Live</small>
            </NavLink>
          )}

          {user?.permissions.includes('patients') && (
            <NavLink to="/patients" className={({ isActive }) => `nav-item${isActive ? ' nav-item--active' : ''}`} onClick={onClose}>
              <UsersRound size={19} /><span>Patients</span><small className="nav-item__live">Live</small>
            </NavLink>
          )}

          {user?.permissions.includes('appointments') && (
            <NavLink to="/appointments" className={({ isActive }) => `nav-item${isActive ? ' nav-item--active' : ''}`} onClick={onClose}>
              <CalendarDays size={19} /><span>Appointments</span><small className="nav-item__live">Live</small>
            </NavLink>
          )}

          {user?.permissions.includes('admissions') && (
            <NavLink to="/admissions" className={({ isActive }) => `nav-item${isActive ? ' nav-item--active' : ''}`} onClick={onClose}>
              <BedDouble size={19} /><span>Admissions & Beds</span><small className="nav-item__live">Live</small>
            </NavLink>
          )}

          {user?.permissions.includes('billing') && (
            <NavLink to="/billing" className={({ isActive }) => `nav-item${isActive ? ' nav-item--active' : ''}`} onClick={onClose}>
              <CreditCard size={19} /><span>Billing</span><small className="nav-item__live">Live</small>
            </NavLink>
          )}

          {user?.permissions.includes('pharmacy') && (
            <NavLink to="/pharmacy" className={({ isActive }) => `nav-item${isActive ? ' nav-item--active' : ''}`} onClick={onClose}>
              <Pill size={19} /><span>Pharmacy</span><small className="nav-item__live">Live</small>
            </NavLink>
          )}

          {user?.permissions.includes('prescriptions') && (
            <NavLink to="/prescriptions" className={({ isActive }) => `nav-item${isActive ? ' nav-item--active' : ''}`} onClick={onClose}>
              <ClipboardPlus size={19} /><span>Prescriptions</span><small className="nav-item__live">Live</small>
            </NavLink>
          )}

          {user?.permissions.includes('doctors') && (
            <NavLink to="/doctors" className={({ isActive }) => `nav-item${isActive ? ' nav-item--active' : ''}`} onClick={onClose}>
              <Stethoscope size={19} /><span>Doctors</span><small className="nav-item__live">Live</small>
            </NavLink>
          )}

          {user?.permissions.includes('statistics') && (
            <NavLink to="/statistics" className={({ isActive }) => `nav-item${isActive ? ' nav-item--active' : ''}`} onClick={onClose}>
              <BarChart3 size={19} /><span>Statistics</span><small className="nav-item__live">Live</small>
            </NavLink>
          )}

          {user?.role === 'Admin' && (
            <NavLink to="/admin/users" className={({ isActive }) => `nav-item${isActive ? ' nav-item--active' : ''}`} onClick={onClose}>
              <UserRoundCog size={19} /><span>Users & Roles</span><small className="nav-item__live">Live</small>
            </NavLink>
          )}

        </nav>

        <div className="sidebar__footer">
          <span className="sidebar__footer-dot" aria-hidden="true"><ShieldCheck size={10} /></span>
          <div><strong>{user?.role ?? 'Secure session'}</strong><small>v1.0.0 · Release accepted</small></div>
        </div>
      </aside>
      {isOpen && <button className="sidebar-overlay" onClick={onClose} aria-label="Close navigation" />}
    </>
  );
};
