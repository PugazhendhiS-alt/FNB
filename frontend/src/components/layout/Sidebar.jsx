import { useState, useMemo, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useRole } from '../../hooks/useRole';
import { useAuth } from '../../context/AuthContext';
import { SIDEBAR_LINKS, MODULE_PATH_MAP } from '../../lib/constants';
import { ChevronDownIcon } from '@heroicons/react/24/solid';
import {
  ChartBarIcon, BuildingOffice2Icon, HomeModernIcon, RectangleStackIcon,
  ShoppingBagIcon, TruckIcon, UsersIcon, CubeIcon, PuzzlePieceIcon, UserCircleIcon,
} from '@heroicons/react/24/outline';

const iconMap = {
  ChartBarIcon, BuildingOffice2Icon, HomeModernIcon,
  RectangleStackIcon, ShoppingBagIcon, TruckIcon, UsersIcon, CubeIcon,
  PuzzlePieceIcon, UserCircleIcon,
};

function AccordionGroup({ title, icon: Icon, items, isOpen, onToggle, onChildClick }) {
  const location = useLocation();
  const isAnyChildActive = items.some(
    child => location.pathname === child.path || (child.path !== '/' && location.pathname.startsWith(child.path))
  );

  return (
    <div>
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          isAnyChildActive
            ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-gray-200'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {Icon && <Icon className="w-4 h-4 flex-shrink-0" />}
          <span className="truncate">{title}</span>
        </div>
        <ChevronDownIcon
          className={`w-3.5 h-3.5 flex-shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      <div
        style={{
          display: 'grid',
          gridTemplateRows: isOpen ? '1fr' : '0fr',
          transition: 'grid-template-rows 0.2s ease',
        }}
      >
        <div className="overflow-hidden">
          <div className="ml-9 mt-0.5 space-y-0.5 border-l-2 border-gray-200 dark:border-gray-600 pl-2">
            {items.map(child => (
              <NavLink
                key={child.path}
                to={child.path}
                end
                onClick={onChildClick}
                className={({ isActive }) =>
                  `block px-3 py-1.5 rounded-md text-sm transition-colors ${
                    isActive
                      ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-medium'
                      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-700 dark:hover:text-gray-200'
                  }`
                }
              >
                {child.label}
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Sidebar({ open, onClose }) {
  const { currentRole, isSuperadmin } = useRole();
  const { allowedModules } = useAuth();
  const location = useLocation();
  const links = SIDEBAR_LINKS[currentRole] || SIDEBAR_LINKS.CUSTOMER;

  const moduleKeys = allowedModules && Array.isArray(allowedModules)
    ? allowedModules.map(m => m.key)
    : null;

  const filteredLinks = useMemo(() => {
    if (!moduleKeys || isSuperadmin) return links;

    return links.reduce((acc, item) => {
      if (item.type === 'single') {
        for (const [modKey, paths] of Object.entries(MODULE_PATH_MAP)) {
          if (paths.includes(item.path)) {
            if (moduleKeys.includes(modKey)) acc.push(item);
            return acc;
          }
        }
        acc.push(item);
      } else {
        const filteredChildren = item.children.filter(child => {
          for (const [modKey, paths] of Object.entries(MODULE_PATH_MAP)) {
            if (paths.includes(child.path)) return moduleKeys.includes(modKey);
          }
          return true;
        });
        if (filteredChildren.length > 0) {
          acc.push({ ...item, children: filteredChildren });
        }
      }
      return acc;
    }, []);
  }, [links, moduleKeys, isSuperadmin]);

  const activeSectionKey = useMemo(() => {
    for (const item of filteredLinks) {
      if (item.type === 'group') {
        for (const child of item.children) {
          if (location.pathname === child.path || (child.path !== '/' && location.pathname.startsWith(child.path))) {
            return item.title;
          }
        }
      }
    }
    return null;
  }, [filteredLinks, location.pathname]);

  const [openSection, setOpenSection] = useState(() => activeSectionKey);

  useEffect(() => {
    if (activeSectionKey) {
      setOpenSection(activeSectionKey);
    }
  }, [activeSectionKey]);

  function handleToggle(sectionTitle) {
    setOpenSection(prev => prev === sectionTitle ? null : sectionTitle);
  }

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
      )}
      <aside className={`fixed top-14 left-0 z-50 h-[calc(100vh-3.5rem)] w-56 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-200 lg:translate-x-0 lg:sticky lg:top-14 lg:z-auto flex flex-col ${
        open ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {filteredLinks.map((item) => {
            if (item.type === 'single') {
              const Icon = iconMap[item.icon];
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end
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
                  <span>{item.label}</span>
                </NavLink>
              );
            }

            const Icon = iconMap[item.icon];
            return (
              <AccordionGroup
                key={item.title}
                title={item.title}
                icon={Icon}
                items={item.children}
                isOpen={openSection === item.title}
                onToggle={() => handleToggle(item.title)}
                onChildClick={onClose}
              />
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
