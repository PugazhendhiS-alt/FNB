import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { orderAPI, paymentAPI } from '../api/endpoints';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { formatCurrency, formatDate, getStatusLabel, getStatusStyle } from '../lib/utils';
import { QRCodeSVG } from 'qrcode.react';
import { CheckCircleIcon, XCircleIcon, CreditCardIcon } from '@heroicons/react/24/outline';

export default function OrderSuccess() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentStep, setPaymentStep] = useState('loading'); // loading, pay, processing, success, failed
  const [testMode, setTestMode] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await orderAPI.getById(orderId);
        setOrder(res.data);
        if (res.data.status === 'PENDING_PAYMENT') {
          setPaymentStep('pay');
        } else if (res.data.status === 'PAID') {
          setPaymentStep('success');
        } else if (res.data.status === 'PAYMENT_FAILED') {
          setPaymentStep('failed');
        } else {
          setPaymentStep('success');
        }
      } catch { toast.error('Order not found'); navigate('/'); }
      finally { setLoading(false); }
    };
    fetchOrder();
  }, [orderId]);

  const handlePayment = async (success) => {
    setTestMode(success ? 'success' : 'failed');
    setPaymentStep('processing');
    try {
      const res = await paymentAPI.process(orderId, success);
      if (res.data.success) {
        setPaymentStep('success');
        setOrder(res.data.order);
        toast.success('Payment successful!');
      } else {
        setPaymentStep('failed');
        toast.error('Payment failed');
      }
    } catch {
      setPaymentStep('failed');
      toast.error('Payment processing error');
    }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>;

  const qrValue = JSON.stringify({ orderId: order?.id, orderCode: order?.orderCode });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Order & Payment</h1>

      <Card className="p-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
            <CreditCardIcon className="w-8 h-8 text-primary-600" />
          </div>
          <h2 className="text-xl font-semibold">Order #{order?.orderCode?.slice(0, 8)}</h2>
          <p className="text-sm text-gray-500">{order?.restaurant?.name}</p>
        </div>

        {paymentStep === 'pay' && (
          <div className="space-y-4">
            <div className="card p-6 text-center border-2 border-dashed border-primary-300 dark:border-primary-700">
              <h3 className="text-lg font-semibold mb-4">UPI Payment</h3>
              <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4 mb-4 inline-block">
                <QRCodeSVG value={qrValue} size={160} />
              </div>
              <p className="text-sm text-gray-500 mb-2">Scan to pay or use UPI ID:</p>
              <p className="text-lg font-mono font-bold text-primary-600">pos@upi</p>
              <p className="text-xs text-gray-400 mt-4">Total: {formatCurrency(order?.totalAmount)}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Button onClick={() => handlePayment(true)} className="bg-green-600 hover:bg-green-700 border-green-600 py-3">
                <CheckCircleIcon className="w-5 h-5 mr-2" /> Payment Success (Test)
              </Button>
              <Button onClick={() => handlePayment(false)} variant="danger" className="py-3">
                <XCircleIcon className="w-5 h-5 mr-2" /> Payment Failed (Test)
              </Button>
            </div>
            <p className="text-xs text-center text-gray-400">* Demo mode: Test payment success or failure</p>
          </div>
        )}

        {paymentStep === 'processing' && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4" />
            <p className="text-lg font-medium">Processing payment...</p>
          </div>
        )}

        {paymentStep === 'success' && (
          <div className="space-y-6">
            <div className="text-center">
              <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-2" />
              <h2 className="text-xl font-semibold text-green-600">Payment Successful!</h2>
              <p className="text-sm text-gray-500">Your order has been placed</p>
            </div>

            <div className="flex flex-col items-center space-y-4 py-4">
              <div className="bg-white p-4 rounded-xl shadow-sm border">
                <QRCodeSVG value={qrValue} size={200} level="H" includeMargin />
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-1">Order Code</p>
                <p className="text-3xl font-bold font-mono tracking-widest text-primary-600">{order?.orderCode}</p>
              </div>
            </div>

            <div className="card p-4 space-y-2">
              <h3 className="font-semibold mb-2">Order Details</h3>
              {order?.items?.map((item, i) => (
                <div key={item.id || i} className="flex justify-between text-sm">
                  <span>x{item.quantity} {item.menuItem?.name}</span>
                  <span>{formatCurrency(item.unitPrice * item.quantity)}</span>
                </div>
              ))}
              <div className="flex justify-between font-bold pt-2 border-t border-gray-200 dark:border-gray-700">
                <span>Total</span>
                <span className="text-primary-600">{formatCurrency(order?.totalAmount)}</span>
              </div>
            </div>

            <Badge variant="success">{getStatusLabel(order?.status)}</Badge>

            <div className="flex gap-3">
              {user && <Button onClick={() => navigate('/orders')} variant="secondary" className="flex-1">View My Orders</Button>}
              <Button onClick={() => navigate('/restaurants')} className="flex-1">Order Again</Button>
            </div>
          </div>
        )}

        {paymentStep === 'failed' && (
          <div className="text-center space-y-4">
            <XCircleIcon className="w-16 h-16 text-red-500 mx-auto" />
            <h2 className="text-xl font-semibold text-red-600">Payment Failed</h2>
            <p className="text-sm text-gray-500">Your payment was not processed. Please try again.</p>
            <Button onClick={() => setPaymentStep('pay')} className="mt-4">Try Again</Button>
          </div>
        )}
      </Card>
    </div>
  );
}