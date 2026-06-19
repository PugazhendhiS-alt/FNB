import WidgetShell from '../../ui/WidgetShell';
import { FireIcon } from '@heroicons/react/24/outline';

const STATUS_COLORS = {
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  preparing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  ready: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
};

const STATUS_ITEMS = [
  { key: 'pending', label: 'Pending', desc: 'Awaiting preparation' },
  { key: 'preparing', label: 'In Preparation', desc: 'Being cooked' },
  { key: 'ready', label: 'Ready to Serve', desc: 'Ready for pickup' },
];

export default function KitchenWidget({ data = {}, loading, onRemove, onRefresh }) {
  const counts = {
    pending: data.kitchen_pending ?? 0,
    preparing: data.kitchen_preparing ?? 0,
    ready: data.kitchen_ready ?? 0,
    delivered: data.kitchen_delivered ?? 0,
    total: (data.kitchen_pending ?? 0) + (data.kitchen_preparing ?? 0) + (data.kitchen_ready ?? 0),
  };

  return (
    <WidgetShell title="Kitchen Status" subtitle="Food preparation status" icon={FireIcon} onRemove={onRemove} onRefresh={onRefresh} loading={loading}>
      <div className="space-y-3">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800/30">
          <FireIcon className="w-5 h-5 text-orange-500 flex-shrink-0" />
          <div>
            <p className="text-lg font-bold text-orange-600 dark:text-orange-400">{counts.total}</p>
            <p className="text-xs text-orange-500">Active orders in kitchen</p>
          </div>
        </div>
        <div className="space-y-2">
          {STATUS_ITEMS.map(s => (
            <div key={s.key} className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 dark:bg-gray-800/50">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{s.label}</p>
                <p className="text-xs text-gray-400">{s.desc}</p>
              </div>
              <span className={`text-sm font-bold px-2.5 py-1 rounded-full ${STATUS_COLORS[s.key]}`}>
                {counts[s.key]}
              </span>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700/50">
          <span className="text-xs text-gray-400">Delivered Today</span>
          <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{counts.delivered}</span>
        </div>
      </div>
    </WidgetShell>
  );
}
