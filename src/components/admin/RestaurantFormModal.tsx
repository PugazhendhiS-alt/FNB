import { useState, useEffect } from 'react';
import type { Cafeteria } from '@/types/data';
import { AdminUser } from '@/contexts/AdminContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Building2 } from 'lucide-react';
import { ImageCropModal } from '@/components/admin/ImageCropModal';

interface RestaurantFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (restaurant: Omit<Cafeteria, 'id'> & { assignedAdminIds?: string[] }) => void;
  cafeteria?: Cafeteria;
  availableAdmins: AdminUser[];
  buildings: Array<{ id: string; name: string }>;
  mode?: 'superadmin' | 'restaurantadmin'; // New modal mode
}

export const RestaurantFormModal = ({
  isOpen,
  onClose,
  onSave,
  cafeteria,
  availableAdmins,
  mode = 'superadmin',
}: RestaurantFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    buildingId: buildings[0]?.id ?? '',
    cuisine: '',
    image: '',
    openTime: '11:00',
    closeTime: '23:00',
    isOpen: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);

  useEffect(() => {
    if (cafeteria) {
      setFormData({
        name: cafeteria.name,
        buildingId: cafeteria.buildingId,
        cuisine: cafeteria.cuisine || '',
        image: cafeteria.image || '',
        openTime: cafeteria.openTime || '11:00',
        closeTime: cafeteria.closeTime || '23:00',
        isOpen: cafeteria.isOpen,
      });
    } else {
      setFormData({
        name: '',
        buildingId: buildings[0]?.id ?? '',
        cuisine: '',
        image: '',
        openTime: '11:00',
        closeTime: '23:00',
        isOpen: true,
      });
    }
  }, [cafeteria, isOpen, mode, buildings]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.buildingId) {
      toast.error('Please fill all required fields');
      return;
    }

    if (mode === 'restaurantadmin' && (!formData.cuisine || !formData.openTime || !formData.closeTime)) {
      toast.error('Please fill all required fields (Name, Cuisine, Hours)');
      return;
    }

    setIsSubmitting(true);
    try {
      const saveData: any = { ...formData };

      onSave(saveData);
      toast.success(cafeteria ? 'Restaurant updated!' : 'Restaurant created!');
      handleClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      buildingId: buildings[0]?.id ?? '',
      cuisine: '',
      image: '',
      openTime: '11:00',
      closeTime: '23:00',
      isOpen: true,
    });
    setIsCropModalOpen(false);
    onClose();
  };

  // SuperAdmin Mode - Simple form
  if (mode === 'superadmin') {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-h-[90vh] overflow-y-auto max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {cafeteria ? 'Edit Restaurant' : 'Create New Restaurant'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Restaurant Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., The Green Bowl"
                required
                disabled={isSubmitting}
                className="bg-background"
              />
            </div>

            {/* Building */}
            <div className="space-y-2">
              <Label htmlFor="buildingId">Building/Location *</Label>
              <select
                id="buildingId"
                name="buildingId"
                value={formData.buildingId}
                onChange={handleInputChange}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                disabled={isSubmitting}
                required
              >
                <option value="">Select a building</option>
                {buildings.map((building) => (
                  <option key={building.id} value={building.id}>
                    {building.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="gradient-gold flex-1"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : cafeteria ? 'Update' : 'Create Restaurant'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    );
  }

  // Restaurant Admin Mode - Full edit form
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Edit Restaurant
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Restaurant Name *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g., The Green Bowl"
              required
              disabled={isSubmitting}
              className="bg-background"
            />
          </div>

          {/* Building (Disabled/Read-only) */}
          <div className="space-y-2">
            <Label htmlFor="buildingId">Building/Location</Label>
            <select
              id="buildingId"
              name="buildingId"
              value={formData.buildingId}
              onChange={handleInputChange}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm opacity-60 cursor-not-allowed"
              disabled={true}
            >
              <option value="b1">Prestige Tower</option>
              <option value="b2">Lakeside Campus</option>
              <option value="b3">BKC Central Hub</option>
            </select>
            <p className="text-xs text-muted-foreground italic">Building cannot be changed (set by Super Admin)</p>
          </div>

          {/* Cuisine */}
          <div className="space-y-2">
            <Label htmlFor="cuisine">Cuisine Type *</Label>
            <Input
              id="cuisine"
              name="cuisine"
              value={formData.cuisine}
              onChange={handleInputChange}
              placeholder="e.g., Healthy & Salads"
              required
              disabled={isSubmitting}
              className="bg-background"
            />
          </div>

          {/* Operating Hours */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="openTime">Opens At *</Label>
              <Input
                id="openTime"
                name="openTime"
                type="time"
                value={formData.openTime}
                onChange={handleInputChange}
                required
                disabled={isSubmitting}
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="closeTime">Closes At *</Label>
              <Input
                id="closeTime"
                name="closeTime"
                type="time"
                value={formData.closeTime}
                onChange={handleInputChange}
                required
                disabled={isSubmitting}
                className="bg-background"
              />
            </div>
          </div>

          {/* Active Status */}
          <div className="flex items-center justify-between gap-4 rounded-md border border-input bg-secondary/50 p-4">
            <div>
              <p className="text-sm font-semibold">Restaurant Status</p>
              <p className="text-xs text-muted-foreground">Toggle active or inactive for this restaurant.</p>
            </div>
            <label className="flex items-center gap-3">
              <span className="text-sm font-medium">{formData.isOpen ? 'Active' : 'Inactive'}</span>
              <input
                id="isOpen"
                name="isOpen"
                type="checkbox"
                checked={formData.isOpen}
                onChange={(e) => setFormData((prev) => ({ ...prev, isOpen: e.target.checked }))}
                disabled={isSubmitting}
                className="h-5 w-10 rounded-full cursor-pointer border border-input bg-background accent-primary"
              />
            </label>
          </div>

          {/* Image */}
          <div className="space-y-2">
            <Label>Restaurant Image</Label>
            {formData.image ? (
              <div className="space-y-3">
                <img
                  src={formData.image}
                  alt="Restaurant preview"
                  className="h-40 w-full rounded-md object-cover"
                />
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCropModalOpen(true)}
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    Replace Image
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => setFormData((prev) => ({ ...prev, image: '' }))}
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    Remove Image
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCropModalOpen(true)}
                disabled={isSubmitting}
                className="w-full"
              >
                Upload Restaurant Image
              </Button>
            )}
            <p className="text-xs text-muted-foreground">Upload and crop the restaurant image to match the user app display.</p>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="gradient-gold flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Update Restaurant'}
            </Button>
          </div>
        </form>
      </DialogContent>

      <ImageCropModal
        isOpen={isCropModalOpen}
        onClose={() => setIsCropModalOpen(false)}
        onSave={(croppedImage) => setFormData((prev) => ({ ...prev, image: croppedImage }))}
        title="Upload Restaurant Image"
        aspectRatio={3}
        width={1200}
        height={400}
      />
    </Dialog>
  );
};
