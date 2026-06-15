import { useState, useMemo } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAdmin, type AdminUser } from '@/contexts/AdminContext';
import { useCafeteriaAdmin } from '@/contexts/CafeteriaAdminContext';
import type { Building } from '@/types/data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminUserFormModal } from '@/components/admin/AdminUserFormModal';
import { RestaurantFormModal } from '@/components/admin/RestaurantFormModal';
import { BuildingFormModal } from '@/components/admin/BuildingFormModal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import {
  LogOut,
  Plus,
  Search,
  Edit2,
  Trash2,
  Users,
  Building2,
  Shield,
  Mail,
  MapPin,
  CheckCircle,
  Circle,
} from 'lucide-react';
import { toast } from 'sonner';

export default function SuperAdminDashboardPage() {
  const navigate = useNavigate();
  const { currentUser, logout, isLoading, allAdminUsers, createAdminUser, updateAdminUser, deleteAdminUser } = useAdmin();
  const { buildings, cafeterias, addBuilding, updateBuilding, deleteBuilding, addCafeteria, updateCafeteria, deleteCafeteria } = useCafeteriaAdmin();

  const [searchQuery, setSearchQuery] = useState('');
  const [isAdminFormOpen, setIsAdminFormOpen] = useState(false);
  const [isRestaurantFormOpen, setIsRestaurantFormOpen] = useState(false);
  const [isBuildingFormOpen, setIsBuildingFormOpen] = useState(false);
  const [isShowNewAdminFlow, setIsShowNewAdminFlow] = useState(false);
  const [adminCreationMode, setAdminCreationMode] = useState<'admin' | 'superadmin'>('admin');
  const [editingUser, setEditingUser] = useState<AdminUser | undefined>();
  const [editingRestaurant, setEditingRestaurant] = useState<any | undefined>();
  const [editingBuilding, setEditingBuilding] = useState<Building | undefined>();
  const [activeTab, setActiveTab] = useState<'restaurants' | 'restaurant-admins' | 'super-admins'>('restaurants');
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'admin' | 'restaurant' | 'building'; id: string } | null>(null);

  // Show loading spinner while auth context initializes
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect if not authenticated or not a superadmin
  if (!currentUser || currentUser.role !== 'superadmin') {
    return <Navigate to="/login" replace />;
  }

  const restaurantAdmins = allAdminUsers.filter((u) => u.role === 'admin');
  const superAdmins = allAdminUsers.filter((u) => u.role === 'superadmin');

  console.log('All admin users:', allAdminUsers);
  console.log('Super admins:', superAdmins);
  console.log('Restaurant admins:', restaurantAdmins);

  const filteredAdmins = useMemo(() => {
    return restaurantAdmins.filter((admin) => {
      const assignedCafes = cafeterias.filter((c) => admin.assignedCafeteriaIds?.includes(c.id));
      const cafeNames = assignedCafes.map((c) => c.name).join(', ');
      return (
        admin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        admin.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cafeNames.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [restaurantAdmins, searchQuery, cafeterias]);

  const filteredSuperAdmins = useMemo(() => {
    return superAdmins.filter((admin) => {
      return (
        admin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        admin.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [superAdmins, searchQuery]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleEditAdmin = (user: AdminUser) => {
    setEditingUser(user);
    setIsShowNewAdminFlow(false);
    setAdminCreationMode(user.role === 'superadmin' ? 'superadmin' : 'admin');
    setIsAdminFormOpen(true);
  };

  const handleDeleteAdmin = (id: string) => {
    setDeleteConfirm({ type: 'admin', id });
  };

  const confirmDeleteAdmin = () => {
    if (deleteConfirm?.type === 'admin') {
      try {
        deleteAdminUser(deleteConfirm.id);
        toast.success('Admin user deleted successfully!');
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Error deleting admin user');
      }
    }
    setDeleteConfirm(null);
  };

  const handleCreateRestaurant = () => {
    setEditingRestaurant(undefined);
    setIsRestaurantFormOpen(true);
  };

  const handleEditRestaurant = (cafe: any) => {
    setEditingRestaurant(cafe);
    setIsRestaurantFormOpen(true);
  };

  const handleDeleteRestaurant = (id: string) => {
    setDeleteConfirm({ type: 'restaurant', id });
  };

  const confirmDeleteRestaurant = async () => {
    if (deleteConfirm?.type === 'restaurant') {
      try {
        await deleteCafeteria(deleteConfirm.id);
        toast.success('Restaurant deleted successfully!');
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Error deleting restaurant');
      }
    }
    setDeleteConfirm(null);
  };

  const handleCreateBuilding = () => {
    setEditingBuilding(undefined);
    setIsBuildingFormOpen(true);
  };

  const handleEditBuilding = (building: Building) => {
    setEditingBuilding(building);
    setIsBuildingFormOpen(true);
  };

  const handleDeleteBuilding = (id: string) => {
    setDeleteConfirm({ type: 'building', id });
  };

  const confirmDeleteBuilding = async () => {
    if (deleteConfirm?.type === 'building') {
      const hasRestaurants = cafeterias.some((cafe) => cafe.buildingId === deleteConfirm.id);
      if (hasRestaurants) {
        toast.error('Cannot delete a building that still has restaurants. Remove or move restaurants first.');
      } else {
        try {
          await deleteBuilding(deleteConfirm.id);
          toast.success('Building deleted successfully!');
        } catch (error) {
          toast.error(error instanceof Error ? error.message : 'Error deleting building');
        }
      }
    }
    setDeleteConfirm(null);
  };

  const handleFormClose = () => {
    setIsAdminFormOpen(false);
    setEditingUser(undefined);
    setIsShowNewAdminFlow(false);
    setAdminCreationMode('admin');
  };

  const handleRestaurantFormClose = () => {
    setIsRestaurantFormOpen(false);
    setEditingRestaurant(undefined);
  };

  const handleSaveAdmin = async (userData: Omit<AdminUser, 'id' | 'createdAt'>) => {
    try {
      if (editingUser) {
        await updateAdminUser(editingUser.id, userData);
      } else {
        await createAdminUser(userData);
      }
    } catch (error) {
      throw error;
    }
  };

  const handleSaveBuilding = async (buildingData: Omit<Building, 'id'>) => {
    try {
      if (editingBuilding) {
        await updateBuilding(editingBuilding.id, buildingData);
      } else {
        await addBuilding(buildingData);
      }
      setIsBuildingFormOpen(false);
      setEditingBuilding(undefined);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error saving building');
      throw error;
    }
  };

  const handleSaveRestaurant = async (cafeData: any) => {
    try {
      const { assignedAdminIds, ...restaurantData } = cafeData;
      let savedRestaurantId = editingRestaurant?.id;

      if (editingRestaurant) {
        await updateCafeteria(editingRestaurant.id, restaurantData);
      } else {
        const newRestaurant = await addCafeteria(restaurantData);
        savedRestaurantId = newRestaurant.id;
      }

      // Update admin assignment if new restaurant
      if (!editingRestaurant && assignedAdminIds && assignedAdminIds.length > 0 && savedRestaurantId) {
        for (const adminId of assignedAdminIds) {
          const admin = allAdminUsers.find((u) => u.id === adminId);
          if (admin) {
            const currentIds = admin.assignedCafeteriaIds || [];
            if (!currentIds.includes(savedRestaurantId)) {
              await updateAdminUser(adminId, {
                ...admin,
                assignedCafeteriaIds: [...currentIds, savedRestaurantId],
              });
            }
          }
        }
      }

      toast.success(editingRestaurant ? 'Restaurant updated!' : 'Restaurant created!');
      handleRestaurantFormClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error saving restaurant');
      throw error;
    }
  };

  const handleToggleRestaurantStatus = async (cafeId: string) => {
    const cafe = cafeterias.find((c) => c.id === cafeId);
    if (!cafe) {
      return;
    }

    try {
      await updateCafeteria(cafeId, { isOpen: !cafe.isOpen });
      toast.success(`Restaurant marked as ${!cafe.isOpen ? 'open' : 'closed'}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error updating restaurant status');
    }
  };

  const getAssignedRestaurants = (adminIds?: string[]) => {
    if (!adminIds || adminIds.length === 0) return [];
    return cafeterias.filter((c) => adminIds.includes(c.id));
  };

  const getBuildingName = (buildingId: string) => {
    return buildings.find((building) => building.id === buildingId)?.name ?? buildingId;
  };

  const getRestaurantAdmins = (cafeId: string) => {
    return restaurantAdmins.filter((a) => a.assignedCafeteriaIds?.includes(cafeId));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-background to-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur-sm shadow-sm border-gold/20">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <div className="rounded-lg bg-gradient-gold p-2">
                <Shield className="h-6 w-6 text-primary-foreground" />
              </div>
              Super Admin Portal
            </h1>
            <p className="text-sm text-muted-foreground mt-1">System Management</p>
          </div>
          <Button variant="outline" onClick={handleLogout} className="gap-2">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        {/* Welcome Card */}
        <Card className="mb-8 bg-gradient-to-r from-gold/10 to-accent/10 border-gold/20">
          <CardContent className="pt-6">
            <p className="text-lg font-semibold">
              Welcome back, <span className="text-gold">{currentUser.name}</span>
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Manage all restaurants and admin users for the ACB Food platform.
            </p>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card className="border-gold/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Building2 className="h-4 w-4 text-gold" />
                Total Restaurants
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gold">{cafeterias.length}</div>
            </CardContent>
          </Card>
          <Card className="border-gold/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <MapPin className="h-4 w-4 text-accent" />
                Total Buildings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent">{buildings.length}</div>
            </CardContent>
          </Card>
          <Card className="border-gold/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4 text-accent" />
                Restaurant Admins
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent">{restaurantAdmins.length}</div>
            </CardContent>
          </Card>
          <Card className="border-gold/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Shield className="h-4 w-4 text-gold" />
                Super Admins
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gold">{superAdmins.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as 'restaurants' | 'restaurant-admins' | 'super-admins')}>
          <TabsList className="grid w-full max-w-2xl grid-cols-3 mb-6">
            <TabsTrigger value="restaurants" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Restaurants
            </TabsTrigger>
            <TabsTrigger value="restaurant-admins" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Restaurant Admins
            </TabsTrigger>
            <TabsTrigger value="super-admins" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Super Admins
            </TabsTrigger>
          </TabsList>

          {/* Restaurants Tab */}
          <TabsContent value="restaurants">
            <Card className="border-gold/20 mb-6">
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <CardTitle>Buildings</CardTitle>
                    <CardDescription>Create and manage building locations for restaurants</CardDescription>
                  </div>
                  <Button onClick={handleCreateBuilding} className="gradient-gold gap-2">
                    <Plus className="h-4 w-4" />
                    Create Building
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {buildings.length > 0 ? (
                    buildings.map((building) => {
                      const restaurantCount = cafeterias.filter((cafe) => cafe.buildingId === building.id).length;
                      return (
                        <Card key={building.id} className="overflow-hidden border-border/50">
                          <div className="p-4">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                              <div>
                                <h3 className="font-bold text-lg">{building.name}</h3>
                                <p className="text-sm text-muted-foreground mt-1">{building.address}</p>
                                <span className="mt-3 inline-flex rounded-full bg-gold/10 px-2.5 py-1 text-xs font-medium text-gold">
                                  {restaurantCount} restaurant{restaurantCount !== 1 ? 's' : ''}
                                </span>
                              </div>
                              <div className="flex gap-2 flex-wrap md:flex-nowrap">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditBuilding(building)}
                                >
                                  <Edit2 className="h-4 w-4 mr-1" />
                                  Edit
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleDeleteBuilding(building.id)}
                                >
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  Delete
                                </Button>
                              </div>
                            </div>
                          </div>
                        </Card>
                      );
                    })
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <Building2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No buildings found. Create one to get started!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-gold/20">
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <CardTitle>All Restaurants</CardTitle>
                    <CardDescription>Create and manage all restaurants in the system</CardDescription>
                  </div>
                  <Button onClick={handleCreateRestaurant} className="gradient-gold gap-2">
                    <Plus className="h-4 w-4" />
                    Create Restaurant
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {cafeterias.length > 0 ? (
                    cafeterias.map((cafe) => {
                      const assignedAdmins = getRestaurantAdmins(cafe.id);
                      return (
                        <Card key={cafe.id} className="overflow-hidden border-border/50">
                          <div className="p-4">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                  <h3 className="font-bold text-lg">{cafe.name}</h3>
                                  <div className="flex items-center gap-2">
                                    {cafe.isOpen ? (
                                      <>
                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                        <span className="text-xs bg-green-100 dark:bg-green-900 px-2 py-1 rounded text-green-700 dark:text-green-300">
                                          Open
                                        </span>
                                      </>
                                    ) : (
                                      <>
                                        <Circle className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-xs bg-secondary px-2 py-1 rounded text-muted-foreground">
                                          Closed
                                        </span>
                                      </>
                                    )}
                                  </div>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-2">
                                  <span className="text-xs bg-gold/20 text-gold px-2 py-1 rounded border border-gold/30">
                                    {getBuildingName(cafe.buildingId)}
                                  </span>
                                  <span className="text-xs bg-gold/20 text-gold px-2 py-1 rounded">
                                    {assignedAdmins.length} admin{assignedAdmins.length !== 1 ? 's' : ''}
                                  </span>
                                </div>
                              </div>
                              <div className="flex gap-2 flex-wrap md:flex-nowrap flex-shrink-0">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleToggleRestaurantStatus(cafe.id)}
                                  className="gap-2 text-xs whitespace-nowrap"
                                >
                                  {cafe.isOpen ? '🔄 Close' : '🔄 Open'}
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditRestaurant(cafe)}
                                >
                                  <Edit2 className="h-4 w-4 mr-1" />
                                  Edit
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleDeleteRestaurant(cafe.id)}
                                >
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  Delete
                                </Button>
                              </div>
                            </div>
                          </div>
                        </Card>
                      );
                    })
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <Building2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No restaurants found. Create one to get started!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Admin Users Tab */}
          <TabsContent value="restaurant-admins">
            <Card className="border-gold/20">
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <CardTitle>Restaurant Admins</CardTitle>
                    <CardDescription>Create and manage restaurant admin users</CardDescription>
                  </div>
                  <Button 
                    onClick={() => { 
                      setAdminCreationMode('admin');
                      setEditingUser(undefined);
                      setIsShowNewAdminFlow(true); 
                      setIsAdminFormOpen(true); 
                    }} 
                    className="gradient-gold gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Create Restaurant Admin
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Search */}
                <div className="mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name, email or restaurant..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Restaurant Admins List */}
                <div className="grid gap-4">
                  {filteredAdmins.length > 0 ? (
                    filteredAdmins.map((admin) => {
                      const assignedCafes = getAssignedRestaurants(admin.assignedCafeteriaIds);
                      return (
                        <Card key={admin.id} className="overflow-hidden border-border/50">
                          <div className="p-4">
                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="font-bold">{admin.name}</h3>
                                  <span className="text-xs bg-accent/20 text-accent px-2 py-1 rounded">
                                    Restaurant Admin
                                  </span>
                                </div>
                                <div className="space-y-1 text-sm text-muted-foreground mb-3">
                                  <div className="flex items-center gap-2">
                                    <Mail className="h-3 w-3" />
                                    {admin.email}
                                  </div>
                                </div>

                                {assignedCafes.length > 0 && (
                                  <div className="flex flex-wrap gap-2">
                                    {assignedCafes.map((cafe) => (
                                      <span
                                        key={cafe.id}
                                        className="text-xs bg-gold/10 text-gold px-2 py-1 rounded border border-gold/20"
                                      >
                                        {cafe.name}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <div className="flex gap-2 flex-shrink-0">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditAdmin(admin)}
                                >
                                  <Edit2 className="h-4 w-4 mr-1" />
                                  Edit
                                </Button>
                                {admin.role !== 'superadmin' && (
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleDeleteAdmin(admin.id)}
                                  >
                                    <Trash2 className="h-4 w-4 mr-1" />
                                    Delete
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </Card>
                      );
                    })
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No restaurant admins found</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Super Admins Tab */}
          <TabsContent value="super-admins">
            <Card className="border-gold/20">
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <CardTitle>Super Admins</CardTitle>
                    <CardDescription>Create and manage super admin users</CardDescription>
                  </div>
                  <Button 
                    onClick={() => { 
                      setAdminCreationMode('superadmin');
                      setEditingUser(undefined);
                      setIsShowNewAdminFlow(true); 
                      setIsAdminFormOpen(true); 
                    }} 
                    className="gradient-gold gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Create Super Admin
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Super Admins List */}
                <div className="grid gap-4">
                  {filteredSuperAdmins.length > 0 ? (
                    filteredSuperAdmins.map((admin) => (
                      <Card key={admin.id} className="overflow-hidden border-border/50">
                        <div className="p-4">
                          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-bold">{admin.name}</h3>
                                <span className="text-xs bg-gold/20 text-gold px-2 py-1 rounded">
                                  Super Admin
                                </span>
                              </div>
                              <div className="space-y-1 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                  <Mail className="h-3 w-3" />
                                  {admin.email}
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2 flex-shrink-0">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditAdmin(admin)}
                              >
                                <Edit2 className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                              {admin.role !== 'superadmin' && (
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleDeleteAdmin(admin.id)}
                                >
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  Delete
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <Shield className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No super admins found</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Admin User Form Modal */}
      <AdminUserFormModal
        isOpen={isAdminFormOpen}
        onClose={handleFormClose}
        onSave={handleSaveAdmin}
        adminUser={editingUser}
        cafeterias={cafeterias.map((c) => ({ id: c.id, name: c.name }))}
        mode={adminCreationMode}
      />

      {/* Restaurant Form Modal */}
      <RestaurantFormModal
        isOpen={isRestaurantFormOpen}
        onClose={handleRestaurantFormClose}
        onSave={handleSaveRestaurant}
        onCreateAdmin={(show) => {
          if (show) {
            setIsRestaurantFormOpen(false);
            setIsShowNewAdminFlow(true);
            setIsAdminFormOpen(true);
          }
        }}
        cafeteria={editingRestaurant}
        availableAdmins={allAdminUsers}
        buildings={buildings.map((building) => ({ id: building.id, name: building.name }))}
        mode="superadmin"
      />

      <BuildingFormModal
        isOpen={isBuildingFormOpen}
        onClose={() => {
          setIsBuildingFormOpen(false);
          setEditingBuilding(undefined);
        }}
        onSave={handleSaveBuilding}
        building={editingBuilding}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {deleteConfirm?.type === 'admin' ? 'Admin User' : deleteConfirm?.type === 'restaurant' ? 'Restaurant' : 'Building'}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Are you sure you want to delete this{' '}
              {deleteConfirm?.type === 'admin' ? 'admin user' : deleteConfirm?.type === 'restaurant' ? 'restaurant' : 'building'}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogAction
            onClick={() => {
              if (deleteConfirm?.type === 'admin') {
                confirmDeleteAdmin();
              } else if (deleteConfirm?.type === 'restaurant') {
                confirmDeleteRestaurant();
              } else {
                confirmDeleteBuilding();
              }
            }}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete
          </AlertDialogAction>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
