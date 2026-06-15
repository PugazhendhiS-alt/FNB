import WidgetShell from '../../ui/WidgetShell';
import { CubeIcon } from '@heroicons/react/24/outline';

const CATEGORIES = [
  { key: 'veggies', label: 'Vegetables', pct: 72, color: 'bg-emerald-500' },
  { key: 'meat', label: 'Meat & Poultry', pct: 45, color: 'bg-rose-500' },
  { key: 'dairy', label: 'Dairy', pct: 60, color: 'bg-amber-500' },
  { key: 'beverages', label: 'Beverages', pct: 85, color: 'bg-blue-500' },
  { key: 'dry', label: 'Dry Goods', pct: 40, color: 'bg-violet-500' },
];

export default function InventoryWidget({ data = {}, loading, onRemove, onRefresh }) {
  const items = data?.inventory ?? CATEGORIES;

  return (
    <WidgetShell title="Inventory" subtitle="Stock levels" icon={CubeIcon} onRemove={onRemove} onRefresh={onRefresh} loading={loading}>
      <div className="space-y-2.5">
        {items.map((item, i) => (
          <div key={item.key || i}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{item.label}</span>
              <span className="text-xs text-gray-400">{item.pct}%</span>
            </div>
            <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${item.color}`}
                style={{ width: `${item.pct}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </WidgetShell>
  );
}
