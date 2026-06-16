import { useAuth } from '../context/AuthContext';

export function useRole() {
  const { user, isGuest } = useAuth();

  const effectiveRole = user?.role || (isGuest ? 'CUSTOMER' : null);

  const isSuperadmin = user?.isSuperadmin || user?.role === 'SUPERADMIN';
  const isBuildingManager = effectiveRole === 'BUILDING_MANAGER' || isSuperadmin;
  const isRestaurantManager = effectiveRole === 'RESTAURANT_MANAGER' || isSuperadmin;
  const isChef = effectiveRole === 'CHEF' || isSuperadmin;
  const isCustomer = effectiveRole === 'CUSTOMER';

  const currentRole = user?.activeRole || effectiveRole;

  const canManageBuildings = isSuperadmin;
  const canEditBuilding = isSuperadmin || isBuildingManager;
  const canManageRestaurants = isSuperadmin || isBuildingManager;
  const canDeleteRestaurant = isSuperadmin;
  const canManageMenu = isRestaurantManager || isSuperadmin;
  const canManageOrders = isRestaurantManager || isChef || isSuperadmin;
  const canManageUsers = isSuperadmin || effectiveRole === 'BUILDING_MANAGER' || effectiveRole === 'RESTAURANT_MANAGER';
  const canViewDashboard = true;
  const canPlaceOrders = isCustomer;

  return {
    isSuperadmin, isBuildingManager, isRestaurantManager, isChef, isCustomer,
    currentRole, canManageBuildings, canEditBuilding, canManageRestaurants, canDeleteRestaurant, canManageMenu,
    canManageOrders, canManageUsers, canViewDashboard, canPlaceOrders,
  };
}