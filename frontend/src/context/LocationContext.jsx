import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { buildingAPI, restaurantAPI } from '../api/endpoints';
import { useAuth } from './AuthContext';

const LocationContext = createContext(null);

export function LocationProvider({ children }) {
  const { user } = useAuth();
  const [buildings, setBuildings] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [selectedBuildingId, setSelectedBuildingId] = useState(null);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(null);
  const [loadingBuildings, setLoadingBuildings] = useState(true);
  const [loadingRestaurants, setLoadingRestaurants] = useState(true);

  const isCustomer = user?.role === 'CUSTOMER';

  useEffect(() => {
    if (!isCustomer) {
      setLoadingBuildings(true);
      buildingAPI.getAll()
        .then(r => setBuildings(r.data))
        .catch(() => setBuildings([]))
        .finally(() => setLoadingBuildings(false));
    }
  }, [isCustomer]);

  useEffect(() => {
    if (user?.building) {
      setSelectedBuildingId(prev => prev || user.building.id);
    }
    if (user?.restaurant) {
      setSelectedRestaurantId(prev => prev || user.restaurant.id);
    }
  }, [user?.building?.id, user?.restaurant?.id]);

  const fetchRestaurants = useCallback(async (buildingId) => {
    if (!buildingId) {
      setRestaurants([]);
      setLoadingRestaurants(false);
      return;
    }
    setLoadingRestaurants(true);
    try {
      const res = await restaurantAPI.getAll({ buildingId });
      setRestaurants(res.data);
      const exists = res.data.some(r => r.id === selectedRestaurantId);
      if (!exists && res.data.length > 0) {
        setSelectedRestaurantId(res.data[0].id);
      }
    } catch {
      setRestaurants([]);
    } finally {
      setLoadingRestaurants(false);
    }
  }, [selectedRestaurantId]);

  useEffect(() => {
    if (!isCustomer && selectedBuildingId) {
      fetchRestaurants(selectedBuildingId);
    }
  }, [selectedBuildingId, isCustomer, fetchRestaurants]);

  const selectedBuilding = buildings.find(b => b.id === selectedBuildingId)
    || (user?.building && !isCustomer ? user.building : null);

  const selectedRestaurant = restaurants.find(r => r.id === selectedRestaurantId)
    || (user?.restaurant && !isCustomer ? user.restaurant : null);

  const switchBuilding = (buildingId) => {
    setSelectedBuildingId(buildingId);
    setSelectedRestaurantId(null);
  };

  const switchRestaurant = (restaurantId) => {
    setSelectedRestaurantId(restaurantId);
  };

  return (
    <LocationContext.Provider value={{
      buildings, restaurants,
      selectedBuilding, selectedBuildingId,
      selectedRestaurant, selectedRestaurantId,
      switchBuilding, switchRestaurant,
      loadingBuildings, loadingRestaurants,
    }}>
      {children}
    </LocationContext.Provider>
  );
}

export const useLocation = () => useContext(LocationContext);
