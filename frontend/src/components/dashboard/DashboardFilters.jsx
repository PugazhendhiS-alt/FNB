import { useState } from 'react';
import { FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';

const DATE_PRESETS = [
  { label: 'Today', value: 'today' },
  { label: '7 Days', value: '7d' },
  { label: '30 Days', value: '30d' },
  { label: '90 Days', value: '90d' },
];

export default function DashboardFilters({ open, onToggle, dateRange, onDateChange, buildings, restaurants }) {
  return (
    <div className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Date Range</label>
            <div className="flex gap-1.5">
              {DATE_PRESETS.map(p => (
                <button
                  key={p.value}
                  onClick={() => onDateChange?.(p.value)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    dateRange === p.value
                      ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          {buildings?.length > 0 && (
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Building</label>
              <select className="input-field text-sm">
                <option value="">All Buildings</option>
                {buildings.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
          )}
          {restaurants?.length > 0 && (
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Restaurant</label>
              <select className="input-field text-sm">
                <option value="">All Restaurants</option>
                {restaurants.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function FilterToggleButton({ open, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`btn-secondary text-sm flex items-center gap-2 ${open ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
    >
      {open ? <XMarkIcon className="w-4 h-4" /> : <FunnelIcon className="w-4 h-4" />}
      {open ? 'Hide Filters' : 'Filters'}
    </button>
  );
}
