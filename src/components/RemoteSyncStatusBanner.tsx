import { useCafeteriaAdmin } from '@/contexts/CafeteriaAdminContext';
import { useOrders } from '@/contexts/OrderContext';

export function RemoteSyncStatusBanner() {
  const { remoteSyncAvailable: cafeteriaSyncAvailable, remoteSyncError: cafeteriaSyncError } = useCafeteriaAdmin();
  const { remoteSyncAvailable: orderSyncAvailable, remoteSyncError: orderSyncError } = useOrders();

  const remoteSyncAvailable = cafeteriaSyncAvailable !== false && orderSyncAvailable !== false;
  const remoteSyncError = [cafeteriaSyncError, orderSyncError].filter(Boolean).join(' / ');

  if (remoteSyncAvailable) {
    return null;
  }

  return (
    <div className="border-b border-yellow-200 bg-yellow-50 text-yellow-900 px-4 py-3 text-sm">
      <p className="font-medium">Remote sync is unavailable.</p>
      <p>{remoteSyncError || 'The app is currently falling back to local storage and will not sync to the remote backend.'}</p>
      <p className="mt-1">Start the backend at <code className="rounded bg-slate-100 px-1 py-0.5">VITE_API_URL</code> or verify the configured endpoint.</p>
    </div>
  );
}
