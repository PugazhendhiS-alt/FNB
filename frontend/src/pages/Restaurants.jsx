import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { restaurantAPI, buildingAPI, authAPI } from '../api/endpoints';
import { useRole } from '../hooks/useRole';
import { useAuth } from '../context/AuthContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Table from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import PageHeader from '../components/ui/PageHeader';
import { ROLE_LABELS } from '../lib/constants';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon, UserIcon, QrCodeIcon, HomeModernIcon, PhotoIcon } from '@heroicons/react/24/outline';

export default function Restaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', cuisine: '', phone: '', image: '', buildingId: '' });
  const [imagePreview, setImagePreview] = useState('');
  const [assignedUsers, setAssignedUsers] = useState([]);
  const { canManageRestaurants, isCustomer, isSuperadmin, isBuildingManager } = useRole();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([fetchRestaurants(), fetchBuildings()]);
  }, []);

  const fetchRestaurants = async () => {
    try { const res = await restaurantAPI.getAll(); setRestaurants(res.data); }
    catch { toast.error('Failed to load restaurants'); }
    finally { setLoading(false); }
  };

  const fetchBuildings = async () => {
    try { const res = await buildingAPI.getAll(); setBuildings(res.data); }
    catch {}
  };

  const fetchUsers = async () => {
    try { const res = await authAPI.getUsers(); setAllUsers(res.data); }
    catch {}
  };

  const availableUsers = allUsers.filter(u =>
    !u.isSuperadmin && ['RESTAURANT_MANAGER', 'CHEF'].includes(u.role)
  );

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return toast.error('Image must be under 2MB');
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImagePreview(ev.target.result);
      setForm({ ...form, image: ev.target.result });
    };
    reader.readAsDataURL(file);
  };

  const toggleActive = async (rest) => {
    try {
      await restaurantAPI.update(rest.id, { isActive: !rest.isActive });
      toast.success(rest.isActive ? 'Restaurant deactivated' : 'Restaurant activated');
      fetchRestaurants();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to toggle status');
    }
  };

  const openCreate = () => {
    setEditing(null);
    const defaultBuildingId = isBuildingManager ? (user?.buildingId || '') : (buildings[0]?.id || '');
    setForm({ name: '', description: '', cuisine: '', phone: '', image: '', buildingId: defaultBuildingId });
    setImagePreview('');
    setAssignedUsers([]);
    fetchUsers();
    setModalOpen(true);
  };

  const openEdit = (rest) => {
    setEditing(rest);
    setForm({ name: rest.name, description: rest.description || '', cuisine: rest.cuisine || '', phone: rest.phone || '', image: rest.image || '', buildingId: rest.buildingId });
    setImagePreview(rest.image || '');
    fetchUsers();
    setAssignedUsers([]);
    setModalOpen(true);
  };

  const toggleUserAssignment = (userId) => {
    setAssignedUsers(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.buildingId) return toast.error('Name and building are required');
    try {
      const payload = { ...form, assignUserIds: assignedUsers };
      if (editing) {
        await restaurantAPI.update(editing.id, payload);
        toast.success('Restaurant updated');
      } else {
        await restaurantAPI.create(payload);
        toast.success('Restaurant created');
      }
      setModalOpen(false);
      fetchRestaurants();
    } catch (err) { toast.error(err.response?.data?.message || 'Operation failed'); }
  };

  const showQrCode = async (rest) => {
    try {
      const res = await restaurantAPI.getQrCode(rest.id);
      setQrData(res.data);
      setQrModalOpen(true);
    } catch {
      toast.error('Failed to generate QR code');
    }
  };

  const downloadQrCode = () => {
    if (!qrData) return;
    const link = document.createElement('a');
    link.download = `${qrData.restaurant}-qrcode.png`;
    link.href = qrData.qrCode;
    link.click();
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure?')) return;
    try { await restaurantAPI.delete(id); toast.success('Deleted'); fetchRestaurants(); }
    catch (err) { toast.error(err.response?.data?.message || 'Delete failed'); }
  };

  const columns = [
    {
      key: 'image', label: '',
      render: (val) => val ? <img src={val} alt="" className="w-10 h-10 rounded-lg object-cover" /> : <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center"><HomeModernIcon className="w-5 h-5 text-gray-400" /></div>,
    },
    { key: 'name', label: 'Name' },
    { key: 'cuisine', label: 'Cuisine' },
    { key: 'building', label: 'Building', render: (val) => val?.name || '-' },
    { key: 'phone', label: 'Phone' },
    {
      key: '_count', label: 'Menu Items / Users',
      render: (val) => (
        <div className="flex gap-2">
          <Badge variant="info">{val?.menuItems || 0} items</Badge>
          <Badge variant="purple">{val?.users || 0} users</Badge>
        </div>
      ),
    },
    {
      key: 'isActive', label: 'Status',
      render: (val, row) => (
        <button
          onClick={() => toggleActive(row)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${val ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'}`}
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${val ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
      ),
    },
    ...(!isCustomer ? [{
      key: 'actions', label: 'Actions',
      render: (_, row) => (
        <div className="flex gap-2">
          <button onClick={() => navigate(`/menu/${row.id}`)} className="p-1 hover:text-primary-600"><EyeIcon className="w-4 h-4" /></button>
          <button onClick={() => showQrCode(row)} className="p-1 hover:text-primary-600"><QrCodeIcon className="w-4 h-4" /></button>
          {canManageRestaurants && <button onClick={() => openEdit(row)} className="p-1 hover:text-primary-600"><PencilIcon className="w-4 h-4" /></button>}
          {canManageRestaurants && <button onClick={() => handleDelete(row.id)} className="p-1 hover:text-red-600"><TrashIcon className="w-4 h-4" /></button>}
        </div>
      ),
    }] : []),
  ];

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>;

  if (isCustomer) {
    return (
      <div className="space-y-6">
        <PageHeader title="Restaurants" icon={HomeModernIcon} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {restaurants.filter(r => r.isActive).map((rest) => (
            <div
              key={rest.id}
              className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all cursor-pointer group"
              onClick={() => navigate(`/checkout/${rest.id}`)}
            >
              <div className="h-36 bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center relative">
                <span className="text-5xl opacity-30">{rest.name?.charAt(0) || '🍽️'}</span>
                <div className="absolute top-3 right-3 bg-white/90 dark:bg-gray-900/90 rounded-full px-2 py-0.5 text-xs font-semibold flex items-center gap-1">
                  <span>⭐</span> 4.5
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg leading-tight">{rest.name}</h3>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                  {rest.cuisine && <span className="bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-2 py-0.5 rounded-full">{rest.cuisine}</span>}
                  <span>🕐 30-40 min</span>
                </div>
                <p className="text-xs text-gray-400 mb-3 line-clamp-1">{rest.building?.name}</p>
                {rest.description && <p className="text-xs text-gray-400 line-clamp-2 mb-3">{rest.description}</p>}
                <button
                  onClick={(e) => { e.stopPropagation(); navigate(`/checkout/${rest.id}`); }}
                  className="w-full py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-semibold transition-colors opacity-0 group-hover:opacity-100 lg:opacity-100"
                >
                  Order Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Restaurants"
        subtitle="Manage all restaurant locations"
        icon={HomeModernIcon}
        actions={canManageRestaurants && (
          <Button onClick={openCreate}><PlusIcon className="w-4 h-4 mr-1" /> Add Restaurant</Button>
        )}
      />
      <Card className="p-4 sm:p-6">
        <Table columns={columns} data={restaurants} searchable />
      </Card>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Restaurant' : 'Add Restaurant'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="Cuisine" value={form.cuisine} onChange={(e) => setForm({ ...form, cuisine: e.target.value })} />
          <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Building *</label>
            <select className="input-field" value={form.buildingId} onChange={(e) => setForm({ ...form, buildingId: e.target.value })} disabled={isBuildingManager}>
              {isBuildingManager
                ? buildings.filter(b => b.id === user?.buildingId).map(b => <option key={b.id} value={b.id}>{b.name}</option>)
                : buildings.map(b => <option key={b.id} value={b.id}>{b.name}</option>)
              }
            </select>
            {isBuildingManager && <p className="text-xs text-gray-400 mt-1">Building is fixed to your assigned building.</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea className="input-field" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Image</label>
            <div className="flex items-center gap-3">
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="w-16 h-16 rounded-lg object-cover border border-gray-200 dark:border-gray-700" />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center border border-gray-200 dark:border-gray-700">
                  <PhotoIcon className="w-6 h-6 text-gray-400" />
                </div>
              )}
              <input type="file" accept="image/*" onChange={handleImageChange} className="text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary-600 hover:file:bg-primary-100 dark:file:bg-primary-900/30 dark:file:text-primary-400" />
              {imagePreview && <button type="button" onClick={() => { setImagePreview(''); setForm({ ...form, image: '' }); }} className="text-xs text-red-500 hover:underline">Remove</button>}
            </div>
          </div>

          {isSuperadmin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
                <UserIcon className="w-4 h-4" /> Assign Restaurant Managers / Chefs
              </label>
              <div className="max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg divide-y divide-gray-200 dark:divide-gray-700">
                {availableUsers.length === 0 ? (
                  <p className="p-3 text-sm text-gray-400 text-center">No available users</p>
                ) : (
                  availableUsers.map((u) => (
                    <label key={u.id} className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={assignedUsers.includes(u.id)}
                        onChange={() => toggleUserAssignment(u.id)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{u.username}</p>
                        <p className="text-xs text-gray-400">{u.email} · <Badge variant="info">{ROLE_LABELS[u.role]}</Badge></p>
                      </div>
                    </label>
                  ))
                )}
              </div>
              <p className="text-xs text-gray-400 mt-1">{assignedUsers.length} user(s) selected</p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit">{editing ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </Modal>

      <Modal open={qrModalOpen} onClose={() => setQrModalOpen(false)} title="Restaurant QR Code">
        {qrData && (
          <div className="text-center space-y-4">
            <p className="font-medium text-lg">{qrData.restaurant}</p>
            <div className="bg-white p-6 rounded-xl inline-block shadow-sm border mx-auto">
              <img src={qrData.qrCode} alt="QR Code" className="w-48 h-48 mx-auto" />
            </div>
            <p className="text-xs text-gray-400 break-all max-w-xs mx-auto">{qrData.menuUrl}</p>
            <div className="flex gap-3 justify-center">
              <Button onClick={downloadQrCode} variant="secondary">Download PNG</Button>
              <Button onClick={() => { navigator.clipboard.writeText(qrData.menuUrl); toast.success('Link copied!'); }}>
                Copy Link
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}