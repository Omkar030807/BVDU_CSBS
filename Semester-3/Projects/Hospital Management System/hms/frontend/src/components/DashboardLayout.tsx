import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useHealth } from '../hooks/useHealth';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

export const DashboardLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const healthState = useHealth();
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <div className="app-shell">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="app-shell__main">
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          health={healthState.health}
          isLoading={healthState.isLoading}
          user={user}
          onLogout={logout}
        />
        <main className="app-content"><Outlet context={healthState} /></main>
      </div>
    </div>
  );
};
