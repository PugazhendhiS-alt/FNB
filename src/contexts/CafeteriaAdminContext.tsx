import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { Building, Cafeteria, MenuItem } from '@/types/data';
import { buildings as mockBuildings } from '@/data/mockData';
import { supabase, supabaseAdmin, SUPABASE_ENABLED } from '@/lib/supabaseClient';
import { createRemoteResource, deleteRemoteResource, getRemoteResource, updateRemoteResource } from '@/lib/remoteApi';

type CafeteriaRow = {
  id: string;
  buildingId: string;
  building_id?: string;
  name: string;
  image?: string;
  cuisine?: string;
  openTime?: string;
  open_time?: string;
  closeTime?: string;
  close_time?: string;
  isOpen?: boolean;
  is_open?: boolean;
  rating?: number;
  created_at?: string;
};

type MenuItemRow = {
  id: string;
  cafeteriaId?: string;
  cafeteria_id?: string;
  name: string;
  description?: string;
  price?: number;
  image?: string;
  category?: string;
  isVeg?: boolean;
  is_veg?: boolean;
  isVegan?: boolean;
  is_vegan?: boolean;
  calories?: number;
  prepTime?: string;
  prep_time?: string;
};

type BuildingRow = {
  id: string;
  name: string;
  address: string;
  cafeteriaCount?: number;
};

interface CafeteriaContextType {
  buildings: Building[];
  cafeterias: Cafeteria[];
  menuItems: MenuItem[];
  addBuilding: (building: Omit<Building, 'id'>) => Promise<Building>;
  updateBuilding: (id: string, building: Partial<Building>) => Promise<Building | null>;
  deleteBuilding: (id: string) => Promise<void>;
  addCafeteria: (cafeteria: Omit<Cafeteria, 'id'>) => Promise<Cafeteria>;
  updateCafeteria: (id: string, cafeteria: Partial<Cafeteria>) => Promise<Cafeteria | null>;
  deleteCafeteria: (id: string) => Promise<void>;
  addMenuItem: (item: Omit<MenuItem, 'id'>) => Promise<MenuItem>;
  updateMenuItem: (id: string, item: Partial<MenuItem>) => Promise<MenuItem | null>;
  deleteMenuItem: (id: string) => Promise<void>;
  remoteSyncAvailable: boolean | null;
  remoteSyncError: string | null;
}

const CafeteriaContext = createContext<CafeteriaContextType | undefined>(undefined);

const normalizeCafeteria = (row: CafeteriaRow): Cafeteria => ({
  id: row.id,
  buildingId: row.buildingId ?? row.building_id ?? '',
  name: row.name,
  image: row.image,
  cuisine: row.cuisine,
  openTime: row.openTime ?? row.open_time ?? '',
  closeTime: row.closeTime ?? row.close_time ?? '',
  isOpen: row.isOpen ?? row.is_open ?? false,
  rating: row.rating,
});

const normalizeMenuItem = (row: MenuItemRow): MenuItem => ({
  id: row.id,
  cafeteriaId: row.cafeteriaId ?? row.cafeteria_id ?? '',
  name: row.name,
  description: row.description,
  price: row.price ?? 0,
  image: row.image,
  category: row.category,
  isVeg: row.isVeg ?? row.is_veg ?? false,
  isVegan: row.isVegan ?? row.is_vegan ?? false,
  calories: row.calories,
  prepTime: row.prepTime ?? row.prep_time,
});

const normalizeBuilding = (row: BuildingRow): Building => ({
  id: row.id,
  name: row.name,
  address: row.address,
  cafeteriaCount: row.cafeteriaCount,
});

export const CafeteriaProvider = ({ children }: { children: ReactNode }) => {
  const [buildings, setBuildings] = useState<Building[]>(mockBuildings);
  const [cafeterias, setCafeterias] = useState<Cafeteria[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [remoteSyncAvailable, setRemoteSyncAvailable] = useState<boolean | null>(null);
  const [remoteSyncError, setRemoteSyncError] = useState<string | null>(null);

  const loadLocalData = () => {
    const storedBuildings = localStorage.getItem('buildings');
    const storedCafeterias = localStorage.getItem('cafeterias');
    const storedMenuItems = localStorage.getItem('menuItems');

    if (storedBuildings) {
      try {
        setBuildings(JSON.parse(storedBuildings));
      } catch {
        setBuildings(mockBuildings);
      }
    }

    if (storedCafeterias) {
      try {
        setCafeterias(JSON.parse(storedCafeterias));
      } catch {
        setCafeterias([]);
      }
    }

    if (storedMenuItems) {
      try {
        setMenuItems(JSON.parse(storedMenuItems));
      } catch {
        setMenuItems([]);
      }
    }
  };

  const saveLocalData = () => {
    localStorage.setItem('buildings', JSON.stringify(buildings));
    localStorage.setItem('cafeterias', JSON.stringify(cafeterias));
    localStorage.setItem('menuItems', JSON.stringify(menuItems));
  };

  const fetchCafeteriasFromSupabase = async (): Promise<Cafeteria[]> => {
    const client = supabaseAdmin ?? supabase;
    if (!client) {
      throw new Error('Supabase client is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
    }

    const { data, error } = await client.from<CafeteriaRow>('cafeterias').select('*');
    if (error) {
      throw error;
    }

    return (data ?? []).map(normalizeCafeteria);
  };

  const fetchMenuItemsFromSupabase = async (): Promise<MenuItem[]> => {
    const client = supabaseAdmin ?? supabase;
    if (!client) {
      throw new Error('Supabase client is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
    }

    const { data, error } = await client.from<MenuItemRow>('menu_items').select('*');
    if (error) {
      throw error;
    }

    return (data ?? []).map(normalizeMenuItem);
  };

  const fetchCafeteriasFromRemote = async (): Promise<Cafeteria[]> => {
    const data = await getRemoteResource<CafeteriaRow[]>('/cafeterias');
    return (data ?? []).map(normalizeCafeteria);
  };

  const fetchMenuItemsFromRemote = async (): Promise<MenuItem[]> => {
    const data = await getRemoteResource<MenuItemRow[]>('/menu-items');
    return (data ?? []).map(normalizeMenuItem);
  };

  const createCafeteriaRemote = async (cafeteria: Omit<Cafeteria, 'id'>): Promise<Cafeteria> => {
    const data = await createRemoteResource<Omit<Cafeteria, 'id'>, CafeteriaRow>('/cafeterias', cafeteria);
    return normalizeCafeteria(data);
  };

  const updateCafeteriaRemote = async (id: string, updates: Partial<Cafeteria>): Promise<Cafeteria | null> => {
    const data = await updateRemoteResource<Partial<Cafeteria>, CafeteriaRow>(`/cafeterias/${id}`, updates);
    return data ? normalizeCafeteria(data) : null;
  };

  const deleteCafeteriaRemote = async (id: string) => {
    await deleteRemoteResource(`/cafeterias/${id}`);
  };

  const createCafeteriaSupabase = async (cafeteria: Omit<Cafeteria, 'id'>): Promise<Cafeteria> => {
    const client = supabaseAdmin ?? supabase;
    if (!client) {
      throw new Error('Supabase client is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
    }

    const { data, error } = await client
      .from<CafeteriaRow>('cafeterias')
      .insert([{ ...cafeteria }])
      .select()
      .single();

    if (error) {
      throw error;
    }

    if (!data) {
      throw new Error('Failed to create cafeteria');
    }

    return normalizeCafeteria(data);
  };

  const updateCafeteriaSupabase = async (id: string, updates: Partial<Cafeteria>): Promise<Cafeteria | null> => {
    const client = supabaseAdmin ?? supabase;
    if (!client) {
      throw new Error('Supabase client is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
    }

    const { data, error } = await client
      .from<CafeteriaRow>('cafeterias')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data ? normalizeCafeteria(data) : null;
  };

  const deleteCafeteriaSupabase = async (id: string) => {
    const client = supabaseAdmin ?? supabase;
    if (!client) {
      throw new Error('Supabase client is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
    }

    const { error } = await client.from('cafeterias').delete().eq('id', id);
    if (error) {
      throw error;
    }
  };

  const createMenuItemRemote = async (item: Omit<MenuItem, 'id'>): Promise<MenuItem> => {
    const data = await createRemoteResource<Omit<MenuItem, 'id'>, MenuItemRow>('/menu-items', item);
    return normalizeMenuItem(data);
  };

  const updateMenuItemRemote = async (id: string, updates: Partial<MenuItem>): Promise<MenuItem | null> => {
    const data = await updateRemoteResource<Partial<MenuItem>, MenuItemRow>(`/menu-items/${id}`, updates);
    return data ? normalizeMenuItem(data) : null;
  };

  const deleteMenuItemRemote = async (id: string) => {
    await deleteRemoteResource(`/menu-items/${id}`);
  };

  const createMenuItemSupabase = async (item: Omit<MenuItem, 'id'>): Promise<MenuItem> => {
    const client = supabaseAdmin ?? supabase;
    if (!client) {
      throw new Error('Supabase client is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
    }

    const { data, error } = await client
      .from<MenuItemRow>('menu_items')
      .insert([{ ...item }])
      .select()
      .single();

    if (error) {
      throw error;
    }

    if (!data) {
      throw new Error('Failed to create menu item');
    }

    return normalizeMenuItem(data);
  };

  const updateMenuItemSupabase = async (id: string, updates: Partial<MenuItem>): Promise<MenuItem | null> => {
    const client = supabaseAdmin ?? supabase;
    if (!client) {
      throw new Error('Supabase client is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
    }

    const { data, error } = await client
      .from<MenuItemRow>('menu_items')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data ? normalizeMenuItem(data) : null;
  };

  const deleteMenuItemSupabase = async (id: string) => {
    const client = supabaseAdmin ?? supabase;
    if (!client) {
      throw new Error('Supabase client is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
    }

    const { error } = await client.from('menu_items').delete().eq('id', id);
    if (error) {
      throw error;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      loadLocalData();

      try {
        const [remoteCafeterias, remoteMenuItems] = await Promise.all([
          fetchCafeteriasFromRemote(),
          fetchMenuItemsFromRemote(),
        ]);

        setCafeterias(remoteCafeterias);
        setMenuItems(remoteMenuItems);
        setRemoteSyncAvailable(true);
        setRemoteSyncError(null);
        return;
      } catch (error) {
        console.warn('Unable to load restaurant data from remote API, falling back:', error);
        setRemoteSyncAvailable(false);
        setRemoteSyncError(error instanceof Error ? error.message : 'Remote sync failed');
      }

      if (!SUPABASE_ENABLED) {
        return;
      }

      try {
        const [supabaseCafeterias, supabaseMenuItems] = await Promise.all([
          fetchCafeteriasFromSupabase(),
          fetchMenuItemsFromSupabase(),
        ]);

        setCafeterias(supabaseCafeterias);
        setMenuItems(supabaseMenuItems);
      } catch (error) {
        console.warn('Unable to load cafeterias from Supabase, continuing with local data:', error);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (remoteSyncAvailable !== false) {
      return;
    }

    const interval = window.setInterval(async () => {
      try {
        const [remoteCafeterias, remoteMenuItems] = await Promise.all([
          fetchCafeteriasFromRemote(),
          fetchMenuItemsFromRemote(),
        ]);

        setCafeterias(remoteCafeterias);
        setMenuItems(remoteMenuItems);
        setRemoteSyncAvailable(true);
        setRemoteSyncError(null);
      } catch (error) {
        setRemoteSyncError(error instanceof Error ? error.message : 'Remote sync failed');
        console.warn('Remote cafeteria sync retry failed:', error);
      }
    }, 10000);

    return () => window.clearInterval(interval);
  }, [remoteSyncAvailable]);

  useEffect(() => {
    saveLocalData();
  }, [buildings, cafeterias, menuItems]);

  const addBuilding = async (building: Omit<Building, 'id'>) => {
    const newBuilding: Building = {
      ...building,
      id: `b${Date.now()}`,
    };
    setBuildings((prev) => [...prev, newBuilding]);
    return newBuilding;
  };

  const updateBuilding = async (id: string, updates: Partial<Building>) => {
    let updatedBuilding: Building | null = null;
    setBuildings((prev) =>
      prev.map((building) => {
        if (building.id !== id) return building;
        updatedBuilding = { ...building, ...updates };
        return updatedBuilding;
      })
    );
    return updatedBuilding;
  };

  const deleteBuilding = async (id: string) => {
    setBuildings((prev) => prev.filter((building) => building.id !== id));
  };

  const addCafeteria = async (cafeteria: Omit<Cafeteria, 'id'>) => {
    try {
      const newCafeteria = await createCafeteriaRemote(cafeteria);
      setCafeterias((prev) => [...prev, newCafeteria]);
      setRemoteSyncAvailable(true);
      setRemoteSyncError(null);
      return newCafeteria;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Remote cafeteria create failed';
      console.warn('Failed to create cafeteria in remote API:', error);
      setRemoteSyncAvailable(false);
      setRemoteSyncError(message);
      if (remoteSyncAvailable === true) {
        throw error;
      }
    }

    if (SUPABASE_ENABLED) {
      try {
        const newCafeteria = await createCafeteriaSupabase(cafeteria);
        setCafeterias((prev) => [...prev, newCafeteria]);
        return newCafeteria;
      } catch (error) {
        console.warn('Failed to create cafeteria in Supabase, falling back to local storage:', error);
      }
    }

    const newCafeteria: Cafeteria = {
      ...cafeteria,
      id: `c${Date.now()}`,
    };
    setCafeterias((prev) => [...prev, newCafeteria]);
    return newCafeteria;
  };

  const updateCafeteria = async (id: string, updates: Partial<Cafeteria>) => {
    try {
      const updatedCafeteria = await updateCafeteriaRemote(id, updates);
      if (updatedCafeteria) {
        setCafeterias((prev) => prev.map((c) => (c.id === id ? updatedCafeteria : c)));
        setRemoteSyncAvailable(true);
        setRemoteSyncError(null);
        return updatedCafeteria;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Remote cafeteria update failed';
      console.warn('Failed to update cafeteria in remote API:', error);
      setRemoteSyncAvailable(false);
      setRemoteSyncError(message);
      if (remoteSyncAvailable === true) {
        throw error;
      }
    }

    if (SUPABASE_ENABLED) {
      try {
        const updatedCafeteria = await updateCafeteriaSupabase(id, updates);
        if (updatedCafeteria) {
          setCafeterias((prev) => prev.map((c) => (c.id === id ? updatedCafeteria : c)));
          return updatedCafeteria;
        }
      } catch (error) {
        console.warn('Failed to update cafeteria in Supabase, falling back to local storage:', error);
      }
    }

    setCafeterias((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    return null;
  };

  const deleteCafeteria = async (id: string) => {
    try {
      await deleteCafeteriaRemote(id);
      setCafeterias((prev) => prev.filter((c) => c.id !== id));
      setMenuItems((prev) => prev.filter((m) => m.cafeteriaId !== id));
      setRemoteSyncAvailable(true);
      setRemoteSyncError(null);
      return;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Remote cafeteria delete failed';
      console.warn('Failed to delete cafeteria in remote API:', error);
      setRemoteSyncAvailable(false);
      setRemoteSyncError(message);
      if (remoteSyncAvailable === true) {
        throw error;
      }
    }

    if (SUPABASE_ENABLED) {
      try {
        await deleteCafeteriaSupabase(id);
        setCafeterias((prev) => prev.filter((c) => c.id !== id));
        setMenuItems((prev) => prev.filter((m) => m.cafeteriaId !== id));
        return;
      } catch (error) {
        console.warn('Failed to delete cafeteria in Supabase, falling back to local storage:', error);
      }
    }

    setCafeterias((prev) => prev.filter((c) => c.id !== id));
    setMenuItems((prev) => prev.filter((m) => m.cafeteriaId !== id));
  };

  const addMenuItem = async (item: Omit<MenuItem, 'id'>) => {
    try {
      const newItem = await createMenuItemRemote(item);
      setMenuItems((prev) => [...prev, newItem]);
      setRemoteSyncAvailable(true);
      setRemoteSyncError(null);
      return newItem;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Remote menu item create failed';
      console.warn('Failed to create menu item in remote API:', error);
      setRemoteSyncAvailable(false);
      setRemoteSyncError(message);
      if (remoteSyncAvailable === true) {
        throw error;
      }
    }

    if (SUPABASE_ENABLED) {
      try {
        const newItem = await createMenuItemSupabase(item);
        setMenuItems((prev) => [...prev, newItem]);
        return newItem;
      } catch (error) {
        console.warn('Failed to create menu item in Supabase, falling back to local storage:', error);
      }
    }

    const newItem: MenuItem = {
      ...item,
      id: `m${Date.now()}`,
    };
    setMenuItems((prev) => [...prev, newItem]);
    return newItem;
  };

  const updateMenuItem = async (id: string, updates: Partial<MenuItem>) => {
    try {
      const updatedItem = await updateMenuItemRemote(id, updates);
      if (updatedItem) {
        setMenuItems((prev) => prev.map((m) => (m.id === id ? updatedItem : m)));
        setRemoteSyncAvailable(true);
        setRemoteSyncError(null);
        return updatedItem;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Remote menu item update failed';
      console.warn('Failed to update menu item in remote API:', error);
      setRemoteSyncAvailable(false);
      setRemoteSyncError(message);
      if (remoteSyncAvailable === true) {
        throw error;
      }
    }

    if (SUPABASE_ENABLED) {
      try {
        const updatedItem = await updateMenuItemSupabase(id, updates);
        if (updatedItem) {
          setMenuItems((prev) => prev.map((m) => (m.id === id ? updatedItem : m)));
          return updatedItem;
        }
      } catch (error) {
        console.warn('Failed to update menu item in Supabase, falling back to local storage:', error);
      }
    }

    setMenuItems((prev) => prev.map((m) => (m.id === id ? { ...m, ...updates } : m)));
    return null;
  };

  const deleteMenuItem = async (id: string) => {
    try {
      await deleteMenuItemRemote(id);
      setMenuItems((prev) => prev.filter((m) => m.id !== id));
      setRemoteSyncAvailable(true);
      setRemoteSyncError(null);
      return;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Remote menu item delete failed';
      console.warn('Failed to delete menu item in remote API:', error);
      setRemoteSyncAvailable(false);
      setRemoteSyncError(message);
      if (remoteSyncAvailable === true) {
        throw error;
      }
    }

    if (SUPABASE_ENABLED) {
      try {
        await deleteMenuItemSupabase(id);
        setMenuItems((prev) => prev.filter((m) => m.id !== id));
        return;
      } catch (error) {
        console.warn('Failed to delete menu item in Supabase, falling back to local storage:', error);
      }
    }

    setMenuItems((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <CafeteriaContext.Provider
      value={{
        buildings,
        cafeterias,
        menuItems,
        addBuilding,
        updateBuilding,
        deleteBuilding,
        addCafeteria,
        updateCafeteria,
        deleteCafeteria,
        addMenuItem,
        updateMenuItem,
        deleteMenuItem,
        remoteSyncAvailable,
        remoteSyncError,
      }}
    >
      {children}
    </CafeteriaContext.Provider>
  );
};

export const useCafeteriaAdmin = () => {
  const context = useContext(CafeteriaContext);
  if (context === undefined) {
    throw new Error('useCafeteriaAdmin must be used within CafeteriaProvider');
  }
  return context;
};
