import { NavLink, useLocation } from 'react-router-dom';
import { useRole } from '../../hooks/useRole';
import {
  ChartBarIcon, ShoppingBagIcon, BuildingStorefrontIcon,
  UsersIcon, RectangleStackIcon, CubeIcon,
} from '@heroicons/react/24/outline';

const tabs = [
  { path: '/', label: 'Dashboard', icon: ChartBarIcon },
  { path: '/restaurants', label: 'Restaurants', icon: BuildingStorefrontIcon },
  { path: '/inventory', label: 'Inventory', icon: CubeIcon },
  { path: '/menu', label: 'Menu', icon: RectangleStackIcon },
  { path: '/users', label: 'Users', icon: UsersIcon },
  { path: '/orders', label: 'Orders', icon: ShoppingBagIcon },
];

export default function BottomNav() {
  const { isCustomer } = useRole();
  const location = useLocation();

  const visibleTabs = tabs.filter(t => {
    if (t.path === '/users' && isCustomer) return false;
    if (t.path === '/inventory' && isCustomer) return false;
    if (t.path === '/menu' && isCustomer) return false;
    return true;
  });

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg border-t border-gray-200/80 dark:border-gray-700/80 lg:hidden safe-area-bottom shadow-[0_-4px_20px_rgba(0,0,0,0.05)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.2)]">
      <div className="flex items-center justify-around h-16 px-2">
        {visibleTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = location.pathname === tab.path ||
            (tab.path !== '/' && location.pathname.startsWith(tab.path));
          return (
            <NavLink
              key={tab.path}
              to={tab.path}
              className={`relative flex flex-col items-center justify-center min-w-[56px] py-1 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
            >
              {isActive && (
                <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary-500 rounded-full" />
              )}
              <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`} />
              <span className={`text-[10px] mt-0.5 font-medium ${isActive ? 'font-semibold' : ''}`}>
                {tab.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
