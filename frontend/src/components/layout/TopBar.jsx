import { Menu, Transition, Combobox } from '@headlessui/react';
import { Fragment, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../context/LocationContext';
import { useSocket } from '../../context/SocketContext';
import { ROLE_LABELS } from '../../lib/constants';
import {
  BellIcon, ChevronDownIcon, ArrowRightOnRectangleIcon,
  UserCircleIcon, SunIcon, MoonIcon, Bars3Icon,
  BuildingOffice2Icon, HomeModernIcon, MagnifyingGlassIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';

function LocationDropdown({ items, selected, onChange, icon: Icon, label, loading }) {
  const [query, setQuery] = useState('');

  const filtered = query === ''
    ? items
    : items.filter(i => i.name.toLowerCase().includes(query.toLowerCase()));

  if (loading) {
    return (
      <div className="flex items-center gap-1.5 px-2 py-1.5 min-w-[120px]">
        <div className="w-4 h-4 rounded animate-pulse bg-gray-200 dark:bg-gray-600" />
        <div className="h-4 w-24 rounded animate-pulse bg-gray-200 dark:bg-gray-600" />
      </div>
    );
  }

  if (items.length === 0 && !selected) {
    return (
      <div className="flex items-center gap-1.5 text-sm text-gray-400 dark:text-gray-500 px-2 py-1.5">
        <Icon className="w-4 h-4 flex-shrink-0" />
        <span>No {label} Assigned</span>
      </div>
    );
  }

  if (items.length <= 1) {
    return (
      <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 px-2 py-1.5">
        <Icon className="w-4 h-4 flex-shrink-0" />
        <span className="font-medium text-gray-700 dark:text-gray-300">{selected?.name || items[0]?.name}</span>
      </div>
    );
  }

  return (
    <Combobox value={selected} onChange={onChange}>
      <div className="relative">
        <Combobox.Button className="flex items-center gap-1.5 px-2 py-1.5 rounded-md bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-200 min-w-[130px]">
          <Icon className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">{selected?.name}</span>
          <ChevronDownIcon className="w-3 h-3 text-gray-400 flex-shrink-0 ml-auto" />
        </Combobox.Button>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
          afterLeave={() => setQuery('')}
        >
          <Combobox.Options className="absolute mt-1 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 max-h-60 overflow-auto py-1">
            <div className="px-2 py-1.5 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-gray-50 dark:bg-gray-700/50">
                <MagnifyingGlassIcon className="w-3 h-3 text-gray-400 flex-shrink-0" />
                <Combobox.Input
                  className="w-full bg-transparent text-xs outline-none border-none p-0 text-gray-700 dark:text-gray-200 placeholder-gray-400"
                  placeholder={`Search ${label}...`}
                  onChange={(e) => setQuery(e.target.value)}
                  autoComplete="off"
                />
              </div>
            </div>
            {filtered.length === 0 && query !== '' ? (
              <p className="px-3 py-2 text-xs text-gray-400 text-center">Nothing found</p>
            ) : (
              filtered.map(item => (
                <Combobox.Option
                  key={item.id}
                  value={item}
                  className={({ active }) =>
                    `px-3 py-2 text-xs cursor-pointer flex items-center justify-between ${
                      active ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300' : 'text-gray-700 dark:text-gray-300'
                    }`
                  }
                >
                  {({ selected: isSelected }) => (
                    <>
                      <span className="truncate">{item.name}</span>
                      {isSelected && <CheckIcon className="w-3.5 h-3.5 text-primary-600 flex-shrink-0" />}
                    </>
                  )}
                </Combobox.Option>
              ))
            )}
          </Combobox.Options>
        </Transition>
      </div>
    </Combobox>
  );
}

export default function TopBar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const {
    buildings, restaurants,
    selectedBuilding, selectedRestaurant,
    switchBuilding, switchRestaurant,
    loadingBuildings, loadingRestaurants,
  } = useLocation();
  const { notifications, setNotifications } = useSocket();
  const [showNotif, setShowNotif] = useState(false);
  const [dark, setDark] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;
  const isCustomer = user?.role === 'CUSTOMER';

  const toggleDark = () => {
    setDark(!dark);
    document.documentElement.classList.toggle('dark');
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <header className="h-14 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="flex items-center justify-between h-full px-3 lg:px-4">
        {/* Left: Hamburger + Logo */}
        <div className="flex items-center gap-2 min-w-0">
          <button onClick={onMenuClick} className="p-2 min-w-[40px] min-h-[40px] rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden flex items-center justify-center">
            <Bars3Icon className="w-5 h-5" />
          </button>
          <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              P
            </div>
            <span className="text-sm font-bold text-gray-900 dark:text-white hidden md:block">POS System</span>
          </div>

          {/* Building & Restaurant Context */}
          {!isCustomer && (
            <div className="hidden lg:flex items-center gap-2 ml-3 pl-3 border-l border-gray-200 dark:border-gray-700">
              <LocationDropdown
                items={buildings}
                selected={selectedBuilding}
                onChange={b => switchBuilding(b.id)}
                icon={BuildingOffice2Icon}
                label="Building"
                loading={loadingBuildings}
              />
              {selectedBuilding && (
                <span className="text-gray-300 dark:text-gray-600 flex-shrink-0">/</span>
              )}
              <LocationDropdown
                items={restaurants}
                selected={selectedRestaurant}
                onChange={r => switchRestaurant(r.id)}
                icon={HomeModernIcon}
                label="Restaurant"
                loading={loadingRestaurants}
              />
            </div>
          )}
        </div>

        {/* Mobile context indicator */}
        {!isCustomer && (selectedBuilding || selectedRestaurant) && (
          <div className="lg:hidden flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 truncate max-w-[40%]">
            {selectedBuilding && <span className="truncate">{selectedBuilding.name}</span>}
            {selectedBuilding && selectedRestaurant && <span className="flex-shrink-0">/</span>}
            {selectedRestaurant && <span className="truncate">{selectedRestaurant.name}</span>}
          </div>
        )}

        <div className="flex-1 min-w-0" />

        {/* Right: Notifications, Theme, Profile */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <button onClick={toggleDark} className="p-2 min-w-[40px] min-h-[40px] rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center">
            {dark ? <SunIcon className="w-4 h-4" /> : <MoonIcon className="w-4 h-4" />}
          </button>

          <div className="relative">
            <button onClick={() => setShowNotif(!showNotif)} className="p-2 min-w-[40px] min-h-[40px] rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 relative flex items-center justify-center">
              <BellIcon className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-medium">
                  {unreadCount}
                </span>
              )}
            </button>
            {showNotif && (
              <div className="fixed sm:absolute right-0 left-0 sm:left-auto mt-2 mx-2 sm:mx-0 w-auto sm:w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50 max-h-[70vh] flex flex-col">
                <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between flex-shrink-0">
                  <h3 className="font-semibold text-sm">Notifications</h3>
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} className="text-xs text-primary-600 hover:underline">Mark all read</button>
                  )}
                </div>
                <div className="overflow-y-auto flex-1">
                  {notifications.length === 0 ? (
                    <p className="p-4 text-sm text-gray-400 text-center">No notifications</p>
                  ) : (
                    notifications.map((n, i) => (
                      <div key={n.id || i} className={`p-3 border-b border-gray-100 dark:border-gray-700 text-sm ${n.read ? 'opacity-60' : ''}`}>
                        <p>{n.message}</p>
                        <p className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <Menu as="div" className="relative">
            <Menu.Button className="flex items-center gap-2 p-1.5 min-w-[40px] min-h-[40px] rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
              <UserCircleIcon className="w-5 h-5 text-gray-500" />
              <span className="text-xs font-medium hidden sm:block">{user?.username}</span>
              <ChevronDownIcon className="w-3 h-3 hidden sm:block" />
            </Menu.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50 origin-top-right">
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-medium">{user?.username}</p>
                  <p className="text-xs text-gray-400">{ROLE_LABELS[user?.role]}</p>
                </div>
                <div className="p-2">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={logout}
                        className={`${active ? 'bg-gray-100 dark:bg-gray-700' : ''} group flex w-full items-center gap-2 px-3 py-2 text-sm rounded-lg text-red-600 min-h-[40px]`}
                      >
                        <ArrowRightOnRectangleIcon className="w-4 h-4" />
                        Logout
                      </button>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </div>
    </header>
  );
}
