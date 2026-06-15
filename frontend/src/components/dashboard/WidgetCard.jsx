import { useState } from 'react';
import Card from '../ui/Card';

const accentColors = {
  blue: 'bg-blue-500', green: 'bg-emerald-500', purple: 'bg-violet-500',
  yellow: 'bg-amber-500', red: 'bg-rose-500', indigo: 'bg-indigo-500', teal: 'bg-teal-500',
};

const iconBgColors = {
  blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400',
  green: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400',
  purple: 'bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-400',
  yellow: 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400',
  red: 'bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400',
  indigo: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400',
  teal: 'bg-teal-100 text-teal-600 dark:bg-teal-900/40 dark:text-teal-400',
};

export default function WidgetCard({
  title, icon, color = 'blue', children, footer, loading,
  onRemove, onRefresh, className = '', compact = false,
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  if (loading) {
    return (
      <Card className="overflow-hidden h-full">
        <div className="animate-pulse h-full">
          <div className="h-0.5 bg-gray-200 dark:bg-gray-700" />
          <div className="p-3 sm:p-4 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gray-200 dark:bg-gray-700" />
              <div className="h-3.5 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`overflow-hidden h-full ${className}`}>
      <div className={`h-0.5 ${accentColors[color] || accentColors.blue}`} />
      <div className={compact ? 'p-3' : 'p-3 sm:p-4'}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2 min-w-0">
            {icon && (
              <div className={`p-1.5 rounded-lg flex-shrink-0 ${iconBgColors[color] || iconBgColors.blue}`}>
                <span className="w-3.5 h-3.5 flex items-center justify-center">{icon}</span>
              </div>
            )}
            {title && (
              <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider truncate">{title}</h3>
            )}
          </div>
          <div className="flex items-center gap-0.5 flex-shrink-0 ml-2">
            {onRefresh && (
              <button onClick={onRefresh} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" title="Refresh">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              </button>
            )}
            {(onRemove) && (
              <div className="relative">
                <button onClick={() => setMenuOpen(!menuOpen)} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" title="Options">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01" /></svg>
                </button>
                {menuOpen && (
                  <div className="absolute right-0 top-full mt-1 w-32 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-20">
                    <button onClick={() => { onRemove(); setMenuOpen(false); }} className="w-full text-left px-3 py-1.5 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      Remove
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        <div>{children}</div>
        {footer && (
          <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700/50">
            {footer}
          </div>
        )}
      </div>
    </Card>
  );
}
