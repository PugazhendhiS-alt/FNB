import WidgetShell from '../../ui/WidgetShell';
import { formatCurrency } from '../../../lib/utils';
import { BanknotesIcon, CreditCardIcon, WalletIcon, BuildingLibraryIcon } from '@heroicons/react/24/outline';

const METHODS = [
  { key: 'card', label: 'Card Payments', icon: CreditCardIcon, color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-300' },
  { key: 'cash', label: 'Cash Payments', icon: WalletIcon, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-300' },
  { key: 'online', label: 'Online Payments', icon: BuildingLibraryIcon, color: 'text-violet-600 bg-violet-50 dark:bg-violet-900/30 dark:text-violet-300' },
];

export default function PaymentWidget({ data = {}, loading, onRemove, onRefresh }) {
  const stats = {
    total: data.total ?? 284500,
    card: data.card ?? 145000,
    cash: data.cash ?? 82500,
    online: data.online ?? 57000,
  };

  return (
    <WidgetShell title="Payments" subtitle="Payment breakdown" icon={BanknotesIcon} onRemove={onRemove} onRefresh={onRefresh} loading={loading}>
      <div className="space-y-3">
        <div className="text-center py-2">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats.total)}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total Revenue</p>
        </div>
        <div className="space-y-2">
          {METHODS.map(m => {
            const Icon = m.icon;
            const val = stats[m.key];
            const pct = stats.total > 0 ? Math.round((val / stats.total) * 100) : 0;
            return (
              <div key={m.key} className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className={`p-1.5 rounded-lg ${m.color} flex-shrink-0`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300">{m.label}</p>
                    <div className="h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full mt-1 max-w-[80px]">
                      <div className="h-full rounded-full bg-gray-400 dark:bg-gray-500" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </div>
                <span className="text-xs font-semibold text-gray-900 dark:text-white flex-shrink-0 ml-2">{formatCurrency(val)}</span>
              </div>
            );
          })}
        </div>
      </div>
    </WidgetShell>
  );
}
