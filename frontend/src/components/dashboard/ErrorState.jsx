import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default function ErrorState({
  title = 'Something went wrong',
  message = 'We couldn\'t load your dashboard data. Please try again.',
  onRetry,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6">
      <div className="w-20 h-20 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 flex items-center justify-center mb-6">
        <ExclamationTriangleIcon className="w-10 h-10 text-red-400 dark:text-red-500" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-sm mb-6">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-primary text-sm flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          Try Again
        </button>
      )}
    </div>
  );
}
