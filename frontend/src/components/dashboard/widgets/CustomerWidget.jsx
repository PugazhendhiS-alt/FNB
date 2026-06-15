import WidgetShell from '../../ui/WidgetShell';
import { UsersIcon } from '@heroicons/react/24/outline';

export default function CustomerWidget({ data = {}, loading, onRemove, onRefresh }) {
  const stats = {
    total: data.total ?? 128,
    active: data.active ?? 89,
    new: data.new ?? 14,
    returning: data.returning ?? 62,
  };

  return (
    <WidgetShell title="Customers" subtitle="Customer analytics" icon={UsersIcon} onRemove={onRemove} onRefresh={onRefresh} loading={loading}>
      <div className="space-y-3">
        <div className="text-center py-2">
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total Customers</p>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
            <p className="text-sm font-bold text-blue-600 dark:text-blue-400">{stats.active}</p>
            <p className="text-[10px] text-gray-400">Active</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{stats.new}</p>
            <p className="text-[10px] text-gray-400">New</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
            <p className="text-sm font-bold text-violet-600 dark:text-violet-400">{stats.returning}</p>
            <p className="text-[10px] text-gray-400">Returning</p>
          </div>
        </div>
      </div>
    </WidgetShell>
  );
}
