import { useState } from 'react';
import Button from '../ui/Button';
import { widgetAPI } from '../../api/endpoints';
import { WIDGET_DISPLAY_TYPES } from '../../lib/constants';
import toast from 'react-hot-toast';

const COLORS = [
  { value: 'blue', class: 'bg-blue-500' },
  { value: 'green', class: 'bg-emerald-500' },
  { value: 'purple', class: 'bg-violet-500' },
  { value: 'yellow', class: 'bg-amber-500' },
  { value: 'red', class: 'bg-rose-500' },
  { value: 'indigo', class: 'bg-indigo-500' },
  { value: 'teal', class: 'bg-teal-500' },
];

export default function CustomWidgetForm({ customSources, onCreated }) {
  const [title, setTitle] = useState('');
  const [source, setSource] = useState('');
  const [displayType, setDisplayType] = useState('stat_card');
  const [color, setColor] = useState('blue');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !source) {
      toast.error('Title and data source are required');
      return;
    }
    setSaving(true);
    try {
      await widgetAPI.createCustom({
        title: title.trim(),
        customSource: source,
        displayType,
        config: { color, customSource: source },
      });
      toast.success('Custom widget created');
      setTitle('');
      setSource('');
      setDisplayType('stat_card');
      setColor('blue');
      onCreated?.();
    } catch (err) {
      toast.error('Failed to create widget');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Widget Title</label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="e.g. Today's Revenue"
          className="input-field w-full"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Data Source</label>
        <select value={source} onChange={e => setSource(e.target.value)} className="input-field w-full" required>
          <option value="">Select a data source...</option>
          {(customSources || []).map(s => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Display Type</label>
        <div className="grid grid-cols-3 gap-2">
          {WIDGET_DISPLAY_TYPES.map(dt => (
            <button
              key={dt.value}
              type="button"
              onClick={() => setDisplayType(dt.value)}
              className={`p-3 rounded-lg border text-sm text-center transition-all ${
                displayType === dt.value
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-600 dark:text-gray-400'
              }`}
            >
              {dt.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Color Theme</label>
        <div className="flex gap-2">
          {COLORS.map(c => (
            <button
              key={c.value}
              type="button"
              onClick={() => setColor(c.value)}
              className={`w-8 h-8 rounded-full ${c.class} transition-all ${
                color === c.value ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-800 ring-primary-500 scale-110' : ''
              }`}
            />
          ))}
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" variant="primary" disabled={saving}>
          {saving ? 'Creating...' : 'Create Widget'}
        </Button>
        <Button type="button" variant="secondary" onClick={() => { setTitle(''); setSource(''); }}>
          Clear
        </Button>
      </div>
    </form>
  );
}
