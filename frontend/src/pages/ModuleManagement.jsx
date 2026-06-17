import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { moduleAPI, buildingAPI, restaurantAPI } from '../api/endpoints';
import { authAPI } from '../api/endpoints';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import PageHeader from '../components/ui/PageHeader';
import Badge from '../components/ui/Badge';
import { PuzzlePieceIcon, PlusIcon, TrashIcon, UsersIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { ROLE_DEFAULT_MODULES, ROLE_LABELS } from '../lib/constants';

const LEVELS = [
  { key: 'building', label: 'Building', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
  { key: 'restaurant', label: 'Restaurant', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
  { key: 'user', label: 'User', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' },
];

const moduleKeyToName = {};

export default function ModuleManagement() {
  const [modules, setModules] = useState([]);
  const [overrides, setOverrides] = useState({ buildingOverrides: [], restaurantOverrides: [], userOverrides: [] });
  const [buildings, setBuildings] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeLevel, setActiveLevel] = useState('building');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ entityId: '', moduleId: '', isEnabled: true });

  useEffect(() => {
    Promise.all([
      moduleAPI.getAll(),
      moduleAPI.getOverrides(),
      buildingAPI.getAll(),
      restaurantAPI.getAll({}),
      authAPI.getUsers(),
    ]).then(([modRes, ovrRes, bldRes, rstRes, usrRes]) => {
      setModules(modRes.data);
      setOverrides(ovrRes.data);
      setBuildings(bldRes.data);
      setRestaurants(rstRes.data);
      setUsers(usrRes.data);
      modRes.data.forEach(m => { moduleKeyToName[m.key] = m.name; });
    }).catch(() => toast.error('Failed to load module data'))
    .finally(() => setLoading(false));
  }, []);

  const currentOverrides = overrides[`${activeLevel}Overrides`] || [];

  const getEntityName = (id) => {
    if (activeLevel === 'building') return buildings.find(b => b.id === id)?.name || id;
    if (activeLevel === 'restaurant') return restaurants.find(r => r.id === id)?.name || id;
    const u = users.find(u => u.id === id);
    return u ? u.username : id;
  };

  const getEntityOptions = () => {
    if (activeLevel === 'building') return buildings.map(b => ({ value: b.id, label: b.name }));
    if (activeLevel === 'restaurant') return restaurants.map(r => ({ value: r.id, label: r.name }));
    return users.map(u => ({ value: u.id, label: `${u.username} (${ROLE_LABELS[u.role] || u.role})` }));
  };

  const handleSave = async () => {
    try {
      const fn = activeLevel === 'building' ? moduleAPI.upsertBuilding
        : activeLevel === 'restaurant' ? moduleAPI.upsertRestaurant
        : moduleAPI.upsertUser;
      const payload = { ...form };
      if (activeLevel === 'user') payload.userId = payload.entityId;
      else if (activeLevel === 'building') payload.buildingId = payload.entityId;
      else if (activeLevel === 'restaurant') payload.restaurantId = payload.entityId;
      delete payload.entityId;
      await fn(payload);
      toast.success('Override saved');
      setModalOpen(false);
      setForm({ entityId: '', moduleId: '', isEnabled: true });
      const res = await moduleAPI.getOverrides();
      setOverrides(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    }
  };

  const handleDelete = async (id) => {
    try {
      const fn = activeLevel === 'building' ? moduleAPI.deleteBuilding
        : activeLevel === 'restaurant' ? moduleAPI.deleteRestaurant
        : moduleAPI.deleteUser;
      await fn(id);
      toast.success('Override removed');
      const res = await moduleAPI.getOverrides();
      setOverrides(res.data);
    } catch {
      toast.error('Delete failed');
    }
  };

  const getUserEffectiveModules = (userId) => {
    const user = users.find(u => u.id === userId);
    const userOverrides = overrides.userOverrides.filter(ov => ov.userId === userId);
    if (userOverrides.length > 0) {
      return {
        source: 'override',
        modules: modules.filter(m => {
          const ov = userOverrides.find(o => o.moduleId === m.id);
          return ov ? ov.isEnabled : false;
        }),
      };
    }
    const defaultKeys = ROLE_DEFAULT_MODULES[user?.role] || [];
    return {
      source: 'role',
      modules: modules.filter(m => defaultKeys.includes(m.key)),
    };
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>;

  return (
    <div className="space-y-6">
      <PageHeader title="Module Management" subtitle="Enable or disable modules at building, restaurant, and user level" icon={PuzzlePieceIcon} />

      <div className="flex gap-2 flex-wrap">
        {LEVELS.map(l => (
          <button key={l.key} onClick={() => setActiveLevel(l.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeLevel === l.key ? l.color + ' ring-2 ring-offset-1' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400'}`}
          >
            {l.label}
          </button>
        ))}
        <button onClick={() => setActiveLevel('user-modules')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeLevel === 'user-modules' ? 'bg-orange-100 text-orange-700 ring-2 ring-offset-1 dark:bg-orange-900/30 dark:text-orange-300' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400'}`}
        >
          <UsersIcon className="w-4 h-4 inline mr-1" />
          User Modules
        </button>
        <div className="flex-1" />
        {activeLevel !== 'user-modules' && (
          <Button onClick={() => { setForm({ entityId: '', moduleId: '', isEnabled: true }); setModalOpen(true); }}>
            <PlusIcon className="w-4 h-4 mr-1" /> Add Override
          </Button>
        )}
      </div>

      {activeLevel === 'user-modules' ? (
        <div className="space-y-4">
          {users.map(user => {
            const { source, modules: userMods } = getUserEffectiveModules(user.id);
            const disabledMods = modules.filter(m => !userMods.find(um => um.id === m.id));
            return (
              <Card key={user.id} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{user.username}</p>
                    <p className="text-xs text-gray-400">{user.email}</p>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      <Badge variant={user.role === 'SUPERADMIN' ? 'purple' : 'success'}>{ROLE_LABELS[user.role] || user.role}</Badge>
                      <Badge variant="info" className="text-[10px]">{source === 'override' ? 'Custom' : 'Role Defaults'}</Badge>
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                  <p className="text-xs font-medium text-gray-500 mb-2">Enabled Modules ({userMods.length})</p>
                  <div className="flex flex-wrap gap-1.5">
                    {userMods.map(m => (
                      <Badge key={m.id} variant="success" className="text-[11px]">
                        <CheckCircleIcon className="w-3 h-3 mr-0.5" />
                        {m.name}
                      </Badge>
                    ))}
                    {userMods.length === 0 && <span className="text-xs text-gray-400">No modules enabled</span>}
                  </div>
                  {disabledMods.length > 0 && (
                    <>
                      <p className="text-xs font-medium text-gray-500 mt-3 mb-2">Disabled Modules ({disabledMods.length})</p>
                      <div className="flex flex-wrap gap-1.5">
                        {disabledMods.map(m => (
                          <Badge key={m.id} variant="danger" className="text-[11px]">
                            <XCircleIcon className="w-3 h-3 mr-0.5" />
                            {m.name}
                          </Badge>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </Card>
            );
          })}
          {users.length === 0 && (
            <Card className="p-6 text-center">
              <p className="text-gray-400 text-sm">No users found.</p>
            </Card>
          )}
        </div>
      ) : (
        <Card>
          {currentOverrides.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No overrides for this level</p>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {currentOverrides.map(ov => {
                const mod = modules.find(m => m.id === ov.moduleId);
                const entityId = ov[`${activeLevel}Id`];
                return (
                  <div key={ov.id} className="flex items-center justify-between py-3 px-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <Badge variant={ov.isEnabled ? 'success' : 'danger'}>{ov.isEnabled ? 'Enabled' : 'Disabled'}</Badge>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{mod?.name || ov.moduleId}</p>
                        <p className="text-xs text-gray-400">{getEntityName(entityId)}</p>
                      </div>
                    </div>
                    <button onClick={() => handleDelete(ov.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors">
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={`Add ${LEVELS.find(l => l.key === activeLevel)?.label} Override`}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{LEVELS.find(l => l.key === activeLevel)?.label}</label>
            <select value={form.entityId} onChange={e => setForm(f => ({ ...f, entityId: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm">
              <option value="">Select {LEVELS.find(l => l.key === activeLevel)?.label?.toLowerCase()}...</option>
              {getEntityOptions().map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Module</label>
            <select value={form.moduleId} onChange={e => setForm(f => ({ ...f, moduleId: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm">
              <option value="">Select module...</option>
              {modules.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
            <select value={form.isEnabled} onChange={e => setForm(f => ({ ...f, isEnabled: e.target.value === 'true' }))}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm">
              <option value="true">Enabled</option>
              <option value="false">Disabled</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <Button onClick={handleSave} className="flex-1">Save</Button>
            <Button variant="secondary" onClick={() => setModalOpen(false)} className="flex-1">Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
