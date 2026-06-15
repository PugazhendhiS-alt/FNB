import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { deliveryAPI, orderAPI } from '../api/endpoints';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import { formatCurrency, formatDate, getStatusLabel } from '../lib/utils';
import { CheckCircleIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function DeliveryConfirmation() {
  const [orderCode, setOrderCode] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const codeInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (orderCode.length === 6 && !order) {
      lookupOrder();
    }
  }, [orderCode]);

  const lookupOrder = async () => {
    if (orderCode.length !== 6) return;
    setLoading(true);
    try {
      const res = await orderAPI.getByCode(orderCode.toUpperCase());
      setOrder(res.data);
    } catch {
      toast.error('Order not found with this code');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!order) return;
    setConfirming(true);
    try {
      const res = await deliveryAPI.confirm(order.orderCode);
      setConfirmed(true);
      toast.success('Delivery confirmed!');
      setOrder(res.data.order);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Confirmation failed');
    } finally {
      setConfirming(false);
    }
  };

  const reset = () => {
    setOrderCode('');
    setOrder(null);
    setConfirmed(false);
    codeInputRef.current?.focus();
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Confirm Delivery</h1>

      <Card className="p-6">
        <div className="text-center mb-6">
          <MagnifyingGlassIcon className="w-12 h-12 text-primary-500 mx-auto mb-3" />
          <h2 className="text-lg font-semibold">Enter or Scan Order Code</h2>
          <p className="text-sm text-gray-500 mt-1">Enter the 6-character order code to confirm delivery</p>
        </div>

        <div className="flex gap-3 mb-6">
          <input
            ref={codeInputRef}
            type="text"
            value={orderCode}
            onChange={(e) => {
              setOrderCode(e.target.value.toUpperCase().slice(0, 6));
              setOrder(null);
              setConfirmed(false);
            }}
            className="input-field text-center text-2xl font-mono tracking-widest uppercase"
            placeholder="XXX XXX"
            maxLength={6}
            autoFocus
          />
          <Button onClick={lookupOrder} disabled={orderCode.length !== 6 || loading}>
            {loading ? '...' : 'Lookup'}
          </Button>
        </div>

        {loading && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
          </div>
        )}

        {order && !confirmed && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6 space-y-4">
            <div className="text-center">
              <Badge variant={order.status === 'COMPLETED' ? 'success' : 'warning'}>
                {getStatusLabel(order.status)}
              </Badge>
            </div>
            <div className="card p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Order Code</span>
                <span className="font-mono font-bold text-lg">{order.orderCode}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Restaurant</span>
                <span>{order.restaurant?.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Customer</span>
                <span>{order.customer?.username}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total</span>
                <span className="font-semibold">{formatCurrency(order.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Date</span>
                <span>{formatDate(order.createdAt)}</span>
              </div>
            </div>
            {order.items?.map((item, i) => (
              <div key={item.id || i} className="flex justify-between text-sm">
                <span>x{item.quantity} {item.menuItem?.name}</span>
                <span>{formatCurrency(item.unitPrice * item.quantity)}</span>
              </div>
            ))}
            {order.status === 'COMPLETED' ? (
              <Button onClick={handleConfirm} disabled={confirming} className="w-full py-3 bg-green-600 hover:bg-green-700">
                {confirming ? 'Confirming...' : 'Confirm Delivery'}
              </Button>
            ) : (
              <p className="text-sm text-center text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
                Order must be COMPLETED before delivery can be confirmed. Current status: {getStatusLabel(order.status)}
              </p>
            )}
          </div>
        )}

        {order && confirmed && (
          <div className="text-center py-6 space-y-4 border-t border-gray-200 dark:border-gray-700">
            <CheckCircleIcon className="w-20 h-20 text-green-500 mx-auto" />
            <h2 className="text-xl font-semibold text-green-600">Delivery Confirmed!</h2>
            <p className="text-sm text-gray-500">Order {order.orderCode} has been delivered successfully.</p>
            <Button onClick={reset} variant="secondary">Confirm Another Order</Button>
          </div>
        )}
      </Card>
    </div>
  );
}