import { NavLink, useLocation } from 'react-router-dom';
import { useRole } from '../../hooks/useRole';
import {
  ChartBarIcon, ShoppingBagIcon, BuildingStorefrontIcon,
  UsersIcon, UserCircleIcon,
} from '@heroicons/react/24/outline';

const tabs = [
  { path: '/', label: 'Dashboard', icon: ChartBarIcon },
  { path: '/restaurants', label: 'Restaurants', icon: BuildingStorefrontIcon },
  { path: '/users', label: 'Users', icon: UsersIcon },
  { path: '/buildings', label: 'Buildings', icon: BuildingStorefrontIcon },
  { path: '/menu', label: 'Menu', icon: ChartBarIcon },
];

export default function BottomNav() {
  const { isAdmin, isCustomer } = useRole();
  const location = useLocation();

  const visibleTabs = tabs.filter(t => {
    if (t.path === '/users' && !isAdmin && !isCustomer) return true;
    if (t.path === '/users' && isCustomer) return false;
    if (t.path === '/buildings' && isCustomer) return false;
    return true;
  });

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 lg:hidden safe-area-bottom">
      <div className="flex items-center justify-around h-14">
        {visibleTabs.slice(0, 5).map((tab) => {
          const Icon = tab.icon;
          const isActive = location.pathname === tab.path ||
            (tab.path !== '/' && location.pathname.startsWith(tab.path));
          return (
            <NavLink
              key={tab.path}
              to={tab.path}
              className={`flex flex-col items-center justify-center min-w-[48px] min-h-[44px] px-2 py-1 rounded-lg transition-colors ${
                isActive
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] mt-0.5 font-medium truncate max-w-[60px] text-center leading-tight">
                {tab.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}