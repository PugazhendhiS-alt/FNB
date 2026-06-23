import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { inventoryAPI } from '../api/endpoints';
import { useRole } from '../hooks/useRole';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import PageHeader from '../components/ui/PageHeader';
import Input from '../components/ui/Input';
import { formatCurrency } from '../lib/utils';
import {
  CubeIcon, PlusIcon, PencilIcon, TrashIcon, FunnelIcon,
  ArrowPathIcon, CheckCircleIcon, XCircleIcon, DocumentArrowDownIcon,
} from '@heroicons/react/24/outline';

const TABS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'items', label: 'Items' },
  { id: 'categories', label: 'Categories' },
  { id: 'vendors', label: 'Vendors' },
  { id: 'purchase-orders', label: 'Purchase Orders' },
  { id: 'grn', label: 'Goods Receipt' },
  { id: 'transfers', label: 'Transfers' },
  { id: 'adjustments', label: 'Adjustments' },
  { id: 'stock-count', label: 'Stock Count' },
  { id: 'wastage', label: 'Wastage' },
  { id: 'recipes', label: 'Recipe Mapping' },
  { id: 'movements', label: 'Movements' },
];

export default function Inventory() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'dashboard');
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [adjustments, setAdjustments] = useState([]);
  const [wastage, setWastage] = useState([]);
  const [movements, setMovements] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const { canManageMenu, isChef } = useRole();
  const canEdit = canManageMenu || isChef;

  const switchTab = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const calls = [];
      if (activeTab === 'dashboard') calls.push(inventoryAPI.getDashboard().then(r => setDashboard(r.data)));
      if (['items', 'dashboard', 'movements', 'adjustments', 'stock-count', 'wastage'].includes(activeTab)) calls.push(inventoryAPI.getItems().then(r => setItems(r.data)));
      if (['categories', 'items'].includes(activeTab)) calls.push(inventoryAPI.getCategories().then(r => setCategories(r.data)));
      if (['vendors', 'purchase-orders', 'items'].includes(activeTab)) calls.push(inventoryAPI.getVendors().then(r => setVendors(r.data)));
      if (['purchase-orders'].includes(activeTab)) calls.push(inventoryAPI.getPurchaseOrders().then(r => setPurchaseOrders(r.data)));
      if (['transfers'].includes(activeTab)) calls.push(inventoryAPI.getTransfers().then(r => setTransfers(r.data)));
      if (['adjustments'].includes(activeTab)) calls.push(inventoryAPI.getAdjustments().then(r => setAdjustments(r.data)));
      if (['wastage'].includes(activeTab)) calls.push(inventoryAPI.getWastage().then(r => setWastage(r.data)));
      if (['movements'].includes(activeTab)) calls.push(inventoryAPI.getMovements({}).then(r => setMovements(r.data)));
      if (['recipes'].includes(activeTab)) {
        calls.push(inventoryAPI.getRecipes({}).then(r => setRecipes(r.data)));
        try {
          const { menuAPI } = await import('../api/endpoints');
          const res = await menuAPI.getAll({});
          setMenuItems(res.data);
        } catch {}
      }
      await Promise.all(calls);
    } catch { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  };

  const catMap = {};
  categories.forEach(c => { catMap[c.id] = c; });

  return (
    <div className="space-y-6">
      <PageHeader title="Inventory" subtitle="Manage inventory, stock, and procurement" icon={CubeIcon} />

      <div className="flex overflow-x-auto gap-1 pb-2 scrollbar-none border-b border-gray-200 dark:border-gray-700">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => switchTab(tab.id)}
            className={`px-3 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>
      ) : (
        <>
          {activeTab === 'dashboard' && <DashboardSection data={dashboard} />}
          {activeTab === 'items' && <ItemsSection items={items} categories={catMap} vendors={vendors} canEdit={canEdit} onRefresh={fetchData} />}
          {activeTab === 'categories' && <CategoriesSection items={categories} canEdit={canEdit} onRefresh={fetchData} />}
          {activeTab === 'vendors' && <VendorsSection items={vendors} canEdit={canEdit} onRefresh={fetchData} />}
          {activeTab === 'purchase-orders' && <PurchaseOrdersSection items={purchaseOrders} vendors={vendors} canEdit={canEdit} onRefresh={fetchData} />}
          {activeTab === 'transfers' && <TransfersSection items={transfers} canEdit={canEdit} onRefresh={fetchData} />}
          {activeTab === 'adjustments' && <AdjustmentsSection items={adjustments} inventoryItems={items} canEdit={canEdit} onRefresh={fetchData} />}
          {activeTab === 'wastage' && <WastageSection items={wastage} inventoryItems={items} canEdit={canEdit} onRefresh={fetchData} />}
          {activeTab === 'movements' && <MovementsSection items={movements} />}
          {activeTab === 'recipes' && <RecipesSection recipes={recipes} menuItems={menuItems} inventoryItems={items} canEdit={canEdit} onRefresh={fetchData} />}
        </>
      )}
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

function DashboardSection({ data }) {
  if (!data) return <Card className="p-8 text-center text-gray-400">Loading dashboard...</Card>;
  const stats = [
    { label: 'Total Items', value: data.totalItems, color: 'blue' },
    { label: 'Total Value', value: formatCurrency(data.totalValue), color: 'green' },
    { label: 'Low Stock Items', value: data.lowStock, color: 'yellow' },
    { label: 'Out of Stock', value: data.outOfStock, color: 'red' },
  ];
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <Card key={s.label} className="p-4 text-center">
            <p className="text-2xl font-bold text-gray-800 dark:text-white">{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {data.lowStockItems?.length > 0 && (
          <Card className="p-4">
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-yellow-500" /> Low Stock Items</h3>
            <div className="space-y-2">
              {data.lowStockItems.map(i => (
                <div key={i.id} className="flex justify-between text-sm"><span>{i.name}</span><span className="text-yellow-600 font-medium">{i.stock?.available || 0} {i.unit}</span></div>
              ))}
            </div>
          </Card>
        )}
        {data.expiringItems?.length > 0 && (
          <Card className="p-4">
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-500" /> Expiring Soon</h3>
            <div className="space-y-2">
              {data.expiringItems.map(i => (
                <div key={i.id} className="flex justify-between text-sm"><span>{i.name}</span><span className="text-red-600 text-xs">{new Date(i.expiryDate).toLocaleDateString()}</span></div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

// ─── Items ────────────────────────────────────────────────────────────────────

function ItemsSection({ items, categories, vendors, canEdit, onRefresh }) {
  const [modal, setModal] = useState(false);
  const [edit, setEdit] = useState(null);
  const [form, setForm] = useState({ name: '', sku: '', categoryId: '', unit: 'pcs', costPrice: 0, sellingPrice: 0, vendorId: '', reorderLevel: 0, reorderQty: 0, minStock: 0, maxStock: 0, storageLocation: '', batchNo: '', isActive: true });

  const openCreate = () => { setEdit(null); setForm({ name: '', sku: `SKU-${Date.now()}`, categoryId: '', unit: 'pcs', costPrice: 0, sellingPrice: 0, vendorId: '', reorderLevel: 0, reorderQty: 0, minStock: 0, maxStock: 0, storageLocation: '', batchNo: '', isActive: true }); setModal(true); };
  const openEdit = (item) => { setEdit(item); setForm({ name: item.name, sku: item.sku, categoryId: item.categoryId || '', unit: item.unit, costPrice: item.costPrice, sellingPrice: item.sellingPrice, vendorId: item.vendorId || '', reorderLevel: item.reorderLevel, reorderQty: item.reorderQty, minStock: item.minStock, maxStock: item.maxStock, storageLocation: item.storageLocation || '', batchNo: item.batchNo || '', isActive: item.isActive }); setModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (edit) { await inventoryAPI.updateItem(edit.id, form); toast.success('Item updated'); }
      else { await inventoryAPI.createItem(form); toast.success('Item created'); }
      setModal(false); onRefresh();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this item?')) return;
    try { await inventoryAPI.deleteItem(id); toast.success('Deleted'); onRefresh(); }
    catch { toast.error('Delete failed'); }
  };

  const [search, setSearch] = useState('');
  const filtered = items.filter(i => !search || i.name.toLowerCase().includes(search.toLowerCase()) || i.sku.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <input className="input-field max-w-xs" placeholder="Search items..." value={search} onChange={e => setSearch(e.target.value)} />
        {canEdit && <Button onClick={openCreate}><PlusIcon className="w-4 h-4 mr-1" /> Add Item</Button>}
      </div>
      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-gray-200 dark:border-gray-700 text-left text-gray-500">
            <th className="p-3 font-medium">Name</th><th className="p-3 font-medium">Stock Keeping Unit</th><th className="p-3 font-medium">Category</th>
            <th className="p-3 font-medium">Stock</th><th className="p-3 font-medium">Cost</th><th className="p-3 font-medium">Reorder</th>
            <th className="p-3 font-medium">Status</th><th className="p-3 font-medium">Actions</th>
          </tr></thead>
          <tbody>
            {filtered.map(item => (
              <tr key={item.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td className="p-3 font-medium">{item.name}</td>
                <td className="p-3 text-gray-500 font-mono text-xs">{item.sku}</td>
                <td className="p-3 text-gray-500">{item.category?.name || '-'}</td>
                <td className="p-3">
                  <span className={item.stock?.available <= item.reorderLevel && item.reorderLevel > 0 ? 'text-red-600 font-medium' : 'text-gray-700 dark:text-gray-300'}>
                    {item.stock?.available || 0} {item.unit}
                  </span>
                </td>
                <td className="p-3">{formatCurrency(item.costPrice)}</td>
                <td className="p-3 text-xs">{item.reorderLevel > 0 ? `${item.reorderLevel} ${item.unit}` : '-'}</td>
                <td className="p-3"><Badge variant={item.isActive ? 'success' : 'danger'}>{item.isActive ? 'Active' : 'Inactive'}</Badge></td>
                <td className="p-3">
                  <div className="flex gap-1">
                    {canEdit && <button onClick={() => openEdit(item)} className="btn-ghost-icon"><PencilIcon className="w-4 h-4" /></button>}
                    {canEdit && <button onClick={() => handleDelete(item.id)} className="btn-ghost-icon hover:!text-red-500"><TrashIcon className="w-4 h-4" /></button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="text-center py-8 text-gray-400">No items found</p>}
      </Card>

      <Modal open={modal} onClose={() => setModal(false)} title={edit ? 'Edit Item' : 'Add Item'}>
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            <Input label="Stock Keeping Unit *" value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">Category</label>
              <select className="input-field" value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })}>
                <option value="">None</option>
                {Object.values(categories).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select></div>
            <Input label="Unit" value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Cost Price" type="number" step="0.01" value={form.costPrice} onChange={e => setForm({ ...form, costPrice: parseFloat(e.target.value) || 0 })} />
            <Input label="Selling Price" type="number" step="0.01" value={form.sellingPrice} onChange={e => setForm({ ...form, sellingPrice: parseFloat(e.target.value) || 0 })} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Input label="Reorder Level" type="number" value={form.reorderLevel} onChange={e => setForm({ ...form, reorderLevel: parseFloat(e.target.value) || 0 })} />
            <Input label="Reorder Qty" type="number" value={form.reorderQty} onChange={e => setForm({ ...form, reorderQty: parseFloat(e.target.value) || 0 })} />
            <Input label="Min Stock" type="number" value={form.minStock} onChange={e => setForm({ ...form, minStock: parseFloat(e.target.value) || 0 })} />
          </div>
          <Input label="Storage Location" value={form.storageLocation} onChange={e => setForm({ ...form, storageLocation: e.target.value })} />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModal(false)}>Cancel</Button>
            <Button type="submit">{edit ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

// ─── Categories ───────────────────────────────────────────────────────────────

function CategoriesSection({ items, canEdit, onRefresh }) {
  const [modal, setModal] = useState(false);
  const [edit, setEdit] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', parentId: '' });

  const openCreate = () => { setEdit(null); setForm({ name: '', description: '', parentId: '' }); setModal(true); };
  const openEdit = (c) => { setEdit(c); setForm({ name: c.name, description: c.description || '', parentId: c.parentId || '' }); setModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (edit) { await inventoryAPI.updateCategory(edit.id, form); toast.success('Updated'); }
      else { await inventoryAPI.createCategory(form); toast.success('Created'); }
      setModal(false); onRefresh();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const rootCats = items.filter(c => !c.parentId);
  return (
    <div className="space-y-4">
      {canEdit && <Button onClick={openCreate}><PlusIcon className="w-4 h-4 mr-1" /> Add Category</Button>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {rootCats.map(cat => (
          <Card key={cat.id} className="p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{cat.name}</h3>
              {canEdit && <button onClick={() => openEdit(cat)} className="btn-ghost-icon"><PencilIcon className="w-4 h-4" /></button>}
            </div>
            {cat.description && <p className="text-xs text-gray-500 mt-1">{cat.description}</p>}
            <p className="text-xs text-gray-400 mt-2">{cat._count?.items || 0} items</p>
            {items.filter(c => c.parentId === cat.id).map(sub => (
              <div key={sub.id} className="ml-3 mt-2 text-sm text-gray-600 dark:text-gray-400 flex justify-between">
                <span>{sub.name}</span>
                <span className="text-xs">{sub._count?.items || 0} items</span>
              </div>
            ))}
          </Card>
        ))}
      </div>
      <Modal open={modal} onClose={() => setModal(false)} title={edit ? 'Edit Category' : 'Add Category'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <div><label className="block text-sm font-medium mb-1">Description</label>
            <textarea className="input-field" rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
          <div><label className="block text-sm font-medium mb-1">Parent Category</label>
            <select className="input-field" value={form.parentId} onChange={e => setForm({ ...form, parentId: e.target.value })}>
              <option value="">None (Root)</option>
              {items.filter(c => c.id !== edit?.id).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select></div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModal(false)}>Cancel</Button>
            <Button type="submit">{edit ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

// ─── Vendors ──────────────────────────────────────────────────────────────────

function VendorsSection({ items, canEdit, onRefresh }) {
  const [modal, setModal] = useState(false);
  const [edit, setEdit] = useState(null);
  const [form, setForm] = useState({ name: '', contactPerson: '', email: '', phone: '', gstNo: '', address: '', paymentTerms: '' });

  const openCreate = () => { setEdit(null); setForm({ name: '', contactPerson: '', email: '', phone: '', gstNo: '', address: '', paymentTerms: '' }); setModal(true); };
  const openEdit = (v) => { setEdit(v); setForm({ name: v.name, contactPerson: v.contactPerson || '', email: v.email || '', phone: v.phone || '', gstNo: v.gstNo || '', address: v.address || '', paymentTerms: v.paymentTerms || '' }); setModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (edit) { await inventoryAPI.updateVendor(edit.id, form); toast.success('Updated'); }
      else { await inventoryAPI.createVendor(form); toast.success('Created'); }
      setModal(false); onRefresh();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  return (
    <div className="space-y-4">
      {canEdit && <Button onClick={openCreate}><PlusIcon className="w-4 h-4 mr-1" /> Add Vendor</Button>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(v => (
          <Card key={v.id} className="p-4">
            <div className="flex items-start justify-between">
              <div><h3 className="font-semibold">{v.name}</h3>
                {v.contactPerson && <p className="text-xs text-gray-500">{v.contactPerson}</p>}</div>
              {canEdit && <button onClick={() => openEdit(v)} className="btn-ghost-icon"><PencilIcon className="w-4 h-4" /></button>}
            </div>
            <div className="mt-2 space-y-1 text-xs text-gray-500">
              {v.email && <p>Email: {v.email}</p>}
              {v.phone && <p>Phone: {v.phone}</p>}
              {v.gstNo && <p>GST: {v.gstNo}</p>}
            </div>
            <p className="text-xs text-gray-400 mt-2">{v._count?.items || 0} items · {v._count?.purchaseOrders || 0} orders</p>
          </Card>
        ))}
      </div>
      <Modal open={modal} onClose={() => setModal(false)} title={edit ? 'Edit Vendor' : 'Add Vendor'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Contact Person" value={form.contactPerson} onChange={e => setForm({ ...form, contactPerson: e.target.value })} />
            <Input label="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            <Input label="GST No" value={form.gstNo} onChange={e => setForm({ ...form, gstNo: e.target.value })} />
          </div>
          <Input label="Payment Terms" value={form.paymentTerms} onChange={e => setForm({ ...form, paymentTerms: e.target.value })} />
          <div><label className="block text-sm font-medium mb-1">Address</label>
            <textarea className="input-field" rows={2} value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} /></div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModal(false)}>Cancel</Button>
            <Button type="submit">{edit ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

// ─── Purchase Orders ──────────────────────────────────────────────────────────

function PurchaseOrdersSection({ items, vendors, canEdit, onRefresh }) {
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ vendorId: '', notes: '', items: [{ itemId: '', quantity: 1, unitPrice: 0 }] });
  const [invItems, setInvItems] = useState([]);

  useEffect(() => { inventoryAPI.getItems({}).then(r => setInvItems(r.data)).catch(() => {}); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await inventoryAPI.createPurchaseOrder(form);
      toast.success('Purchase order created');
      setModal(false); onRefresh();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const updateItem = (idx, field, value) => {
    const updated = [...form.items];
    updated[idx] = { ...updated[idx], [field]: value };
    setForm({ ...form, items: updated });
  };

  const addItem = () => setForm({ ...form, items: [...form.items, { itemId: '', quantity: 1, unitPrice: 0 }] });
  const removeItem = (idx) => setForm({ ...form, items: form.items.filter((_, i) => i !== idx) });

  return (
    <div className="space-y-4">
      {canEdit && <Button onClick={() => { setForm({ vendorId: '', notes: '', items: [{ itemId: '', quantity: 1, unitPrice: 0 }] }); setModal(true); }}><PlusIcon className="w-4 h-4 mr-1" /> New Purchase Order</Button>}
      <div className="space-y-3">
        {items.map(po => (
          <Card key={po.id} className="p-4">
            <div className="flex items-start justify-between">
              <div><p className="font-mono font-bold text-sm">{po.poNumber}</p>
                <p className="text-xs text-gray-500">{po.vendor?.name} · {new Date(po.createdAt).toLocaleDateString()}</p></div>
              <Badge variant={po.status === 'DRAFT' ? 'warning' : po.status === 'ORDERED' ? 'info' : po.status === 'RECEIVED' ? 'success' : 'danger'}>{po.status}</Badge>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              {po.items?.map(i => <span key={i.id} className="mr-3">{i.item?.name} × {i.quantity}</span>)}
            </div>
            <p className="text-sm font-semibold mt-2">{formatCurrency(po.totalAmount)}</p>
          </Card>
        ))}
      </div>
      <Modal open={modal} onClose={() => setModal(false)} title="New Purchase Order" size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">Vendor *</label>
            <select className="input-field" value={form.vendorId} onChange={e => setForm({ ...form, vendorId: e.target.value })} required>
              <option value="">Select vendor</option>
              {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select></div>
          <div><label className="block text-sm font-medium mb-1">Notes</label>
            <textarea className="input-field" rows={2} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
          <div className="space-y-2">
            <div className="flex justify-between items-center"><span className="text-sm font-medium">Items</span>
              <Button type="button" size="sm" variant="secondary" onClick={addItem}>+ Add Item</Button></div>
            {form.items.map((item, idx) => (
              <div key={idx} className="flex gap-2 items-start">
                <select className="input-field flex-1" value={item.itemId} onChange={e => updateItem(idx, 'itemId', e.target.value)} required>
                  <option value="">Select item</option>
                  {invItems.map(i => <option key={i.id} value={i.id}>{i.name} ({i.sku})</option>)}
                </select>
                <input className="input-field w-20" type="number" min="1" placeholder="Qty" value={item.quantity} onChange={e => updateItem(idx, 'quantity', parseInt(e.target.value) || 1)} />
                <input className="input-field w-24" type="number" step="0.01" placeholder="Price" value={item.unitPrice} onChange={e => updateItem(idx, 'unitPrice', parseFloat(e.target.value) || 0)} />
                {form.items.length > 1 && <button type="button" onClick={() => removeItem(idx)} className="p-2 text-red-500"><XCircleIcon className="w-5 h-5" /></button>}
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModal(false)}>Cancel</Button>
            <Button type="submit">Create PO</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

// ─── Transfers ────────────────────────────────────────────────────────────────

function TransfersSection({ items, canEdit, onRefresh }) {
  const [restaurants, setRestaurants] = useState([]);
  useEffect(() => {
    import('../api/endpoints').then(({ restaurantAPI }) =>
      restaurantAPI.getAll().then(r => setRestaurants(r.data)).catch(() => {})
    );
  }, []);

  const handleApprove = async (id) => {
    try { await inventoryAPI.updateTransfer(id, { status: 'APPROVED' }); toast.success('Approved'); onRefresh(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };
  const handleReceive = async (id) => {
    try { await inventoryAPI.updateTransfer(id, { status: 'RECEIVED' }); toast.success('Received'); onRefresh(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  return (
    <div className="space-y-3">
      {items.map(t => (
        <Card key={t.id} className="p-4">
          <div className="flex items-start justify-between">
            <div><p className="font-mono font-bold text-sm">{t.transferNo}</p>
              <p className="text-xs text-gray-500">{t.fromRestaurant?.name || 'Warehouse'} → {t.toRestaurant?.name || 'Unknown'}</p></div>
            <Badge variant={t.status === 'RECEIVED' ? 'success' : t.status === 'APPROVED' ? 'info' : t.status === 'IN_TRANSIT' ? 'warning' : 'secondary'}>{t.status}</Badge>
          </div>
          <div className="mt-2 text-xs text-gray-500">{t.items?.map(i => <span key={i.id} className="mr-3">{i.item?.name} × {i.quantity}</span>)}</div>
          <div className="flex gap-2 mt-3">
            {t.status === 'REQUESTED' && canEdit && <Button size="sm" onClick={() => handleApprove(t.id)}>Approve</Button>}
            {t.status === 'APPROVED' && canEdit && <Button size="sm" onClick={() => handleReceive(t.id)}>Mark Received</Button>}
          </div>
        </Card>
      ))}
      {items.length === 0 && <Card className="p-8 text-center text-gray-400">No transfers</Card>}
    </div>
  );
}

// ─── Adjustments ──────────────────────────────────────────────────────────────

function AdjustmentsSection({ items, inventoryItems, canEdit, onRefresh }) {
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ restaurantId: '', type: 'NEGATIVE', reason: 'DAMAGE', notes: '', items: [{ itemId: '', quantity: 1 }] });

  const addItem = () => setForm({ ...form, items: [...form.items, { itemId: '', quantity: 1 }] });
  const removeItem = (idx) => setForm({ ...form, items: form.items.filter((_, i) => i !== idx) });
  const updateItem = (idx, field, value) => {
    const updated = [...form.items];
    updated[idx] = { ...updated[idx], [field]: value };
    setForm({ ...form, items: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await inventoryAPI.createAdjustment(form);
      toast.success('Adjustment created');
      setModal(false); onRefresh();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleApprove = async (id) => {
    try { await inventoryAPI.approveAdjustment(id); toast.success('Approved'); onRefresh(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  return (
    <div className="space-y-4">
      {canEdit && <Button onClick={() => { setForm({ restaurantId: '', type: 'NEGATIVE', reason: 'DAMAGE', notes: '', items: [{ itemId: '', quantity: 1 }] }); setModal(true); }}><PlusIcon className="w-4 h-4 mr-1" /> New Adjustment</Button>}
      <div className="space-y-3">
        {items.map(a => (
          <Card key={a.id} className="p-4">
            <div className="flex items-start justify-between">
              <div><p className="font-mono font-bold text-sm">{a.adjustmentNo}</p>
                <p className="text-xs text-gray-500">{a.type} · {a.reason}</p></div>
              <Badge variant={a.status === 'APPROVED' ? 'success' : 'warning'}>{a.status}</Badge>
            </div>
            <div className="mt-2 text-xs text-gray-500">{a.items?.map(i => <span key={i.id} className="mr-3">{i.item?.name} × {i.quantity}</span>)}</div>
            {a.status === 'PENDING' && canEdit && <Button size="sm" className="mt-2" onClick={() => handleApprove(a.id)}>Approve</Button>}
          </Card>
        ))}
      </div>
      <Modal open={modal} onClose={() => setModal(false)} title="New Adjustment">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">Type</label>
            <select className="input-field" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
              <option value="NEGATIVE">Negative (Reduce Stock)</option>
              <option value="POSITIVE">Positive (Increase Stock)</option>
            </select></div>
          <div><label className="block text-sm font-medium mb-1">Reason</label>
            <select className="input-field" value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })}>
              <option value="DAMAGE">Damage</option><option value="THEFT">Theft</option><option value="EXPIRY">Expiry</option>
              <option value="COUNT_DIFFERENCE">Count Difference</option><option value="OPERATIONAL_LOSS">Operational Loss</option>
            </select></div>
          <div><label className="block text-sm font-medium mb-1">Notes</label>
            <textarea className="input-field" rows={2} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
          <div className="space-y-2">
            <div className="flex justify-between"><span className="text-sm font-medium">Items</span>
              <Button type="button" size="sm" variant="secondary" onClick={addItem}>+ Add</Button></div>
            {form.items.map((i, idx) => (
              <div key={idx} className="flex gap-2">
                <select className="input-field flex-1" value={i.itemId} onChange={e => updateItem(idx, 'itemId', e.target.value)} required>
                  <option value="">Select item</option>
                  {inventoryItems.map(inv => <option key={inv.id} value={inv.id}>{inv.name}</option>)}
                </select>
                <input className="input-field w-20" type="number" min="1" value={i.quantity} onChange={e => updateItem(idx, 'quantity', parseFloat(e.target.value) || 1)} />
                {form.items.length > 1 && <button type="button" onClick={() => removeItem(idx)} className="p-2 text-red-500"><XCircleIcon className="w-5 h-5" /></button>}
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModal(false)}>Cancel</Button>
            <Button type="submit">Create</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

// ─── Wastage ──────────────────────────────────────────────────────────────────

function WastageSection({ items, inventoryItems, canEdit, onRefresh }) {
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ restaurantId: '', type: 'EXPIRY', notes: '', items: [{ itemId: '', quantity: 1, reason: '' }] });

  const addItem = () => setForm({ ...form, items: [...form.items, { itemId: '', quantity: 1, reason: '' }] });
  const removeItem = (idx) => setForm({ ...form, items: form.items.filter((_, i) => i !== idx) });
  const updateItem = (idx, field, value) => {
    const updated = [...form.items];
    updated[idx] = { ...updated[idx], [field]: value };
    setForm({ ...form, items: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await inventoryAPI.createWastage(form);
      toast.success('Wastage recorded');
      setModal(false); onRefresh();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  return (
    <div className="space-y-4">
      {canEdit && <Button onClick={() => { setForm({ restaurantId: '', type: 'EXPIRY', notes: '', items: [{ itemId: '', quantity: 1, reason: '' }] }); setModal(true); }}><PlusIcon className="w-4 h-4 mr-1" /> Record Wastage</Button>}
      <div className="space-y-3">
        {items.map(w => (
          <Card key={w.id} className="p-4">
            <div className="flex items-start justify-between">
              <div><p className="font-mono font-bold text-sm">{w.wastageNo}</p>
                <p className="text-xs text-gray-500">{w.type} · {new Date(w.createdAt).toLocaleDateString()}</p></div>
              <Badge variant={w.type === 'EXPIRY' ? 'danger' : 'warning'}>{w.type}</Badge>
            </div>
            <div className="mt-2 text-xs text-gray-500">{w.items?.map(i => <span key={i.id} className="mr-3">{i.item?.name} × {i.quantity} ({i.reason || '-'})</span>)}</div>
          </Card>
        ))}
      </div>
      <Modal open={modal} onClose={() => setModal(false)} title="Record Wastage">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">Type</label>
            <select className="input-field" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
              <option value="EXPIRY">Expired</option><option value="DAMAGE">Damaged</option>
              <option value="KITCHEN">Kitchen Wastage</option><option value="PREPARATION">Preparation Loss</option>
            </select></div>
          <div><label className="block text-sm font-medium mb-1">Notes</label>
            <textarea className="input-field" rows={2} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
          <div className="space-y-2">
            <div className="flex justify-between"><span className="text-sm font-medium">Items</span>
              <Button type="button" size="sm" variant="secondary" onClick={addItem}>+ Add</Button></div>
            {form.items.map((i, idx) => (
              <div key={idx} className="flex gap-2">
                <select className="input-field flex-1" value={i.itemId} onChange={e => updateItem(idx, 'itemId', e.target.value)} required>
                  <option value="">Select item</option>
                  {inventoryItems.map(inv => <option key={inv.id} value={inv.id}>{inv.name}</option>)}
                </select>
                <input className="input-field w-20" type="number" min="1" value={i.quantity} onChange={e => updateItem(idx, 'quantity', parseFloat(e.target.value) || 1)} />
                <input className="input-field w-28" placeholder="Reason" value={i.reason} onChange={e => updateItem(idx, 'reason', e.target.value)} />
                {form.items.length > 1 && <button type="button" onClick={() => removeItem(idx)} className="p-2 text-red-500"><XCircleIcon className="w-5 h-5" /></button>}
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModal(false)}>Cancel</Button>
            <Button type="submit">Record</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

// ─── Movements ────────────────────────────────────────────────────────────────

function MovementsSection({ items }) {
  return (
    <Card className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead><tr className="border-b border-gray-200 dark:border-gray-700 text-left text-gray-500">
          <th className="p-3 font-medium">Date</th><th className="p-3 font-medium">Item</th><th className="p-3 font-medium">Type</th>
          <th className="p-3 font-medium">Qty</th><th className="p-3 font-medium">Before</th><th className="p-3 font-medium">After</th>
          <th className="p-3 font-medium">Reference</th>
        </tr></thead>
        <tbody>
          {items.map(m => (
            <tr key={m.id} className="border-b border-gray-100 dark:border-gray-800">
              <td className="p-3 text-xs text-gray-500">{new Date(m.createdAt).toLocaleString()}</td>
              <td className="p-3 font-medium">{m.item?.name}</td>
              <td className="p-3"><Badge variant={m.type === 'IN' ? 'success' : 'danger'}>{m.type}</Badge></td>
              <td className="p-3">{m.quantity} {m.item?.unit}</td>
              <td className="p-3 text-gray-500">{m.balanceBefore}</td>
              <td className="p-3 text-gray-500">{m.balanceAfter}</td>
              <td className="p-3 text-xs text-gray-400">{m.reference}{m.referenceId ? ` #${m.referenceId.slice(0, 8)}` : ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {items.length === 0 && <p className="text-center py-8 text-gray-400">No movements</p>}
    </Card>
  );
}

// ─── Recipe Mapping ───────────────────────────────────────────────────────────

function RecipesSection({ recipes, menuItems, inventoryItems, canEdit, onRefresh }) {
  const [modal, setModal] = useState(false);
  const [edit, setEdit] = useState(null);
  const [form, setForm] = useState({ menuItemId: '', servings: 1, ingredients: [{ itemId: '', quantity: 1, unit: 'pcs' }] });

  const openCreate = () => {
    setEdit(null);
    setForm({ menuItemId: '', servings: 1, ingredients: [{ itemId: '', quantity: 1, unit: 'pcs' }] });
    setModal(true);
  };
  const openEdit = (r) => {
    setEdit(r);
    setForm({
      menuItemId: r.menuItemId, servings: r.servings || 1,
      ingredients: r.ingredients?.map(i => ({ itemId: i.itemId, quantity: i.quantity, unit: i.unit || 'pcs' })) || [{ itemId: '', quantity: 1, unit: 'pcs' }],
    });
    setModal(true);
  };

  const addIngredient = () => setForm({ ...form, ingredients: [...form.ingredients, { itemId: '', quantity: 1, unit: 'pcs' }] });
  const removeIngredient = (idx) => setForm({ ...form, ingredients: form.ingredients.filter((_, i) => i !== idx) });
  const updateIngredient = (idx, field, value) => {
    const updated = [...form.ingredients];
    updated[idx] = { ...updated[idx], [field]: value };
    setForm({ ...form, ingredients: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await inventoryAPI.upsertRecipe(form);
      toast.success(edit ? 'Recipe updated' : 'Recipe created');
      setModal(false); onRefresh();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  return (
    <div className="space-y-4">
      {canEdit && <Button onClick={openCreate}><PlusIcon className="w-4 h-4 mr-1" /> Add Recipe</Button>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {recipes.map(r => (
          <Card key={r.id} className="p-4">
            <div className="flex items-start justify-between">
              <h3 className="font-semibold">{r.menuItem?.name}</h3>
              {canEdit && <button onClick={() => openEdit(r)} className="btn-ghost-icon"><PencilIcon className="w-4 h-4" /></button>}
            </div>
            <p className="text-xs text-gray-500 mb-2">Servings: {r.servings}</p>
            <div className="space-y-1 text-sm">
              {r.ingredients?.map(ing => (
                <div key={ing.id} className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>{ing.item?.name}</span>
                  <span>{ing.quantity} {ing.unit}</span>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
      <Modal open={modal} onClose={() => setModal(false)} title={edit ? 'Edit Recipe' : 'Add Recipe'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">Menu Item *</label>
            <select className="input-field" value={form.menuItemId} onChange={e => setForm({ ...form, menuItemId: e.target.value })} required>
              <option value="">Select menu item</option>
              {menuItems.map(m => <option key={m.id} value={m.id} disabled={!!recipes.find(r => r.menuItemId === m.id && r.id !== edit?.id)}>{m.name}</option>)}
            </select></div>
          <Input label="Servings" type="number" min="1" value={form.servings} onChange={e => setForm({ ...form, servings: parseInt(e.target.value) || 1 })} />
          <div className="space-y-2">
            <div className="flex justify-between"><span className="text-sm font-medium">Ingredients</span>
              <Button type="button" size="sm" variant="secondary" onClick={addIngredient}>+ Add</Button></div>
            {form.ingredients.map((ing, idx) => (
              <div key={idx} className="flex gap-2 items-start">
                <select className="input-field flex-1" value={ing.itemId} onChange={e => updateIngredient(idx, 'itemId', e.target.value)} required>
                  <option value="">Select ingredient</option>
                  {inventoryItems.map(i => <option key={i.id} value={i.id}>{i.name} ({i.unit})</option>)}
                </select>
                <input className="input-field w-20" type="number" min="0.01" step="0.01" value={ing.quantity} onChange={e => updateIngredient(idx, 'quantity', parseFloat(e.target.value) || 1)} />
                <input className="input-field w-16" value={ing.unit} onChange={e => updateIngredient(idx, 'unit', e.target.value)} />
                {form.ingredients.length > 1 && <button type="button" onClick={() => removeIngredient(idx)} className="p-2 text-red-500"><XCircleIcon className="w-5 h-5" /></button>}
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModal(false)}>Cancel</Button>
            <Button type="submit">{edit ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
