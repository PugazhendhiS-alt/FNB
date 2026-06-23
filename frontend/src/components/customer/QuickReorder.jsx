import { useNavigate } from 'react-router-dom';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

function formatDate(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = (now - d) / (1000 * 60 * 60 * 24);
  if (diff < 1) return 'Today';
  if (diff < 2) return 'Yesterday';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export default function QuickReorder({ orders, loading }) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800/95 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm p-5 animate-pulse">
        <div className="h-5 w-28 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
        <div className="space-y-3">
          {[1, 2].map(i => <div key={i} className="h-14 bg-gray-100 dark:bg-gray-700 rounded-lg" />)}
        </div>
      </div>
    );
  }

  if (!orders?.length) {
    return (
      <div className="bg-white dark:bg-gray-800/95 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-500">
            <ArrowPathIcon className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">Quick Reorder</h3>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">No previous orders yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800/95 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-500">
          <ArrowPathIcon className="w-5 h-5" />
        </div>
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">Quick Reorder</h3>
      </div>
      <div className="space-y-2">
        {orders.slice(0, 3).map(order => (
          <button
            key={order.id}
            onClick={() => navigate(`/menu/${order.restaurantId}`)}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-700/30 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors text-left"
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{order.restaurant?.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {order.items?.length} item(s) · ₹{order.totalAmount?.toFixed(2)}
              </p>
            </div>
            <div className="text-right flex-shrink-0 ml-3">
              <p className="text-[10px] text-gray-400 dark:text-gray-500">{formatDate(order.createdAt)}</p>
              <span className="text-xs font-medium text-primary-600 dark:text-primary-400">Reorder</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
