import { memo } from 'react';
import { formatCurrency } from '../../lib/utils';
import {
  UsersIcon, BuildingOffice2Icon, BuildingStorefrontIcon,
  ShoppingBagIcon, CurrencyDollarIcon, ClockIcon,
} from '@heroicons/react/24/outline';

const KPI_DEFS = [
  { key: 'total_users', label: 'Total Users', icon: UsersIcon, color: 'from-blue-500 to-blue-600', lightBg: 'bg-blue-50 dark:bg-blue-900/20', iconColor: 'text-blue-600 dark:text-blue-400' },
  { key: 'buildings', label: 'Buildings', icon: BuildingOffice2Icon, color: 'from-amber-500 to-amber-600', lightBg: 'bg-amber-50 dark:bg-amber-900/20', iconColor: 'text-amber-600 dark:text-amber-400' },
  { key: 'restaurants', label: 'Restaurants', icon: BuildingStorefrontIcon, color: 'from-violet-500 to-violet-600', lightBg: 'bg-violet-50 dark:bg-violet-900/20', iconColor: 'text-violet-600 dark:text-violet-400' },
  { key: 'orders', label: 'Orders', icon: ShoppingBagIcon, color: 'from-emerald-500 to-emerald-600', lightBg: 'bg-emerald-50 dark:bg-emerald-900/20', iconColor: 'text-emerald-600 dark:text-emerald-400' },
  { key: 'revenue', label: 'Revenue', icon: CurrencyDollarIcon, color: 'from-rose-500 to-rose-600', lightBg: 'bg-rose-50 dark:bg-rose-900/20', iconColor: 'text-rose-600 dark:text-rose-400' },
  { key: 'pending_orders', label: 'Pending Orders', icon: ClockIcon, color: 'from-indigo-500 to-indigo-600', lightBg: 'bg-indigo-50 dark:bg-indigo-900/20', iconColor: 'text-indigo-600 dark:text-indigo-400' },
];

function KpiCard({ def, value, trend, trendLabel, currency }) {
  const Icon = def.icon;
  const isUp = trend > 0;
  const isDown = trend < 0;

  return (
    <div className="bg-white dark:bg-gray-800/95 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm p-4 hover:shadow-md hover:border-gray-200 dark:hover:border-gray-600 transition-all duration-200 group">
      <div className="flex items-start justify-between">
        <div className={`p-2 rounded-xl ${def.lightBg} ${def.iconColor} group-hover:scale-105 transition-transform duration-200`}>
          <Icon className="w-5 h-5" />
        </div>
        {(trend !== undefined && trend !== null) && (
          <span className={`inline-flex items-center gap-0.5 text-[11px] font-semibold px-1.5 py-0.5 rounded-full ${
            isUp ? 'text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-900/30' :
            isDown ? 'text-red-700 bg-red-50 dark:text-red-300 dark:bg-red-900/30' :
            'text-gray-500 bg-gray-50 dark:text-gray-400 dark:bg-gray-700/50'
          }`}>
            <span className={`text-[9px] ${isUp ? '' : isDown ? '' : ''}`}>
              {isUp ? '↑' : isDown ? '↓' : '→'}
            </span>
            {trendLabel || `${Math.abs(trend)}%`}
          </span>
        )}
      </div>
      <div className="mt-3">
        <p className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
          {currency ? formatCurrency(value ?? 0) : (value ?? 0).toLocaleString()}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{def.label}</p>
      </div>
    </div>
  );
}

const KpiCardMemo = memo(KpiCard);

export default function KPIGrid({ metrics = [], loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800/95 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm p-4 animate-pulse">
            <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-700 mb-3" />
            <div className="h-7 w-20 bg-gray-100 dark:bg-gray-700 rounded mb-2" />
            <div className="h-3 w-16 bg-gray-100 dark:bg-gray-700 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (!metrics || metrics.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
      {KPI_DEFS.map((def) => {
        const metric = metrics.find(m => m.key === def.key || m.label === def.label);
        return (
          <KpiCardMemo
            key={def.key}
            def={def}
            value={metric?.value ?? 0}
            trend={metric?.trend}
            trendLabel={metric?.trendLabel}
            currency={metric?.currency}
          />
        );
      })}
    </div>
  );
}
