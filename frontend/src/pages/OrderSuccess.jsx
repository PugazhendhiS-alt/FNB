import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { orderAPI, paymentAPI, foodCardAPI } from '../api/endpoints';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { formatCurrency, formatDate, getStatusLabel, getStatusStyle } from '../lib/utils';
import { QRCodeSVG } from 'qrcode.react';
import {
  CheckCircleIcon, XCircleIcon, CreditCardIcon,
  BanknotesIcon, DevicePhoneMobileIcon, IdentificationIcon,
  ArrowLeftIcon, EyeIcon, EyeSlashIcon, PlusIcon,
} from '@heroicons/react/24/outline';

const PAYMENT_METHODS = [
  { id: 'card', label: 'Credit/Debit Card', icon: CreditCardIcon, bgClass: 'bg-blue-100 dark:bg-blue-900/30', iconClass: 'text-blue-600' },
  { id: 'upi', label: 'UPI', icon: DevicePhoneMobileIcon, bgClass: 'bg-purple-100 dark:bg-purple-900/30', iconClass: 'text-purple-600' },
  { id: 'counter', label: 'Pay at Counter', icon: BanknotesIcon, bgClass: 'bg-green-100 dark:bg-green-900/30', iconClass: 'text-green-600' },
  { id: 'foodcard', label: 'Food Card', icon: IdentificationIcon, bgClass: 'bg-orange-100 dark:bg-orange-900/30', iconClass: 'text-orange-600' },
];

export default function OrderSuccess() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentStep, setPaymentStep] = useState('loading');
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [processing, setProcessing] = useState(false);

  // Food Card state
  const [foodCard, setFoodCard] = useState(null);
  const [fcPin, setFcPin] = useState('');
  const [fcLoading, setFcLoading] = useState(false);
  const [showCreateCard, setShowCreateCard] = useState(false);
  const [newCardPin, setNewCardPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [creatingCard, setCreatingCard] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [fcTopUpAmount, setFcTopUpAmount] = useState('');
  const [fcTopUpPin, setFcTopUpPin] = useState('');
  const [showTopUp, setShowTopUp] = useState(false);
  const [topingUp, setTopingUp] = useState(false);

  // Card form state
  const [cardForm, setCardForm] = useState({ number: '', expiry: '', cvv: '', name: '' });

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

  useEffect(() => {
    if (user && paymentStep === 'pay') {
      loadFoodCard();
    }
  }, [user, paymentStep]);

  const loadFoodCard = async () => {
    try {
      const res = await foodCardAPI.getCard();
      setFoodCard(res.data);
    } catch {
      setFoodCard(null);
    }
  };

  const handleCreateCard = async () => {
    if (!newCardPin || newCardPin.length < 4 || newCardPin.length > 6) {
      return toast.error('PIN must be 4-6 digits');
    }
    if (newCardPin !== confirmPin) {
      return toast.error('PINs do not match');
    }
    setCreatingCard(true);
    try {
      const res = await foodCardAPI.create({ pin: newCardPin });
      setFoodCard(res.data);
      setShowCreateCard(false);
      setNewCardPin('');
      setConfirmPin('');
      toast.success('Food Card created!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create Food Card');
    } finally {
      setCreatingCard(false);
    }
  };

  const handleTopUp = async () => {
    const amount = parseFloat(fcTopUpAmount);
    if (!amount || amount <= 0) return toast.error('Enter a valid amount');
    if (!fcTopUpPin) return toast.error('Enter your PIN');
    setTopingUp(true);
    try {
      const res = await foodCardAPI.topUp({ amount, pin: fcTopUpPin });
      setFoodCard(prev => ({ ...prev, balance: res.data.balance }));
      setFcTopUpAmount('');
      setFcTopUpPin('');
      setShowTopUp(false);
      toast.success(res.data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Top-up failed');
    } finally {
      setTopingUp(false);
    }
  };

  const handlePayment = async (method) => {
    setSelectedMethod(method);
    if (method === 'foodcard') {
      if (!user) {
        toast.error('Please login to use Food Card');
        return;
      }
      return;
    }
    if (method === 'counter') {
      setProcessing(true);
      try {
        const res = await paymentAPI.process(orderId, true);
        if (res.data.success) {
          setPaymentStep('success');
          setOrder(res.data.order);
          setSelectedMethod(null);
          toast.success('Order placed! Pay at counter.');
        }
      } catch {
        toast.error('Payment processing error');
      } finally {
        setProcessing(false);
      }
      return;
    }

    setProcessing(true);
    try {
      const res = await paymentAPI.process(orderId, true);
      if (res.data.success) {
        setPaymentStep('success');
        setOrder(res.data.order);
        toast.success('Payment successful!');
      }
    } catch {
      toast.error('Payment processing error');
    } finally {
      setProcessing(false);
      setSelectedMethod(null);
    }
  };

  const handleFoodCardPay = async () => {
    if (!fcPin) return toast.error('Enter your PIN');
    setFcLoading(true);
    try {
      const res = await foodCardAPI.pay({ orderId, pin: fcPin });
      if (res.data.success) {
        setPaymentStep('success');
        setOrder(res.data.order);
        setFoodCard(prev => ({ ...prev, balance: res.data.balance }));
        toast.success('Payment successful via Food Card!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Food Card payment failed');
    } finally {
      setFcLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>;

  const qrValue = JSON.stringify({ orderId: order?.id, orderCode: order?.orderCode });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-12">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold">Payment</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 mt-6 space-y-4">
        {/* Order Summary Card */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm text-gray-500">Order #{order?.orderCode}</h2>
              <p className="font-semibold text-gray-900 dark:text-gray-100">{order?.restaurant?.name}</p>
            </div>
            <Badge variant={order?.status === 'PENDING_PAYMENT' ? 'warning' : 'success'}>
              {getStatusLabel(order?.status)}
            </Badge>
          </div>
          <div className="space-y-2">
            {order?.items?.map((item, i) => (
              <div key={item.id || i} className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  <span className="text-gray-400">{item.quantity}x</span> {item.menuItem?.name}
                </span>
                <span className="font-medium">{formatCurrency(item.unitPrice * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between font-bold text-lg pt-3 mt-3 border-t border-gray-200 dark:border-gray-700">
            <span>Total</span>
            <span className="text-primary-600">{formatCurrency(order?.totalAmount)}</span>
          </div>
        </Card>

        {/* Payment Section */}
        {paymentStep === 'pay' && (
          <div className="space-y-4">
            {!selectedMethod ? (
              <>
                <h2 className="text-lg font-bold">Choose Payment Method</h2>
                <div className="grid grid-cols-2 gap-3">
                  {PAYMENT_METHODS.map(method => {
                    const Icon = method.icon;
                    return (
                      <button
                        key={method.id}
                        onClick={() => handlePayment(method.id)}
                        disabled={processing}
                        className="bg-white dark:bg-gray-800 rounded-xl p-4 border-2 border-gray-200 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-500 transition-all text-left hover:shadow-md disabled:opacity-50"
                      >
                        <div className={`w-10 h-10 rounded-lg ${method.bgClass} flex items-center justify-center mb-3`}>
                          <Icon className={`w-5 h-5 ${method.iconClass}`} />
                        </div>
                        <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">{method.label}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {method.id === 'card' && 'Visa, Mastercard, Rupay'}
                          {method.id === 'upi' && 'GPay, PhonePe, Paytm'}
                          {method.id === 'counter' && 'Pay at restaurant counter'}
                          {method.id === 'foodcard' && 'Prepaid food card'}
                        </p>
                      </button>
                    );
                  })}
                </div>
                {processing && (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Processing payment...</p>
                  </div>
                )}
              </>
            ) : selectedMethod === 'card' && (
              <Card className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Credit / Debit Card</h3>
                  <div className="flex gap-1">
                    <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">Visa</span>
                    <span className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded">MC</span>
                    <span className="text-xs px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded">Rupay</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Card Number</label>
                    <input
                      type="text"
                      maxLength={19}
                      placeholder="1234 5678 9012 3456"
                      value={cardForm.number}
                      onChange={e => setCardForm({ ...cardForm, number: e.target.value })}
                      className="input-field font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-1 block">Expiry</label>
                      <input
                        type="text"
                        maxLength={5}
                        placeholder="MM/YY"
                        value={cardForm.expiry}
                        onChange={e => setCardForm({ ...cardForm, expiry: e.target.value })}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-1 block">CVV</label>
                      <input
                        type="text"
                        maxLength={4}
                        placeholder="123"
                        value={cardForm.cvv}
                        onChange={e => setCardForm({ ...cardForm, cvv: e.target.value })}
                        className="input-field"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Cardholder Name</label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      value={cardForm.name}
                      onChange={e => setCardForm({ ...cardForm, name: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <Button
                    onClick={() => handlePayment('card')}
                    disabled={processing}
                    className="w-full py-3 mt-2"
                  >
                    {processing ? 'Processing...' : `Pay ${formatCurrency(order?.totalAmount)}`}
                  </Button>
                  <button
                    onClick={() => setSelectedMethod(null)}
                    className="w-full text-sm text-gray-500 hover:text-gray-700 py-2"
                  >
                    Back to payment methods
                  </button>
                </div>
              </Card>
            )}

            {selectedMethod === 'upi' && (
              <Card className="p-5 text-center">
                <h3 className="font-semibold mb-4">UPI Payment</h3>
                <div className="bg-gray-100 dark:bg-gray-900 rounded-xl p-4 mb-4 inline-block">
                  <QRCodeSVG value={qrValue} size={180} />
                </div>
                <p className="text-sm text-gray-500 mb-1">Scan any UPI app to pay</p>
                <p className="text-lg font-mono font-bold text-primary-600 mb-2">pos@upi</p>
                <p className="text-sm font-semibold mb-4">{formatCurrency(order?.totalAmount)}</p>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handlePayment('upi')}
                    disabled={processing}
                    className="flex-1"
                  >
                    {processing ? 'Processing...' : 'I\'ve Paid (Test)'}
                  </Button>
                  <Button
                    onClick={() => paymentAPI.process(orderId, false).then(() => {
                      toast.error('Payment failed');
                    }).catch(() => {})}
                    variant="danger"
                    disabled={processing}
                  >
                    <XCircleIcon className="w-4 h-4" />
                  </Button>
                </div>
                <button
                  onClick={() => setSelectedMethod(null)}
                  className="w-full text-sm text-gray-500 hover:text-gray-700 py-2 mt-2"
                >
                  Back to payment methods
                </button>
              </Card>
            )}

            {selectedMethod === 'counter' && (
              <Card className="p-5 text-center">
                <BanknotesIcon className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <h3 className="font-semibold text-lg mb-2">Pay at Counter</h3>
                <p className="text-sm text-gray-500 mb-1">Show this order code at the restaurant counter</p>
                <p className="text-3xl font-bold font-mono tracking-widest text-primary-600 my-4">{order?.orderCode}</p>
                <p className="text-sm text-gray-400 mb-4">Total: {formatCurrency(order?.totalAmount)}</p>
                <Button onClick={() => handlePayment('counter')} disabled={processing} className="w-full">
                  {processing ? 'Placing Order...' : 'Confirm - Pay at Counter'}
                </Button>
                <button
                  onClick={() => setSelectedMethod(null)}
                  className="w-full text-sm text-gray-500 hover:text-gray-700 py-2 mt-2"
                >
                  Back to payment methods
                </button>
              </Card>
            )}

            {selectedMethod === 'foodcard' && (
              <Card className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <IdentificationIcon className="w-5 h-5 text-orange-500" />
                    Food Card
                  </h3>
                  {foodCard && (
                    <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded font-medium">
                      Active
                    </span>
                  )}
                </div>

                {!foodCard && !showCreateCard ? (
                  <div className="text-center py-6">
                    <IdentificationIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <p className="font-medium text-gray-900 dark:text-gray-100 mb-1">No Food Card Found</p>
                    <p className="text-sm text-gray-500 mb-4">Create a prepaid food card for easy payments</p>
                    <Button onClick={() => setShowCreateCard(true)} variant="secondary" className="w-full">
                      Create Food Card
                    </Button>
                    <button
                      onClick={() => setSelectedMethod(null)}
                      className="w-full text-sm text-gray-500 hover:text-gray-700 py-2 mt-2"
                    >
                      Back to payment methods
                    </button>
                  </div>
                ) : showCreateCard ? (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-500 mb-1">Set a 4-6 digit PIN for your Food Card</p>
                    <div className="relative">
                      <input
                        type={showPin ? 'text' : 'password'}
                        maxLength={6}
                        inputMode="numeric"
                        pattern="[0-9]*"
                        placeholder="Enter PIN"
                        value={newCardPin}
                        onChange={e => setNewCardPin(e.target.value.replace(/\D/g, ''))}
                        className="input-field text-center text-lg font-bold tracking-widest"
                      />
                      <button
                        onClick={() => setShowPin(!showPin)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                      >
                        {showPin ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showPin ? 'text' : 'password'}
                        maxLength={6}
                        inputMode="numeric"
                        pattern="[0-9]*"
                        placeholder="Confirm PIN"
                        value={confirmPin}
                        onChange={e => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                        className="input-field text-center text-lg font-bold tracking-widest"
                      />
                    </div>
                    <Button
                      onClick={handleCreateCard}
                      disabled={creatingCard || !newCardPin || newCardPin !== confirmPin}
                      className="w-full"
                    >
                      {creatingCard ? 'Creating...' : 'Create Food Card'}
                    </Button>
                    <button
                      onClick={() => { setShowCreateCard(false); setNewCardPin(''); setConfirmPin(''); }}
                      className="w-full text-sm text-gray-500 py-1"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Balance Display */}
                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 text-white">
                      <p className="text-xs text-orange-100 mb-1">Available Balance</p>
                      <p className="text-2xl font-bold">{formatCurrency(foodCard?.balance || 0)}</p>
                      <p className="text-xs text-orange-100 mt-1">Card: ****{foodCard?.cardNumber?.slice(-4) || '****'}</p>
                    </div>

                    {/* Order Total */}
                    <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-800/50 rounded-lg px-4 py-3">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Order Total</span>
                      <span className="font-bold text-primary-600">{formatCurrency(order?.totalAmount)}</span>
                    </div>

                    {/* Insufficient balance warning */}
                    {(foodCard?.balance || 0) < (order?.totalAmount || 0) && (
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                        <p className="text-sm text-red-700 dark:text-red-300 font-medium">Insufficient Balance</p>
                        <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">
                          You need {formatCurrency((order?.totalAmount || 0) - (foodCard?.balance || 0))} more
                        </p>
                        {!showTopUp && (
                          <button
                            onClick={() => setShowTopUp(true)}
                            className="text-sm text-red-600 dark:text-red-400 font-medium underline mt-1"
                          >
                            Top up now
                          </button>
                        )}
                      </div>
                    )}

                    {/* Top Up Section */}
                    {showTopUp && (
                      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 space-y-2">
                        <h4 className="text-sm font-semibold flex items-center gap-1">
                          <PlusIcon className="w-4 h-4" /> Top Up Food Card
                        </h4>
                        <input
                          type="number"
                          placeholder="Amount"
                          value={fcTopUpAmount}
                          onChange={e => setFcTopUpAmount(e.target.value)}
                          className="input-field text-sm"
                          min="1"
                          step="0.01"
                        />
                        <div className="relative">
                          <input
                            type="password"
                            maxLength={6}
                            inputMode="numeric"
                            placeholder="Enter PIN"
                            value={fcTopUpPin}
                            onChange={e => setFcTopUpPin(e.target.value.replace(/\D/g, ''))}
                            className="input-field text-sm"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={handleTopUp} disabled={topingUp} className="flex-1">
                            {topingUp ? 'Topping up...' : 'Add Money'}
                          </Button>
                          <button
                            onClick={() => { setShowTopUp(false); setFcTopUpAmount(''); setFcTopUpPin(''); }}
                            className="px-3 text-sm text-gray-500"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {/* PIN Entry for Payment */}
                    {(foodCard?.balance || 0) >= (order?.totalAmount || 0) && (
                      <>
                        <div className="relative">
                          <input
                            type="password"
                            maxLength={6}
                            inputMode="numeric"
                            placeholder="Enter 4-6 digit PIN to pay"
                            value={fcPin}
                            onChange={e => setFcPin(e.target.value.replace(/\D/g, ''))}
                            className="input-field text-center text-lg font-bold tracking-widest"
                          />
                        </div>
                        <Button
                          onClick={handleFoodCardPay}
                          disabled={fcLoading || !fcPin || fcPin.length < 4}
                          className="w-full py-3"
                        >
                          {fcLoading ? (
                            <span className="flex items-center justify-center gap-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                              Processing...
                            </span>
                          ) : (
                            `Pay ${formatCurrency(order?.totalAmount)}`
                          )}
                        </Button>
                      </>
                    )}

                    <button
                      onClick={() => setSelectedMethod(null)}
                      className="w-full text-sm text-gray-500 hover:text-gray-700 py-1"
                    >
                      Back to payment methods
                    </button>
                  </div>
                )}
              </Card>
            )}
          </div>
        )}

        {/* Success State */}
        {paymentStep === 'success' && (
          <div className="space-y-4">
            <Card className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircleIcon className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-green-600 mb-1">Payment Successful!</h2>
              <p className="text-sm text-gray-500 mb-4">Your order has been placed</p>

              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 mb-4 inline-block">
                <QRCodeSVG value={qrValue} size={180} level="H" includeMargin />
              </div>

              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-1">Order Code</p>
                <p className="text-3xl font-bold font-mono tracking-widest text-primary-600">{order?.orderCode}</p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 text-left space-y-2 mb-4">
                {order?.items?.map((item, i) => (
                  <div key={item.id || i} className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      <span className="text-gray-400">{item.quantity}x</span> {item.menuItem?.name}
                    </span>
                    <span className="font-medium">{formatCurrency(item.unitPrice * item.quantity)}</span>
                  </div>
                ))}
                <div className="flex justify-between font-bold pt-2 border-t border-gray-200 dark:border-gray-700">
                  <span>Total</span>
                  <span className="text-primary-600">{formatCurrency(order?.totalAmount)}</span>
                </div>
              </div>

              <Badge variant="success">{getStatusLabel(order?.status)}</Badge>

              <div className="flex gap-3 mt-4">
                {user && <Button onClick={() => navigate('/orders')} variant="secondary" className="flex-1">View Orders</Button>}
                <Button onClick={() => navigate('/restaurants')} className="flex-1">Order Again</Button>
              </div>
            </Card>
          </div>
        )}

        {/* Failed State */}
        {paymentStep === 'failed' && (
          <Card className="p-6 text-center">
            <XCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-3" />
            <h2 className="text-xl font-bold text-red-600 mb-1">Payment Failed</h2>
            <p className="text-sm text-gray-500 mb-4">Your payment was not processed. Please try again.</p>
            {order?.paymentMethod === 'FOOD_CARD' ? (
              <p className="text-xs text-gray-400 mb-4">Your Food Card has not been charged</p>
            ) : null}
            <Button onClick={() => setPaymentStep('pay')} className="mt-2">Try Again</Button>
          </Card>
        )}
      </div>
    </div>
  );
}
