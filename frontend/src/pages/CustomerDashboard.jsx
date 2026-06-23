import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChartBarIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { customerAPI, foodCardAPI } from '../api/endpoints';
import { useSocket } from '../context/SocketContext';
import ActiveOrderTracker from '../components/customer/ActiveOrderTracker';
import QuickReorder from '../components/customer/QuickReorder';
import WalletCard from '../components/customer/WalletCard';
import RecommendedItems from '../components/customer/RecommendedItems';
import OffersCoupons from '../components/customer/OffersCoupons';
import FavoriteRestaurants from '../components/customer/FavoriteRestaurants';
import OrderHistory from '../components/customer/OrderHistory';
import NotificationsCenter from '../components/customer/NotificationsCenter';
import { useAuth } from '../context/AuthContext';

let cachedData = null;

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket, notifications } = useSocket();
  const [data, setData] = useState(cachedData);
  const [loading, setLoading] = useState(!cachedData);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const fetchedRef = useRef(false);

  const loadDashboard = useCallback(async (isRefresh) => {
    if (isRefresh) setRefreshing(true);
    else if (!cachedData) setLoading(true);
    setError(null);
    try {
      const res = await customerAPI.getDashboard();
      cachedData = res.data;
      setData(res.data);
    } catch (err) {
      if (!cachedData) setError('Failed to load dashboard.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!cachedData && !fetchedRef.current) {
      fetchedRef.current = true;
      loadDashboard(false);
    }
  }, [loadDashboard]);

  useEffect(() => {
    if (!socket) return;
    const handler = () => { loadDashboard(true); };
    socket.on('order-status-changed', handler);
    return () => socket.off('order-status-changed', handler);
  }, [socket, loadDashboard]);

  const handleTopUp = async (amount) => {
    try {
      await foodCardAPI.topUp({ amount });
      loadDashboard(true);
    } catch (err) {
      alert('Top-up failed. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-4 w-56 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
          <div className="h-9 w-28 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-40 bg-gray-100 dark:bg-gray-800 rounded-2xl" />
            <div className="h-32 bg-gray-100 dark:bg-gray-800 rounded-2xl" />
            <div className="h-40 bg-gray-100 dark:bg-gray-800 rounded-2xl" />
          </div>
          <div className="space-y-4">
            <div className="h-48 bg-gray-100 dark:bg-gray-800 rounded-2xl" />
            <div className="h-32 bg-gray-100 dark:bg-gray-800 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-gray-500 dark:text-gray-400 mb-4">{error}</p>
        <button onClick={() => loadDashboard(false)} className="btn-primary text-sm">Retry</button>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-md shadow-primary-500/10">
            <ChartBarIcon className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">My Dashboard</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Welcome back, {user?.username || 'Guest'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => loadDashboard(true)}
            disabled={refreshing}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="Refresh"
          >
            <ArrowPathIcon className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => navigate('/restaurants')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 active:bg-primary-800 transition-colors shadow-sm"
          >
            <ChartBarIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Order Now</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        <div className="lg:col-span-2 space-y-4 lg:space-y-6">
          <ActiveOrderTracker order={data?.activeOrder} loading={false} />
          <QuickReorder orders={data?.recentOrders} loading={false} />
          <RecommendedItems
            items={data?.recommendations?.trendingItems}
            favorites={data?.recommendations?.favoriteItems}
            loading={false}
          />
          <OffersCoupons offers={data?.offers} loading={false} />
          <OrderHistory orders={data?.orderHistory} loading={false} />
        </div>

        <div className="space-y-4 lg:space-y-6">
          <WalletCard wallet={data?.wallet} loading={false} onTopUp={handleTopUp} />
          <FavoriteRestaurants
            restaurants={data?.favorites?.restaurants}
            loading={false}
          />
          <NotificationsCenter onViewAll={() => navigate('/profile')} />
        </div>
      </div>
    </div>
  );
}
