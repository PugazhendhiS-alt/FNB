import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRole } from '../hooks/useRole';
import Badge from '../components/ui/Badge';
import PageHeader from '../components/ui/PageHeader';
import WidgetGrid from '../components/dashboard/WidgetGrid';
import PrimaryMetricsBar from '../components/dashboard/PrimaryMetricsBar';
import DashboardFilters, { FilterToggleButton } from '../components/dashboard/DashboardFilters';
import { FullPageSkeleton } from '../components/dashboard/LoadingState';
import ErrorState from '../components/dashboard/ErrorState';
import { ShoppingBagIcon, ChartBarIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

export default function Dashboard() {
  const [metrics, setMetrics] = useState([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [dateRange, setDateRange] = useState('7d');
  const [initialLoading, setInitialLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState(null);
  const { isSuperadmin, currentRole, isCustomer, isAdmin } = useRole();
  const navigate = useNavigate();

  const handleMetricsUpdate = useCallback((m) => {
    setMetrics(m);
    setInitialLoading(false);
  }, []);

  const handleError = useCallback((err) => {
    setDashboardError(err);
    setInitialLoading(false);
  }, []);

  if (isCustomer) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-md">
              <ChartBarIcon className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold">My Dashboard</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Welcome back</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/restaurants')}
            className="btn-primary text-sm py-2 px-4 flex items-center gap-2"
          >
            <ShoppingBagIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Order Now</span>
          </button>
        </div>
        <WidgetGrid onMetricsUpdate={handleMetricsUpdate} />
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
            <FilterToggleButton open={filtersOpen} onClick={() => setFiltersOpen(!filtersOpen)} />
          </>
        }
      />

      {/* ── Filters ── */}
      <DashboardFilters
        open={filtersOpen}
        dateRange={dateRange}
        onDateChange={setDateRange}
      />

      {/* ── Primary Metrics ── */}
      {metrics.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Key Metrics</h2>
          </div>
          <PrimaryMetricsBar metrics={metrics} />
        </div>
      )}

      {/* ── Widget Content Area ── */}
      <div>
        <WidgetGrid onMetricsUpdate={handleMetricsUpdate} />
      </div>
    </div>
  );
}
