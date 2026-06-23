import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeartIcon } from '@heroicons/react/24/outline';

function FavoriteRestaurants({ restaurants = [], items = [], loading }) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800/95 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm p-5 animate-pulse">
        <div className="h-5 w-36 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
        <div className="flex gap-3">
          {[1, 2].map(i => <div key={i} className="flex-shrink-0 w-28 h-20 bg-gray-100 dark:bg-gray-700 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (!restaurants?.length) {
    return (
      <div className="bg-white dark:bg-gray-800/95 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-lg bg-pink-50 dark:bg-pink-900/20 text-pink-500">
            <HeartIcon className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">Favorites</h3>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">Order from restaurants to build your favorites.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800/95 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-pink-50 dark:bg-pink-900/20 text-pink-500">
          <HeartIcon className="w-5 h-5" />
        </div>
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">Favorites</h3>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-thin">
        {restaurants.slice(0, 5).map(r => (
          <button
            key={r.id}
            onClick={() => navigate(`/menu/${r.id}`)}
            className="flex-shrink-0 w-32 bg-gray-50 dark:bg-gray-700/30 rounded-xl p-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors border border-gray-100 dark:border-gray-700/30"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-white text-xs font-bold mb-2">
              {r.name?.charAt(0)}
            </div>
            <p className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">{r.name}</p>
            {r.cuisine && <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">{r.cuisine}</p>}
          </button>
        ))}
      </div>
    </div>
  );
}

export default memo(FavoriteRestaurants, (prev, next) =>
  prev.loading === next.loading && prev.restaurants?.length === next.restaurants?.length
);
