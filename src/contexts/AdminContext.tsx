import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase, supabaseAdmin, SUPABASE_ENABLED, SUPABASE_ADMIN_ENABLED } from '@/lib/supabaseClient';

export type AdminRole = 'superadmin' | 'admin';

export interface AdminUser {
  id: string;
  email: string;
  password: string; // Store hashed in production
  name: string;
  role: AdminRole;
  assignedCafeteriaIds?: string[]; // Array for multi-restaurant support
  isActive: boolean;
  createdAt: string;
}

const DEFAULT_LOCAL_ADMIN_USERS: AdminUser[] = [
  {
    id: 'local_superadmin',
    email: 'superadmin@acbfood.com',
    password: 'admin',
    name: 'Local Super Admin',
    role: 'superadmin',
    assignedCafeteriaIds: [],
    isActive: true,
    createdAt: new Date().toISOString(),
  },
];

export interface AdminUserLogin extends Omit<AdminUser, 'password'> {
  role: AdminRole;
  assignedCafeteriaIds?: string[];
  isActive: boolean;
}

type AdminProfileRow = {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  assigned_cafeteria_ids?: string[] | null;
  is_active?: boolean;
  created_at: string;
};

type SupabaseMetadata = {
  role?: AdminRole;
  name?: string;
  assignedCafeteriaIds?: string[];
  isActive?: boolean;
};

interface AdminContextType {
  currentUser: AdminUserLogin | null;
  isAuthenticated: boolean;
  isSupabaseEnabled: boolean;
  login: (email: string, password: string) => Promise<AdminUserLogin>;
  logout: () => void;
  isLoading: boolean;
  allAdminUsers: AdminUser[];
  createAdminUser: (user: Omit<AdminUser, 'id' | 'createdAt'>) => Promise<void>;
  updateAdminUser: (id: string, updates: Partial<AdminUser>) => Promise<void>;
  deleteAdminUser: (id: string) => Promise<void>;
  getAdminUsersByRole: (role: AdminRole) => AdminUser[];
  getAdminsForCafeteria: (cafeteriaId: string) => AdminUser[];
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<AdminUserLogin | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [allAdminUsers, setAllAdminUsers] = useState<AdminUser[]>(SUPABASE_ENABLED ? [] : DEFAULT_LOCAL_ADMIN_USERS);

  const buildUserFromProfile = (profile: AdminProfileRow): AdminUserLogin => {
    return {
      id: profile.id,
      email: profile.email,
      name: profile.name,
      role: profile.role,
      assignedCafeteriaIds: profile.assigned_cafeteria_ids ?? undefined,
      isActive: profile.is_active ?? true,
      createdAt: profile.created_at,
    };
  };

  const fetchAdminProfiles = async () => {
    const { data, error } = await supabase.from<AdminProfileRow>('admin_profiles').select('*');
    if (error) {
      console.error('Failed to load admin profiles:', error.message);
      return;
    }
    if (data) {
      console.log('Loaded admin profiles from Supabase:', data);
      setAllAdminUsers(data.map(buildUserFromProfile).map((user) => ({ ...user, password: '' })));
    } else {
      console.log('No admin profiles found in Supabase');
    }
  };

  const loadAdminProfile = async (userId: string) => {
    const { data, error } = await supabase.from<AdminProfileRow>('admin_profiles').select('*').eq('id', userId).single();
    if (error) {
      throw new Error(error.message || 'Admin profile not found');
    }
    return buildUserFromProfile(data);
  };

  const buildUserFromAuthUser = (user: User): AdminUserLogin | null => {
    const metadata = user.user_metadata as SupabaseMetadata | undefined;
    if (!metadata?.role || !['superadmin', 'admin'].includes(metadata.role)) {
      return null;
    }

    return {
      id: user.id,
      email: user.email ?? '',
      name: metadata.name ?? 'Admin User',
      role: metadata.role,
      assignedCafeteriaIds: metadata.assignedCafeteriaIds,
      isActive: metadata.isActive ?? true,
      createdAt: user.created_at ?? new Date().toISOString(),
    };
  };

  // Load from Supabase session on mount and optionally local mock data when Supabase is disabled
  useEffect(() => {
    const loadStoredData = async () => {
      if (SUPABASE_ENABLED) {
        console.log('Supabase enabled, clearing localStorage admin users');
        // Clear old localStorage data when using Supabase
        localStorage.removeItem('allAdminUsers');

        const { data } = await supabase.auth.getSession();
        if (data.session?.user) {
          try {
            const profile = await loadAdminProfile(data.session.user.id);
            if (profile) {
              setCurrentUser(profile);
              localStorage.setItem('currentAdminUser', JSON.stringify(profile));
            }
            await fetchAdminProfiles();
          } catch (error) {
            console.warn('Unable to load admin profile:', error instanceof Error ? error.message : error);
          }
        } else {
          // No session, load all admin profiles from DB
          await fetchAdminProfiles();
        }
      } else {
        console.log('Supabase disabled, loading from localStorage');
        const storedUser = localStorage.getItem('currentAdminUser');
        const storedUsers = localStorage.getItem('allAdminUsers');

        if (storedUser) {
          try {
            setCurrentUser(JSON.parse(storedUser));
          } catch (error) {
            console.warn('Unable to parse stored currentAdminUser:', error);
          }
        }

        let parsedUsers: AdminUser[] | null = null;
        if (storedUsers) {
          try {
            parsedUsers = JSON.parse(storedUsers);
          } catch (error) {
            console.warn('Unable to parse stored allAdminUsers:', error);
          }
        }

        const hasValidLocalUsers = Array.isArray(parsedUsers) && parsedUsers.length > 0;
        const hasSuperadmin = hasValidLocalUsers && parsedUsers.some((u) => u.email === 'superadmin@acbfood.com');

        if (hasValidLocalUsers && hasSuperadmin) {
          setAllAdminUsers(parsedUsers as AdminUser[]);
        } else {
          setAllAdminUsers(DEFAULT_LOCAL_ADMIN_USERS);
          localStorage.setItem('allAdminUsers', JSON.stringify(DEFAULT_LOCAL_ADMIN_USERS));
        }
      }

      setIsLoading(false);
    };

    loadStoredData();
  }, []);

  // Persist users to localStorage only when Supabase is disabled
  useEffect(() => {
    if (!SUPABASE_ENABLED) {
      localStorage.setItem('allAdminUsers', JSON.stringify(allAdminUsers));
    }
  }, [allAdminUsers]);

  const login = async (email: string, password: string) => {
    if (SUPABASE_ENABLED) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error || !data.session?.user) {
        throw new Error(error?.message || 'Invalid email or password');
      }

      let profile;
      try {
        profile = await loadAdminProfile(data.session.user.id);
      } catch (loadError) {
        console.warn('Admin profile load failed, falling back to auth metadata:', loadError);
        const fallback = buildUserFromAuthUser(data.session.user);
        if (fallback) {
          profile = fallback;
        } else {
          throw loadError;
        }
      }

      if (!profile || !profile.isActive) {
        throw new Error('Admin access not available for this account');
      }

      setCurrentUser(profile);
      localStorage.setItem('currentAdminUser', JSON.stringify(profile));
      await fetchAdminProfiles();
      return profile;
    }

    const user = allAdminUsers.find((u) => u.email === email);
    if (!user || user.password !== password) {
      throw new Error('Invalid email or password');
    }

    const { password: _, ...userWithoutPassword } = user;
    setCurrentUser(userWithoutPassword as AdminUserLogin);
    localStorage.setItem('currentAdminUser', JSON.stringify(userWithoutPassword));
    return userWithoutPassword as AdminUserLogin;
  };

  const logout = async () => {
    if (SUPABASE_ENABLED) {
      await supabase.auth.signOut();
    }
    setCurrentUser(null);
    localStorage.removeItem('currentAdminUser');
  };

  const createAdminUser = async (user: Omit<AdminUser, 'id' | 'createdAt'>) => {
    if (SUPABASE_ENABLED) {
      // Try server-side API first (production on Vercel)
      try {
        const res = await fetch('/api/admin/create-user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: user.email,
            password: user.password,
            name: user.name,
            role: user.role,
            assignedCafeteriaIds: user.assignedCafeteriaIds,
          }),
        });

        if (res.ok) {
          const result = await res.json();
          if (result.success) {
            await fetchAdminProfiles();
            return;
          }
          throw new Error(result.error || 'Failed to create admin user via API');
        }

        if (res.status !== 404) {
          const errorData = await res.json();
          throw new Error(errorData.error || `Failed to create admin user (${res.status})`);
        }
      } catch (apiError) {
        // If the API route is unavailable in local dev, fall back to direct Supabase admin client.
      }

      // Local / direct Supabase fallback when the API route is not available
      if (!SUPABASE_ADMIN_ENABLED || !supabaseAdmin) {
        throw new Error('Creating admin users requires SUPABASE_SERVICE_ROLE_KEY environment variable. Set VITE_SUPABASE_SERVICE_ROLE_KEY for local development.');
      }

      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: {
          role: user.role,
          name: user.name,
          assignedCafeteriaIds: user.assignedCafeteriaIds,
        },
      });

      if (error || !data.user?.id) {
        throw new Error(error?.message || 'Failed to create admin user');
      }

      const profileRow: AdminProfileRow = {
        id: data.user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        assigned_cafeteria_ids: user.assignedCafeteriaIds,
        is_active: true,
        created_at: new Date().toISOString(),
      };

      const profileClient = supabaseAdmin ?? supabase;
      const { error: profileError } = await profileClient!.from('admin_profiles').upsert(profileRow, { onConflict: 'id' });

      if (profileError) {
        if (supabaseAdmin) {
          await supabaseAdmin.auth.admin.deleteUser(data.user.id).catch(() => null);
        }
        throw new Error(profileError.message || 'Failed to save admin profile');
      }

      await fetchAdminProfiles();
      return;
    }

    const newUser: AdminUser = {
      ...user,
      id: `admin_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setAllAdminUsers([...allAdminUsers, newUser]);
  };

  const updateAdminUser = async (id: string, updates: Partial<AdminUser>) => {
    if (SUPABASE_ENABLED) {
      const profileUpdates: Partial<AdminProfileRow> = {
        email: updates.email,
        name: updates.name,
        role: updates.role,
        assigned_cafeteria_ids: updates.assignedCafeteriaIds,
        is_active: updates.isActive,
      };

      const profileClient = supabaseAdmin ?? supabase;
      const { error: profileError } = await profileClient!.from('admin_profiles').update(profileUpdates).eq('id', id);
      if (profileError) {
        throw new Error(profileError.message || 'Failed to update admin profile');
      }

      if (updates.password) {
        if (currentUser?.id === id) {
          const { error } = await supabase.auth.updateUser({ password: updates.password });
          if (error) {
            throw new Error(error.message || 'Failed to update password');
          }
        } else {
          throw new Error('Password updates for other users require backend support');
        }
      }

      await fetchAdminProfiles();
      if (currentUser?.id === id) {
        const updatedProfile = await loadAdminProfile(id);
        setCurrentUser(updatedProfile);
        localStorage.setItem('currentAdminUser', JSON.stringify(updatedProfile));
      }
      return;
    }

    setAllAdminUsers(
      allAdminUsers.map((u) => (u.id === id ? { ...u, ...updates } : u))
    );
  };

  const deleteAdminUser = async (id: string) => {
    const user = allAdminUsers.find((u) => u.id === id);
    console.log('Attempting to delete user:', user);
    if (user?.role === 'superadmin') {
      console.error('Cannot delete superadmin user:', user);
      throw new Error('Cannot delete superadmin user');
    }

    if (SUPABASE_ENABLED) {
      const profileClient = supabaseAdmin ?? supabase;
      const { error } = await profileClient!.from('admin_profiles').delete().eq('id', id);
      if (error) {
        throw new Error(error.message || 'Failed to delete admin user');
      }

      if (supabaseAdmin) {
        await supabaseAdmin.auth.admin.deleteUser(id).catch(() => null);
      }

      setAllAdminUsers(allAdminUsers.filter((u) => u.id !== id));
      return;
    }

    setAllAdminUsers(allAdminUsers.filter((u) => u.id !== id));
  };

  const getAdminUsersByRole = (role: AdminRole) => {
    return allAdminUsers.filter((u) => u.role === role);
  };

  const getAdminsForCafeteria = (cafeteriaId: string) => {
    return allAdminUsers.filter((u) => u.assignedCafeteriaIds?.includes(cafeteriaId));
  };

  return (
    <AdminContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        isSupabaseEnabled: SUPABASE_ENABLED,
        login,
        logout,
        isLoading,
        allAdminUsers,
        createAdminUser,
        updateAdminUser,
        deleteAdminUser,
        getAdminUsersByRole,
        getAdminsForCafeteria,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within AdminProvider');
  }
  return context;
};
