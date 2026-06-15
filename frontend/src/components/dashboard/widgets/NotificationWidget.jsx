import WidgetShell from '../../ui/WidgetShell';
import {
  BellIcon, MegaphoneIcon, InformationCircleIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';

const NOTIFICATIONS = [
  { type: 'alert', message: 'Inventory low: Tomatoes (5kg remaining)', time: '5m ago', icon: ExclamationCircleIcon, color: 'text-amber-500 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400' },
  { type: 'announcement', message: 'New menu items added for weekend special', time: '1h ago', icon: MegaphoneIcon, color: 'text-violet-500 bg-violet-50 dark:bg-violet-900/20 dark:text-violet-400' },
  { type: 'info', message: 'System update scheduled at 2:00 AM', time: '2h ago', icon: InformationCircleIcon, color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400' },
  { type: 'alert', message: 'Printer queue: 3 pending print jobs', time: '3h ago', icon: ExclamationCircleIcon, color: 'text-amber-500 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400' },
  { type: 'info', message: 'Daily report generated successfully', time: '4h ago', icon: InformationCircleIcon, color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400' },
];

export default function NotificationWidget({ data = {}, loading, onRemove, onRefresh, onResize, size }) {
  const notifications = data.notifications ?? NOTIFICATIONS;

  return (
    <WidgetShell title="Notifications" subtitle="Latest updates" onRemove={onRemove} onRefresh={onRefresh} onResize={onResize} size={size} loading={loading}>
      <div className="p-4 space-y-1.5 max-h-80 overflow-y-auto scrollbar-none">
        {notifications.map((n, i) => {
          const Icon = n.icon;
          return (
            <div key={i} className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              <div className={`p-1.5 rounded-lg flex-shrink-0 ${n.color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-700 dark:text-gray-300 line-clamp-2">{n.message}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{n.time}</p>
              </div>
            </div>
          );
        })}
      </div>
    </WidgetShell>
  );
}
