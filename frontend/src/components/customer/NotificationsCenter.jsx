import { BellIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useSocket } from '../../context/SocketContext';

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const TYPE_STYLES = {
  ORDER_UPDATE: 'bg-blue-50 text-blue-500 dark:bg-blue-900/20 dark:text-blue-400',
  PAYMENT: 'bg-green-50 text-green-500 dark:bg-green-900/20 dark:text-green-400',
  PROMOTIONAL: 'bg-purple-50 text-purple-500 dark:bg-purple-900/20 dark:text-purple-400',
};

export default function NotificationsCenter({ onViewAll }) {
  const { notifications, markAsRead, markAllAsRead } = useSocket();
  const unread = notifications?.filter(n => !n.read) || [];

  if (!notifications) {
    return (
      <div className="bg-white dark:bg-gray-800/95 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm p-5 animate-pulse">
        <div className="h-5 w-28 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
        <div className="space-y-3">
          {[1, 2].map(i => <div key={i} className="h-12 bg-gray-100 dark:bg-gray-700 rounded-lg" />)}
        </div>
      </div>
    );
  }

  if (!notifications?.length) {
    return (
      <div className="bg-white dark:bg-gray-800/95 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
            <BellIcon className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">Notifications</h3>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">No notifications yet.</p>
      </div>
    );
  }

  const displayNotifications = notifications.slice(0, 4);

  return (
    <div className="bg-white dark:bg-gray-800/95 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
            <BellIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Notifications</h3>
            {unread.length > 0 && (
              <span className="text-[10px] text-primary-600 dark:text-primary-400">{unread.length} unread</span>
            )}
          </div>
        </div>
        {unread.length > 0 && (
          <button onClick={markAllAsRead} className="text-xs font-medium text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1">
            <CheckCircleIcon className="w-3.5 h-3.5" /> Mark all read
          </button>
        )}
      </div>
      <div className="space-y-1.5">
        {displayNotifications.map(n => (
          <button
            key={n.id}
            onClick={() => !n.read && markAsRead(n.id)}
            className={`w-full flex items-start gap-3 p-3 rounded-xl text-left transition-colors ${
              n.read ? 'opacity-60' : 'bg-gray-50 dark:bg-gray-700/30'
            } hover:bg-gray-100 dark:hover:bg-gray-700/50`}
          >
            <div className={`p-1.5 rounded-lg flex-shrink-0 ${TYPE_STYLES[n.type] || 'bg-gray-100 text-gray-500'}`}>
              <BellIcon className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-gray-900 dark:text-gray-100">{n.message}</p>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">{timeAgo(n.createdAt)}</p>
            </div>
          </button>
        ))}
      </div>
      {notifications.length > 4 && (
        <button
          onClick={onViewAll}
          className="mt-3 w-full text-center text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
        >
          View all {notifications.length} notifications →
        </button>
      )}
    </div>
  );
}
