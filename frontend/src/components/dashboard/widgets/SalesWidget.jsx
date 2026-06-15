import WidgetShell from '../../ui/WidgetShell';
import { formatCurrency } from '../../../lib/utils';
import {
  CurrencyDollarIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon,
} from '@heroicons/react/24/outline';

const METRICS = [
  { key: 'today', label: 'Today\'s Sales', color: 'from-blue-500 to-blue-600', icon: CurrencyDollarIcon },
  { key: 'weekly', label: 'Weekly Sales', color: 'from-emerald-500 to-emerald-600', icon: ArrowTrendingUpIcon },
  { key: 'monthly', label: 'Monthly Sales', color: 'from-violet-500 to-violet-600', icon: ArrowTrendingUpIcon },
  { key: 'revenue', label: 'Revenue Trend', color: 'from-amber-500 to-amber-600', icon: ArrowTrendingUpIcon },
];

export default function SalesWidget({ data = {}, loading, onRemove, onRefresh, onResize, size }) {
  const stats = {
    today: { value: data.today ?? 48250, trend: '+12.5%' },
    weekly: { value: data.weekly ?? 285000, trend: '+8.3%' },
    monthly: { value: data.monthly ?? 1250000, trend: '+15.2%' },
    revenue: { value: data.revenue ?? 4520000, trend: '+10.8%' },
  };

  return (
    <WidgetShell title="Sales Overview" subtitle="Revenue summary" onRemove={onRemove} onRefresh={onRefresh} onResize={onResize} size={size} loading={loading}>
      <div className="p-4 space-y-3">
        {METRICS.map(m => {
          const Icon = m.icon;
          const stat = stats[m.key];
          const isUp = stat.trend.startsWith('+');
          return (
            <div key={m.key} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-gradient-to-br ${m.color} text-white`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{m.label}</p>
                  <p className="text-base font-bold mt-0.5">{formatCurrency(stat.value)}</p>
                </div>
              </div>
              <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
                isUp ? 'text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-900/30' : 'text-red-700 bg-red-50 dark:text-red-300 dark:bg-red-900/30'
              }`}>
                {isUp ? <ArrowTrendingUpIcon className="w-3 h-3" /> : <ArrowTrendingDownIcon className="w-3 h-3" />}
                {stat.trend}
              </span>
            </div>
          );
        })}
      </div>
    </WidgetShell>
  );
}
