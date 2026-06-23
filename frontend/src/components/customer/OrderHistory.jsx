import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClockIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

const STATUS_STYLES = {
  PENDING_PAYMENT: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
  PAID: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
  PREPARING: 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400',
  COMPLETED: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
  DELIVERED: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
  CANCELLED: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400',
};

function formatDate(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = (now - d) / (1000 * 60 * 60 * 24);
  if (diff < 1) return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  if (diff < 2) return 'Yesterday';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function OrderHistory({ orders, loading, onReorder }) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800/95 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm p-5 animate-pulse">
        <div className="h-5 w-28 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-100 dark:bg-gray-700 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (!orders?.length) {
    return (
      <div className="bg-white dark:bg-gray-800/95 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
            <ClockIcon className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">Order History</h3>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">No orders yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800/95 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
            <ClockIcon className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">Order History</h3>
        </div>
      </div>
      <div className="space-y-2">
        {orders.slice(0, 5).map(order => (
          <div key={order.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-700/30">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{order.restaurant?.name}</p>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${STATUS_STYLES[order.status] || ''}`}>
                  {order.status?.replace(/_/g, ' ')}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {order.items?.length} item(s) · ₹{order.totalAmount?.toFixed(2)} · {formatDate(order.createdAt)}
              </p>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0 ml-3">
              {order.status === 'DELIVERED' || order.status === 'COMPLETED' ? (
                <button
                  onClick={() => navigate(`/menu/${order.restaurantId}`)}
                  className="p-2 rounded-lg text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                  title="Reorder"
                >
                  <ArrowPathIcon className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => navigate(`/orders`)}
                  className="text-xs font-medium text-primary-600 dark:text-primary-400 hover:underline"
                >
                  View
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      {orders.length > 5 && (
        <button
          onClick={() => navigate('/orders')}
          className="mt-3 w-full text-center text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
        >
          View all {orders.length} orders →
        </button>
      )}
    </div>
  );
}

export default memo(OrderHistory, (prev, next) =>
  prev.loading === next.loading && prev.orders?.length === next.orders?.length
);
