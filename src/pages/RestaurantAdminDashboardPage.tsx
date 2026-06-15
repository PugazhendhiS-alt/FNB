import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { MenuItem } from '@/types/data';
import { useAdmin } from '@/contexts/AdminContext';
import { useCafeteriaAdmin } from '@/contexts/CafeteriaAdminContext';
import { useOrders } from '@/contexts/OrderContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RestaurantFormModal } from '@/components/admin/RestaurantFormModal';
import { MenuItemFormModal } from '@/components/admin/MenuItemFormModal';
import { LogOut, Search, Settings, Clock, CheckCircle, AlertCircle, TrendingUp, Edit2, Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function RestaurantAdminDashboardPage() {
  const navigate = useNavigate();
  const { currentUser, logout } = useAdmin();
  const { cafeterias, updateCafeteria, menuItems } = useCafeteriaAdmin();
  const { orders, updateOrderStatus } = useOrders();
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'menu' | 'settings'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | undefined>();

  // Only show for restaurant admins
  if (!currentUser || currentUser.role !== 'admin') {
    navigate('/login');
    return null;
  }

  const assignedCafeteria = cafeterias.find((c) => c.id === currentUser.assignedCafeteriaIds?.[0]);

  if (!assignedCafeteria) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">Restaurant not assigned</p>
            <Button onClick={() => logout()}>Logout</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const cafeteriaOrders = orders.filter((o) => o.cafeteriaId === assignedCafeteria.id);
  const cafeteriaMenuItems = menuItems.filter((m) => m.cafeteriaId === assignedCafeteria.id);

  const pendingOrders = cafeteriaOrders.filter((o) => o.status === 'pending');
  const confirmedOrders = cafeteriaOrders.filter((o) => o.status === 'confirmed');
  const readyOrders = cafeteriaOrders.filter((o) => o.status === 'ready');
  const completedOrders = cafeteriaOrders.filter((o) => o.status === 'completed');

  const filteredOrders = useMemo(() => {
    return cafeteriaOrders.filter((order) =>
      order.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [cafeteriaOrders, searchQuery]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleOrderStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await updateOrderStatus(orderId, newStatus as any);
      toast.success(`Order status updated to ${newStatus}`);
    } catch (error) {
      toast.error('Error updating order status');
    }
  };

  const handleToggleRestaurantStatus = async () => {
    try {
      await updateCafeteria(assignedCafeteria.id, { isOpen: !assignedCafeteria.isOpen });
      toast.success(`Restaurant marked ${assignedCafeteria.isOpen ? 'inactive' : 'active'}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error updating restaurant status');
    }
  };

  const handleOpenMenuModal = (item?: MenuItem) => {
    setEditingMenuItem(item);
    setIsMenuModalOpen(true);
  };

  const handleCloseMenuModal = () => {
    setEditingMenuItem(undefined);
    setIsMenuModalOpen(false);
  };

  const handleSaveRestaurant = async (cafeData: any) => {
    try {
      await updateCafeteria(assignedCafeteria.id, cafeData);
      toast.success('Restaurant settings updated!');
      setIsEditModalOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error updating restaurant');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'preparing':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'ready':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'completed':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-background to-secondary">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur-sm shadow-sm">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{assignedCafeteria.name}</h1>
            <p className="text-sm text-muted-foreground mt-1">Admin Dashboard</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              Logged in as: <span className="font-semibold">{currentUser.name}</span>
            </span>
            <Button variant="outline" onClick={handleLogout} className="gap-2">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        {/* Overview Stats */}
        {activeTab === 'overview' && (
          <div className="grid gap-4 md:grid-cols-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  Pending
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-600">{pendingOrders.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  Confirmed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">{confirmedOrders.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Clock className="h-4 w-4 text-orange-600" />
                  Ready
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600">{readyOrders.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Completed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{completedOrders.length}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as any)}>
          <TabsList className="grid w-full max-w-2xl grid-cols-4 mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="menu">Menu Items</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Quick Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Orders</span>
                    <span className="font-bold">{cafeteriaOrders.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Menu Items</span>
                    <span className="font-bold">{cafeteriaMenuItems.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Revenue (Today)</span>
                    <span className="font-bold text-green-600">
                      ₹{completedOrders.reduce((sum, o) => sum + o.totalAmount, 0)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Restaurant Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {assignedCafeteria.cuisine && (
                    <div>
                      <p className="text-sm text-muted-foreground">Cuisine</p>
                      <p className="font-semibold">{assignedCafeteria.cuisine}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className="font-semibold">
                      {assignedCafeteria.isOpen ? '🟢 Open' : '⚫ Closed'}
                    </p>
                  </div>
                  {assignedCafeteria.openTime && assignedCafeteria.closeTime && (
                    <div>
                      <p className="text-sm text-muted-foreground">Hours</p>
                      <p className="font-semibold">
                        {assignedCafeteria.openTime} - {assignedCafeteria.closeTime}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Orders Management</CardTitle>
                <CardDescription>View and manage all orders</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Search */}
                <div className="mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by customer name, email or order ID..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Orders List */}
                <div className="grid gap-4">
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => (
                      <Card key={order.id} className="overflow-hidden">
                        <CardContent className="pt-6">
                          <div className="grid md:grid-cols-3 gap-4 mb-4">
                            <div>
                              <p className="text-sm text-muted-foreground">Order ID</p>
                              <p className="font-mono font-bold text-sm">{order.id}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Customer</p>
                              <p className="font-semibold">{order.userName}</p>
                              <p className="text-sm text-muted-foreground">{order.userEmail}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Total Amount</p>
                              <p className="text-2xl font-bold text-green-600">₹{order.totalAmount}</p>
                            </div>
                          </div>

                          <div className="mb-4 space-y-2">
                            <p className="text-sm font-semibold">Items:</p>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              {order.items.map((item) => (
                                <li key={item.id}>
                                  • {item.name} x{item.quantity} - ₹{item.price * item.quantity}
                                </li>
                              ))}
                            </ul>
                          </div>

                          {order.specialInstructions && (
                            <div className="mb-4 p-2 bg-secondary rounded text-sm">
                              <p className="font-semibold text-muted-foreground">Special Instructions:</p>
                              <p>{order.specialInstructions}</p>
                            </div>
                          )}

                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div className="flex items-center gap-2">
                              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getStatusColor(order.status)}`}>
                                {order.status.toUpperCase()}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(order.createdAt).toLocaleTimeString()}
                              </span>
                            </div>
                            <select
                              value={order.status}
                              onChange={(e) => handleOrderStatusChange(order.id, e.target.value)}
                              className="px-3 py-1 rounded-md border border-input bg-background text-sm cursor-pointer"
                            >
                              <option value="pending">Pending</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="preparing">Preparing</option>
                              <option value="ready">Ready</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      {cafeteriaOrders.length === 0 ? 'No orders yet' : 'No matching orders found'}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Menu Tab */}
          <TabsContent value="menu">
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle>Menu Items</CardTitle>
                    <CardDescription>Current menu items for this restaurant</CardDescription>
                  </div>
                  <Button onClick={() => handleOpenMenuModal()} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Item
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {cafeteriaMenuItems.length > 0 ? (
                    cafeteriaMenuItems.map((item) => (
                      <Card key={item.id} className="overflow-hidden">
                        <div className="flex flex-col md:flex-row">
                          {item.image && (
                            <div className="h-24 w-full md:h-24 md:w-24 flex-shrink-0">
                              <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                            </div>
                          )}
                          <div className="flex-1 p-4">
                            <h3 className="font-bold">{item.name}</h3>
                            <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                            <div className="flex flex-wrap gap-2">
                              <span className="text-sm font-bold text-green-600">₹{item.price}</span>
                              <span className="text-xs bg-secondary px-2 py-1 rounded">{item.category}</span>
                              {item.isVegan && (
                                <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 px-2 py-1 rounded">Vegan</span>
                              )}
                              {item.isVeg && !item.isVegan && (
                                <span className="text-xs bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-200 px-2 py-1 rounded">Veg</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="border-t border-input p-4 flex justify-end">
                          <Button variant="outline" size="sm" onClick={() => handleOpenMenuModal(item)} className="gap-2">
                            <Edit2 className="h-4 w-4" />
                            Edit
                          </Button>
                        </div>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">No menu items found</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Restaurant Settings
                  </CardTitle>
                  <Button onClick={() => setIsEditModalOpen(true)} className="gap-2">
                    <Edit2 className="h-4 w-4" />
                    Edit Restaurant
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Restaurant Name</p>
                    <p className="text-lg font-semibold">{assignedCafeteria.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Cuisine Type</p>
                    <p className="text-lg font-semibold">{assignedCafeteria.cuisine || 'Not set'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Operating Hours</p>
                    <p className="text-lg font-semibold">
                      {assignedCafeteria.openTime && assignedCafeteria.closeTime 
                        ? `${assignedCafeteria.openTime} to ${assignedCafeteria.closeTime}`
                        : 'Not set'}
                    </p>
                  </div>
                  <div className="rounded-md border border-input p-4">
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className="text-lg font-semibold mb-3">
                      {assignedCafeteria.isOpen ? '✅ Active' : '❌ Inactive'}
                    </p>
                    <Button variant="outline" onClick={handleToggleRestaurantStatus}>
                      Set {assignedCafeteria.isOpen ? 'Inactive' : 'Active'}
                    </Button>
                  </div>
                  {assignedCafeteria.image && (
                    <div>
                      <p className="text-sm text-muted-foreground">Restaurant Image</p>
                      <img src={assignedCafeteria.image} alt={assignedCafeteria.name} className="mt-2 h-32 w-full object-cover rounded-lg" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Restaurant Edit Modal */}
      <RestaurantFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveRestaurant}
        cafeteria={assignedCafeteria}
        availableAdmins={[]}
        mode="restaurantadmin"
      />

      <MenuItemFormModal
        isOpen={isMenuModalOpen}
        onClose={handleCloseMenuModal}
        menuItem={editingMenuItem}
        cafeteriaId={assignedCafeteria.id}
        cafeterias={[{ id: assignedCafeteria.id, name: assignedCafeteria.name }]}
      />
    </div>
  );
}
