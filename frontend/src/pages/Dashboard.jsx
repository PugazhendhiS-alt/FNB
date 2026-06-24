import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRole } from '../hooks/useRole';
import { useSocket } from '../context/SocketContext';
import Badge from '../components/ui/Badge';
import PageHeader from '../components/ui/PageHeader';
import KPIGrid from '../components/dashboard/KPIGrid';
import QuickActionsBar from '../components/dashboard/QuickActionsBar';
import DashboardContent from '../components/dashboard/DashboardWidgetSections';
import DashboardFilters, { FilterToggleButton } from '../components/dashboard/DashboardFilters';
import CustomerDashboard from './CustomerDashboard';
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
  const { socket } = useSocket();
  const [refreshKey, setRefreshKey] = useState(0);
  const hasLoaded = useRef(false);

  useEffect(() => {
    if (!socket) return;
    const handler = () => setRefreshKey(k => k + 1);
    socket.on('dashboard-update', handler);
    return () => socket.off('dashboard-update', handler);
  }, [socket]);

  useEffect(() => {
    let cancelled = false;

    async function loadMetrics() {
      if (!hasLoaded.current) setKpiLoading(true);
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
          key: `${WIDGET_TYPE_TO_KPI[w.widgetType] || w.widgetType}_${w.id}`,
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
      if (!hasLoaded.current) setSectionLoading(true);
      try {
        const res = await dashboardAPI.getSectionData();
        if (!cancelled && res.data) {
          const prefixed = {};
          Object.entries(res.data).forEach(([groupKey, group]) => {
            if (group && typeof group === 'object') {
              Object.entries(group).forEach(([key, val]) => {
                prefixed[`${groupKey}_${key}`] = val;
              });
            }
          });
          setSectionData(prefixed);
        }
      } catch {
        // silent - use defaults
      } finally {
        if (!cancelled) {
          setSectionLoading(false);
          hasLoaded.current = true;
        }
      }
    }

    loadMetrics();
    loadSectionData();
    return () => { cancelled = true; };
  }, [refreshKey]);

  if (isCustomer) {
    return <CustomerDashboard />;
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
