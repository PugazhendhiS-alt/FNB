import { memo, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClockIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useSocket } from '../../context/SocketContext';

const STEPS = ['PAID', 'PREPARING', 'COMPLETED', 'DELIVERED'];
const STEP_LABELS = { PAID: 'Confirmed', PREPARING: 'Preparing', COMPLETED: 'Ready', DELIVERED: 'Delivered' };

function getStepIndex(status) {
  const idx = STEPS.indexOf(status);
  return idx >= 0 ? idx : -1;
}

function ActiveOrderTracker({ order, loading }) {
  const { socket } = useSocket();
  const navigate = useNavigate();
  const [currentStatus, setCurrentStatus] = useState(order?.status);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (order?.status) setCurrentStatus(order.status);
  }, [order?.status]);

  useEffect(() => {
    if (!socket || !order?.id) return;
    const handler = (data) => {
      if (data.id === order.id) {
        setCurrentStatus(data.status);
        setAnimate(true);
        setTimeout(() => setAnimate(false), 1000);
      }
    };
    socket.on('order-status-changed', handler);
    return () => socket.off('order-status-changed', handler);
  }, [socket, order?.id]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800/95 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm p-5 animate-pulse">
        <div className="h-5 w-36 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
        <div className="space-y-3">
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="bg-white dark:bg-gray-800/95 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-orange-500">
            <ClockIcon className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">No Active Order</h3>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">You don't have any active orders right now.</p>
        <button onClick={() => navigate('/restaurants')} className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline">
          Browse restaurants to place an order
        </button>
      </div>
    );
  }

  const stepIndex = getStepIndex(currentStatus);

  return (
    <div className={`bg-white dark:bg-gray-800/95 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm p-5 transition-all duration-300 ${animate ? 'ring-2 ring-primary-400 scale-[1.01]' : ''}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-500">
            <ClockIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Active Order</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">{order.restaurant?.name}</p>
          </div>
        </div>
        <span className="text-xs font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 px-2.5 py-1 rounded-full">
          #{order.orderCode?.slice(-6)}
        </span>
      </div>

      <div className="relative mb-4">
        <div className="flex items-center justify-between">
          {STEPS.map((step, i) => {
            const isActive = i <= stepIndex;
            const isCurrent = i === stepIndex;
            return (
              <div key={step} className="flex flex-col items-center flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 ${
                  isActive
                    ? 'bg-primary-500 text-white shadow-md shadow-primary-500/30'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                } ${isCurrent && animate ? 'ring-4 ring-primary-200 dark:ring-primary-800' : ''}`}>
                  {i + 1}
                </div>
                <span className={`text-[10px] mt-1.5 font-medium ${
                  isActive ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-gray-500'
                }`}>{STEP_LABELS[step]}</span>
              </div>
            );
          })}
        </div>
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-100 dark:bg-gray-700 -z-0">
          <div className="h-full bg-primary-500 transition-all duration-700" style={{ width: `${(stepIndex / (STEPS.length - 1)) * 100}%` }} />
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>{order.items?.length || 0} item(s)</span>
        <span>₹{order.totalAmount?.toFixed(2)}</span>
      </div>

      <button
        onClick={() => navigate(`/orders`)}
        className="mt-3 w-full flex items-center justify-center gap-1 text-xs font-medium text-primary-600 dark:text-primary-400 hover:underline"
      >
        View Details <ChevronRightIcon className="w-3 h-3" />
      </button>
    </div>
  );
}

export default memo(ActiveOrderTracker, (prev, next) =>
  prev.loading === next.loading && prev.order?.status === next.order?.status && prev.order?.id === next.order?.id
);
