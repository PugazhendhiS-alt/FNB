import { useState, memo } from 'react';
import { EllipsisVerticalIcon, ArrowPathIcon, XMarkIcon } from '@heroicons/react/24/outline';

function WidgetShell({
  title, subtitle, children, className = '',
  onRemove, onRefresh, onViewMore,
  loading, icon: Icon, updatedAt,
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  const timeAgo = updatedAt ? formatTimeAgo(updatedAt) : null;

  return (
    <div className={`bg-white dark:bg-gray-800/95 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col ${className}`}>
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-50 dark:border-gray-700/30">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {Icon && (
            <div className="p-1.5 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 flex-shrink-0">
              <Icon className="w-4 h-4" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate leading-5">{title}</h3>
            {subtitle && <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate mt-0.5">{subtitle}</p>}
          </div>
        </div>
        <div className="flex items-center gap-0.5 flex-shrink-0 ml-3">
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-gray-300 transition-colors"
              title="Refresh"
            >
              <ArrowPathIcon className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          )}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-gray-300 transition-colors"
              title="Actions"
            >
              <EllipsisVerticalIcon className="w-3.5 h-3.5" />
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-full mt-1 z-20 w-36 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 py-1">
                  {onViewMore && (
                    <button
                      onClick={() => { setMenuOpen(false); onViewMore(); }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      View Details
                    </button>
                  )}
                  {onRefresh && (
                    <button
                      onClick={() => { setMenuOpen(false); onRefresh(); }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      Refresh Data
                    </button>
                  )}
                  {onRemove && (
                    <button
                      onClick={() => { setMenuOpen(false); onRemove(); }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      Remove Widget
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
          {onRemove && (
            <button
              onClick={onRemove}
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              title="Remove"
            >
              <XMarkIcon className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
      <div className="flex-1 px-5 py-4">
        {loading ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-3/4" />
            <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-1/2" />
            <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-5/6" />
          </div>
        ) : (
          children
        )}
      </div>
      {(timeAgo || onViewMore) && !loading && (
        <div className="flex items-center justify-between px-5 py-2.5 border-t border-gray-50 dark:border-gray-700/30">
          {timeAgo && (
            <span className="text-[10px] text-gray-400 dark:text-gray-500">Updated {timeAgo}</span>
          )}
          {onViewMore && (
            <button
              onClick={onViewMore}
              className="text-[11px] font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
            >
              View more →
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function formatTimeAgo(date) {
  const now = Date.now();
  const diff = now - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default memo(WidgetShell);
