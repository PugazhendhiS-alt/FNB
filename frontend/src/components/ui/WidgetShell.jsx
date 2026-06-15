import { useState } from 'react';
import { XMarkIcon, ArrowPathIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';

const sizeOptions = [
  { key: 'sm', label: 'Small' },
  { key: 'md', label: 'Medium' },
  { key: 'lg', label: 'Large' },
  { key: 'xl', label: 'Full' },
];

export default function WidgetShell({
  title, subtitle, children, className = '',
  onRemove, onRefresh, onResize,
  size = 'md', loading,
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className={`widget-card group ${className}`}>
      <div className="widget-card-header">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{title}</h3>
            {subtitle && <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate">{subtitle}</p>}
          </div>
        </div>
        <div className="flex items-center gap-0.5 flex-shrink-0 ml-2">
          {onRefresh && (
            <button onClick={onRefresh} className="btn-ghost-icon" title="Refresh">
              <ArrowPathIcon className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          )}
          {onResize && (
            <div className="relative">
              <button onClick={() => setMenuOpen(!menuOpen)} className="btn-ghost-icon" title="Resize">
                <AdjustmentsHorizontalIcon className="w-3.5 h-3.5" />
              </button>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-1 z-20 w-32 bg-white dark:bg-gray-800 rounded-xl shadow-elevated border border-gray-200 dark:border-gray-700 py-1 animate-scale-in">
                    {sizeOptions.map(opt => (
                      <button
                        key={opt.key}
                        onClick={() => { onResize(opt.key); setMenuOpen(false); }}
                        className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                          size === opt.key ? 'text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
          {onRemove && (
            <button onClick={onRemove} className="btn-ghost-icon hover:!text-red-500" title="Remove">
              <XMarkIcon className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
      <div className={className}>
        {children}
      </div>
    </div>
  );
}
