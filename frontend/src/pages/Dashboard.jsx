import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRole } from '../hooks/useRole';
import Badge from '../components/ui/Badge';
import PageHeader from '../components/ui/PageHeader';
import WidgetGrid from '../components/dashboard/WidgetGrid';
import DashboardWidgetSections from '../components/dashboard/DashboardWidgetSections';
import PrimaryMetricsBar from '../components/dashboard/PrimaryMetricsBar';
import DashboardFilters, { FilterToggleButton } from '../components/dashboard/DashboardFilters';
import { FullPageSkeleton } from '../components/dashboard/LoadingState';
import ErrorState from '../components/dashboard/ErrorState';
import { ShoppingBagIcon, ChartBarIcon } from '@heroicons/react/24/outline';

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

      <DashboardFilters
        open={filtersOpen}
        dateRange={dateRange}
        onDateChange={setDateRange}
      />

      {metrics.length > 0 && (
        <div className="animate-in">
          <div className="flex items-center justify-between mb-3">
            <h2 className="section-header">Key Metrics</h2>
          </div>
          <PrimaryMetricsBar metrics={metrics} />
        </div>
      )}

      <div>
        <WidgetGrid onMetricsUpdate={handleMetricsUpdate} />
      </div>

      <hr className="border-gray-200 dark:border-gray-700/50" />

      <DashboardWidgetSections />
    </div>
  );
}
