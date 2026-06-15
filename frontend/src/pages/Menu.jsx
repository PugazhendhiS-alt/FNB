import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { menuAPI, restaurantAPI } from '../api/endpoints';
import { useRole } from '../hooks/useRole';
import { useAuth } from '../context/AuthContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import PageHeader from '../components/ui/PageHeader';
import { formatCurrency } from '../lib/utils';
import { PlusIcon, PencilIcon, TrashIcon, ShoppingCartIcon, FunnelIcon, RectangleStackIcon } from '@heroicons/react/24/outline';

export default function Menu() {
  const { restaurantId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', price: '', category: '', restaurantId: '' });
  const [allRestaurants, setAllRestaurants] = useState([]);
  const [filterRestaurantId, setFilterRestaurantId] = useState('');
  const { canManageMenu, isCustomer, isRestaurantManager } = useRole();

  useEffect(() => {
    if (restaurantId) {
      fetchRestaurantData();
    } else {
      fetchAllRestaurants();
      fetchAllItems();
    }
  }, [restaurantId]);

  const fetchRestaurants = async () => {
    try { const res = await restaurantAPI.getAll(); setAllRestaurants(res.data); }
    catch { /* ignore */ }
  };

  const fetchAllRestaurants = fetchRestaurants;

  const fetchRestaurantData = async () => {
    try {
      const [restRes, menuRes] = await Promise.all([
        restaurantAPI.getById(restaurantId),
        menuAPI.getAll({ restaurantId }),
      ]);
      setRestaurant(restRes.data);
      setItems(menuRes.data);
    } catch { toast.error('Failed to load menu'); }
    finally { setLoading(false); }
  };

  const fetchAllItems = async () => {
    try {
      const params = filterRestaurantId ? { restaurantId: filterRestaurantId } : {};
      const res = await menuAPI.getAll(params);
      setItems(res.data);
    }
    catch { toast.error('Failed to load menu items'); }
    finally { setLoading(false); }
  };

  const handleFilterChange = (rid) => {
    setFilterRestaurantId(rid);
    if (!rid) {
      fetchAllItems();
    } else {
      menuAPI.getAll({ restaurantId: rid }).then(res => { setItems(res.data); setLoading(false); });
    }
  };

  const openCreate = () => {
    setEditing(null);
    const defaultRestaurantId = restaurantId || (isRestaurantManager ? user?.restaurantId : filterRestaurantId) || '';
    setForm({ name: '', description: '', price: '', category: '', restaurantId: defaultRestaurantId });
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({ name: item.name, description: item.description || '', price: String(item.price), category: item.category || '', restaurantId: item.restaurantId });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.restaurantId) return toast.error('Name, price, and restaurant are required');
    try {
      if (editing) {
        await menuAPI.update(editing.id, form);
        toast.success('Item updated');
      } else {
        await menuAPI.create(form);
        toast.success('Item created');
      }
      setModalOpen(false);
      restaurantId ? fetchRestaurantData() : fetchAllItems();
    } catch (err) { toast.error(err.response?.data?.message || 'Operation failed'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure?')) return;
    try { await menuAPI.delete(id); toast.success('Deleted'); restaurantId ? fetchRestaurantData() : fetchAllItems(); }
    catch (err) { toast.error(err.response?.data?.message || 'Delete failed'); }
  };

  const toggleAvailable = async (item) => {
    try {
      await menuAPI.update(item.id, { available: !item.available });
      toast.success(item.available ? 'Item hidden' : 'Item available');
      restaurantId ? fetchRestaurantData() : fetchAllItems();
    } catch (err) { toast.error('Failed to update'); }
  };

  const categories = [...new Set(items.map(i => i.category).filter(Boolean))];

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>;

  return (
    <div className="space-y-6">
      <PageHeader
        title={restaurant ? restaurant.name : 'Menu Items'}
        subtitle={restaurant?.description || 'Browse and manage menu items'}
        icon={RectangleStackIcon}
        actions={
          <>
            {isCustomer && restaurantId && (
              <Button onClick={() => navigate(`/checkout/${restaurantId}`)}>
                <ShoppingCartIcon className="w-4 h-4 mr-1" /> Order Now
              </Button>
            )}
            {canManageMenu && (
              <Button onClick={openCreate}><PlusIcon className="w-4 h-4 mr-1" /> Add Item</Button>
            )}
          </>
        }
      />

      {isCustomer && restaurant ? (
        <div className="space-y-6">
          {categories.map(cat => (
            <div key={cat}>
              <h2 className="text-lg font-semibold mb-3 text-primary-600">{cat}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.filter(i => i.category === cat && i.available).map(item => (
                  <Card key={item.id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{item.name}</h3>
                        {item.description && <p className="text-xs text-gray-500 mt-1">{item.description}</p>}
                      </div>
                      <p className="text-lg font-bold text-primary-600">{formatCurrency(item.price)}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
          {items.filter(i => i.available).length === 0 && (
            <Card className="p-8 text-center">
              <p className="text-gray-400">No menu items available</p>
            </Card>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <FunnelIcon className="w-4 h-4 text-gray-400" />
            <select
              value={filterRestaurantId}
              onChange={(e) => handleFilterChange(e.target.value)}
              className="input-field w-auto max-w-xs text-sm"
            >
              <option value="">All Restaurants</option>
              {allRestaurants.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
            <span className="text-xs text-gray-400">{items.length} items</span>
          </div>
          <Card className="p-4 sm:p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Restaurant</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Available</th>
                    {canManageMenu && <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {items.map(item => (
                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium">{item.name}</p>
                        {item.description && <p className="text-xs text-gray-400">{item.description}</p>}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{item.restaurant?.name || '-'}</td>
                      <td className="px-4 py-3 text-sm">{item.category || '-'}</td>
                      <td className="px-4 py-3 text-sm font-medium">{formatCurrency(item.price)}</td>
                      <td className="px-4 py-3">
                        <Badge variant={item.available ? 'success' : 'danger'}>{item.available ? 'Available' : 'Unavailable'}</Badge>
                      </td>
                      {canManageMenu && (
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button onClick={() => openEdit(item)} className="p-1 hover:text-primary-600"><PencilIcon className="w-4 h-4" /></button>
                            <button onClick={() => toggleAvailable(item)} className="p-1 hover:text-yellow-600 text-xs">{item.available ? 'Hide' : 'Show'}</button>
                            <button onClick={() => handleDelete(item.id)} className="p-1 hover:text-red-600"><TrashIcon className="w-4 h-4" /></button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
              {items.length === 0 && (
                <div className="text-center py-12 text-gray-400 text-sm">No menu items found</div>
              )}
            </div>
          </Card>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Menu Item' : 'Add Menu Item'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="Price *" type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          <Input label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea className="input-field" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          {!restaurantId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Restaurant *</label>
              <select
                className="input-field"
                value={form.restaurantId}
                onChange={(e) => setForm({ ...form, restaurantId: e.target.value })}
                disabled={isRestaurantManager && !!user?.restaurantId}
              >
                <option value="">Select a restaurant</option>
                {allRestaurants.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit">{editing ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}