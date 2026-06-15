import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { ROLE_LABELS } from '../../lib/constants';
import {
  Bars3Icon, BellIcon, ChevronDownIcon, ArrowRightOnRectangleIcon,
  UserCircleIcon, SunIcon, MoonIcon,
} from '@heroicons/react/24/outline';
import { useState } from 'react';

export default function Header({ onMenuClick }) {
  const { user, logout } = useAuth();
  const { notifications, setNotifications } = useSocket();
  const [showNotif, setShowNotif] = useState(false);
  const [dark, setDark] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const toggleDark = () => {
    setDark(!dark);
    document.documentElement.classList.toggle('dark');
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-3 lg:px-6">
      <button onClick={onMenuClick} className="p-2 min-w-[44px] min-h-[44px] rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden flex items-center justify-center">
        <Bars3Icon className="w-6 h-6" />
      </button>

      <div className="flex-1" />

      <div className="flex items-center gap-2 sm:gap-3">
        <button onClick={toggleDark} className="p-2 min-w-[44px] min-h-[44px] rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center">
          {dark ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
        </button>

        <div className="relative">
          <button onClick={() => setShowNotif(!showNotif)} className="p-2 min-w-[44px] min-h-[44px] rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 relative flex items-center justify-center">
            <BellIcon className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
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
          <Menu.Button className="flex items-center gap-2 p-2 min-w-[44px] min-h-[44px] rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
            <UserCircleIcon className="w-6 h-6 text-gray-500" />
            <span className="text-sm font-medium hidden sm:block">{user?.username}</span>
            <ChevronDownIcon className="w-4 h-4 hidden sm:block" />
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
            <Menu.Items className="absolute right-0 mt-2 w-56 sm:w-56 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50 origin-top-right">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <p className="text-sm font-medium">{user?.username}</p>
                <p className="text-xs text-gray-400">{ROLE_LABELS[user?.role]}</p>
              </div>

              <div className="p-2">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={logout}
                      className={`${active ? 'bg-gray-100 dark:bg-gray-700' : ''} group flex w-full items-center gap-2 px-3 py-2 text-sm rounded-lg text-red-600 min-h-[44px]`}
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
    </header>
  );
}