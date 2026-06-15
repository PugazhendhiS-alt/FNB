import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import BottomNav from './BottomNav';
import { useRole } from '../../hooks/useRole';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isCustomer } = useRole();

  return (
    <div className="min-h-screen flex">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className={`flex-1 p-3 sm:p-4 lg:p-6 overflow-auto ${!isCustomer ? 'pb-20 sm:pb-4 lg:pb-6' : 'pb-4'}`}>
          <Outlet />
        </main>
        {!isCustomer && <BottomNav />}
      </div>
    </div>
  );
}