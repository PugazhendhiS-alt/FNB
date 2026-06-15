import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useRole } from '../../hooks/useRole';
import { SIDEBAR_LINKS } from '../../lib/constants';
import {
  ChartBarIcon, BuildingOffice2Icon, HomeModernIcon, RectangleStackIcon,
  ShoppingBagIcon, TruckIcon, UsersIcon, XMarkIcon, Bars3Icon,
} from '@heroicons/react/24/outline';

const iconMap = {
  ChartBarIcon, BuildingOffice2Icon, HomeModernIcon,
  RectangleStackIcon, ShoppingBagIcon, TruckIcon, UsersIcon,
};

export default function Sidebar({ open, onClose }) {
  const { currentRole } = useRole();
  const links = SIDEBAR_LINKS[currentRole] || SIDEBAR_LINKS.CUSTOMER;

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
      )}
      <aside className={`fixed top-0 left-0 z-50 h-full w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-200 lg:translate-x-0 lg:static lg:z-auto ${
        open ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex justify-end px-3 pt-3 lg:hidden">
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
        <nav className="p-4 space-y-1">
          {links.map((link) => {
            const Icon = iconMap[link.icon];
            return (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={onClose}
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
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-400 text-center font-bold text-primary-600">POS System</p>
          <p className="text-[10px] text-gray-400 text-center mt-0.5">v1.0</p>
        </div>
      </aside>
    </>
  );
}