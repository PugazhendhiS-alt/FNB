import { memo } from 'react';
import Card from './Card';

const DashboardWidget = memo(function DashboardWidget({ title, icon, color = 'blue', children, footer, loading }) {
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

  if (loading) {
    return (
      <Card className="overflow-hidden">
        <div className="animate-pulse">
          <div className="h-1 bg-gray-200 dark:bg-gray-700" />
          <div className="p-5 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-700" />
              <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className={`h-1 ${accentColors[color] || accentColors.blue}`} />
      <div className="p-4 sm:p-5">
        {(title || icon) && (
          <div className="flex items-center gap-3 mb-4">
            {icon && (
              <div className={`p-2 rounded-lg ${iconBgColors[color] || iconBgColors.blue}`}>
                <span className="w-5 h-5 flex items-center justify-center">{icon}</span>
              </div>
            )}
            {title && (
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{title}</h3>
            )}
          </div>
        )}
        <div>{children}</div>
        {footer && (
          <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">{footer}</div>
        )}
      </div>
    </Card>
  );
});

export default DashboardWidget;