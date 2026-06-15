import { useState, useEffect, useCallback } from 'react';
import { useRole } from '../../hooks/useRole';
import ErrorBoundary from '../ErrorBoundary';
import {
  SalesWidget, OrdersWidget, KitchenWidget, InventoryWidget,
  CustomerWidget, StaffWidget, PaymentWidget, NotificationWidget,
  QuickActionsWidget,
} from './widgets';
import {
  XMarkIcon, AdjustmentsHorizontalIcon,
} from '@heroicons/react/24/outline';

const ALL_SECTIONS = [
  { id: 'sales', label: 'Sales Overview', Component: SalesWidget, roles: ['SUPERADMIN', 'ADMIN', 'BUILDING_MANAGER', 'RESTAURANT_MANAGER'] },
  { id: 'orders', label: 'Orders', Component: OrdersWidget, roles: ['SUPERADMIN', 'ADMIN', 'BUILDING_MANAGER', 'RESTAURANT_MANAGER', 'CHEF'] },
  { id: 'kitchen', label: 'Kitchen', Component: KitchenWidget, roles: ['SUPERADMIN', 'ADMIN', 'RESTAURANT_MANAGER', 'CHEF'] },
  { id: 'inventory', label: 'Inventory', Component: InventoryWidget, roles: ['SUPERADMIN', 'ADMIN', 'RESTAURANT_MANAGER'] },
  { id: 'customers', label: 'Customers', Component: CustomerWidget, roles: ['SUPERADMIN', 'ADMIN'] },
  { id: 'staff', label: 'Staff', Component: StaffWidget, roles: ['SUPERADMIN', 'ADMIN', 'BUILDING_MANAGER'] },
  { id: 'payments', label: 'Payments', Component: PaymentWidget, roles: ['SUPERADMIN', 'ADMIN', 'BUILDING_MANAGER'] },
  { id: 'notifications', label: 'Notifications', Component: NotificationWidget, roles: ['SUPERADMIN', 'ADMIN', 'BUILDING_MANAGER', 'RESTAURANT_MANAGER', 'CHEF'] },
  { id: 'quickActions', label: 'Quick Actions', Component: QuickActionsWidget, roles: ['SUPERADMIN', 'ADMIN', 'BUILDING_MANAGER', 'RESTAURANT_MANAGER', 'CHEF'] },
];

function getDefaultSections(currentRole) {
  return ALL_SECTIONS
    .filter(s => s.roles.includes(currentRole))
    .slice(0, 4)
    .map(s => s.id);
}

const WIDGET_SIZES = {
  sales: 'lg', orders: 'md', kitchen: 'md', inventory: 'md',
  customers: 'md', staff: 'md', payments: 'md', notifications: 'md',
  quickActions: 'sm',
};

function WidgetWrapper({ section, data, size, customizing, toggleSection }) {
  const Component = section.Component;
  return (
    <ErrorBoundary
      message={`Failed to load "${section.label}" widget.`}
      fallback={
        <div className="widget-card p-6 text-center">
          <p className="text-sm text-gray-400">{section.label} widget unavailable</p>
        </div>
      }
    >
      <div className={size === 'lg' ? 'sm:col-span-2 xl:col-span-2' : size === 'xl' ? 'sm:col-span-2 xl:col-span-3' : ''}>
        <Component
          data={data}
          size={size}
          onRemove={customizing ? () => toggleSection(section.id) : undefined}
        />
      </div>
    </ErrorBoundary>
  );
}

function loadSavedSections(currentRole) {
  try {
    const raw = localStorage.getItem('dashSections');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    const validIds = new Set(ALL_SECTIONS.filter(s => s.roles.includes(currentRole)).map(s => s.id));
    const filtered = parsed.filter(id => validIds.has(id));
    return filtered.length > 0 ? filtered : null;
  } catch {
    return null;
  }
}

export default function DashboardWidgetSections({ data = {} }) {
  const { currentRole } = useRole();
  const [sections, setSections] = useState(() => {
    return loadSavedSections(currentRole) || getDefaultSections(currentRole);
  });
  const [customizing, setCustomizing] = useState(false);

  useEffect(() => {
    if (currentRole) {
      setSections(prev => loadSavedSections(currentRole) || getDefaultSections(currentRole));
    }
  }, [currentRole]);

  useEffect(() => {
    try {
      localStorage.setItem('dashSections', JSON.stringify(sections));
    } catch {}
  }, [sections]);

  const availableSections = ALL_SECTIONS.filter(s => s.roles.includes(currentRole));

  const toggleSection = useCallback((id) => {
    setSections(prev => {
      if (prev.includes(id)) return prev.filter(s => s !== id);
      const section = ALL_SECTIONS.find(s => s.id === id);
      if (!section) return prev;
      return [...prev, id];
    });
  }, []);

  const resetSections = useCallback(() => {
    setSections(getDefaultSections(currentRole));
  }, [currentRole]);

  const visibleSections = availableSections.filter(s => sections.includes(s.id));

  if (availableSections.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="section-header">Dashboard Widgets</h2>
        <div className="flex items-center gap-2">
          {customizing && (
            <button onClick={resetSections} className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 underline">
              Reset
            </button>
          )}
          <button
            onClick={() => setCustomizing(!customizing)}
            className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors ${
              customizing
                ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 dark:hover:text-gray-300'
            }`}
          >
            <AdjustmentsHorizontalIcon className="w-3.5 h-3.5" />
            {customizing ? 'Done' : 'Customize'}
          </button>
        </div>
      </div>

      {customizing && (
        <div className="card-base p-4 animate-slide-down">
          <div className="flex flex-wrap gap-2">
            {availableSections.map(s => (
              <button
                key={s.id}
                onClick={() => toggleSection(s.id)}
                className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                  sections.includes(s.id)
                    ? 'bg-primary-50 text-primary-700 border-primary-200 dark:bg-primary-900/30 dark:text-primary-300 dark:border-primary-800'
                    : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700 dark:hover:border-gray-600'
                }`}
              >
                {sections.includes(s.id) ? '✓ ' : ''}{s.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {visibleSections.map(s => (
          <WidgetWrapper
            key={s.id}
            section={s}
            data={data[s.id]}
            size={WIDGET_SIZES[s.id] || 'md'}
            customizing={customizing}
            toggleSection={toggleSection}
          />
        ))}
      </div>

      {visibleSections.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <p className="text-sm">No widgets enabled. Click Customize to add widgets.</p>
        </div>
      )}
    </div>
  );
}
