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

  useEffect(() => {
    if (user?.building) setSelectedBuildingId(user.building.id);
    if (user?.restaurant) setSelectedRestaurantId(user.restaurant.id);
  }, [user?.building?.id, user?.restaurant?.id]);

  useEffect(() => {
    buildingAPI.getAll().then(r => setBuildings(r.data)).catch(() => {});
  }, []);

  const fetchRestaurants = useCallback(async (buildingId) => {
    try {
      const res = await restaurantAPI.getAll({ buildingId });
      setRestaurants(res.data);
    } catch {
      setRestaurants([]);
    }
  }, []);

  useEffect(() => {
    if (selectedBuildingId) {
      fetchRestaurants(selectedBuildingId);
    }
  }, [selectedBuildingId, fetchRestaurants]);

  const selectedBuilding = buildings.find(b => b.id === selectedBuildingId) || user?.building || null;
  const selectedRestaurant = restaurants.find(r => r.id === selectedRestaurantId) || user?.restaurant || null;

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
      switchBuilding, switchRestaurant, fetchRestaurants,
    }}>
      {children}
    </LocationContext.Provider>
  );
}

export const useLocation = () => useContext(LocationContext);
