import { useState, useEffect } from 'react';
import type { MenuItem } from '@/types/data';
import { useCafeteriaAdmin } from '@/contexts/CafeteriaAdminContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Flame, Leaf } from 'lucide-react';
import { ImageCropModal } from '@/components/admin/ImageCropModal';

interface MenuItemFormProps {
  isOpen: boolean;
  onClose: () => void;
  menuItem?: MenuItem;
  cafeteriaId: string;
  cafeterias: Array<{ id: string; name: string }>;
}

export type MenuItemFormData = Omit<MenuItem, 'id'> & {
  price: number | string;
  calories?: number | string;
};

export const MenuItemFormModal = ({
  isOpen,
  onClose,
  menuItem,
  cafeteriaId,
  cafeterias,
}: MenuItemFormProps) => {
  const { addMenuItem, updateMenuItem } = useCafeteriaAdmin();
  const [formData, setFormData] = useState<MenuItemFormData>({
    cafeteriaId,
    name: '',
    description: '',
    price: '',
    image: '',
    category: 'Mains',
    isVeg: true,
    isVegan: false,
    calories: undefined,
    prepTime: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);

  useEffect(() => {
    if (menuItem) {
      setFormData({
        cafeteriaId: menuItem.cafeteriaId,
        name: menuItem.name,
        description: menuItem.description,
        price: menuItem.price,
        image: menuItem.image,
        category: menuItem.category,
        isVeg: menuItem.isVeg,
        isVegan: menuItem.isVegan,
        calories: menuItem.calories,
        prepTime: menuItem.prepTime,
      });
    } else {
      setFormData({
        cafeteriaId,
        name: '',
        description: '',
        price: '',
        image: '',
        category: 'Mains',
        isVeg: true,
        isVegan: false,
        calories: undefined,
        prepTime: '',
      });
    }
  }, [menuItem, cafeteriaId, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? (e.target as HTMLInputElement).checked
          : name === 'price'
            ? value
            : name === 'calories'
              ? value === ''
                ? undefined
                : value
              : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const normalizedPrice = typeof formData.price === 'string' ? parseFloat(formData.price) : formData.price;
    const normalizedCalories = typeof formData.calories === 'string'
      ? formData.calories === '' ? undefined : parseFloat(formData.calories)
      : formData.calories;

    if (!formData.name || !normalizedPrice || normalizedPrice <= 0) {
      toast.error('Name and price are required');
      return;
    }

    const saveData: Omit<MenuItem, 'id'> = {
      cafeteriaId: formData.cafeteriaId,
      name: formData.name,
      description: formData.description,
      price: normalizedPrice,
      image: formData.image,
      category: formData.category,
      isVeg: formData.isVeg,
      isVegan: formData.isVegan,
      calories: normalizedCalories,
      prepTime: formData.prepTime,
    };

    setIsSubmitting(true);
    try {
      if (menuItem) {
        await updateMenuItem(menuItem.id, saveData);
        toast.success('Menu item updated successfully!');
      } else {
        await addMenuItem(saveData);
        toast.success('Menu item added successfully!');
      }
      handleClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      cafeteriaId,
      name: '',
      description: '',
      price: '',
      image: '',
      category: 'Mains',
      isVeg: true,
      isVegan: false,
      calories: undefined,
      prepTime: '',
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto max-w-md">
        <DialogHeader>
          <DialogTitle>{menuItem ? 'Edit Menu Item' : 'Add Menu Item'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Cafeteria */}
          {cafeterias.length > 1 ? (
            <div className="space-y-2">
              <Label htmlFor="cafeteriaId">Restaurant</Label>
              <select
                id="cafeteriaId"
                name="cafeteriaId"
                value={formData.cafeteriaId}
                onChange={handleChange}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              >
                <option value="">Select a restaurant</option>
                {cafeterias.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <input type="hidden" name="cafeteriaId" value={formData.cafeteriaId} />
          )}

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Item Name *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Butter Chicken"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the dish..."
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              rows={3}
            />
          </div>

          {/* Price */}
          <div className="space-y-2">
            <Label htmlFor="price">Price (₹) *</Label>
            <Input
              id="price"
              name="price"
              type="number"
              min="0"
              step="10"
              value={formData.price}
              onChange={handleChange}
              placeholder="e.g., 250"
              required
            />
          </div>

          {/* Image */}
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="image">Item Image</Label>
              <Button type="button" variant="outline" size="sm" onClick={() => setIsCropModalOpen(true)}>
                Upload / Crop
              </Button>
            </div>
            {formData.image ? (
              <div className="relative overflow-hidden rounded-md border border-input">
                <img src={formData.image} alt="Preview" className="h-28 w-full object-cover" />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute right-2 top-2"
                  onClick={() => setFormData((prev) => ({ ...prev, image: '' }))}
                >
                  Remove
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Optional: upload an image now or later.</p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              placeholder="e.g., Mains, Dessert, Drinks"
            />
          </div>

          {/* Calories */}
          <div className="space-y-2">
            <Label htmlFor="calories" className="flex items-center gap-2">
              <Flame className="h-4 w-4" />
              Calories
            </Label>
            <Input
              id="calories"
              name="calories"
              type="number"
              min="0"
              value={formData.calories || ''}
              onChange={handleChange}
              placeholder="e.g., 350"
            />
          </div>

          {/* Prep Time */}
          <div className="space-y-2">
            <Label htmlFor="prepTime">Preparation Time</Label>
            <Input
              id="prepTime"
              name="prepTime"
              value={formData.prepTime || ''}
              onChange={handleChange}
              placeholder="e.g., 10 min"
            />
          </div>

          {/* Dietary Options */}
          <div className="space-y-3 rounded-lg bg-secondary p-3">
            <Label className="flex items-center gap-2">
              <Leaf className="h-4 w-4" />
              Dietary Options
            </Label>
            <div className="flex items-center gap-2">
              <input
                id="isVeg"
                name="isVeg"
                type="checkbox"
                checked={formData.isVeg}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="isVeg" className="font-normal cursor-pointer">
                Vegetarian
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <input
                id="isVegan"
                name="isVegan"
                type="checkbox"
                checked={formData.isVegan}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="isVegan" className="font-normal cursor-pointer">
                Vegan
              </Label>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="gradient-gold w-full"
            disabled={isSubmitting}
            size="lg"
          >
            {isSubmitting ? 'Saving...' : menuItem ? 'Update Item' : 'Add Item'}
          </Button>
        </form>
      </DialogContent>

      <ImageCropModal
        isOpen={isCropModalOpen}
        onClose={() => setIsCropModalOpen(false)}
        onSave={(croppedImage) => setFormData((prev) => ({ ...prev, image: croppedImage }))}
        title="Upload Menu Item Image"
        aspectRatio={4 / 3}
        width={800}
        height={600}
      />
    </Dialog>
  );
};
