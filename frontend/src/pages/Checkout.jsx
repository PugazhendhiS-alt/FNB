import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { menuAPI, orderAPI, restaurantAPI } from '../api/endpoints';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { formatCurrency } from '../lib/utils';
import { MinusIcon, PlusIcon, ArrowLeftIcon, XMarkIcon, ShoppingBagIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const categoryIcons = {
  'Main Course': '🍛',
  'Appetizer': '🥟',
  'Bread': '🍞',
  'Pizza': '🍕',
  'Pasta': '🍝',
  'Sushi': '🍣',
  'Ramen': '🍜',
  'Dessert': '🍰',
  'Beverages': '🥤',
  'Salad': '🥗',
};

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
  const [activeCategory, setActiveCategory] = useState('');
  const [showCart, setShowCart] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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

  useEffect(() => {
    if (items.length > 0 && !activeCategory) {
      const cats = [...new Set(items.map(i => i.category).filter(Boolean))];
      if (cats.length > 0) setActiveCategory(cats[0]);
    }
  }, [items, activeCategory]);

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

  const getItemQty = (itemId) => cart[itemId] || 0;

  const cartItems = Object.entries(cart)
    .map(([id, qty]) => ({ ...items.find(i => i.id === id), quantity: qty }))
    .filter(i => i.name);

  const totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

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

  if (loading) return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mx-auto mb-3" />
        <p className="text-sm text-gray-500">Loading menu...</p>
      </div>
    </div>
  );

  const categories = [...new Set(items.map(i => i.category).filter(Boolean))];
  const filteredItems = searchQuery
    ? items.filter(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()) || i.description?.toLowerCase().includes(searchQuery.toLowerCase()))
    : items;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-32">
      {/* Restaurant Header */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="max-w-4xl mx-auto px-4 pt-4 pb-8">
          <button onClick={() => navigate('/restaurants')} className="flex items-center gap-1.5 text-white/80 hover:text-white mb-4 text-sm font-medium">
            <ArrowLeftIcon className="w-4 h-4" /> Back to Restaurants
          </button>
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center text-3xl shrink-0 shadow-lg backdrop-blur-sm">
              {restaurant?.name?.charAt(0) || '🍽️'}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold tracking-tight">{restaurant?.name}</h1>
              <p className="text-sm text-white/80 mt-1 line-clamp-1">{restaurant?.description}</p>
              <div className="flex items-center gap-3 mt-2 text-sm text-white/70">
                {restaurant?.cuisine && (
                  <span className="flex items-center gap-1">
                    <span>🍽️</span> {restaurant.cuisine}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <span>⭐</span> 4.5
                </span>
                <span className="flex items-center gap-1">
                  <span>🕐</span> 30-40 min
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="max-w-4xl mx-auto px-4 -mt-4 relative z-10">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md flex items-center px-4 py-2.5 gap-3">
          <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search for dishes..."
            className="flex-1 bg-transparent outline-none text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-gray-400 hover:text-gray-600">
              <XMarkIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Category Chips */}
      {!searchQuery && categories.length > 0 && (
        <div className="max-w-4xl mx-auto px-4 mt-4 overflow-x-auto hide-scrollbar">
          <div className="flex gap-2 pb-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                  activeCategory === cat
                    ? 'bg-primary-600 text-white shadow-md shadow-primary-600/20'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 shadow-sm border border-gray-200 dark:border-gray-700'
                }`}
              >
                <span>{categoryIcons[cat] || '🍽️'}</span>
                <span>{cat}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Menu Items */}
      <div className="max-w-4xl mx-auto px-4 mt-4 space-y-3">
        {searchQuery ? (
          <>
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Search Results ({filteredItems.length})
            </h2>
            {filteredItems.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <MagnifyingGlassIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No dishes found. Try a different search.</p>
              </div>
            )}
          </>
        ) : (
          categories.map(cat => (
            <div key={cat} id={`cat-${cat}`}>
              {activeCategory === cat && (
                <>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">{categoryIcons[cat] || '🍽️'}</span>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">{cat}</h2>
                  </div>
                  {items.filter(i => i.category === cat).map(item => (
                    <MenuItemCard
                      key={item.id}
                      item={item}
                      quantity={getItemQty(item.id)}
                      onAdd={() => addToCart(item)}
                      onRemove={() => removeFromCart(item)}
                    />
                  ))}
                </>
              )}
            </div>
          ))
        )}

        {!searchQuery && filteredItems.filter(i => !i.category || activeCategory === i.category).map(item => (
          activeCategory !== item.category && !item.category ? (
            <MenuItemCard
              key={item.id}
              item={item}
              quantity={getItemQty(item.id)}
              onAdd={() => addToCart(item)}
              onRemove={() => removeFromCart(item)}
            />
          ) : null
        ))}

        {searchQuery && filteredItems.map(item => (
          <MenuItemCard
            key={item.id}
            item={item}
            quantity={getItemQty(item.id)}
            onAdd={() => addToCart(item)}
            onRemove={() => removeFromCart(item)}
          />
        ))}
      </div>

      {/* Floating Cart Button (mobile) */}
      {totalItems > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white dark:from-gray-900 via-white/95 dark:via-gray-900/95 to-transparent z-50 lg:hidden">
          <button
            onClick={() => setShowCart(true)}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white rounded-xl py-3.5 px-4 flex items-center justify-between shadow-2xl shadow-primary-600/30 transition-all active:scale-[0.98]"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <ShoppingBagIcon className="w-4 h-4" />
              </div>
              <span className="font-semibold">{totalItems} item{totalItems > 1 ? 's' : ''}</span>
            </div>
            <span className="font-bold text-lg">{formatCurrency(totalAmount)}</span>
          </button>
        </div>
      )}

      {/* Desktop Cart Sidebar */}
      <div className="hidden lg:block fixed right-0 top-0 h-full w-96 bg-white dark:bg-gray-900 shadow-2xl border-l border-gray-200 dark:border-gray-800 z-40 overflow-y-auto">
        <div className="p-5">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-5">
            <ShoppingBagIcon className="w-5 h-5 text-primary-600" />
            Your Cart
          </h2>
          {totalItems === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <ShoppingBagIcon className="w-16 h-16 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Your cart is empty</p>
              <p className="text-sm mt-1">Add items from the menu</p>
            </div>
          ) : (
            <>
              <div className="space-y-3 mb-5">
                {cartItems.map(item => (
                  <div key={item.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3">
                    <div className="flex-1 min-w-0 mr-3">
                      <p className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">{item.name}</p>
                      <p className="text-xs text-gray-500">{formatCurrency(item.price)} each</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => removeFromCart(item)}
                        className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                      >
                        <MinusIcon className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-6 text-center font-semibold text-sm">{item.quantity}</span>
                      <button
                        onClick={() => addToCart(item)}
                        className="w-7 h-7 rounded-full bg-primary-600 text-white flex items-center justify-center hover:bg-primary-700 transition-colors"
                      >
                        <PlusIcon className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="text-right ml-3 min-w-[60px]">
                      <p className="font-semibold text-sm">{formatCurrency(item.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>

              {!user && (
                <div className="mb-4 space-y-2">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase">Your Details</h3>
                  <input
                    type="text"
                    value={guestInfo.name}
                    onChange={(e) => setGuestInfo({ ...guestInfo, name: e.target.value })}
                    className="input-field text-sm"
                    placeholder="Your name *"
                  />
                  <input
                    type="tel"
                    value={guestInfo.phone}
                    onChange={(e) => setGuestInfo({ ...guestInfo, phone: e.target.value })}
                    className="input-field text-sm"
                    placeholder="Phone (optional)"
                  />
                </div>
              )}

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2 mb-5">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Subtotal</span>
                  <span>{formatCurrency(totalAmount)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Delivery Fee</span>
                  <span className="text-green-600 font-medium">FREE</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-gray-100 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <span>Total</span>
                  <span className="text-primary-600">{formatCurrency(totalAmount)}</span>
                </div>
              </div>

              <Button
                onClick={placeOrder}
                disabled={placing || totalItems === 0}
                className="w-full py-3.5 text-base font-semibold rounded-xl"
              >
                {placing ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    Placing Order...
                  </span>
                ) : (
                  `Place Order • ${formatCurrency(totalAmount)}`
                )}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Mobile Cart Drawer */}
      {showCart && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowCart(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-900 rounded-t-2xl max-h-[80vh] overflow-y-auto animate-slide-up">
            <div className="sticky top-0 bg-white dark:bg-gray-900 pt-4 pb-2 px-5 border-b border-gray-200 dark:border-gray-800 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <ShoppingBagIcon className="w-5 h-5 text-primary-600" />
                  Your Cart ({totalItems})
                </h2>
                <button onClick={() => setShowCart(false)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-5 space-y-3">
              {cartItems.map(item => (
                <div key={item.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3">
                  <div className="flex-1 min-w-0 mr-3">
                    <p className="font-medium text-sm truncate">{item.name}</p>
                    <p className="text-xs text-gray-500">{formatCurrency(item.price)} each</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => removeFromCart(item)}
                      className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center"
                    >
                      <MinusIcon className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-6 text-center font-semibold text-sm">{item.quantity}</span>
                    <button
                      onClick={() => addToCart(item)}
                      className="w-7 h-7 rounded-full bg-primary-600 text-white flex items-center justify-center"
                    >
                      <PlusIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="text-right ml-3 min-w-[60px]">
                    <p className="font-semibold text-sm">{formatCurrency(item.price * item.quantity)}</p>
                  </div>
                </div>
              ))}
            </div>

            {!user && (
              <div className="px-5 mb-4 space-y-2">
                <input
                  type="text"
                  value={guestInfo.name}
                  onChange={(e) => setGuestInfo({ ...guestInfo, name: e.target.value })}
                  className="input-field text-sm"
                  placeholder="Your name *"
                />
                <input
                  type="tel"
                  value={guestInfo.phone}
                  onChange={(e) => setGuestInfo({ ...guestInfo, phone: e.target.value })}
                  className="input-field text-sm"
                  placeholder="Phone (optional)"
                />
              </div>
            )}

            <div className="px-5 pb-6 border-t border-gray-200 dark:border-gray-800 pt-4">
              <div className="flex justify-between text-lg font-bold mb-4">
                <span>Total</span>
                <span className="text-primary-600">{formatCurrency(totalAmount)}</span>
              </div>
              <Button
                onClick={placeOrder}
                disabled={placing || totalItems === 0}
                className="w-full py-3.5 text-base font-semibold rounded-xl"
              >
                {placing ? 'Placing Order...' : `Place Order • ${formatCurrency(totalAmount)}`}
              </Button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .animate-slide-up {
          animation: slideUp 0.3s ease-out;
        }
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

function MenuItemCard({ item, quantity, onAdd, onRemove }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 flex items-center gap-4 shadow-sm border border-gray-100 dark:border-gray-700/50 hover:shadow-md transition-shadow">
      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary-100 to-primary-50 dark:from-primary-900/40 dark:to-primary-800/20 flex items-center justify-center text-2xl shrink-0">
        {item.image ? (
          <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-xl" />
        ) : (
          '🍽️'
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{item.name}</h3>
        {item.description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">{item.description}</p>
        )}
        <p className="text-sm font-bold text-primary-600 mt-1.5">{formatCurrency(item.price)}</p>
      </div>
      <div className="shrink-0">
        {quantity > 0 ? (
          <div className="flex items-center gap-2 bg-primary-50 dark:bg-primary-900/30 rounded-lg p-1">
            <button
              onClick={onRemove}
              className="w-7 h-7 rounded-md bg-primary-600 text-white flex items-center justify-center hover:bg-primary-700 transition-colors"
            >
              <MinusIcon className="w-3.5 h-3.5" />
            </button>
            <span className="w-6 text-center font-bold text-sm text-primary-700 dark:text-primary-300">{quantity}</span>
            <button
              onClick={onAdd}
              className="w-7 h-7 rounded-md bg-primary-600 text-white flex items-center justify-center hover:bg-primary-700 transition-colors"
            >
              <PlusIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={onAdd}
            className="px-4 py-2 rounded-lg border-2 border-primary-600 text-primary-600 font-semibold text-sm hover:bg-primary-600 hover:text-white transition-all active:scale-95"
          >
            ADD
          </button>
        )}
      </div>
    </div>
  );
}
