import WidgetShell from '../../ui/WidgetShell';
import { formatCurrency } from '../../../lib/utils';
import { ExclamationTriangleIcon, XCircleIcon, CubeIcon } from '@heroicons/react/24/outline';

export default function InventoryWidget({ data = {}, loading, onRemove, onRefresh, onResize, size }) {
  const lowStock = data.lowStock ?? [
    { name: 'Tomatoes', qty: 5, unit: 'kg', threshold: 20 },
    { name: 'Cheese', qty: 2, unit: 'kg', threshold: 10 },
    { name: 'Olive Oil', qty: 3, unit: 'L', threshold: 15 },
  ];
  const outOfStock = data.outOfStock ?? ['Mozzarella', 'Basil', 'Parmesan'];
  const inventoryValue = data.inventoryValue ?? 285000;

  return (
    <WidgetShell title="Inventory" subtitle="Stock overview" onRemove={onRemove} onRefresh={onRefresh} onResize={onResize} size={size} loading={loading}>
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 text-white">
              <CubeIcon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Inventory Value</p>
              <p className="text-lg font-bold">{formatCurrency(inventoryValue)}</p>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <ExclamationTriangleIcon className="w-3.5 h-3.5 text-amber-500" />
            <p className="text-xs font-semibold text-amber-600 dark:text-amber-400">Low Stock</p>
          </div>
          <div className="space-y-1.5">
            {lowStock.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-sm px-2.5 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-900/20">
                <span className="font-medium">{item.name}</span>
                <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">{item.qty}/{item.threshold} {item.unit}</span>
              </div>
            ))}
          </div>
        </div>

        {outOfStock.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <XCircleIcon className="w-3.5 h-3.5 text-red-500" />
              <p className="text-xs font-semibold text-red-600 dark:text-red-400">Out of Stock</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {outOfStock.map((name, i) => (
                <span key={i} className="text-xs px-2 py-1 rounded-full bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 font-medium">
                  {name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </WidgetShell>
  );
}
