import WidgetShell from '../../ui/WidgetShell';
import { UserIcon, ClockIcon } from '@heroicons/react/24/outline';

const CASHIERS = [
  { name: 'Rajesh K.', orders: 34, rating: 4.8, active: true },
  { name: 'Priya S.', orders: 28, rating: 4.6, active: true },
  { name: 'Amit R.', orders: 22, rating: 4.5, active: false },
  { name: 'Sneha M.', orders: 19, rating: 4.7, active: false },
];

export default function StaffWidget({ data = {}, loading, onRemove, onRefresh, onResize, size }) {
  const staff = data.staff ?? CASHIERS;
  const activeCount = staff.filter(s => s.active).length;
  const totalOrders = staff.reduce((sum, s) => sum + s.orders, 0);

  return (
    <WidgetShell title="Staff" subtitle={`${activeCount} active · ${totalOrders} orders today`} onRemove={onRemove} onRefresh={onRefresh} onResize={onResize} size={size} loading={loading}>
      <div className="p-4 space-y-2">
        {staff.map((s, i) => (
          <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 dark:bg-gray-800/50">
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                s.active ? 'bg-gradient-to-br from-primary-500 to-primary-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}>
                {s.name.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-medium">{s.name}</p>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span className="flex items-center gap-0.5"><ClockIcon className="w-3 h-3" /> {s.orders}</span>
                  <span>★ {s.rating}</span>
                </div>
              </div>
            </div>
            {s.active && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-soft" title="Active" />
            )}
          </div>
        ))}
      </div>
    </WidgetShell>
  );
}
