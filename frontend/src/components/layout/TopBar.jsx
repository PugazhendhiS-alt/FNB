import { Menu, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { ROLE_LABELS } from '../../lib/constants';
import { Link } from 'react-router-dom';
import {
  BellIcon, ChevronDownIcon, ArrowRightOnRectangleIcon,
  UserCircleIcon, SunIcon, MoonIcon, Bars3Icon,
  BuildingOffice2Icon, HomeModernIcon,
} from '@heroicons/react/24/outline';

export default function TopBar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const { notifications, setNotifications } = useSocket();
  const [showNotif, setShowNotif] = useState(false);
  const [dark, setDark] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;
  const isCustomer = user?.role === 'CUSTOMER';

  const buildingName = user?.restaurant?.building?.name;
  const restaurantName = user?.restaurant?.name;

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

          {!isCustomer && (restaurantName || buildingName) && (
            <div className="hidden lg:flex items-center gap-2 ml-3 pl-3 border-l border-gray-200 dark:border-gray-700">
              {buildingName && (
                <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                  <BuildingOffice2Icon className="w-3.5 h-3.5" />
                  <span className="font-medium text-gray-700 dark:text-gray-300">{buildingName}</span>
                </div>
              )}
              {buildingName && restaurantName && (
                <span className="text-gray-300 dark:text-gray-600">/</span>
              )}
              {restaurantName && (
                <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                  <HomeModernIcon className="w-3.5 h-3.5" />
                  <span className="font-medium text-gray-700 dark:text-gray-300">{restaurantName}</span>
                </div>
              )}
            </div>
          )}
        </div>

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
                <div className="p-2 space-y-0.5">
                  <Menu.Item>
                    {({ active }) => (
                      <Link
                        to="/profile"
                        className={`${active ? 'bg-gray-100 dark:bg-gray-700' : ''} group flex w-full items-center gap-2 px-3 py-2 text-sm rounded-lg min-h-[40px] text-gray-700 dark:text-gray-300`}
                      >
                        <UserCircleIcon className="w-4 h-4" />
                        Profile
                      </Link>
                    )}
                  </Menu.Item>
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
