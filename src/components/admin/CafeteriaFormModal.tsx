import { useState, useEffect } from 'react';
import type { Cafeteria } from '@/types/data';
import { useCafeteriaAdmin } from '@/contexts/CafeteriaAdminContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Clock, Building2, Utensils } from 'lucide-react';

interface CafeteriaFormProps {
  isOpen: boolean;
  onClose: () => void;
  cafeteria?: Cafeteria;
  buildings: Array<{ id: string; name: string }>;
}

export const CafeteriaFormModal = ({ isOpen, onClose, cafeteria, buildings }: CafeteriaFormProps) => {
  const { addCafeteria, updateCafeteria } = useCafeteriaAdmin();
  const [formData, setFormData] = useState<Omit<Cafeteria, 'id'>>({
    buildingId: '',
    name: '',
    image: '',
    cuisine: '',
    rating: 4.0,
    openTime: '09:00 AM',
    closeTime: '09:00 PM',
    isOpen: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (cafeteria) {
      setFormData({
        buildingId: cafeteria.buildingId,
        name: cafeteria.name,
        image: cafeteria.image,
        cuisine: cafeteria.cuisine,
        rating: cafeteria.rating,
        openTime: cafeteria.openTime,
        closeTime: cafeteria.closeTime,
        isOpen: cafeteria.isOpen,
      });
    } else {
      setFormData({
        buildingId: buildings[0]?.id || '',
        name: '',
        image: '',
        cuisine: '',
        rating: 4.0,
        openTime: '09:00 AM',
        closeTime: '09:00 PM',
        isOpen: true,
      });
    }
  }, [cafeteria, buildings, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : name === 'rating' ? parseFloat(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.buildingId || !formData.cuisine || !formData.image) {
      toast.error('Please fill all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      if (cafeteria) {
        await updateCafeteria(cafeteria.id, formData);
        toast.success('Cafeteria updated successfully!');
      } else {
        await addCafeteria(formData);
        toast.success('Cafeteria added successfully!');
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
      buildingId: buildings[0]?.id || '',
      name: '',
      image: '',
      cuisine: '',
      rating: 4.0,
      openTime: '09:00 AM',
      closeTime: '09:00 PM',
      isOpen: true,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto max-w-md">
        <DialogHeader>
          <DialogTitle>{cafeteria ? 'Edit Restaurant' : 'Add New Restaurant'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Building */}
          <div className="space-y-2">
            <Label htmlFor="buildingId" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Building
            </Label>
            <select
              id="buildingId"
              name="buildingId"
              value={formData.buildingId}
              onChange={handleChange}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              required
            >
              <option value="">Select a building</option>
              {buildings.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Restaurant Name *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., The Green Bowl"
              required
            />
          </div>

          {/* Cuisine */}
          <div className="space-y-2">
            <Label htmlFor="cuisine" className="flex items-center gap-2">
              <Utensils className="h-4 w-4" />
              Cuisine Type *
            </Label>
            <Input
              id="cuisine"
              name="cuisine"
              value={formData.cuisine}
              onChange={handleChange}
              placeholder="e.g., North Indian, Italian"
              required
            />
          </div>

          {/* Image URL */}
          <div className="space-y-2">
            <Label htmlFor="image">Image URL *</Label>
            <Input
              id="image"
              name="image"
              value={formData.image}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
              required
            />
            {formData.image && (
              <img src={formData.image} alt="Preview" className="h-24 w-full rounded-md object-cover" />
            )}
          </div>

          {/* Rating */}
          <div className="space-y-2">
            <Label htmlFor="rating">Rating (0-5)</Label>
            <Input
              id="rating"
              name="rating"
              type="number"
              min="0"
              max="5"
              step="0.1"
              value={formData.rating}
              onChange={handleChange}
            />
          </div>

          {/* Open Time */}
          <div className="space-y-2">
            <Label htmlFor="openTime" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Opening Time
            </Label>
            <Input
              id="openTime"
              name="openTime"
              value={formData.openTime}
              onChange={handleChange}
              placeholder="e.g., 09:00 AM"
            />
          </div>

          {/* Close Time */}
          <div className="space-y-2">
            <Label htmlFor="closeTime" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Closing Time
            </Label>
            <Input
              id="closeTime"
              name="closeTime"
              onChange={handleChange}
              value={formData.closeTime}
              placeholder="e.g., 09:00 PM"
            />
          </div>

          {/* Is Open */}
          <div className="flex items-center gap-2">
            <input
              id="isOpen"
              name="isOpen"
              type="checkbox"
              checked={formData.isOpen}
              onChange={handleChange}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="isOpen" className="font-normal cursor-pointer">
              Currently Open
            </Label>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="gradient-gold w-full"
            disabled={isSubmitting}
            size="lg"
          >
            {isSubmitting ? 'Saving...' : cafeteria ? 'Update Restaurant' : 'Add Restaurant'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
