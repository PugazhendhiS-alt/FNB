import WidgetShell from '../../ui/WidgetShell';
import { BellIcon, CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

const NOTIFICATIONS = [
  { id: 1, type: 'order', text: 'New order #ORD-2024 from Table 5', time: '2m ago', icon: CheckCircleIcon, color: 'text-emerald-500' },
  { id: 2, type: 'alert', text: 'Inventory low: Chicken stock running out', time: '15m ago', icon: ExclamationTriangleIcon, color: 'text-amber-500' },
  { id: 3, type: 'info', text: 'Restaurant "Spice Kitchen" opened', time: '1h ago', icon: InformationCircleIcon, color: 'text-blue-500' },
  { id: 4, type: 'order', text: 'Order #ORD-2023 marked as completed', time: '2h ago', icon: CheckCircleIcon, color: 'text-emerald-500' },
  { id: 5, type: 'alert', text: 'Payment failed for order #ORD-2021', time: '3h ago', icon: ExclamationTriangleIcon, color: 'text-red-500' },
];

export default function NotificationWidget({ data = {}, loading, onRemove, onRefresh }) {
  const items = data?.notifications ?? NOTIFICATIONS;

  return (
    <WidgetShell title="Notifications" subtitle="Recent updates" icon={BellIcon} onRemove={onRemove} onRefresh={onRefresh} loading={loading}>
      <div className="space-y-1 -mx-1">
        {items.slice(0, 5).map(n => {
          const Icon = n.icon;
          return (
            <div key={n.id} className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${n.color || 'text-gray-400'}`} />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">{n.text}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{n.time || 'Just now'}</p>
              </div>
            </div>
          );
        })}
      </div>
    </WidgetShell>
  );
}
