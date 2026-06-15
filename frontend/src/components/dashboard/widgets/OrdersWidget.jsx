import WidgetShell from '../../ui/WidgetShell';
import { formatCurrency } from '../../../lib/utils';
import { ClockIcon, CheckCircleIcon, XCircleIcon, BanknotesIcon } from '@heroicons/react/24/outline';

const ITEMS = [
  { key: 'active', label: 'Active Orders', icon: ClockIcon, color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-300' },
  { key: 'completed', label: 'Completed Today', icon: CheckCircleIcon, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-300' },
  { key: 'cancelled', label: 'Cancelled', icon: XCircleIcon, color: 'text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-300' },
  { key: 'aov', label: 'Avg Order Value', icon: BanknotesIcon, color: 'text-violet-600 bg-violet-50 dark:bg-violet-900/30 dark:text-violet-300' },
];

export default function OrdersWidget({ data = {}, loading, onRemove, onRefresh, onResize, size }) {
  const stats = {
    active: data.active ?? 12,
    completed: data.completed ?? 48,
    cancelled: data.cancelled ?? 3,
    aov: data.aov ?? 450,
  };

  return (
    <WidgetShell title="Orders" subtitle="Order statistics" onRemove={onRemove} onRefresh={onRefresh} onResize={onResize} size={size} loading={loading}>
      <div className="p-4 grid grid-cols-2 gap-3">
        {ITEMS.map(item => {
          const Icon = item.icon;
          const val = stats[item.key];
          return (
            <div key={item.key} className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
              <div className={`p-2 rounded-lg inline-flex ${item.color} mb-2`}>
                <Icon className="w-4 h-4" />
              </div>
              <p className="text-xl font-bold">{item.key === 'aov' ? formatCurrency(val) : val}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.label}</p>
            </div>
          );
        })}
      </div>
    </WidgetShell>
  );
}
