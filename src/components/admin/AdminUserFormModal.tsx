import { useState, useEffect } from 'react';
import { AdminUser, AdminRole } from '@/contexts/AdminContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Mail, User, Lock, Building2, X, Eye, EyeOff } from 'lucide-react';

interface AdminUserFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: Omit<AdminUser, 'id' | 'createdAt'>) => Promise<void>;
  adminUser?: AdminUser;
  cafeterias: Array<{ id: string; name: string }>;
  mode?: 'admin' | 'superadmin'; // Mode for creation flow
}

export const AdminUserFormModal = ({
  isOpen,
  onClose,
  onSave,
  adminUser,
  cafeterias,
  mode = 'admin',
}: AdminUserFormProps) => {
  const [formData, setFormData] = useState<Omit<AdminUser, 'id' | 'createdAt'>>({
    email: '',
    password: '',
    name: '',
    role: 'admin',
    assignedCafeteriaIds: [],
    isActive: true,
    createdAt: new Date().toISOString(),
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (adminUser) {
      setFormData({
        email: adminUser.email,
        password: '',
        name: adminUser.name,
        role: adminUser.role,
        assignedCafeteriaIds: adminUser.assignedCafeteriaIds || [],
        isActive: adminUser.isActive !== undefined ? adminUser.isActive : true,
        createdAt: adminUser.createdAt,
      });
    } else {
      setFormData({
        email: '',
        password: '',
        name: '',
        role: mode === 'superadmin' ? 'superadmin' : 'admin',
        assignedCafeteriaIds: [],
        isActive: true,
        createdAt: new Date().toISOString(),
      });
    }
  }, [adminUser, isOpen, mode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleRestaurantToggle = (cafeId: string) => {
    const assignedIds = formData.assignedCafeteriaIds || [];
    setFormData((prev) => ({
      ...prev,
      assignedCafeteriaIds: assignedIds.includes(cafeId)
        ? assignedIds.filter((id) => id !== cafeId)
        : [...assignedIds, cafeId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.name) {
      toast.error('Please fill all required fields');
      return;
    }

    if (!adminUser && !formData.password) {
      toast.error('Please provide a password for new users');
      return;
    }

    if (formData.role === 'admin' && (!formData.assignedCafeteriaIds || formData.assignedCafeteriaIds.length === 0)) {
      toast.error('Please assign at least one restaurant for admin users');
      return;
    }

    if (formData.password && formData.password.length < 4) {
      toast.error('Password must be at least 4 characters');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave(formData);
      toast.success(adminUser ? 'Admin user updated!' : 'Admin user created!');
      handleClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      email: '',
      password: '',
      name: '',
      role: 'admin',
      assignedCafeteriaIds: [],
      isActive: true,
      createdAt: new Date().toISOString(),
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {adminUser ? 'Edit Admin User' : `Create ${mode === 'superadmin' ? 'Super Admin' : 'Restaurant Admin'}`}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email *
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="admin@example.com"
              required
              disabled={isSubmitting || !!adminUser}
              className="bg-background"
            />
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Full Name *
            </Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              required
              disabled={isSubmitting}
              className="bg-background"
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Password {adminUser ? '(leave blank to keep current password)' : '*'}
            </Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required={!adminUser}
                disabled={isSubmitting}
                className="bg-background pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                disabled={isSubmitting}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Minimum 4 characters
            </p>
          </div>

          {/* Restaurant Assignment (multi-select for admin role) */}
          {mode === 'admin' && (
            <div className="space-y-3 border rounded-lg p-4 bg-card">
              <div>
                <Label className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Assign Restaurants * (Select at least one)
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  This admin can manage selected restaurants
                </p>
              </div>

              <div className="space-y-2 max-h-40 overflow-y-auto">
                {cafeterias.length > 0 ? (
                  cafeterias.map((cafe) => (
                    <div key={cafe.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`cafe-${cafe.id}`}
                        checked={(formData.assignedCafeteriaIds || []).includes(cafe.id)}
                        onCheckedChange={() => handleRestaurantToggle(cafe.id)}
                        disabled={isSubmitting}
                      />
                      <Label
                        htmlFor={`cafe-${cafe.id}`}
                        className="cursor-pointer flex-1 text-sm font-medium"
                      >
                        {cafe.name}
                      </Label>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground text-sm py-2">
                    No restaurants available
                  </p>
                )}
              </div>

              {(formData.assignedCafeteriaIds || []).length > 0 && (
                <div className="bg-accent/10 border border-accent/20 rounded p-2">
                  <p className="text-xs font-semibold text-accent mb-2">
                    Assigned to {formData.assignedCafeteriaIds!.length} restaurant(s)
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {formData.assignedCafeteriaIds!.map((cafeId) => {
                      const cafe = cafeterias.find((c) => c.id === cafeId);
                      return cafe ? (
                        <div
                          key={cafeId}
                          className="bg-accent/20 text-xs px-2 py-1 rounded inline-flex items-center gap-1"
                        >
                          {cafe.name}
                          <button
                            type="button"
                            onClick={() => handleRestaurantToggle(cafeId)}
                            className="hover:text-destructive ml-1"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Submit Button */}
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
              {isSubmitting ? 'Saving...' : adminUser ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
