import { useState, useEffect, useCallback, useRef } from 'react';
import GridLayout from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import WidgetRenderer from './WidgetRenderer';
import WidgetManagerModal from './WidgetManagerModal';
import EmptyState from './EmptyState';
import { WidgetSkeleton } from './LoadingState';
import ErrorState from './ErrorState';
import { widgetAPI } from '../../api/endpoints';
import { useRole } from '../../hooks/useRole';
import {
  Cog6ToothIcon, ArrowPathIcon, CheckIcon,
  Bars3Icon, XMarkIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const GRID_COLS = { lg: 6, md: 4, sm: 2 };
const GRID_BREAKPOINTS = { lg: 1200, md: 996, sm: 768 };
const GRID_MARGIN = [12, 12];
const ROW_HEIGHT = 50;
const GRID_GAP = 12;

const WIDGET_COLORS = ['blue', 'green', 'purple', 'yellow', 'red', 'indigo', 'teal'];
const COLOR_DOT_CLASSES = {
  blue: 'bg-blue-500', green: 'bg-emerald-500', purple: 'bg-violet-500',
  yellow: 'bg-amber-500', red: 'bg-rose-500', indigo: 'bg-indigo-500', teal: 'bg-teal-500',
};

function getDefaultSize(displayType) {
  switch (displayType) {
    case 'stat_card': return { w: 2, h: 3 };
    case 'table': return { w: 4, h: 7 };
    case 'bar_chart': return { w: 4, h: 6 };
    case 'ranked_list': return { w: 2, h: 5 };
    case 'list': return { w: 2, h: 5 };
    case 'progress': return { w: 2, h: 5 };
    case 'status_bar': return { w: 2, h: 4 };
    case 'action_grid': return { w: 2, h: 5 };
    default: return { w: 2, h: 4 };
  }
}

function clampLayout(item, cols) {
  return {
    ...item,
    x: Math.max(0, Math.min(item.x, cols - item.w)),
    w: Math.min(item.w, cols),
  };
}

export default function WidgetGrid({ onMetricsUpdate }) {
  const [widgets, setWidgets] = useState([]);
  const [widgetData, setWidgetData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showManager, setShowManager] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const { currentRole } = useRole();
  const saveTimer = useRef(null);
  const gridRef = useRef(null);

  const fetchData = useCallback(async (items) => {
    try {
      const ids = items.map(w => w.id);
      const res = await widgetAPI.batchData(ids);
      const data = res.data || {};
      setWidgetData(data);
      const metrics = items
        .filter(w => w.displayType === 'stat_card')
        .map(w => ({
          label: w.title,
          value: data[w.id]?.value ?? 0,
          currency: w.widgetType === 'stats_revenue' || w.customSource === 'total_revenue' || w.customSource === 'avg_order_value',
          color: w.config?.color || 'blue',
          trend: data[w.id]?.trend ?? 0,
        }));
      onMetricsUpdate?.(metrics);
    } catch (err) {
      console.error('Failed to load widget data:', err);
    }
  }, [onMetricsUpdate]);

  const loadWidgets = useCallback(async () => {
    setLoading(true);
    setError(null);
    setWidgetData({});
    try {
      const res = await widgetAPI.getWidgets();
      const items = res.data;
      setWidgets(items);
      if (items.length > 0) await fetchData(items);
    } catch (err) {
      setError(err?.response?.data?.message || err.message);
      setWidgets([]);
    } finally {
      setLoading(false);
    }
  }, [fetchData]);

  useEffect(() => { loadWidgets(); }, [loadWidgets, currentRole]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadWidgets();
    setRefreshing(false);
  }, [loadWidgets]);

  const handleRemoveWidget = useCallback(async (widgetId) => {
    try {
      await widgetAPI.deleteWidget(widgetId);
      const remaining = widgets.filter(w => w.id !== widgetId);
      setWidgets(remaining);
      if (remaining.length > 0) await fetchData(remaining);
    } catch (err) {
      console.error('Failed to remove widget:', err);
    }
  }, [widgets, fetchData]);

  const handleWidgetAdded = useCallback(() => {
    setShowManager(false);
    loadWidgets();
  }, [loadWidgets]);

  const saveLayouts = useCallback(async (gridLayouts) => {
    setSaving(true);
    try {
      const updates = gridLayouts.filter(item => {
        const widget = widgets.find(w => w.id === item.i);
        if (!widget) return false;
        const saved = widget.layout || {};
        return saved.x !== item.x || saved.y !== item.y || saved.w !== item.w || saved.h !== item.h;
      }).map((item, idx) => {
        return widgetAPI.updateWidget(item.i, {
          layout: { x: item.x, y: item.y, w: item.w, h: item.h },
          position: idx,
        });
      });
      if (updates.length > 0) {
        await Promise.all(updates);
        setWidgets(prev => prev.map((w, idx) => {
          const gl = gridLayouts.find(g => g.i === w.id);
          return { ...w, layout: gl ? { x: gl.x, y: gl.y, w: gl.w, h: gl.h } : w.layout, position: idx };
        }));
      }
    } catch (err) {
      console.error('Failed to save layout:', err);
      toast.error('Failed to save widget layout');
    } finally {
      setSaving(false);
    }
  }, [widgets]);

  const onLayoutChange = useCallback((newLayout) => {
    if (!editMode) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      const clamped = newLayout.map(item => clampLayout(item, GRID_COLS.lg));
      saveLayouts(clamped);
    }, 800);
  }, [editMode, saveLayouts]);

  const toggleEditMode = useCallback(() => {
    if (editMode) {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      const currentLayout = widgets.map((w, i) => {
        const l = w.layout || getDefaultSize(w.displayType);
        return clampLayout(
          { i: w.id, x: l.x || 0, y: l.y || i, w: Math.min(l.w || 2, GRID_COLS.lg), h: l.h || 4 },
          GRID_COLS.lg
        );
      });
      saveLayouts(currentLayout);
    }
    setEditMode(prev => !prev);
  }, [editMode, widgets, saveLayouts]);

  const changeWidgetColor = useCallback(async (widgetId, color) => {
    setWidgets(prev => prev.map(w =>
      w.id === widgetId ? { ...w, config: { ...w.config, color } } : w
    ));
    try {
      const w = widgets.find(wi => wi.id === widgetId);
      await widgetAPI.updateWidget(widgetId, { config: { ...w?.config, color } });
    } catch (err) {
      toast.error('Failed to update color');
    }
  }, [widgets]);

  const updateWidgetTitle = useCallback(async (widgetId, title) => {
    setWidgets(prev => prev.map(w =>
      w.id === widgetId ? { ...w, title } : w
    ));
    try {
      await widgetAPI.updateWidget(widgetId, { title });
    } catch (err) {
      toast.error('Failed to update title');
    }
  }, []);

  if (loading) return <WidgetSkeleton count={4} />;
  if (error) return <ErrorState message={error} onRetry={loadWidgets} />;

  if (widgets.length === 0) {
    return (
      <div className="space-y-4">
        <EmptyState onAction={() => setShowManager(true)} />
        {showManager && (
          <WidgetManagerModal
            open={showManager}
            onClose={() => setShowManager(false)}
            currentWidgets={widgets}
            onWidgetAdded={handleWidgetAdded}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end gap-2">
        <button onClick={handleRefresh} disabled={refreshing} className="btn-secondary text-sm flex items-center gap-2 py-1.5 px-3">
          <ArrowPathIcon className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
        <button onClick={() => setShowManager(true)} className="btn-secondary text-sm flex items-center gap-2 py-1.5 px-3">
          <Cog6ToothIcon className="w-4 h-4" /> Customize
        </button>
        <button
          onClick={toggleEditMode}
          className={`text-sm flex items-center gap-2 py-1.5 px-3 rounded-lg transition-all ${
            editMode
              ? 'bg-primary-600 text-white shadow-sm hover:bg-primary-700'
              : 'btn-secondary'
          }`}
        >
          {editMode ? (
            <><CheckIcon className="w-4 h-4" />{saving ? 'Saving...' : 'Done'}</>
          ) : (
            <><Bars3Icon className="w-4 h-4" />Arrange</>
          )}
        </button>
      </div>

      {editMode && (
        <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg px-4 py-2.5 text-sm text-primary-700 dark:text-primary-300 flex items-center gap-2">
          <Bars3Icon className="w-4 h-4 flex-shrink-0" />
          Drag the handlebar to reposition. Use bottom-right corner to resize. Click Done to save.
        </div>
      )}

      <div className="relative" ref={gridRef}>
        {editMode && (
          <div className="absolute inset-0 pointer-events-none z-0" style={{ margin: -GRID_GAP }}>
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid-pattern" width={ROW_HEIGHT * GRID_COLS.lg / 2 + GRID_GAP} height={ROW_HEIGHT + GRID_GAP} patternUnits="userSpaceOnUse">
                  <rect width="100%" height="100%" fill="none" />
                  {Array.from({ length: GRID_COLS.lg }).map((_, ci) => (
                    <line key={ci} x1={ci * (ROW_HEIGHT * GRID_COLS.lg / 2 + GRID_GAP) / GRID_COLS.lg + GRID_GAP / 2} y1="0" x2={ci * (ROW_HEIGHT * GRID_COLS.lg / 2 + GRID_GAP) / GRID_COLS.lg + GRID_GAP / 2} y2="100%" stroke="rgba(59,130,246,0.08)" strokeWidth="1" />
                  ))}
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid-pattern)" />
            </svg>
          </div>
        )}

        <style>{`
          .react-grid-placeholder {
            background: #3b82f6 !important;
            border-radius: 12px !important;
            opacity: 0.15 !important;
            transition: all 100ms ease !important;
            z-index: 0 !important;
          }
          .react-grid-item.react-draggable-dragging {
            z-index: 100 !important;
            opacity: 0.9 !important;
            transform: scale(1.02) !important;
            transition: none !important;
            box-shadow: 0 10px 40px rgba(0,0,0,0.15) !important;
          }
          .react-grid-item.react-resizable-handle::after {
            border-right: 2px solid transparent !important;
            border-bottom: 2px solid transparent !important;
          }
          .edit-mode .react-grid-item.react-resizable-handle::after {
            border-right: 2px solid #93c5fd !important;
            border-bottom: 2px solid #93c5fd !important;
          }
        `}</style>

        <GridLayout
          className={`layout ${editMode ? 'edit-mode' : ''}`}
          ref={gridRef}
          cols={GRID_COLS}
          breakpoints={GRID_BREAKPOINTS}
          rowHeight={ROW_HEIGHT}
          margin={GRID_MARGIN}
          containerPadding={[0, 0]}
          compactType="vertical"
          preventCollision={true}
          isDraggable={editMode}
          isResizable={editMode}
          onLayoutChange={onLayoutChange}
          draggableHandle=".widget-drag-handle"
          draggableCancel="input,textarea,select,button,.no-drag"
        >
          {widgets.map((widget, idx) => {
            const color = widget.config?.color || 'blue';
            const saved = widget.layout || getDefaultSize(widget.displayType);
            const col = GRID_COLS.lg;
            return (
              <div
                key={widget.id}
                data-grid={clampLayout({
                  x: saved.x || 0,
                  y: saved.y ?? idx,
                  w: Math.min(saved.w || 2, col),
                  h: saved.h || 4,
                  minW: 1,
                  minH: 2,
                }, col)}
                className={`relative group ${
                  editMode ? 'ring-2 ring-primary-300 dark:ring-primary-600 rounded-xl overflow-hidden' : ''
                }`}
              >
                {editMode && (
                  <div className="widget-drag-handle absolute top-0 left-0 right-0 h-8 bg-gray-50 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700 flex items-center px-2 gap-1 cursor-grab active:cursor-grabbing z-10 rounded-t-xl select-none">
                    <Bars3Icon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <input
                        type="text"
                        value={widget.title}
                        onChange={(e) => updateWidgetTitle(widget.id, e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.stopPropagation()}
                        className="w-full bg-transparent text-xs font-medium text-gray-700 dark:text-gray-300 border-0 p-0 focus:outline-none focus:ring-0 truncate"
                      />
                    </div>
                    <div className="flex items-center gap-0.5 flex-shrink-0 ml-1">
                      {WIDGET_COLORS.map(c => (
                        <button
                          key={c}
                          onClick={(e) => { e.stopPropagation(); changeWidgetColor(widget.id, c); }}
                          className={`w-3.5 h-3.5 rounded-full border-2 transition-all ${
                            COLOR_DOT_CLASSES[c] || 'bg-blue-500'
                          } ${
                            color === c ? 'border-gray-800 dark:border-white scale-110' : 'border-transparent'
                          }`}
                        />
                      ))}
                      <button
                        onClick={(e) => { e.stopPropagation(); handleRemoveWidget(widget.id); }}
                        className="p-0.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-500 ml-1"
                      >
                        <XMarkIcon className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
                <div className={editMode ? 'pt-8 h-full' : 'h-full'}>
                  <WidgetRenderer
                    widget={widget}
                    data={widgetData[widget.id]}
                    loading={!widgetData[widget.id]}
                    onRemove={editMode ? undefined : () => handleRemoveWidget(widget.id)}
                    onRefresh={() => fetchData([widget])}
                  />
                </div>
              </div>
            );
          })}
        </GridLayout>
      </div>

      {showManager && (
        <WidgetManagerModal
          open={showManager}
          onClose={() => setShowManager(false)}
          currentWidgets={widgets}
          onWidgetAdded={handleWidgetAdded}
        />
      )}
    </div>
  );
}
