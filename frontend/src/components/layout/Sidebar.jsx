import { NavLink } from 'react-router-dom';
import { useRole } from '../../hooks/useRole';
import { SIDEBAR_LINKS } from '../../lib/constants';
import {
  ChartBarIcon, BuildingOffice2Icon, HomeModernIcon, RectangleStackIcon,
  ShoppingBagIcon, TruckIcon, UsersIcon, CubeIcon,
} from '@heroicons/react/24/outline';

const iconMap = {
  ChartBarIcon, BuildingOffice2Icon, HomeModernIcon,
  RectangleStackIcon, ShoppingBagIcon, TruckIcon, UsersIcon, CubeIcon,
};

export default function Sidebar() {
  const { currentRole } = useRole();
  const links = SIDEBAR_LINKS[currentRole] || SIDEBAR_LINKS.CUSTOMER;

  return (
    <aside className="hidden lg:flex lg:flex-col w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-shrink-0">
      <nav className="p-4 space-y-1 sticky top-0">
        {links.map((link) => {
          const Icon = iconMap[link.icon];
          return (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'sidebar-link-active' : 'sidebar-link-inactive'}`
              }
            >
              {Icon && <Icon className="w-5 h-5" />}
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
