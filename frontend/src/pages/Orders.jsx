import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { orderAPI } from '../api/endpoints';
import { useRole } from '../hooks/useRole';
import { useSocket } from '../context/SocketContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import PageHeader from '../components/ui/PageHeader';
import QRScanner from '../components/QRScanner';
import { formatCurrency, formatDate, getStatusLabel, getStatusStyle } from '../lib/utils';
import { ClipboardDocumentListIcon, QrCodeIcon, XCircleIcon } from '@heroicons/react/24/outline';

const STATUS_TABS = ['ALL', 'PENDING_PAYMENT', 'PAID', 'PREPARING', 'COMPLETED', 'DELIVERED', 'CANCELLED'];

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [expandedId, setExpandedId] = useState(null);
  const [showScanner, setShowScanner] = useState(false);
  const [scannedCode, setScannedCode] = useState('');
  const { currentRole, isCustomer, canManageOrders } = useRole();
  const { socket } = useSocket();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isCustomer && !canManageOrders) navigate('/', { replace: true });
  }, [isCustomer, canManageOrders, navigate]);

  useEffect(() => {
    fetchOrders();
    if (socket) {
      socket.on('order-updated', (data) => {
        setOrders(prev => prev.map(o => o.id === data.id ? { ...o, ...data } : o));
        fetchOrders();
      });
    }
    return () => { if (socket) socket.off('order-updated'); };
  }, [socket]);

  const fetchOrders = async () => {
    try { const res = await orderAPI.getAll({}); setOrders(res.data); }
    catch { toast.error('Failed to load orders'); }
    finally { setLoading(false); }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await orderAPI.updateStatus(orderId, newStatus);
      toast.success(`Order status updated to ${getStatusLabel(newStatus)}`);
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Status update failed');
    }
  };

  const getNextActions = (status) => {
    if (isCustomer) return [];
    const actions = {
      PAID: [{ label: 'Start Preparing', status: 'PREPARING', variant: 'primary' }],
      PREPARING: [{ label: 'Mark Completed', status: 'COMPLETED', variant: 'primary' }],
      COMPLETED: [{ label: 'Mark Delivered', status: 'DELIVERED', variant: 'primary' }],
      PENDING_PAYMENT: [{ label: 'Cancel', status: 'CANCELLED', variant: 'danger' }],
    };
    return actions[status] || [];
  };

  const filtered = activeTab === 'ALL' ? orders : orders.filter(o => o.status === activeTab);

  const scannedOrder = scannedCode
    ? orders.find(o => o.orderCode === scannedCode)
    : null;

  const displayOrders = scannedCode
    ? (scannedOrder ? [scannedOrder] : [])
    : filtered;

  const handleScan = async (code) => {
    setShowScanner(false);
    setScannedCode(code);
    setActiveTab('ALL');
    try {
      const res = await orderAPI.getByCode(code);
      setExpandedId(res.data.id);
      toast.success(`Order ${code} found`);
    } catch {
      toast.error('Order not found');
      setScannedCode('');
    }
  };

  const clearScan = () => {
    setScannedCode('');
    setExpandedId(null);
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>;

  return (
    <div className="space-y-6">
      <PageHeader
        title={isCustomer ? 'My Orders' : 'Orders'}
        subtitle="Track and manage orders"
        icon={ClipboardDocumentListIcon}
        actions={canManageOrders && (
          <Button onClick={() => setShowScanner(true)} variant="secondary">
            <QrCodeIcon className="w-4 h-4 mr-1" /> Scan QR
          </Button>
        )}
      />

      {scannedCode && (
        <div className="flex items-center gap-3 px-4 py-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-200 dark:border-primary-800">
          <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
            Scanning order: <span className="font-mono font-bold">{scannedCode}</span>
          </span>
          <button onClick={clearScan} className="ml-auto p-1 rounded hover:bg-primary-100 dark:hover:bg-primary-800/50">
            <XCircleIcon className="w-4 h-4 text-primary-500" />
          </button>
        </div>
      )}

        <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-none">
          {STATUS_TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                activeTab === tab
                  ? 'bg-primary-600 text-white shadow-sm shadow-primary-500/20'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
              }`}
            >
              {getStatusLabel(tab) === tab ? tab.replace(/_/g, ' ') : getStatusLabel(tab)}
            </button>
          ))}
        </div>

      <div className="space-y-4">
        {displayOrders.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-400">No orders found</p>
          </Card>
        ) : (
          displayOrders.map((order, idx) => (
            <div key={order.id} className="animate-in" style={{ animationDelay: `${idx * 50}ms` }}>
            <Card className="overflow-hidden">
              <div
                className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/30"
                onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-medium">Order #{order.orderCode?.slice(0, 8)}</p>
                      <p className="text-xs text-gray-400">{order.restaurant?.name} · {formatDate(order.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">{formatCurrency(order.totalAmount)}</span>
                    <Badge variant={getStatusStyle(order.status).replace('badge-', '')}>{getStatusLabel(order.status)}</Badge>
                  </div>
                </div>

                {expandedId === order.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="space-y-2">
                      {order.items?.map((item, i) => (
                        <div key={item.id || i} className="flex justify-between text-sm">
                          <span>x{item.quantity} {item.menuItem?.name}</span>
                          <span className="text-gray-500">{formatCurrency(item.unitPrice * item.quantity)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                      <div className="text-sm">
                        <p className="text-gray-500">Customer: {order.customer?.username}</p>
                        {order.orderCode && <p className="text-gray-500">Code: <span className="font-mono font-bold">{order.orderCode}</span></p>}
                      </div>
                      <div className="flex gap-2">
                        {getNextActions(order.status).map(action => (
                          <Button
                            key={action.status}
                            variant={action.variant}
                            size="sm"
                            onClick={(e) => { e.stopPropagation(); handleStatusUpdate(order.id, action.status); }}
                          >
                            {action.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
            </div>
          ))
        )}
      </div>

      {showScanner && <QRScanner onScan={handleScan} onClose={() => setShowScanner(false)} />}
    </div>
  );
}