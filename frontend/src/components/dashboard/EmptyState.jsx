import { Cog6ToothIcon } from '@heroicons/react/24/outline';

export default function EmptyState({
  icon: Icon = Cog6ToothIcon,
  title = 'Your dashboard is empty',
  message = 'Add widgets to monitor your key metrics and stay on top of your business.',
  actionLabel = 'Add Widgets',
  onAction,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6">
      <div className="w-20 h-20 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 flex items-center justify-center mb-6">
        <Icon className="w-10 h-10 text-gray-300 dark:text-gray-600" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-sm mb-6">{message}</p>
      {onAction && (
        <button onClick={onAction} className="btn-primary text-sm flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
