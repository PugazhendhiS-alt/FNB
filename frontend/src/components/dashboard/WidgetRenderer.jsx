import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardWidget from '../ui/DashboardWidget';
import Badge from '../ui/Badge';
import { formatCurrency, formatDate, getStatusLabel, getStatusStyle } from '../../lib/utils';
import { ROLE_LABELS } from '../../lib/constants';
import {
  UsersIcon, BuildingOffice2Icon, BuildingStorefrontIcon, ShoppingBagIcon,
  CurrencyDollarIcon, ClockIcon, CubeIcon, ChartBarIcon, UserGroupIcon,
} from '@heroicons/react/24/outline';

const ICONS = {
  UsersIcon, BuildingOffice2Icon, BuildingStorefrontIcon, ShoppingBagIcon,
  CurrencyDollarIcon, ClockIcon, CubeIcon, ChartBarIcon, UserGroupIcon,
};

function ProgressBar({ value, max, color = 'blue', label }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  const colors = {
    blue: 'bg-blue-500', green: 'bg-emerald-500', purple: 'bg-violet-500',
    yellow: 'bg-amber-500', red: 'bg-rose-500', indigo: 'bg-indigo-500',
    teal: 'bg-teal-500', gray: 'bg-gray-400',
  };
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-500 dark:text-gray-400 w-24 sm:w-28 flex-shrink-0 truncate">{label}</span>
      <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${colors[color] || colors.blue}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 w-12 text-right flex-shrink-0">{value}</span>
    </div>
  );
}

const ProgressBarMemo = memo(ProgressBar);

function StatusBar({ statuses, orders }) {
  const statusColors = {
    PENDING_PAYMENT: 'bg-amber-400', PAID: 'bg-blue-400', PREPARING: 'bg-violet-400',
    COMPLETED: 'bg-teal-400', DELIVERED: 'bg-emerald-400', CANCELLED: 'bg-gray-400',
  };
  const counts = {};
  statuses.forEach(s => { counts[s] = 0; });
  orders.forEach(o => { if (counts[o.status] !== undefined) counts[o.status]++; });
  const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
  return (
    <div className="space-y-3">
      <div className="flex h-3 rounded-full overflow-hidden">
        {statuses.filter(s => counts[s] > 0).map(s => (
          <div key={s} className={`${statusColors[s] || 'bg-gray-300'}`} style={{ width: `${(counts[s] / total) * 100}%` }} title={`${getStatusLabel(s)}: ${counts[s]}`} />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {statuses.map(s => (
          <div key={s} className="flex items-center justify-between text-xs">
            <span className={`badge ${getStatusStyle(s)}`}>{getStatusLabel(s)}</span>
            <span className="font-medium text-gray-700 dark:text-gray-300">{counts[s]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const StatusBarMemo = memo(StatusBar);

function RankBadge({ rank }) {
  if (rank === 0) return <span className="flex-shrink-0 w-6 h-6 rounded-full bg-yellow-400 text-white flex items-center justify-center text-xs font-bold">1</span>;
  if (rank === 1) return <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center text-xs font-bold">2</span>;
  if (rank === 2) return <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-700 text-white flex items-center justify-center text-xs font-bold">3</span>;
  return <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-400 flex items-center justify-center text-xs font-bold">{rank + 1}</span>;
}

const RankBadgeMemo = memo(RankBadge);

const widgetIconMap = {
  stats_total_users: 'UsersIcon', stats_buildings: 'BuildingOffice2Icon',
  stats_restaurants: 'BuildingStorefrontIcon', stats_orders: 'ShoppingBagIcon',
  stats_revenue: 'CurrencyDollarIcon', stats_pending_orders: 'ClockIcon',
  stats_preparing: 'CubeIcon', stats_completed_today: 'CubeIcon',
  users_by_role: 'UserGroupIcon', orders_by_status: 'ShoppingBagIcon',
  recent_orders: 'ShoppingBagIcon', popular_items: 'CubeIcon',
  buildings_list: 'BuildingOffice2Icon', restaurants_list: 'BuildingStorefrontIcon',
  quick_actions: 'ChartBarIcon', building_reports: 'BuildingOffice2Icon',
  restaurant_reports: 'BuildingStorefrontIcon', revenue_chart: 'ChartBarIcon',
};

function getWidgetIcon(widgetType) {
  const name = widgetIconMap[widgetType] || 'ChartBarIcon';
  const Icon = ICONS[name];
  return Icon ? <Icon className="w-5 h-5" /> : null;
}

function StatCardView({ value, subtitle, currency }) {
  return (
    <div className="text-center py-2">
      <div className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-white">
        {currency ? formatCurrency(value) : (value ?? 0)}
      </div>
      {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
    </div>
  );
}

const StatCardViewMemo = memo(StatCardView);

function UsersByRoleView({ data }) {
  if (!data || data.length === 0) return <p className="text-sm text-gray-400 text-center py-4">No users found</p>;
  const total = data.reduce((s, r) => s + r.count, 0) || 1;
  return (
    <div className="space-y-2.5">
      {data.map((item) => (
        <ProgressBarMemo
          key={item.role}
          label={ROLE_LABELS[item.role] || item.role}
          value={item.count}
          max={total}
          color={item.role === 'SUPERADMIN' ? 'purple' : item.role === 'ADMIN' ? 'blue' : item.role === 'BUILDING_MANAGER' ? 'yellow' : item.role === 'RESTAURANT_MANAGER' ? 'teal' : item.role === 'CHEF' ? 'green' : 'gray'}
        />
      ))}
    </div>
  );
}

const UsersByRoleViewMemo = memo(UsersByRoleView);

function OrdersByStatusView({ data }) {
  if (!data || data.length === 0) return <p className="text-sm text-gray-400 text-center py-4">No orders</p>;
  return (
    <StatusBarMemo
      statuses={['PENDING_PAYMENT', 'PAID', 'PREPARING', 'COMPLETED', 'DELIVERED', 'CANCELLED']}
      orders={data}
    />
  );
}

const OrdersByStatusViewMemo = memo(OrdersByStatusView);

function RecentOrdersView({ data }) {
  if (!data || data.length === 0) return <p className="text-sm text-gray-400 text-center py-4">No recent orders</p>;
  return (
    <div className="divide-y divide-gray-100 dark:divide-gray-700/50 -mx-1">
      {data.slice(0, 5).map((order) => (
        <div key={order.id} className="py-2.5 flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">#{order.orderCode?.slice(0, 8)}</p>
            <p className="text-xs text-gray-400 truncate">{order.restaurant?.name}</p>
          </div>
          <div className="text-right ml-3 flex-shrink-0">
            <span className={`badge ${getStatusStyle(order.status)}`}>{getStatusLabel(order.status)}</span>
            <p className="text-xs font-medium mt-0.5 text-gray-600 dark:text-gray-400">{formatCurrency(order.totalAmount)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

const RecentOrdersViewMemo = memo(RecentOrdersView);

function PopularItemsView({ data }) {
  if (!data || data.length === 0) return <p className="text-sm text-gray-400 text-center py-4">No data yet</p>;
  return (
    <div className="divide-y divide-gray-100 dark:divide-gray-700/50 -mx-1">
      {data.map((item, i) => (
        <div key={item?.id || i} className="py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <RankBadgeMemo rank={i} />
            <p className="text-sm font-medium truncate">{item?.name || 'Unknown'}</p>
          </div>
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 flex-shrink-0">{item?.totalSold || 0} sold</span>
        </div>
      ))}
    </div>
  );
}

const PopularItemsViewMemo = memo(PopularItemsView);

function BuildingsListView({ data }) {
  if (!data || data.length === 0) return <p className="text-sm text-gray-400 text-center py-4">No buildings</p>;
  return (
    <div className="space-y-3">
      {data.slice(0, 6).map((b) => (
        <div key={b.id} className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate">{b.name}</p>
            <p className="text-xs text-gray-400">{b._count?.restaurants || 0} restaurants · {b._count?.users || 0} users</p>
          </div>
          <Badge variant={b.isActive ? 'success' : 'danger'}>{b.isActive ? 'Active' : 'Inactive'}</Badge>
        </div>
      ))}
    </div>
  );
}

const BuildingsListViewMemo = memo(BuildingsListView);

function RestaurantsListView({ data }) {
  if (!data || data.length === 0) return <p className="text-sm text-gray-400 text-center py-4">No restaurants</p>;
  return (
    <div className="divide-y divide-gray-100 dark:divide-gray-700/50 -mx-1">
      {data.slice(0, 7).map((r) => (
        <div key={r.id} className="py-2.5 flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate">{r.name}</p>
            <p className="text-xs text-gray-400 truncate">{r.building?.name} · {r.cuisine || '-'}</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400 flex-shrink-0 ml-3">
            <span>{r._count?.menuItems || 0} items</span>
            <span className="w-1 h-1 rounded-full bg-gray-300" />
            <span>{r._count?.orders || 0} ords</span>
          </div>
        </div>
      ))}
    </div>
  );
}

const RestaurantsListViewMemo = memo(RestaurantsListView);

const QUICK_ACTIONS = [
  { path: '/users', label: 'Manage Users', sub: 'Add or edit users', icon: UsersIcon,
    classes: 'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/30 border-blue-200 dark:border-blue-800',
    iconClasses: 'text-blue-600 dark:text-blue-400' },
  { path: '/buildings', label: 'Buildings', sub: 'Manage buildings', icon: BuildingOffice2Icon,
    classes: 'from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-900/30 border-amber-200 dark:border-amber-800',
    iconClasses: 'text-amber-600 dark:text-amber-400' },
  { path: '/restaurants', label: 'Restaurants', sub: 'Manage restaurants', icon: BuildingStorefrontIcon,
    classes: 'from-violet-50 to-violet-100 dark:from-violet-900/20 dark:to-violet-900/30 border-violet-200 dark:border-violet-800',
    iconClasses: 'text-violet-600 dark:text-violet-400' },
  { path: '/orders', label: 'Orders', sub: 'Monitor orders', icon: ShoppingBagIcon,
    classes: 'from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-900/30 border-emerald-200 dark:border-emerald-800',
    iconClasses: 'text-emerald-600 dark:text-emerald-400' },
];

function QuickActionsView() {
  const navigate = useNavigate();
  return (
    <div className="grid grid-cols-2 gap-3">
      {QUICK_ACTIONS.map((link) => {
        const Icon = link.icon;
        return (
          <button key={link.path} onClick={() => navigate(link.path)}
            className={`p-3 rounded-xl bg-gradient-to-br ${link.classes} hover:shadow-md transition-shadow text-left border`}
          >
            <Icon className={`w-6 h-6 ${link.iconClasses} mb-2`} />
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{link.label}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{link.sub}</p>
          </button>
        );
      })}
    </div>
  );
}

const QuickActionsViewMemo = memo(QuickActionsView);

function BuildingReportsView({ data }) {
  if (!data || data.length === 0) return <p className="text-sm text-gray-400 text-center py-4">No reports</p>;
  return (
    <div className="overflow-x-auto -mx-1">
      <table className="min-w-full text-xs">
        <thead className="text-left text-gray-500 dark:text-gray-400">
          <tr><th className="pb-2 pr-2 font-medium">Building</th><th className="pb-2 pr-2 font-medium text-right">Orders</th><th className="pb-2 font-medium text-right">Revenue</th></tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
          {data.map(b => (
            <tr key={b.id}>
              <td className="py-1.5 pr-2 font-medium truncate max-w-[100px]">{b.name}</td>
              <td className="py-1.5 pr-2 text-right">{b.totalOrders}</td>
              <td className="py-1.5 text-right font-medium">{formatCurrency(b.totalRevenue)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const BuildingReportsViewMemo = memo(BuildingReportsView);

function RestaurantReportsView({ data }) {
  if (!data || data.length === 0) return <p className="text-sm text-gray-400 text-center py-4">No reports</p>;
  return (
    <div className="overflow-x-auto -mx-1">
      <table className="min-w-full text-xs">
        <thead className="text-left text-gray-500 dark:text-gray-400">
          <tr><th className="pb-2 pr-2 font-medium">Restaurant</th><th className="pb-2 pr-2 font-medium text-right">Orders</th><th className="pb-2 font-medium text-right">Revenue</th></tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
          {data.map(r => (
            <tr key={r.id}>
              <td className="py-1.5 pr-2 font-medium truncate max-w-[100px]">{r.name}</td>
              <td className="py-1.5 pr-2 text-right">{r.totalOrders}</td>
              <td className="py-1.5 text-right font-medium">{formatCurrency(r.totalRevenue)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const RestaurantReportsViewMemo = memo(RestaurantReportsView);

function RevenueChartView({ data }) {
  if (!data || data.length === 0) return <p className="text-sm text-gray-400 text-center py-4">No data</p>;
  const maxRevenue = Math.max(...data.map(d => d.revenue), 1);
  return (
    <div className="space-y-2">
      <div className="flex items-end gap-1 h-28">
        {data.map((d) => (
          <div key={d.date} className="flex-1 flex flex-col items-center justify-end h-full">
            <div
              className="w-full bg-primary-500/80 dark:bg-primary-400/80 rounded-t transition-all duration-300 hover:bg-primary-600 dark:hover:bg-primary-300 relative group min-h-[4px]"
              style={{ height: `${(d.revenue / maxRevenue) * 100}%` }}
            >
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs rounded px-1.5 py-0.5 opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity">
                {formatCurrency(d.revenue)}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between text-[10px] text-gray-400">
        {data.filter((_, i) => i % Math.ceil(data.length / 5) === 0 || i === data.length - 1).map(d => (
          <span key={d.date}>{new Date(d.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
        ))}
      </div>
    </div>
  );
}

const RevenueChartViewMemo = memo(RevenueChartView);

function renderContent(widgetType, displayType, data, config) {
  if (!data) return <p className="text-sm text-gray-400 text-center py-4">No data</p>;

  switch (widgetType) {
    case 'custom': return <CustomWidgetContent data={data} displayType={displayType} config={config} />;
    case 'stats_total_users': return <StatCardViewMemo value={data?.value} subtitle="Registered users" />;
    case 'stats_buildings': return <StatCardViewMemo value={data?.value} subtitle="Total buildings" />;
    case 'stats_restaurants': return <StatCardViewMemo value={data?.value} subtitle="Total restaurants" />;
    case 'stats_orders': return <StatCardViewMemo value={data?.value} subtitle="All orders" />;
    case 'stats_revenue': return <StatCardViewMemo value={data?.value} currency subtitle="Total revenue" />;
    case 'stats_pending_orders': return <StatCardViewMemo value={data?.value} subtitle="Awaiting action" />;
    case 'stats_preparing': return <StatCardViewMemo value={data?.value} subtitle="Being prepared" />;
    case 'stats_completed_today': return <StatCardViewMemo value={data?.value} subtitle="Completed today" />;
    case 'users_by_role': return <UsersByRoleViewMemo data={data?.data} />;
    case 'orders_by_status': return <OrdersByStatusViewMemo data={data?.data} />;
    case 'recent_orders': return <RecentOrdersViewMemo data={data?.data} />;
    case 'popular_items': return <PopularItemsViewMemo data={data?.data} />;
    case 'buildings_list': return <BuildingsListViewMemo data={data?.data} />;
    case 'restaurants_list': return <RestaurantsListViewMemo data={data?.data} />;
    case 'quick_actions': return <QuickActionsViewMemo />;
    case 'building_reports': return <BuildingReportsViewMemo data={data?.data} />;
    case 'restaurant_reports': return <RestaurantReportsViewMemo data={data?.data} />;
    case 'revenue_chart': return <RevenueChartViewMemo data={data?.data} />;
    default: return <p className="text-sm text-gray-400 text-center py-4">Unknown widget</p>;
  }
}

function CustomWidgetContent({ data, displayType, config }) {
  if (displayType === 'stat_card') {
    const isCurrency = config?.customSource === 'total_revenue' || config?.customSource === 'avg_order_value';
    return <StatCardViewMemo value={data?.value} currency={isCurrency} />;
  }
  return (
    <div className="text-center py-4">
      <div className="text-3xl font-bold text-gray-800 dark:text-white">{data?.value ?? 0}</div>
    </div>
  );
}

const CustomWidgetContentMemo = memo(CustomWidgetContent);

export default memo(function WidgetRenderer({ widget, data, loading, onRemove, onSettings }) {
  const { title, widgetType, displayType, config } = widget;
  const color = config?.color || 'blue';
  const icon = getWidgetIcon(widgetType);

  if (loading) {
    return <DashboardWidget title={title} icon={icon} color={color} loading />;
  }

  const content = renderContent(widgetType, displayType, data, config);

  return (
    <DashboardWidget
      title={title}
      icon={icon}
      color={color}
      footer={
        <div className="flex items-center justify-between">
          {data?.footerLink && (
            <span className="text-xs text-primary-600 hover:underline cursor-pointer font-medium">{data.footerLink}</span>
          )}
          <div className="flex items-center gap-1 ml-auto">
            {onSettings && (
              <button onClick={onSettings} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" title="Settings">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </button>
            )}
            {onRemove && (
              <button onClick={onRemove} className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500" title="Remove widget">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            )}
          </div>
        </div>
      }
    >
      {content}
    </DashboardWidget>
  );
});