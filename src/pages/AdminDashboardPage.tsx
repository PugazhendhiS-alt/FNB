import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '@/contexts/AdminContext';
import { useCafeteriaAdmin } from '@/contexts/CafeteriaAdminContext';
import type { Cafeteria } from '@/types/data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CafeteriaFormModal } from '@/components/admin/CafeteriaFormModal';
import { LogOut, Plus, Search, Edit2, Trash2, MapPin, Clock, Star, Utensils } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { currentUser, logout } = useAdmin();
  const { cafeterias, deleteCafeteria } = useCafeteriaAdmin();
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCafeteria, setEditingCafeteria] = useState<Cafeteria | undefined>();
  const [filterBuilding, setFilterBuilding] = useState<string>('all');

  const filteredCafeterias = useMemo(() => {
    return cafeterias.filter((cafe) => {
      const matchesSearch =
        cafe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cafe.cuisine.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesBuilding = filterBuilding === 'all' || cafe.buildingId === filterBuilding;
      return matchesSearch && matchesBuilding;
    });
  }, [cafeterias, searchQuery, filterBuilding]);

  const buildings = useMemo(() => {
    return Array.from(new Set(cafeterias.map((c) => c.buildingId)));
  }, [cafeterias]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleEdit = (cafe: Cafeteria) => {
    setEditingCafeteria(cafe);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this restaurant?')) {
      return;
    }

    try {
      await deleteCafeteria(id);
      toast.success('Restaurant deleted successfully!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error deleting restaurant');
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingCafeteria(undefined);
  };

  const getBuildingName = (buildingId: string) => {
    return buildingId || 'Unknown';
  };

  if (!currentUser) {
    navigate('/admin/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-background to-secondary">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur-sm shadow-sm">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <div className="rounded-lg bg-primary p-2">
                <Utensils className="h-5 w-5 text-primary-foreground" />
              </div>
              ACB Food Admin
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Welcome, {admin?.email}</p>
          </div>
          <Button variant="outline" onClick={handleLogout} className="gap-2">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Restaurants</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{cafeterias.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Buildings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{buildings.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Open Restaurants</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{cafeterias.filter((c) => c.isOpen).length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Actions Section */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex-1 max-w-sm">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search restaurants or cuisine..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <select
            value={filterBuilding}
            onChange={(e) => setFilterBuilding(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm w-full md:w-40"
          >
            <option value="all">All Buildings</option>
            {buildings.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
          <Button onClick={() => setIsFormOpen(true)} className="gradient-gold gap-2">
            <Plus className="h-4 w-4" />
            Add Restaurant
          </Button>
        </div>

        {/* Restaurants List */}
        <div className="grid gap-4">
          {filteredCafeterias.length > 0 ? (
            filteredCafeterias.map((cafe) => (
              <Card key={cafe.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="flex flex-col md:flex-row">
                  {/* Image */}
                  <div className="h-40 w-full md:h-32 md:w-40 flex-shrink-0 overflow-hidden">
                    <img
                      src={cafe.image}
                      alt={cafe.name}
                      className="h-full w-full object-cover hover:scale-105 transition-transform"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-4 flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-bold">{cafe.name}</h3>
                      <div className="mt-2 grid gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {getBuildingName(cafe.buildingId)}
                        </div>
                        <div className="flex items-center gap-2">
                          <Utensils className="h-4 w-4" />
                          {cafe.cuisine}
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {cafe.openTime} – {cafe.closeTime}
                        </div>
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 fill-current text-yellow-500" />
                          <span className="text-foreground">{cafe.rating.toFixed(1)}</span>
                          <span className="text-xs rounded-full px-2 py-1 bg-secondary">
                            {cafe.isOpen ? '🟢 Open' : '⚫ Closed'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-row md:flex-col gap-2 p-4 border-t md:border-t-0 md:border-l">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(cafe)}
                      className="flex-1 gap-2"
                    >
                      <Edit2 className="h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(cafe.id)}
                      className="flex-1 gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => navigate(`/menu/${cafe.id}`)}
                      className="flex-1"
                    >
                      Menu
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Utensils className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">No restaurants found</p>
                <Button onClick={() => setIsFormOpen(true)} className="gradient-gold gap-2">
                  <Plus className="h-4 w-4" />
                  Add First Restaurant
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Form Modal */}
      <CafeteriaFormModal
        isOpen={isFormOpen}
        onClose={handleFormClose}
        cafeteria={editingCafeteria}
        buildings={buildings}
      />
    </div>
  );
}
