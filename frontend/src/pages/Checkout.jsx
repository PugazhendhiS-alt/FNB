import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { menuAPI, orderAPI, restaurantAPI } from '../api/endpoints';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { formatCurrency } from '../lib/utils';
import { MinusIcon, PlusIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function Checkout() {
  const { restaurantId } = useParams();
  const navigate = useNavigate();
  const { user, isGuest } = useAuth();
  const [items, setItems] = useState([]);
  const [restaurant, setRestaurant] = useState(null);
  const [cart, setCart] = useState({});
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [guestInfo, setGuestInfo] = useState({ name: '', phone: '' });

  useEffect(() => {
    if (!restaurantId) {
      toast.error('No restaurant selected');
      navigate('/restaurants');
      return;
    }
    Promise.all([
      restaurantAPI.getById(restaurantId).then(r => setRestaurant(r.data)),
      menuAPI.getAll({ restaurantId }).then(r => setItems(r.data.filter(i => i.available))),
    ]).catch(() => toast.error('Failed to load menu'))
      .finally(() => setLoading(false));
  }, [restaurantId]);

  const addToCart = (item) => {
    setCart(prev => ({ ...prev, [item.id]: (prev[item.id] || 0) + 1 }));
  };

  const removeFromCart = (item) => {
    setCart(prev => {
      const qty = (prev[item.id] || 0) - 1;
      if (qty <= 0) {
        const { [item.id]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [item.id]: qty };
    });
  };

  const cartItems = Object.entries(cart)
    .map(([id, qty]) => ({ ...items.find(i => i.id === id), quantity: qty }))
    .filter(i => i.name);

  const totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const placeOrder = async () => {
    if (cartItems.length === 0) return toast.error('Cart is empty');
    if (!user && !isGuest && !guestInfo.name) {
      toast.error('Please enter your name to place an order');
      return;
    }
    setPlacing(true);
    try {
      if (!user && isGuest) {
        const res = await orderAPI.createGuest({
          restaurantId,
          items: cartItems.map(i => ({ menuItemId: i.id, quantity: i.quantity })),
          guestName: guestInfo.name || 'Guest',
          guestPhone: guestInfo.phone || undefined,
        });
        navigate(`/order-success/${res.data.order.id}`);
      } else {
        const res = await orderAPI.create({
          restaurantId,
          items: cartItems.map(i => ({ menuItemId: i.id, quantity: i.quantity })),
        });
        navigate(`/order-success/${res.data.id}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>;

  const categories = [...new Set(items.map(i => i.category).filter(Boolean))];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/restaurants')} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
          <ArrowLeftIcon className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold">{restaurant?.name}</h1>
          <p className="text-sm text-gray-500">{restaurant?.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {categories.map(cat => (
            <div key={cat}>
              <h2 className="text-lg font-semibold mb-3 text-primary-600">{cat}</h2>
              <div className="space-y-2">
                {items.filter(i => i.category === cat).map(item => (
                  <Card key={item.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium">{item.name}</h3>
                        {item.description && <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>}
                        <p className="text-sm font-bold text-primary-600 mt-1">{formatCurrency(item.price)}</p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        {cart[item.id] ? (
                          <div className="flex items-center gap-2">
                            <button onClick={() => removeFromCart(item)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                              <MinusIcon className="w-4 h-4" />
                            </button>
                            <span className="w-6 text-center font-medium text-sm">{cart[item.id]}</span>
                            <button onClick={() => addToCart(item)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                              <PlusIcon className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <Button onClick={() => addToCart(item)} variant="primary" className="text-xs px-3 py-1">
                            Add
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-1 space-y-4">
          {!user && (
            <Card className="p-4">
              <h3 className="text-sm font-semibold mb-3">Your Details</h3>
              <input
                type="text"
                value={guestInfo.name}
                onChange={(e) => setGuestInfo({ ...guestInfo, name: e.target.value })}
                className="input-field text-sm mb-2"
                placeholder="Your name *"
              />
              <input
                type="tel"
                value={guestInfo.phone}
                onChange={(e) => setGuestInfo({ ...guestInfo, phone: e.target.value })}
                className="input-field text-sm"
                placeholder="Phone (optional)"
              />
            </Card>
          )}
          <Card className="p-4 sticky top-6">
            <h2 className="text-lg font-semibold mb-4">Your Cart</h2>
            {cartItems.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">Cart is empty</p>
            ) : (
              <>
                <div className="space-y-3 mb-4">
                  {cartItems.map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>x{item.quantity} {item.name}</span>
                      <span className="font-medium">{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>{formatCurrency(totalAmount)}</span>
                  </div>
                </div>
                <Button onClick={placeOrder} disabled={placing || cartItems.length === 0} className="w-full mt-4">
                  {placing ? 'Placing Order...' : 'Place Order'}
                </Button>
              </>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}