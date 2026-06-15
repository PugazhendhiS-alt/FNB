import { useEffect, useState } from 'react';
import type { Building } from '@/types/data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Building2 } from 'lucide-react';

interface BuildingFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (building: Omit<Building, 'id'>) => Promise<void>;
  building?: Building;
}

export const BuildingFormModal = ({ isOpen, onClose, onSave, building }: BuildingFormProps) => {
  const [formData, setFormData] = useState<Omit<Building, 'id'>>({
    name: '',
    address: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (building) {
      setFormData({
        name: building.name,
        address: building.address,
      });
    } else {
      setFormData({
        name: '',
        address: '',
      });
    }
  }, [building, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.address.trim()) {
      toast.error('Please provide both building name and address');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        name: formData.name.trim(),
        address: formData.address.trim(),
      });
      toast.success(building ? 'Building updated!' : 'Building created!');
      handleClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to save building');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      address: '',
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {building ? 'Edit Building' : 'Create New Building'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Building Name *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Prestige Tower"
              disabled={isSubmitting}
              className="bg-background"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address *</Label>
            <Input
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="e.g. Outer Ring Road, Bellandur"
              disabled={isSubmitting}
              className="bg-background"
              required
            />
          </div>

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
              {isSubmitting ? 'Saving...' : building ? 'Update Building' : 'Create Building'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
