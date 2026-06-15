import { useState, useEffect, useCallback, memo } from 'react';
import { useRole } from '../../hooks/useRole';
import ErrorBoundary from '../ErrorBoundary';
import {
  SalesWidget, OrdersWidget, KitchenWidget, InventoryWidget,
  CustomerWidget, StaffWidget, PaymentWidget, NotificationWidget,
} from './widgets';
import {
  AdjustmentsHorizontalIcon,
  ChartBarIcon, ClipboardDocumentListIcon, CubeIcon, BuildingOffice2Icon,
} from '@heroicons/react/24/outline';

const ROWS = [
  {
    id: 'insights',
    title: 'Business Insights',
    subtitle: 'Revenue and order analytics',
    icon: ChartBarIcon,
    layout: '70-30',
    widgets: [
      { id: 'sales', Component: SalesWidget, roles: ['SUPERADMIN', 'ADMIN', 'BUILDING_MANAGER', 'RESTAURANT_MANAGER'] },
      { id: 'orders', Component: OrdersWidget, roles: ['SUPERADMIN', 'ADMIN', 'BUILDING_MANAGER', 'RESTAURANT_MANAGER', 'CHEF'] },
    ],
  },
  {
    id: 'operations',
    title: 'Operational Dashboard',
    subtitle: 'Kitchen status, popular items, recent orders',
    icon: ClipboardDocumentListIcon,
    layout: '3-col',
    widgets: [
      { id: 'kitchen', Component: KitchenWidget, roles: ['SUPERADMIN', 'ADMIN', 'RESTAURANT_MANAGER', 'CHEF'] },
      { id: 'inventory', Component: InventoryWidget, roles: ['SUPERADMIN', 'ADMIN', 'RESTAURANT_MANAGER'] },
      { id: 'customers', Component: CustomerWidget, roles: ['SUPERADMIN', 'ADMIN'] },
    ],
  },
  {
    id: 'management',
    title: 'Management Overview',
    subtitle: 'Buildings, restaurants, and staff',
    icon: BuildingOffice2Icon,
    layout: '3-col',
    widgets: [
      { id: 'notifications', Component: NotificationWidget, roles: ['SUPERADMIN', 'ADMIN', 'BUILDING_MANAGER', 'RESTAURANT_MANAGER', 'CHEF'] },
      { id: 'staff', Component: StaffWidget, roles: ['SUPERADMIN', 'ADMIN', 'BUILDING_MANAGER'] },
      { id: 'payments', Component: PaymentWidget, roles: ['SUPERADMIN', 'ADMIN', 'BUILDING_MANAGER'] },
    ],
  },
];

const ROW_ICONS = { ChartBarIcon, ClipboardDocumentListIcon, CubeIcon, BuildingOffice2Icon };

function loadHiddenRows() {
  try {
    const raw = localStorage.getItem('dashHiddenRows');
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveHiddenRows(ids) {
  try { localStorage.setItem('dashHiddenRows', JSON.stringify(ids)); } catch {}
}

function RowWidget({ widget, data }) {
  const Component = widget.Component;
  return (
    <ErrorBoundary
      message={`Failed to load widget.`}
      fallback={
        <div className="bg-white dark:bg-gray-800/95 rounded-2xl border border-gray-100 dark:border-gray-700/50 p-8 text-center">
          <p className="text-sm text-gray-400">Widget unavailable</p>
        </div>
      }
    >
      <Component data={data} />
    </ErrorBoundary>
  );
}

const RowWidgetMemo = memo(RowWidget);

function DashboardRow({ row, data, editing, onToggle }) {
  const { currentRole } = useRole();
  const Icon = ROW_ICONS[row.icon] || ChartBarIcon;

  const visibleWidgets = row.widgets.filter(w => w.roles.includes(currentRole));
  if (visibleWidgets.length === 0) return null;

  if (row.layout === '70-30') {
    const [main, side] = visibleWidgets;
    if (!main && !side) return null;
    return (
      <section>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400">
              <Icon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{row.title}</h2>
              {row.subtitle && <p className="text-[11px] text-gray-400 dark:text-gray-500">{row.subtitle}</p>}
            </div>
          </div>
          {editing && (
            <button
              onClick={() => onToggle(row.id)}
              className="text-xs text-gray-400 hover:text-red-500 transition-colors px-2 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              Hide Row
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
          <div className="xl:col-span-3">
            {main && <RowWidgetMemo key={main.id} widget={main} data={data} />}
          </div>
          <div className="xl:col-span-2">
            {side && <RowWidgetMemo key={side.id} widget={side} data={data} />}
          </div>
        </div>
      </section>
    );
  }

  if (row.layout === '3-col') {
    return (
      <section>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400">
              <Icon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{row.title}</h2>
              {row.subtitle && <p className="text-[11px] text-gray-400 dark:text-gray-500">{row.subtitle}</p>}
            </div>
          </div>
          {editing && (
            <button
              onClick={() => onToggle(row.id)}
              className="text-xs text-gray-400 hover:text-red-500 transition-colors px-2 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              Hide Row
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {visibleWidgets.map(w => (
            <RowWidgetMemo key={w.id} widget={w} data={data} />
          ))}
        </div>
      </section>
    );
  }

  return null;
}

const DashboardRowMemo = memo(DashboardRow);

export default function DashboardContent({ data = {} }) {
  const { currentRole } = useRole();
  const [hiddenRows, setHiddenRows] = useState(loadHiddenRows);
  const [editing, setEditing] = useState(false);

  useEffect(() => { saveHiddenRows(hiddenRows); }, [hiddenRows]);

  const visibleRows = ROWS.filter(r => {
    const hasVisible = r.widgets.some(w => w.roles.includes(currentRole));
    return hasVisible && !hiddenRows.includes(r.id);
  });

  if (visibleRows.length === 0) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Dashboard</h2>
        <button
          onClick={() => setEditing(!editing)}
          className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-xl transition-all ${
            editing
              ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300 border border-primary-200 dark:border-primary-800'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 dark:hover:text-gray-300 border border-transparent'
          }`}
        >
          <AdjustmentsHorizontalIcon className="w-3.5 h-3.5" />
          {editing ? 'Done' : 'Customize'}
        </button>
      </div>

      {editing && hiddenRows.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-xl px-4 py-2.5 text-xs text-amber-700 dark:text-amber-300 flex items-center gap-2">
          <span>Hidden rows will not appear on the dashboard.</span>
          <button
            onClick={() => setHiddenRows([])}
            className="font-semibold underline hover:no-underline"
          >
            Restore all
          </button>
        </div>
      )}

      {visibleRows.map(row => (
        <DashboardRowMemo
          key={row.id}
          row={row}
          data={data}
          editing={editing}
          onToggle={(id) => {
            setHiddenRows(prev => prev.includes(id) ? prev.filter(h => h !== id) : [...prev, id]);
          }}
        />
      ))}
    </div>
  );
}
