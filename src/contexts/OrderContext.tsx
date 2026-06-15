import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { createRemoteResource, getRemoteResource, updateRemoteResource } from '@/lib/remoteApi';

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image: string;
}

export interface Order {
  id: string;
  cafeteriaId: string;
  userId: string;
  userName: string;
  userEmail: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  specialInstructions?: string;
  createdAt: string;
  updatedAt: string;
}

interface OrderRow {
  id: string;
  cafeteriaId?: string;
  cafeteria_id?: string;
  userId?: string;
  user_id?: string;
  userName?: string;
  user_name?: string;
  userEmail?: string;
  user_email?: string;
  items?: OrderItem[];
  totalAmount?: number;
  total_amount?: number;
  status?: OrderStatus;
  specialInstructions?: string;
  special_instructions?: string;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
}

interface OrderContextType {
  orders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<Order | null>;
  getOrdersByCafeteria: (cafeteriaId: string) => Order[];
  getOrderById: (orderId: string) => Order | undefined;
  deleteOrder: (orderId: string) => void;
  remoteSyncAvailable: boolean | null;
  remoteSyncError: string | null;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

// Mock orders for demo
const MOCK_ORDERS: Order[] = [
  {
    id: 'ord1',
    cafeteriaId: 'c1',
    userId: 'user1',
    userName: 'Rajesh Kumar',
    userEmail: 'rajesh@example.com',
    items: [
      { id: 'm1', name: 'Grilled Paneer Salad', quantity: 1, price: 180, image: '' },
      { id: 'm3', name: 'Mango Lassi', quantity: 2, price: 90, image: '' },
    ],
    totalAmount: 360,
    status: 'pending',
    specialInstructions: 'Less spicy, extra cilantro',
    createdAt: new Date(Date.now() - 30 * 60000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 60000).toISOString(),
  },
  {
    id: 'ord2',
    cafeteriaId: 'c2',
    userId: 'user2',
    userName: 'Priya Sharma',
    userEmail: 'priya@example.com',
    items: [
      { id: 'm4', name: 'Butter Chicken Thali', quantity: 1, price: 250, image: '' },
    ],
    totalAmount: 250,
    status: 'confirmed',
    createdAt: new Date(Date.now() - 60 * 60000).toISOString(),
    updatedAt: new Date(Date.now() - 45 * 60000).toISOString(),
  },
  {
    id: 'ord3',
    cafeteriaId: 'c1',
    userId: 'user3',
    userName: 'Amit Patel',
    userEmail: 'amit@example.com',
    items: [
      { id: 'm5', name: 'Paneer Tikka Wrap', quantity: 2, price: 160, image: '' },
      { id: 'm6', name: 'Masala Fries', quantity: 1, price: 120, image: '' },
    ],
    totalAmount: 440,
    status: 'ready',
    createdAt: new Date(Date.now() - 120 * 60000).toISOString(),
    updatedAt: new Date(Date.now() - 20 * 60000).toISOString(),
  },
];

const normalizeOrder = (row: OrderRow): Order => ({
  id: row.id,
  cafeteriaId: row.cafeteriaId ?? row.cafeteria_id ?? '',
  userId: row.userId ?? row.user_id ?? '',
  userName: row.userName ?? row.user_name ?? '',
  userEmail: row.userEmail ?? row.user_email ?? '',
  items: row.items ?? [],
  totalAmount: row.totalAmount ?? row.total_amount ?? 0,
  status: row.status ?? 'pending',
  specialInstructions: row.specialInstructions ?? row.special_instructions,
  createdAt: row.createdAt ?? row.created_at ?? new Date().toISOString(),
  updatedAt: row.updatedAt ?? row.updated_at ?? new Date().toISOString(),
});

export const OrderProvider = ({ children }: { children: ReactNode }) => {
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [remoteSyncAvailable, setRemoteSyncAvailable] = useState<boolean | null>(null);
  const [remoteSyncError, setRemoteSyncError] = useState<string | null>(null);

  const loadLocalData = () => {
    const storedOrders = localStorage.getItem('orders');
    if (storedOrders) {
      try {
        setOrders(JSON.parse(storedOrders));
      } catch {
        setOrders(MOCK_ORDERS);
      }
    }
  };

  const saveLocalData = () => {
    localStorage.setItem('orders', JSON.stringify(orders));
  };

  const fetchOrdersFromRemote = async (): Promise<Order[]> => {
    const data = await getRemoteResource<OrderRow[]>('/orders');
    return (data ?? []).map(normalizeOrder);
  };

  const createOrderRemote = async (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order> => {
    const data = await createRemoteResource<
      Omit<Order, 'id' | 'createdAt' | 'updatedAt'>,
      OrderRow
    >('/orders', order);
    return normalizeOrder(data);
  };

  const updateOrderStatusRemote = async (orderId: string, status: OrderStatus): Promise<Order | null> => {
    const data = await updateRemoteResource<{ status: OrderStatus }, OrderRow>(`/orders/${orderId}`, {
      status,
    });
    return data ? normalizeOrder(data) : null;
  };

  useEffect(() => {
    loadLocalData();

    const loadRemoteOrders = async () => {
      try {
        const remoteOrders = await fetchOrdersFromRemote();
        setOrders(remoteOrders);
        setRemoteSyncAvailable(true);
        setRemoteSyncError(null);
      } catch (error) {
        setRemoteSyncAvailable(false);
        setRemoteSyncError(error instanceof Error ? error.message : 'Remote orders sync failed');
        console.warn('Unable to load orders from remote API, falling back to local storage:', error);
      }
    };

    loadRemoteOrders();
  }, []);

  useEffect(() => {
    saveLocalData();
  }, [orders]);

  useEffect(() => {
    const interval = window.setInterval(async () => {
      try {
        const remoteOrders = await fetchOrdersFromRemote();
        setOrders(remoteOrders);
        setRemoteSyncAvailable(true);
        setRemoteSyncError(null);
      } catch (error) {
        setRemoteSyncAvailable(false);
        setRemoteSyncError(error instanceof Error ? error.message : 'Remote orders sync failed');
        console.warn('Remote order sync retry failed:', error);
      }
    }, 10000);

    return () => window.clearInterval(interval);
  }, [remoteSyncAvailable]);

  const addOrder = async (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newOrder = await createOrderRemote(order);
      setOrders((prev) => [newOrder, ...prev]);
      return newOrder;
    } catch (error) {
      console.warn('Failed to create order in remote API, falling back to local storage:', error);
      const newOrder: Order = {
        ...order,
        id: `ord_${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setOrders((prev) => [newOrder, ...prev]);
      return newOrder;
    }
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      const updatedOrder = await updateOrderStatusRemote(orderId, status);
      if (updatedOrder) {
        setOrders((prev) => prev.map((order) => (order.id === orderId ? updatedOrder : order)));
        return updatedOrder;
      }
    } catch (error) {
      console.warn('Failed to update order status in remote API, falling back to local storage:', error);
    }

    const existingOrder = orders.find((order) => order.id === orderId);
    const updatedOrder = existingOrder
      ? { ...existingOrder, status, updatedAt: new Date().toISOString() }
      : null;

    if (updatedOrder) {
      setOrders((prev) => prev.map((order) => (order.id === orderId ? updatedOrder : order)));
    }
    return updatedOrder;
  };

  const getOrdersByCafeteria = (cafeteriaId: string) => {
    return orders.filter((order) => order.cafeteriaId === cafeteriaId);
  };

  const getOrderById = (orderId: string) => {
    return orders.find((order) => order.id === orderId);
  };

  const deleteOrder = (orderId: string) => {
    setOrders((prev) => prev.filter((order) => order.id !== orderId));
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        addOrder,
        updateOrderStatus,
        getOrdersByCafeteria,
        getOrderById,
        deleteOrder,
        remoteSyncAvailable,
        remoteSyncError,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrders must be used within OrderProvider');
  }
  return context;
};
