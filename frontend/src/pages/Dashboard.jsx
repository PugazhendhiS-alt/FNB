import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRole } from '../hooks/useRole';
import Badge from '../components/ui/Badge';
import PageHeader from '../components/ui/PageHeader';
import KPIGrid from '../components/dashboard/KPIGrid';
import QuickActionsBar from '../components/dashboard/QuickActionsBar';
import DashboardContent from '../components/dashboard/DashboardWidgetSections';
import DashboardFilters, { FilterToggleButton } from '../components/dashboard/DashboardFilters';
import ErrorBoundary from '../components/ErrorBoundary';
import { widgetAPI, dashboardAPI } from '../api/endpoints';
import { ChartBarIcon } from '@heroicons/react/24/outline';

const WIDGET_TYPE_TO_KPI = {
  stats_total_users: 'total_users',
  stats_buildings: 'buildings',
  stats_restaurants: 'restaurants',
  stats_orders: 'orders',
  stats_revenue: 'revenue',
  stats_pending_orders: 'pending_orders',
};

export default function Dashboard() {
  const [metrics, setMetrics] = useState([]);
  const [sectionData, setSectionData] = useState({});
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [dateRange, setDateRange] = useState('7d');
  const [kpiLoading, setKpiLoading] = useState(true);
  const [sectionLoading, setSectionLoading] = useState(true);
  const { isSuperadmin, currentRole, isCustomer } = useRole();
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    async function loadMetrics() {
      setKpiLoading(true);
      try {
        const res = await widgetAPI.getWidgets();
        if (cancelled) return;
        const items = res.data;
        const statWidgets = items.filter(w => w.displayType === 'stat_card');
        if (statWidgets.length === 0) {
          setKpiLoading(false);
          return;
        }
        const ids = statWidgets.map(w => w.id);
        const dataRes = await widgetAPI.batchData(ids);
        if (cancelled) return;
        const data = dataRes.data || {};
        const mapped = statWidgets.map(w => ({
          key: WIDGET_TYPE_TO_KPI[w.widgetType] || w.widgetType,
          value: data[w.id]?.value ?? 0,
          trend: data[w.id]?.trend,
          trendLabel: data[w.id]?.trendLabel,
          currency: w.widgetType === 'stats_revenue' || w.customSource === 'total_revenue' || w.customSource === 'avg_order_value',
        }));
        setMetrics(mapped);
      } catch {
        // silent - use defaults
      } finally {
        if (!cancelled) {
          setKpiLoading(false);
        }
      }
    }

    async function loadSectionData() {
      try {
        const res = await dashboardAPI.getSectionData();
        if (!cancelled && res.data) {
          const flat = {};
          Object.values(res.data).forEach(group => {
            if (group && typeof group === 'object') Object.assign(flat, group);
          });
          setSectionData(flat);
        }
      } catch {
        // silent - use defaults
      } finally {
        if (!cancelled) setSectionLoading(false);
      }
    }

    loadMetrics();
    loadSectionData();
    return () => { cancelled = true; };
  }, []);

  if (isCustomer) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-md shadow-primary-500/10">
              <ChartBarIcon className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold">My Dashboard</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Welcome back</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/restaurants')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 active:bg-primary-800 transition-colors shadow-sm"
          >
            <ChartBarIcon className="w-4 h-4" />
            <span className="hidden sm:inline">View Menus</span>
          </button>
        </div>
        <DashboardContent data={sectionData} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        subtitle={isSuperadmin ? 'Complete system overview at a glance' : 'Your personalized overview'}
        icon={ChartBarIcon}
        actions={
          <>
            <Badge variant="purple" className="text-xs">{currentRole}</Badge>
            <QuickActionsBar />
            <FilterToggleButton open={filtersOpen} onClick={() => setFiltersOpen(!filtersOpen)} />
          </>
        }
      />

      <DashboardFilters
        open={filtersOpen}
        dateRange={dateRange}
        onDateChange={setDateRange}
      />

      <KPIGrid metrics={metrics} loading={kpiLoading} />

      <ErrorBoundary message="A dashboard section failed to load.">
        <DashboardContent data={sectionData} />
      </ErrorBoundary>
    </div>
  );
}
