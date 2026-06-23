export const ROLES = {
  SUPERADMIN: 'SUPERADMIN',
  BUILDING_MANAGER: 'BUILDING_MANAGER',
  RESTAURANT_MANAGER: 'RESTAURANT_MANAGER',
  CHEF: 'CHEF',
  CUSTOMER: 'CUSTOMER',
};

export const ORDER_STATUS = {
  PENDING_PAYMENT: 'PENDING_PAYMENT',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  PAID: 'PAID',
  PREPARING: 'PREPARING',
  COMPLETED: 'COMPLETED',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
};

export const STATUS_STYLES = {
  PENDING_PAYMENT: { label: 'Pending Payment', class: 'badge-warning' },
  PAYMENT_FAILED: { label: 'Payment Failed', class: 'badge-danger' },
  PAID: { label: 'Paid', class: 'badge-info' },
  PREPARING: { label: 'Preparing', class: 'badge-purple' },
  COMPLETED: { label: 'Completed', class: 'badge-success' },
  DELIVERED: { label: 'Delivered', class: 'badge-success' },
  CANCELLED: { label: 'Cancelled', class: 'badge-danger' },
};

export const ROLE_HIERARCHY = {
  SUPERADMIN: 100,
  BUILDING_MANAGER: 70,
  RESTAURANT_MANAGER: 50,
  CHEF: 40,
  CUSTOMER: 10,
};

export const ROLE_LABELS = {
  SUPERADMIN: 'Super Admin',
  BUILDING_MANAGER: 'Building Manager',
  RESTAURANT_MANAGER: 'Restaurant Manager',
  CHEF: 'Chef',
  CUSTOMER: 'Customer',
};

export const WIDGET_DISPLAY_TYPES = [
  { value: 'stat_card', label: 'Number Card' },
  { value: 'list', label: 'List' },
  { value: 'progress', label: 'Progress Bars' },
];

export const WIDGET_COLORS = {
  blue: 'blue', green: 'green', purple: 'purple', yellow: 'yellow',
  red: 'red', indigo: 'indigo', teal: 'teal',
};

export const WIDGET_SIZES = {
  sm: { w: 1, h: 1, label: 'Small' },
  md: { w: 2, h: 2, label: 'Medium' },
  lg: { w: 3, h: 2, label: 'Large' },
};

export const CUSTOM_DATA_SOURCES = [
  { value: 'total_users', label: 'Total Users' },
  { value: 'total_buildings', label: 'Total Buildings' },
  { value: 'total_restaurants', label: 'Total Restaurants' },
  { value: 'total_orders', label: 'Total Orders' },
  { value: 'total_revenue', label: 'Total Revenue' },
  { value: 'pending_orders', label: 'Pending Orders' },
  { value: 'preparing_orders', label: 'In Preparation' },
  { value: 'completed_today', label: 'Delivered Today' },
  { value: 'avg_order_value', label: 'Average Order Value' },
];

export const SYSTEM_WIDGETS = [
  { widgetType: 'stats_total_users', label: 'Total Users', displayType: 'stat_card', roles: ['SUPERADMIN'] },
  { widgetType: 'stats_buildings', label: 'Total Buildings', displayType: 'stat_card', roles: ['SUPERADMIN'] },
  { widgetType: 'stats_restaurants', label: 'Total Restaurants', displayType: 'stat_card', roles: ['SUPERADMIN','BUILDING_MANAGER','RESTAURANT_MANAGER','CHEF'] },
  { widgetType: 'stats_orders', label: 'Total Orders', displayType: 'stat_card', roles: ['SUPERADMIN','BUILDING_MANAGER','RESTAURANT_MANAGER','CHEF'] },
  { widgetType: 'stats_revenue', label: 'Total Revenue', displayType: 'stat_card', roles: ['SUPERADMIN','BUILDING_MANAGER','RESTAURANT_MANAGER'] },
  { widgetType: 'stats_pending_orders', label: 'Pending Orders', displayType: 'stat_card', roles: ['SUPERADMIN','BUILDING_MANAGER','RESTAURANT_MANAGER','CHEF'] },
  { widgetType: 'stats_preparing', label: 'In Preparation', displayType: 'stat_card', roles: ['SUPERADMIN','BUILDING_MANAGER','RESTAURANT_MANAGER','CHEF'] },
  { widgetType: 'stats_completed_today', label: 'Delivered Today', displayType: 'stat_card', roles: ['SUPERADMIN','BUILDING_MANAGER','RESTAURANT_MANAGER','CHEF'] },
  { widgetType: 'users_by_role', label: 'Users by Role', displayType: 'progress', roles: ['SUPERADMIN'] },
  { widgetType: 'orders_by_status', label: 'Orders by Status', displayType: 'status_bar', roles: ['SUPERADMIN','BUILDING_MANAGER','RESTAURANT_MANAGER','CHEF'] },
  { widgetType: 'recent_orders', label: 'Recent Orders', displayType: 'list', roles: ['SUPERADMIN','BUILDING_MANAGER','RESTAURANT_MANAGER','CHEF'] },
  { widgetType: 'popular_items', label: 'Popular Items', displayType: 'ranked_list', roles: ['SUPERADMIN','BUILDING_MANAGER','RESTAURANT_MANAGER','CHEF'] },
  { widgetType: 'buildings_list', label: 'Buildings', displayType: 'list', roles: ['SUPERADMIN'] },
  { widgetType: 'restaurants_list', label: 'Restaurants', displayType: 'list', roles: ['SUPERADMIN','BUILDING_MANAGER'] },
  { widgetType: 'quick_actions', label: 'Quick Actions', displayType: 'action_grid', roles: ['SUPERADMIN','BUILDING_MANAGER','RESTAURANT_MANAGER','CHEF'] },
  { widgetType: 'building_reports', label: 'Building Reports', displayType: 'table', roles: ['SUPERADMIN'] },
  { widgetType: 'restaurant_reports', label: 'Restaurant Reports', displayType: 'table', roles: ['SUPERADMIN'] },
  { widgetType: 'revenue_chart', label: 'Revenue Chart', displayType: 'bar_chart', roles: ['SUPERADMIN','BUILDING_MANAGER','RESTAURANT_MANAGER'] },
  { widgetType: 'food_card_overview', label: 'Food Card', displayType: 'food_card', roles: ['CUSTOMER','SUPERADMIN','BUILDING_MANAGER','RESTAURANT_MANAGER'] },
];

export const ROLE_DEFAULT_MODULES = {
  SUPERADMIN: ['dashboard', 'orders', 'inventory', 'menu', 'restaurants', 'buildings', 'users', 'delivery', 'modules', 'profile'],
  BUILDING_MANAGER: ['dashboard', 'inventory', 'restaurants', 'users', 'profile'],
  RESTAURANT_MANAGER: ['dashboard', 'orders', 'inventory', 'menu', 'users', 'delivery', 'profile'],
  CHEF: ['dashboard', 'orders', 'inventory', 'profile'],
  CUSTOMER: ['dashboard', 'restaurants', 'orders', 'profile'],
};

export const MODULE_PATH_MAP = {
  dashboard: ['/'],
  profile: ['/profile'],
  orders: ['/orders'],
  inventory: ['/inventory'],
  menu: ['/menu'],
  restaurants: ['/restaurants'],
  buildings: ['/buildings'],
  users: ['/users'],
  delivery: ['/delivery-confirmation'],
  modules: ['/modules'],
};

export const SIDEBAR_LINKS = {
  SUPERADMIN: [
    { type: 'single', path: '/', label: 'Dashboard', icon: 'ChartBarIcon' },
    {
      type: 'group', title: 'Order Management', icon: 'ShoppingBagIcon',
      children: [
        { path: '/orders', label: 'Orders' },
        { path: '/delivery-confirmation', label: 'Confirm Delivery' },
      ],
    },
    {
      type: 'group', title: 'Operations', icon: 'CubeIcon',
      children: [
        { path: '/inventory', label: 'Inventory' },
        { path: '/menu', label: 'Menu Items' },
        { path: '/restaurants', label: 'Restaurants' },
      ],
    },
    {
      type: 'group', title: 'Administration', icon: 'BuildingOffice2Icon',
      children: [
        { path: '/buildings', label: 'Buildings' },
        { path: '/users', label: 'Users' },
        { path: '/modules', label: 'Modules' },
      ],
    },
    { type: 'single', path: '/profile', label: 'Profile', icon: 'UserCircleIcon' },
  ],
  BUILDING_MANAGER: [
    { type: 'single', path: '/', label: 'Dashboard', icon: 'ChartBarIcon' },
    {
      type: 'group', title: 'Operations', icon: 'CubeIcon',
      children: [
        { path: '/inventory', label: 'Inventory' },
        { path: '/restaurants', label: 'Restaurants' },
      ],
    },
    { type: 'single', path: '/users', label: 'Users', icon: 'UsersIcon' },
    { type: 'single', path: '/profile', label: 'Profile', icon: 'UserCircleIcon' },
  ],
  RESTAURANT_MANAGER: [
    { type: 'single', path: '/', label: 'Dashboard', icon: 'ChartBarIcon' },
    {
      type: 'group', title: 'Order Management', icon: 'ShoppingBagIcon',
      children: [
        { path: '/orders', label: 'Orders' },
        { path: '/delivery-confirmation', label: 'Confirm Delivery' },
      ],
    },
    {
      type: 'group', title: 'Operations', icon: 'CubeIcon',
      children: [
        { path: '/inventory', label: 'Inventory' },
        { path: '/menu', label: 'Menu' },
      ],
    },
    { type: 'single', path: '/users', label: 'Users', icon: 'UsersIcon' },
    { type: 'single', path: '/profile', label: 'Profile', icon: 'UserCircleIcon' },
  ],
  CHEF: [
    { type: 'single', path: '/', label: 'Dashboard', icon: 'ChartBarIcon' },
    { type: 'single', path: '/orders', label: 'Orders', icon: 'ShoppingBagIcon' },
    { type: 'single', path: '/inventory', label: 'Inventory', icon: 'CubeIcon' },
    { type: 'single', path: '/profile', label: 'Profile', icon: 'UserCircleIcon' },
  ],
  CUSTOMER: [
    { type: 'single', path: '/', label: 'Dashboard', icon: 'ChartBarIcon' },
    { type: 'single', path: '/restaurants', label: 'Restaurants', icon: 'HomeModernIcon' },
    { type: 'single', path: '/orders', label: 'My Orders', icon: 'ShoppingBagIcon' },
    { type: 'single', path: '/profile', label: 'Profile', icon: 'UserCircleIcon' },
  ],
};