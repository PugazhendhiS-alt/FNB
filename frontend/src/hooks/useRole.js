import { useAuth } from '../context/AuthContext';

export function useRole() {
  const { user, isGuest } = useAuth();

  const effectiveRole = user?.role || (isGuest ? 'CUSTOMER' : null);

  const isSuperadmin = user?.isSuperadmin || user?.role === 'SUPERADMIN';
  const isAdmin = effectiveRole === 'ADMIN' || isSuperadmin;
  const isBuildingManager = effectiveRole === 'BUILDING_MANAGER' || isSuperadmin;
  const isRestaurantManager = effectiveRole === 'RESTAURANT_MANAGER' || isSuperadmin;
  const isChef = effectiveRole === 'CHEF' || isSuperadmin;
  const isCustomer = effectiveRole === 'CUSTOMER';

  const currentRole = user?.activeRole || effectiveRole;

  const canManageBuildings = isAdmin || isBuildingManager;
  const canManageRestaurants = isAdmin || isBuildingManager;
  const canManageMenu = isAdmin || isRestaurantManager;
  const canManageOrders = isAdmin || isRestaurantManager || isChef;
  const canViewDashboard = true;
  const canPlaceOrders = isCustomer;

  return {
    isSuperadmin, isAdmin, isBuildingManager, isRestaurantManager, isChef, isCustomer,
    currentRole, canManageBuildings, canManageRestaurants, canManageMenu,
    canManageOrders, canViewDashboard, canPlaceOrders,
  };
}