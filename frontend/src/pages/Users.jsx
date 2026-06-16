import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { authAPI, buildingAPI, restaurantAPI, moduleAPI } from '../api/endpoints';
import { ROLES, ROLE_LABELS, ROLE_HIERARCHY, ROLE_DEFAULT_MODULES } from '../lib/constants';
import { useRole } from '../hooks/useRole';
import { useAuth } from '../context/AuthContext';
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
  const [modules, setModules] = useState([]);
  const [userModuleOverrides, setUserModuleOverrides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    username: '', email: '', password: '', role: 'CUSTOMER',
    phone: '', avatar: '', buildingId: '', restaurantId: '',
  });
  const [selectedModules, setSelectedModules] = useState([]);
  const [avatarPreview, setAvatarPreview] = useState('');
  const { isSuperadmin, currentRole, canManageUsers } = useRole();
  const { user: currentUser } = useAuth();

  const isManager = currentRole === 'BUILDING_MANAGER' || currentRole === 'RESTAURANT_MANAGER';

  const getDefaultModuleIds = (role) => {
    const defaultKeys = ROLE_DEFAULT_MODULES[role] || [];
    return modules.filter(m => defaultKeys.includes(m.key)).map(m => m.id);
  };

  useEffect(() => { Promise.all([fetchUsers(), fetchBuildings(), fetchRestaurants(), ...(isSuperadmin ? [fetchModules()] : [])]); }, []);

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

  const fetchModules = async () => {
    try {
      const [modRes, ovrRes] = await Promise.all([moduleAPI.getAll(), moduleAPI.getOverrides()]);
      setModules(modRes.data);
      setUserModuleOverrides(ovrRes.data.userOverrides || []);
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
    const defaults = { username: '', email: '', password: '', role: 'CUSTOMER', phone: '', avatar: '', buildingId: '', restaurantId: '' };
    if (currentRole === 'BUILDING_MANAGER') {
      defaults.buildingId = currentUser?.buildingId || '';
    } else if (currentRole === 'RESTAURANT_MANAGER') {
      defaults.restaurantId = currentUser?.restaurantId || '';
    }
    setForm(defaults);
    setAvatarPreview('');
    setSelectedModules(getDefaultModuleIds('CUSTOMER'));
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
    const userOverrides = userModuleOverrides.filter(ov => ov.userId === user.id);
    setSelectedModules(userOverrides.filter(ov => ov.isEnabled).map(ov => ov.moduleId));
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
      if (currentRole === 'BUILDING_MANAGER') payload.buildingId = currentUser?.buildingId || null;
      if (currentRole === 'RESTAURANT_MANAGER') payload.restaurantId = currentUser?.restaurantId || null;
      let userId;
      if (editing) {
        if (!payload.password) delete payload.password;
        await authAPI.updateUser(editing.id, payload);
        toast.success('User updated');
        userId = editing.id;
      } else {
        const res = await authAPI.createUser(payload);
        toast.success('User created');
        userId = res.data.id || res.data.user?.id;
      }

      if (isSuperadmin) {
        const existingOverrides = userModuleOverrides.filter(ov => ov.userId === userId);
        for (const mod of modules) {
          const enabled = selectedModules.includes(mod.id);
          const existing = existingOverrides.find(ov => ov.moduleId === mod.id);
          if (existing) {
            if (existing.isEnabled !== enabled) {
              await moduleAPI.upsertUser({ userId, moduleId: mod.id, isEnabled: enabled });
            }
          } else {
            await moduleAPI.upsertUser({ userId, moduleId: mod.id, isEnabled: enabled });
          }
        }
      }

      setModalOpen(false);
      fetchUsers();
      if (isSuperadmin) fetchModules();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  };

  const toggleModule = (moduleId) => {
    setSelectedModules(prev =>
      prev.includes(moduleId) ? prev.filter(id => id !== moduleId) : [...prev, moduleId]
    );
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

  const currentUserLevel = ROLE_HIERARCHY[currentRole] || 0;
  const assignableRoles = roleOptions.filter(([key]) =>
    isSuperadmin ? true : ROLE_HIERARCHY[key] < currentUserLevel
  );

  const requiresBuilding = (role) => ['BUILDING_MANAGER'].includes(role);
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
      render: (val) => <Badge variant={val === 'SUPERADMIN' ? 'purple' : 'success'}>{ROLE_LABELS[val] || val}</Badge>,
    },
    {
      key: 'building', label: 'Building',
      render: (_, row) => <span className="text-sm">{row.building?.name || '-'}</span>,
    },
    {
      key: 'restaurant', label: 'Restaurant',
      render: (_, row) => <span className="text-sm">{row.restaurant?.name || '-'}</span>,
    },
    ...(isSuperadmin ? [{
      key: 'modules', label: 'Module Access',
      render: (_, row) => {
        const overrides = userModuleOverrides.filter(ov => ov.userId === row.id && ov.isEnabled);
        return overrides.length === 0
          ? <span className="text-xs text-gray-400">All</span>
          : <div className="flex flex-wrap gap-1 max-w-[200px]">
              {overrides.map(ov => {
                const m = modules.find(mod => mod.id === ov.moduleId);
                return m ? <Badge key={ov.id} variant="info" className="text-[10px]">{m.name}</Badge> : null;
              })}
            </div>;
      },
    }] : []),
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
        subtitle={isSuperadmin ? 'Manage system users, roles, and module access' : 'Manage users under your ' + (currentRole === 'BUILDING_MANAGER' ? 'building' : 'restaurant')}
        icon={UsersIcon}
        actions={canManageUsers && (
          <Button onClick={openCreate}><PlusIcon className="w-4 h-4 mr-1" /> Add User</Button>
        )}
      />

      {isManager && users.length === 0 && !loading && (
        <Card className="p-6 text-center">
          <p className="text-gray-400">No users found under your {currentRole === 'BUILDING_MANAGER' ? 'building' : 'restaurant'}.</p>
          <p className="text-xs text-gray-500 mt-1">Users you create will be automatically assigned to your context.</p>
        </Card>
      )}

      {users.length > 0 && (
        <Card className="p-4 sm:p-6">
          <Table columns={columns} data={users} searchable searchPlaceholder="Search users..." />
        </Card>
      )}

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
              onChange={(e) => {
                setForm({ ...form, role: e.target.value, buildingId: '', restaurantId: '' });
                if (!editing) setSelectedModules(getDefaultModuleIds(e.target.value));
              }}
            >
              {assignableRoles.map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          {isSuperadmin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Building</label>
              <select className="input-field" value={form.buildingId} onChange={(e) => setForm({ ...form, buildingId: e.target.value })}>
                <option value="">Select building...</option>
                {buildings.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
          )}
          {!isSuperadmin && requiresBuilding(form.role) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Building</label>
              {currentRole === 'BUILDING_MANAGER' ? (
                <input type="text" className="input-field bg-gray-50 dark:bg-gray-800 cursor-not-allowed" value={buildings.find(b => b.id === currentUser?.buildingId)?.name || 'Your building'} disabled />
              ) : (
                <select className="input-field" value={form.buildingId} onChange={(e) => setForm({ ...form, buildingId: e.target.value })}>
                  <option value="">Select building...</option>
                  {buildings.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              )}
            </div>
          )}

          {isSuperadmin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Restaurant</label>
              <select className="input-field" value={form.restaurantId} onChange={(e) => setForm({ ...form, restaurantId: e.target.value })}>
                <option value="">Select restaurant...</option>
                {restaurants.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
          )}
          {!isSuperadmin && requiresRestaurant(form.role) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Restaurant</label>
              {currentRole === 'RESTAURANT_MANAGER' ? (
                <input type="text" className="input-field bg-gray-50 dark:bg-gray-800 cursor-not-allowed" value={restaurants.find(r => r.id === currentUser?.restaurantId)?.name || 'Your restaurant'} disabled />
              ) : (
                <select className="input-field" value={form.restaurantId} onChange={(e) => setForm({ ...form, restaurantId: e.target.value })}>
                  <option value="">Select restaurant...</option>
                  {restaurants.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              )}
            </div>
          )}

          {isSuperadmin && modules.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Module Access</label>
              <p className="text-xs text-gray-400 mb-2">Select modules this user can access. Leave all unchecked for full access.</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {modules.map(mod => (
                  <label key={mod.id} className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors ${
                    selectedModules.includes(mod.id)
                      ? 'border-primary-300 bg-primary-50 dark:border-primary-700 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}>
                    <input
                      type="checkbox"
                      checked={selectedModules.includes(mod.id)}
                      onChange={() => toggleModule(mod.id)}
                      className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{mod.name}</span>
                  </label>
                ))}
              </div>
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
