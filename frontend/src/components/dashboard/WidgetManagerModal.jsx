import { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import CustomWidgetForm from './CustomWidgetForm';
import { widgetAPI } from '../../api/endpoints';
import { useRole } from '../../hooks/useRole';
import { SYSTEM_WIDGETS } from '../../lib/constants';
import { PlusIcon, TrashIcon, SparklesIcon, ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline';

export default function WidgetManagerModal({ open, onClose, currentWidgets, onWidgetAdded }) {
  const [tab, setTab] = useState('add');
  const [available, setAvailable] = useState([]);
  const [customSources, setCustomSources] = useState([]);
  const [adding, setAdding] = useState(null);
  const { currentRole } = useRole();

  useEffect(() => {
    if (open) {
      loadAvailable();
    }
  }, [open]);

  const loadAvailable = async () => {
    try {
      const res = await widgetAPI.getAvailable();
      setAvailable(res.data.systemWidgets || []);
      setCustomSources(res.data.customSources || []);
    } catch (err) {
      console.error('Failed to load available widgets:', err);
    }
  };

  const handleAdd = async (widgetType) => {
    setAdding(widgetType);
    try {
      await widgetAPI.addWidget({ widgetType });
      onWidgetAdded?.();
    } catch (err) {
      console.error('Failed to add widget:', err);
    } finally {
      setAdding(null);
    }
  };

  const handleRemove = async (id) => {
    try {
      await widgetAPI.deleteWidget(id);
      onWidgetAdded?.();
    } catch (err) {
      console.error('Failed to remove widget:', err);
    }
  };

  const handleMove = async (id, dir) => {
    const idx = currentWidgets.findIndex(w => w.id === id);
    if (idx === -1) return;
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= currentWidgets.length) return;
    try {
      await widgetAPI.updateWidget(id, { position: newIdx });
      const other = currentWidgets[newIdx];
      await widgetAPI.updateWidget(other.id, { position: idx });
      onWidgetAdded?.();
    } catch (err) {
      console.error('Failed to reorder:', err);
    }
  };

  const handleCustomCreated = () => {
    onWidgetAdded?.();
  };

  const tabs = [
    { id: 'add', label: 'Add Widgets' },
    { id: 'my', label: `My Widgets (${currentWidgets.length})` },
    { id: 'custom', label: 'Create Custom' },
  ];

  return (
    <Modal open={open} onClose={onClose} title="Customize Dashboard" size="lg">
      <div className="flex gap-1 mb-6 border-b border-gray-200 dark:border-gray-700 -mx-6 px-6">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`pb-3 px-3 text-sm font-medium border-b-2 transition-colors ${
              tab === t.id
                ? 'border-primary-600 text-primary-600 dark:text-primary-400 dark:border-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'add' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
          {available.length === 0 ? (
            <div className="col-span-full text-center py-8 text-gray-400">
              <PlusIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">All widgets are already on your dashboard</p>
            </div>
          ) : (
            available.map((w) => (
              <div key={w.widgetType} className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 transition-colors">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{w.label}</p>
                  <p className="text-xs text-gray-400 capitalize">{w.displayType.replace(/_/g, ' ')}</p>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleAdd(w.widgetType)}
                  disabled={adding === w.widgetType}
                >
                  {adding === w.widgetType ? 'Adding...' : 'Add'}
                </Button>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'my' && (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {currentWidgets.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p className="text-sm">No widgets on your dashboard yet</p>
            </div>
          ) : (
            currentWidgets.map((w, i) => (
              <div key={w.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{w.title}</p>
                  <p className="text-xs text-gray-400">{w.widgetType === 'custom' ? 'Custom widget' : w.widgetType.replace(/_/g, ' ')}</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0 ml-3">
                  <button onClick={() => handleMove(w.id, -1)} disabled={i === 0}
                    className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <ArrowUpIcon className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleMove(w.id, 1)} disabled={i === currentWidgets.length - 1}
                    className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <ArrowDownIcon className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleRemove(w.id)}
                    className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'custom' && (
        <CustomWidgetForm
          customSources={customSources}
          onCreated={handleCustomCreated}
        />
      )}
    </Modal>
  );
}
