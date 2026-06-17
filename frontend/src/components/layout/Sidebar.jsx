import { NavLink } from 'react-router-dom';
import { useRole } from '../../hooks/useRole';
import { useAuth } from '../../context/AuthContext';
import { SIDEBAR_LINKS, MODULE_PATH_MAP } from '../../lib/constants';
import {
  ChartBarIcon, BuildingOffice2Icon, HomeModernIcon, RectangleStackIcon,
  ShoppingBagIcon, TruckIcon, UsersIcon, CubeIcon, PuzzlePieceIcon, UserCircleIcon,
} from '@heroicons/react/24/outline';

const iconMap = {
  ChartBarIcon, BuildingOffice2Icon, HomeModernIcon,
  RectangleStackIcon, ShoppingBagIcon, TruckIcon, UsersIcon, CubeIcon,
  PuzzlePieceIcon, UserCircleIcon,
};

export default function Sidebar({ open, onClose }) {
  const { currentRole, isSuperadmin } = useRole();
  const { allowedModules } = useAuth();
  const links = SIDEBAR_LINKS[currentRole] || SIDEBAR_LINKS.CUSTOMER;

  const moduleKeys = allowedModules && Array.isArray(allowedModules)
    ? allowedModules.map(m => m.key)
    : null;

  const filteredLinks = moduleKeys && !isSuperadmin
    ? links.filter(link => {
        for (const [modKey, paths] of Object.entries(MODULE_PATH_MAP)) {
          if (paths.includes(link.path)) return moduleKeys.includes(modKey);
        }
        return true;
      })
    : links;

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
      )}
      <aside className={`fixed top-14 left-0 z-50 h-[calc(100vh-3.5rem)] w-56 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-200 lg:translate-x-0 lg:sticky lg:top-14 lg:z-auto flex flex-col ${
        open ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {filteredLinks.map((link) => {
            const Icon = iconMap[link.icon];
            return (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-gray-200'
                  }`
                }
              >
                {Icon && <Icon className="w-4 h-4 flex-shrink-0" />}
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="p-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 px-3 py-2">
            <div className="w-6 h-6 rounded bg-primary-600 flex items-center justify-center text-white font-bold text-[10px] flex-shrink-0">
              P
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-gray-700 dark:text-gray-300">POS System</p>
              <p className="text-[10px] text-gray-400">v1.0</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
