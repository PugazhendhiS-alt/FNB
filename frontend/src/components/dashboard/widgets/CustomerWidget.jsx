import WidgetShell from '../../ui/WidgetShell';
import { UserGroupIcon, UserPlusIcon, ArrowPathIcon, StarIcon } from '@heroicons/react/24/outline';

const STATS = [
  { key: 'new', label: 'New Customers', value: 24, icon: UserPlusIcon, color: 'from-blue-500 to-blue-600' },
  { key: 'repeat', label: 'Repeat Customers', value: 168, icon: ArrowPathIcon, color: 'from-emerald-500 to-emerald-600' },
  { key: 'loyalty', label: 'Loyalty Members', value: 89, icon: StarIcon, color: 'from-amber-500 to-amber-600', suffix: '' },
  { key: 'total', label: 'Total Customers', value: 1256, icon: UserGroupIcon, color: 'from-violet-500 to-violet-600' },
];

export default function CustomerWidget({ data = {}, loading, onRemove, onRefresh, onResize, size }) {
  const stats = {
    new: data.newCustomers ?? 24,
    repeat: data.repeatCustomers ?? 168,
    loyalty: data.loyaltyMembers ?? 89,
    total: data.totalCustomers ?? 1256,
  };

  return (
    <WidgetShell title="Customers" subtitle="Customer insights" onRemove={onRemove} onRefresh={onRefresh} onResize={onResize} size={size} loading={loading}>
      <div className="p-4 grid grid-cols-2 gap-3">
        {STATS.map(s => {
          const Icon = s.icon;
          return (
            <div key={s.key} className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
              <div className={`p-2 rounded-lg inline-flex bg-gradient-to-br ${s.color} text-white mb-2`}>
                <Icon className="w-4 h-4" />
              </div>
              <p className="text-xl font-bold">{stats[s.key]}{s.suffix ?? ''}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{s.label}</p>
            </div>
          );
        })}
      </div>
    </WidgetShell>
  );
}
