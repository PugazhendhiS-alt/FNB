import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { buildingAPI, authAPI } from '../api/endpoints';
import { useRole } from '../hooks/useRole';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Table from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import PageHeader from '../components/ui/PageHeader';
import { ROLE_LABELS } from '../lib/constants';
import { PlusIcon, PencilIcon, TrashIcon, UserIcon, BuildingOffice2Icon } from '@heroicons/react/24/outline';

export default function Buildings() {
  const [buildings, setBuildings] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', address: '', phone: '', description: '' });
  const [assignedUsers, setAssignedUsers] = useState([]);
  const { canManageBuildings, isSuperadmin } = useRole();

  useEffect(() => { fetchBuildings(); }, []);

  const fetchBuildings = async () => {
    try {
      const res = await buildingAPI.getAll();
      setBuildings(res.data);
    } catch { toast.error('Failed to load buildings'); }
    finally { setLoading(false); }
  };

  const fetchUsers = async () => {
    try {
      const res = await authAPI.getUsers();
      setAllUsers(res.data);
    } catch {}
  };

  const availableUsers = allUsers.filter(u => 
    !u.isSuperadmin && ['ADMIN', 'BUILDING_MANAGER'].includes(u.role)
  );

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', address: '', phone: '', description: '' });
    setAssignedUsers([]);
    fetchUsers();
    setModalOpen(true);
  };

  const openEdit = (building) => {
    setEditing(building);
    setForm({ name: building.name, address: building.address, phone: building.phone || '', description: building.description || '' });
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
    if (!form.name || !form.address) return toast.error('Name and address are required');
    try {
      const payload = { ...form, assignUserIds: assignedUsers };
      if (editing) {
        await buildingAPI.update(editing.id, payload);
        toast.success('Building updated');
      } else {
        await buildingAPI.create(payload);
        toast.success('Building created');
      }
      setModalOpen(false);
      fetchBuildings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this building?')) return;
    try {
      await buildingAPI.delete(id);
      toast.success('Building deleted');
      fetchBuildings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'address', label: 'Address' },
    { key: 'phone', label: 'Phone' },
    {
      key: '_count', label: 'Restaurants / Users',
      render: (val) => (
        <div className="flex gap-2">
          <Badge variant="info">{val?.restaurants || 0} restaurants</Badge>
          <Badge variant="purple">{val?.users || 0} users</Badge>
        </div>
      ),
    },
    {
      key: 'isActive', label: 'Status',
      render: (val) => <Badge variant={val ? 'success' : 'danger'}>{val ? 'Active' : 'Inactive'}</Badge>,
    },
    ...(canManageBuildings ? [{
      key: 'actions', label: 'Actions',
      render: (_, row) => (
        <div className="flex gap-2">
          <button onClick={() => openEdit(row)} className="p-1 hover:text-primary-600"><PencilIcon className="w-4 h-4" /></button>
          <button onClick={() => handleDelete(row.id)} className="p-1 hover:text-red-600"><TrashIcon className="w-4 h-4" /></button>
        </div>
      ),
    }] : []),
  ];

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Buildings"
        subtitle="Manage building locations"
        icon={BuildingOffice2Icon}
        actions={canManageBuildings && (
          <Button onClick={openCreate}><PlusIcon className="w-4 h-4 mr-1" /> Add Building</Button>
        )}
      />

      <Card className="p-4 sm:p-6">
        <Table columns={columns} data={buildings} searchable />
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Building' : 'Add Building'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="Address *" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea className="input-field" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>

          {isSuperadmin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
                <UserIcon className="w-4 h-4" /> Assign Building Managers / Admins
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
    </div>
  );
}