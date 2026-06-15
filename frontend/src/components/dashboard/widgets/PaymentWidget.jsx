import WidgetShell from '../../ui/WidgetShell';
import { formatCurrency } from '../../../lib/utils';

const PAYMENTS = [
  { key: 'cash', label: 'Cash', value: 125000, pct: 28, color: 'bg-emerald-500' },
  { key: 'card', label: 'Card', value: 185000, pct: 41, color: 'bg-blue-500' },
  { key: 'upi', label: 'UPI', value: 98000, pct: 22, color: 'bg-violet-500' },
  { key: 'wallet', label: 'Wallet', value: 42000, pct: 9, color: 'bg-amber-500' },
];

export default function PaymentWidget({ data = {}, loading, onRemove, onRefresh, onResize, size }) {
  const payments = data.payments ?? PAYMENTS;
  const total = payments.reduce((sum, p) => sum + p.value, 0);

  return (
    <WidgetShell title="Payments" subtitle="Payment method breakdown" onRemove={onRemove} onRefresh={onRefresh} onResize={onResize} size={size} loading={loading}>
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Total Collected</span>
          <span className="text-lg font-bold">{formatCurrency(total)}</span>
        </div>
        <div className="flex gap-0.5 h-2 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700">
          {payments.map(p => (
            <div key={p.key} className={`${p.color} transition-all duration-500`} style={{ width: `${p.pct}%` }} />
          ))}
        </div>
        <div className="space-y-2">
          {payments.map(p => (
            <div key={p.key} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${p.color}`} />
                <span className="text-gray-600 dark:text-gray-400">{p.label}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-medium">{formatCurrency(p.value)}</span>
                <span className="text-xs text-gray-400 w-8 text-right">{p.pct}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </WidgetShell>
  );
}
