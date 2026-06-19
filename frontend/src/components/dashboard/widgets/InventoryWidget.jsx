import WidgetShell from '../../ui/WidgetShell';
import { CubeIcon } from '@heroicons/react/24/outline';

export default function InventoryWidget({ data = {}, loading, onRemove, onRefresh }) {
  const hasData = Object.keys(data).some(k => k.startsWith('inventory_'));

  return (
    <WidgetShell title="Inventory" subtitle="Stock levels" icon={CubeIcon} onRemove={onRemove} onRefresh={onRefresh} loading={loading}>
      {hasData ? (
        <div className="space-y-2.5">{/* real data rendered when backend provides it */}</div>
      ) : (
        <div className="text-center py-6 text-gray-400 text-sm">Inventory data not available</div>
      )}
    </WidgetShell>
  );
}
