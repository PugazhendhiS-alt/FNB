import WidgetShell from '../../ui/WidgetShell';
import { FireIcon } from '@heroicons/react/24/outline';

const STATUS_COLORS = {
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  preparing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  ready: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
};

const STATUS_ITEMS = [
  { key: 'pending', label: 'Pending Orders', desc: 'Awaiting preparation' },
  { key: 'preparing', label: 'In Preparation', desc: 'Being cooked' },
  { key: 'ready', label: 'Ready to Serve', desc: 'Ready for pickup' },
];

export default function KitchenWidget({ data = {}, loading, onRemove, onRefresh, onResize, size }) {
  const counts = {
    pending: data.pending ?? 8,
    preparing: data.preparing ?? 5,
    ready: data.ready ?? 3,
    total: (data.pending ?? 8) + (data.preparing ?? 5) + (data.ready ?? 3),
  };

  return (
    <WidgetShell title="Kitchen" subtitle="Food preparation status" onRemove={onRemove} onRefresh={onRefresh} onResize={onResize} size={size} loading={loading}>
      <div className="p-4">
        <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800/30">
          <FireIcon className="w-5 h-5 text-orange-500" />
          <div>
            <p className="text-lg font-bold text-orange-600 dark:text-orange-400">{counts.total}</p>
            <p className="text-xs text-orange-500">Total active orders</p>
          </div>
        </div>
        <div className="space-y-2">
          {STATUS_ITEMS.map(s => (
            <div key={s.key} className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 dark:bg-gray-800/50">
              <div>
                <p className="text-sm font-medium">{s.label}</p>
                <p className="text-xs text-gray-400">{s.desc}</p>
              </div>
              <span className={`text-sm font-bold px-2.5 py-1 rounded-full ${STATUS_COLORS[s.key]}`}>
                {counts[s.key]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </WidgetShell>
  );
}
