import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { authAPI, buildingAPI, restaurantAPI } from '../api/endpoints';
import { ROLES, ROLE_LABELS, ROLE_HIERARCHY } from '../lib/constants';
import { useRole } from '../hooks/useRole';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Table from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import PageHeader from '../components/ui/PageHeader';
import { PlusIcon, PencilIcon, TrashIcon, UsersIcon, PhotoIcon } from '@heroicons/react/24/outline';

const roleOptions = Object.entries(ROLE_LABELS);

export default function Users() {
  const [users, setUsers] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    username: '', email: '', password: '', role: 'CUSTOMER',
    phone: '', avatar: '', buildingId: '', restaurantId: '',
  });
  const [avatarPreview, setAvatarPreview] = useState('');
  const { isAdmin, isSuperadmin, currentRole } = useRole();

  useEffect(() => { Promise.all([fetchUsers(), fetchBuildings(), fetchRestaurants()]); }, []);

  const fetchUsers = async () => {
    try {
      const res = await authAPI.getUsers();
      setUsers(res.data);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  };

  const fetchBuildings = async () => {
    try {
      const res = await buildingAPI.getAll();
      setBuildings(res.data);
    } catch {}
  };

  const fetchRestaurants = async () => {
    try {
      const res = await restaurantAPI.getAll();
      setRestaurants(res.data);
    } catch {}
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return toast.error('Image must be under 2MB');
    const reader = new FileReader();
    reader.onload = (ev) => {
      setAvatarPreview(ev.target.result);
      setForm({ ...form, avatar: ev.target.result });
    };
    reader.readAsDataURL(file);
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ username: '', email: '', password: '', role: 'CUSTOMER', phone: '', avatar: '', buildingId: '', restaurantId: '' });
    setAvatarPreview('');
    setModalOpen(true);
  };

  const openEdit = (user) => {
    setEditing(user);
    setForm({
      username: user.username, email: user.email, password: '',
      role: user.role, phone: user.phone || '', avatar: user.avatar || '',
      buildingId: user.buildingId || '',
      restaurantId: user.restaurantId || '',
    });
    setAvatarPreview(user.avatar || '');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.email) return toast.error('Username and email are required');
    if (!editing && !form.password) return toast.error('Password is required');
    try {
      const payload = { ...form };
      if (!payload.phone) delete payload.phone;
      if (!payload.buildingId) payload.buildingId = null;
      if (!payload.restaurantId) payload.restaurantId = null;
      if (editing) {
        if (!payload.password) delete payload.password;
        await authAPI.updateUser(editing.id, payload);
        toast.success('User updated');
      } else {
        await authAPI.createUser(payload);
        toast.success('User created');
      }
      setModalOpen(false);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await authAPI.deleteUser(id);
      toast.success('User deleted');
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const isSuperadminUser = isSuperadmin;
  const currentUserLevel = ROLE_HIERARCHY[currentRole] || 0;
  const assignableRoles = roleOptions.filter(([key]) =>
    isSuperadminUser ? true : ROLE_HIERARCHY[key] < currentUserLevel
  );

  const requiresBuilding = (role) => ['ADMIN', 'BUILDING_MANAGER'].includes(role);
  const requiresRestaurant = (role) => ['RESTAURANT_MANAGER', 'CHEF'].includes(role);

  const columns = [
    {
      key: 'avatar', label: '',
      render: (val) => val ? <img src={val} alt="" className="w-9 h-9 rounded-full object-cover" /> : <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-xs font-bold text-primary-600"><UsersIcon className="w-5 h-5" /></div>,
    },
    { key: 'username', label: 'Username' },
    { key: 'email', label: 'Email' },
    {
      key: 'role', label: 'Role',
      render: (val) => <Badge variant={val === 'SUPERADMIN' ? 'purple' : val === 'ADMIN' ? 'info' : 'success'}>{ROLE_LABELS[val] || val}</Badge>,
    },
    {
      key: 'buildingId', label: 'Building',
      render: (val) => {
        const b = buildings.find(b => b.id === val);
        return <span className="text-sm">{b?.name || '-'}</span>;
      },
    },
    {
      key: 'restaurantId', label: 'Restaurant',
      render: (val) => {
        const r = restaurants.find(r => r.id === val);
        return <span className="text-sm">{r?.name || '-'}</span>;
      },
    },
    {
      key: 'actions', label: 'Actions',
      render: (_, row) => (
        <div className="flex gap-2">
          <button onClick={() => openEdit(row)} className="p-1 hover:text-primary-600"><PencilIcon className="w-4 h-4" /></button>
          <button onClick={() => handleDelete(row.id)} className="p-1 hover:text-red-600"><TrashIcon className="w-4 h-4" /></button>
        </div>
      ),
    },
  ];

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        subtitle="Manage system users and roles"
        icon={UsersIcon}
        actions={isAdmin && (
          <Button onClick={openCreate}><PlusIcon className="w-4 h-4 mr-1" /> Add User</Button>
        )}
      />

      <Card className="p-4 sm:p-6">
        <Table columns={columns} data={users} searchable searchPlaceholder="Search users..." />
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit User' : 'Add User'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-4 mb-2">
            {avatarPreview ? (
              <img src={avatarPreview} alt="Avatar" className="w-16 h-16 rounded-full object-cover border border-gray-200 dark:border-gray-700" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center border border-gray-200 dark:border-gray-700">
                <PhotoIcon className="w-7 h-7 text-gray-400" />
              </div>
            )}
            <div>
              <input type="file" accept="image/*" onChange={handleAvatarChange} className="text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary-600 hover:file:bg-primary-100 dark:file:bg-primary-900/30 dark:file:text-primary-400" />
              {avatarPreview && <button type="button" onClick={() => { setAvatarPreview(''); setForm({ ...form, avatar: '' }); }} className="text-xs text-red-500 hover:underline mt-1 block">Remove</button>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Username *" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
            <Input label="Email *" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label={editing ? 'Password (leave blank to keep)' : 'Password *'} type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role *</label>
            <select
              className="input-field"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value, buildingId: '', restaurantId: '' })}
            >
              {assignableRoles.map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
          {requiresBuilding(form.role) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Building</label>
              <select
                className="input-field"
                value={form.buildingId}
                onChange={(e) => setForm({ ...form, buildingId: e.target.value })}
              >
                <option value="">Select building...</option>
                {buildings.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          )}
          {requiresRestaurant(form.role) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Restaurant</label>
              <select
                className="input-field"
                value={form.restaurantId}
                onChange={(e) => setForm({ ...form, restaurantId: e.target.value })}
              >
                <option value="">Select restaurant...</option>
                {restaurants.map((r) => (
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
