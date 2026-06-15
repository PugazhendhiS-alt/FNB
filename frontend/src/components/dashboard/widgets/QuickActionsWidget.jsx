import { useNavigate } from 'react-router-dom';
import WidgetShell from '../../ui/WidgetShell';
import {
  PlusIcon, ShoppingBagIcon, CurrencyDollarIcon,
  ArchiveBoxArrowDownIcon, ChartBarIcon, UserPlusIcon,
} from '@heroicons/react/24/outline';

const ACTIONS = [
  { label: 'Add Menu Item', path: '/menu', icon: PlusIcon, color: 'from-blue-500 to-blue-600' },
  { label: 'Create Order', path: '/orders', icon: ShoppingBagIcon, color: 'from-emerald-500 to-emerald-600' },
  { label: 'Open Register', action: 'register', icon: CurrencyDollarIcon, color: 'from-amber-500 to-amber-600' },
  { label: 'Update Inventory', path: '/menu', icon: ArchiveBoxArrowDownIcon, color: 'from-violet-500 to-violet-600' },
  { label: 'View Reports', path: '/', icon: ChartBarIcon, color: 'from-rose-500 to-rose-600' },
  { label: 'Add User', path: '/users', icon: UserPlusIcon, color: 'from-cyan-500 to-cyan-600' },
];

export default function QuickActionsWidget({ data = {}, loading, onRemove, onRefresh, onResize, size }) {
  const navigate = useNavigate();
  const actions = data.actions ?? ACTIONS;

  return (
    <WidgetShell title="Quick Actions" subtitle="Frequently used tasks" onRemove={onRemove} onRefresh={onRefresh} onResize={onResize} size={size} loading={loading}>
      <div className="p-4 grid grid-cols-2 gap-2">
        {actions.map((action, i) => {
          const Icon = action.icon;
          return (
            <button
              key={i}
              onClick={() => {
                if (action.path) navigate(action.path);
                else if (action.action === 'register') alert('Register feature coming soon');
              }}
              className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all active:scale-95"
            >
              <div className={`p-2 rounded-lg bg-gradient-to-br ${action.color} text-white`}>
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-medium text-gray-600 dark:text-gray-400 text-center leading-tight">{action.label}</span>
            </button>
          );
        })}
      </div>
    </WidgetShell>
  );
}
