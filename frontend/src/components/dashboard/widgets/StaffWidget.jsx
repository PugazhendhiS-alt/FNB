import WidgetShell from '../../ui/WidgetShell';
import { UserGroupIcon } from '@heroicons/react/24/outline';

const ROLES = [
  { key: 'admin', label: 'Admins', count: 3, color: 'bg-blue-500' },
  { key: 'manager', label: 'Managers', count: 8, color: 'bg-amber-500' },
  { key: 'chef', label: 'Chefs', count: 15, color: 'bg-violet-500' },
  { key: 'staff', label: 'Staff', count: 24, color: 'bg-emerald-500' },
];

export default function StaffWidget({ data = {}, loading, onRemove, onRefresh }) {
  const roles = data?.staff_roles ?? ROLES;
  const total = roles.reduce((s, r) => s + r.count, 0);

  return (
    <WidgetShell title="Staff" subtitle="Team overview" icon={UserGroupIcon} onRemove={onRemove} onRefresh={onRefresh} loading={loading}>
      <div className="space-y-3">
        <div className="text-center py-2">
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{total}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total Staff</p>
        </div>
        <div className="space-y-2">
          {roles.map(r => (
            <div key={r.key} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{r.label}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-900 dark:text-white">{r.count}</span>
                <div className={`w-2 h-2 rounded-full ${r.color}`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </WidgetShell>
  );
}
