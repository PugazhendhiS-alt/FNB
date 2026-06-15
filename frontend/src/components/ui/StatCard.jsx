import { memo } from 'react';

const StatCard = memo(function StatCard({ title, value, icon, color = 'primary', subtitle }) {
  const gradients = {
    primary: 'from-blue-500 to-blue-600',
    green: 'from-emerald-500 to-emerald-600',
    yellow: 'from-amber-500 to-amber-600',
    red: 'from-rose-500 to-rose-600',
    purple: 'from-violet-500 to-violet-600',
  };

  const bgLight = {
    primary: 'bg-blue-50 dark:bg-blue-900/20',
    green: 'bg-emerald-50 dark:bg-emerald-900/20',
    yellow: 'bg-amber-50 dark:bg-amber-900/20',
    red: 'bg-rose-50 dark:bg-rose-900/20',
    purple: 'bg-violet-50 dark:bg-violet-900/20',
  };

  const iconColors = {
    primary: 'text-blue-600 dark:text-blue-400',
    green: 'text-emerald-600 dark:text-emerald-400',
    yellow: 'text-amber-600 dark:text-amber-400',
    red: 'text-rose-600 dark:text-rose-400',
    purple: 'text-violet-600 dark:text-violet-400',
  };

  return (
    <div className={`relative overflow-hidden rounded-xl ${bgLight[color] || bgLight.primary} border border-gray-200 dark:border-gray-700`}>
      <div className="absolute top-0 right-0 w-24 h-24 -mr-6 -mt-6 rounded-full bg-gradient-to-br opacity-10 dark:opacity-20 ${gradients[color] || gradients.primary}" />
      <div className="relative p-4 sm:p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1 min-w-0 flex-1">
            <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{title}</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
            {subtitle && <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{subtitle}</p>}
          </div>
          {icon && (
            <div className={`flex-shrink-0 p-2 rounded-lg ${iconColors[color] || iconColors.primary} bg-white dark:bg-gray-800/50 shadow-sm`}>
              <span className="w-5 h-5 flex items-center justify-center">{icon}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default StatCard;