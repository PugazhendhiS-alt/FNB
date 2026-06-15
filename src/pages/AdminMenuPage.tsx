import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAdmin } from '@/contexts/AdminContext';
import { useCafeteriaAdmin } from '@/contexts/CafeteriaAdminContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { MenuItemFormModal } from '@/components/admin/MenuItemFormModal';
import type { MenuItem } from '@/types/data';
import { ArrowLeft, Plus, Search, Edit2, Trash2, Leaf, Flame } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminMenuPage() {
  const { cafeteriaId } = useParams<{ cafeteriaId: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAdmin();
  const { cafeterias, menuItems, deleteMenuItem } = useCafeteriaAdmin();
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | undefined>();
  const [filterCategory, setFilterCategory] = useState<string>('all');

  if (!currentUser || currentUser.role !== 'admin') {
    navigate('/login');
    return null;
  }

  const cafeteria = cafeterias.find((c) => c.id === cafeteriaId);

  if (!cafeteria) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">Restaurant not found</p>
            <Button onClick={() => navigate('/restaurant/dashboard')}>Back to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const cafeteriaItems = menuItems.filter((m) => m.cafeteriaId === cafeteriaId);
  const categories = useMemo(() => [...new Set(cafeteriaItems.map((i) => i.category))], [cafeteriaItems]);

  const filteredItems = useMemo(() => {
    return cafeteriaItems.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [cafeteriaItems, searchQuery, filterCategory]);

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this menu item?')) {
      await deleteMenuItem(id);
      toast.success('Menu item deleted successfully!');
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingItem(undefined);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-background to-secondary">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur-sm shadow-sm">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/dashboard')}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{cafeteria.name}</h1>
            <p className="text-sm text-muted-foreground">Manage menu items</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-2 mb-8">
          <Card>
            <CardContent className="py-4">
              <p className="text-sm text-muted-foreground">Total Items</p>
              <p className="text-3xl font-bold">{cafeteriaItems.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4">
              <p className="text-sm text-muted-foreground">Categories</p>
              <p className="text-3xl font-bold">{categories.length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex-1 max-w-sm">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm w-full md:w-40"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <Button onClick={() => setIsFormOpen(true)} className="gradient-gold gap-2">
            <Plus className="h-4 w-4" />
            Add Item
          </Button>
        </div>

        {/* Menu Items List */}
        <div className="grid gap-4">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="flex flex-col md:flex-row">
                  {/* Image */}
                  <div className="h-32 w-full md:h-32 md:w-32 flex-shrink-0 overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover hover:scale-105 transition-transform"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-bold">{item.name}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-primary">₹{item.price}</p>
                          <span className="text-xs text-muted-foreground">{item.category}</span>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="mt-3 flex flex-wrap gap-3 text-sm">
                        {item.calories && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Flame className="h-4 w-4" />
                            {item.calories} cal
                          </div>
                        )}
                        {item.prepTime && (
                          <div className="text-muted-foreground">
                            🕐 {item.prepTime}
                          </div>
                        )}
                        {item.isVegan && (
                          <div className="flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900 rounded-full text-green-700 dark:text-green-300">
                            <Leaf className="h-3 w-3" />
                            <span className="text-xs font-medium">Vegan</span>
                          </div>
                        )}
                        {item.isVeg && !item.isVegan && (
                          <div className="flex items-center gap-1 px-2 py-1 bg-orange-100 dark:bg-orange-900 rounded-full text-orange-700 dark:text-orange-300">
                            <Leaf className="h-3 w-3" />
                            <span className="text-xs font-medium">Vegetarian</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-row md:flex-col gap-2 p-4 border-t md:border-t-0 md:border-l">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(item)}
                      className="flex-1 gap-2"
                    >
                      <Edit2 className="h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(item.id)}
                      className="flex-1 gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="text-6xl mb-4">🍽️</div>
                <p className="text-muted-foreground mb-4">No menu items found</p>
                <Button onClick={() => setIsFormOpen(true)} className="gradient-gold gap-2">
                  <Plus className="h-4 w-4" />
                  Add First Item
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Form Modal */}
      <MenuItemFormModal
        isOpen={isFormOpen}
        onClose={handleFormClose}
        menuItem={editingItem}
        cafeteriaId={cafeteriaId!}
        cafeterias={cafeterias}
      />
    </div>
  );
}
