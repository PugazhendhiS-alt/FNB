import WidgetShell from '../../ui/WidgetShell';
import { useSocket } from '../../../context/SocketContext';
import { BellIcon, CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

const typeConfig = {
  ORDER_UPDATE: { icon: CheckCircleIcon, color: 'text-emerald-500' },
  PAYMENT_SUCCESS: { icon: CheckCircleIcon, color: 'text-emerald-500' },
  DELIVERED: { icon: CheckCircleIcon, color: 'text-blue-500' },
  NEW_ORDER: { icon: InformationCircleIcon, color: 'text-blue-500' },
};

export default function NotificationWidget({ data = {}, loading, onRemove, onRefresh }) {
  const { notifications } = useSocket();
  const items = (data?.notifications || notifications).slice(0, 5);

  return (
    <WidgetShell title="Notifications" subtitle="Recent updates" icon={BellIcon} onRemove={onRemove} onRefresh={onRefresh} loading={loading}>
      <div className="space-y-1 -mx-1">
        {items.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-4">No notifications</p>
        ) : (
          items.map((n, i) => {
            const cfg = typeConfig[n.type] || { icon: InformationCircleIcon, color: 'text-gray-400' };
            const Icon = cfg.icon;
            return (
              <div key={n.id || i} className={`flex items-start gap-2.5 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${n.read ? 'opacity-60' : ''}`}>
                <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${cfg.color}`} />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">{n.message}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {n.createdAt ? new Date(n.createdAt).toLocaleString() : 'Just now'}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </WidgetShell>
  );
}
