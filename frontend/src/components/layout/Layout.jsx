import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import TopBar from './TopBar';
import Sidebar from './Sidebar';
import LocationBar from './LocationBar';
import BottomNav from './BottomNav';
import { useRole } from '../../hooks/useRole';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isCustomer } = useRole();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <TopBar onMenuClick={() => setSidebarOpen(true)} />
      <div className="flex flex-1">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 flex flex-col min-w-0 overflow-auto">
          <LocationBar />
          <div className={`flex-1 p-3 sm:p-4 lg:p-6 ${!isCustomer ? 'pb-24 sm:pb-6 lg:pb-6' : 'pb-6'}`}>
            <div className="max-w-7xl mx-auto space-y-6">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
      {!isCustomer && <BottomNav />}
    </div>
  );
}
