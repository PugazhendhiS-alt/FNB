import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { SparklesIcon } from '@heroicons/react/24/outline';

function RecommendedItems({ items = [], favorites = [], loading }) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800/95 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm p-5 animate-pulse">
        <div className="h-5 w-36 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
        <div className="flex gap-3 overflow-hidden">
          {[1, 2, 3].map(i => <div key={i} className="flex-shrink-0 w-32 h-36 bg-gray-100 dark:bg-gray-700 rounded-xl" />)}
        </div>
      </div>
    );
  }

  const displayItems = favorites.length > 0 ? favorites : items;

  if (!displayItems?.length) {
    return (
      <div className="bg-white dark:bg-gray-800/95 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-500">
            <SparklesIcon className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">Recommended</h3>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">Start ordering to see personalized recommendations.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800/95 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-500">
          <SparklesIcon className="w-5 h-5" />
        </div>
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">Recommended for You</h3>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-thin">
        {displayItems.slice(0, 6).map(item => (
          <button
            key={item.id}
            onClick={() => navigate(`/menu/${item.restaurantId}`)}
            className="flex-shrink-0 w-32 bg-gray-50 dark:bg-gray-700/30 rounded-xl p-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors border border-gray-100 dark:border-gray-700/30"
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold mb-2 ${item.foodCategory === 'VEG' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
              {item.foodCategory === 'VEG' ? 'V' : 'N'}
            </div>
            <p className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">{item.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">₹{item.price?.toFixed(2)}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

export default memo(RecommendedItems, (prev, next) =>
  prev.loading === next.loading && prev.favorites?.length === next.favorites?.length
);
