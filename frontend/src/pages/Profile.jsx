import { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useRole } from '../hooks/useRole';
import { authAPI } from '../api/endpoints';
import { ROLE_LABELS } from '../lib/constants';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import PageHeader from '../components/ui/PageHeader';
import Badge from '../components/ui/Badge';
import { UserCircleIcon, PhotoIcon, PencilIcon } from '@heroicons/react/24/outline';

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const { isSuperadmin } = useRole();
  const fileInputRef = useRef(null);

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ username: '', email: '', avatar: '' });
  const [avatarPreview, setAvatarPreview] = useState('');

  const [pwOpen, setPwOpen] = useState(false);
  const [pwStep, setPwStep] = useState('current');
  const [currentPassword, setCurrentPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwSending, setPwSending] = useState(false);
  const [devOtp, setDevOtp] = useState('');

  useEffect(() => {
    if (user) {
      setForm({ username: user.username || '', email: user.email || '', avatar: user.avatar || '' });
      setAvatarPreview(user.avatar || '');
    }
  }, [user]);

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return toast.error('Image must be under 2MB');
    const reader = new FileReader();
    reader.onload = (ev) => {
      setAvatarPreview(ev.target.result);
      setForm({ ...form, avatar: ev.target.result });
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.username || !form.email) return toast.error('Username and email are required.');
    setSaving(true);
    try {
      await updateProfile({
        username: form.username,
        email: form.email,
        avatar: form.avatar || null,
      });
      toast.success('Profile updated');
      setEditing(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleSendOtp = async () => {
    if (!currentPassword) return toast.error('Enter your current password.');
    if (newPassword !== confirmPassword) return toast.error('New passwords do not match.');
    if (newPassword.length < 6) return toast.error('Password must be at least 6 characters.');
    setPwSending(true);
    try {
      const res = await authAPI.changePassword({ currentPassword });
      if (res.data.otpCode) setDevOtp(res.data.otpCode);
      setPwStep('verify');
      toast.success('OTP sent to your email');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setPwSending(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode || !newPassword) return toast.error('OTP and new password are required.');
    setPwSending(true);
    try {
      await authAPI.verifyPasswordChange({ code: otpCode, newPassword });
      toast.success('Password changed successfully');
      setPwOpen(false);
      setPwStep('current');
      setCurrentPassword('');
      setOtpCode('');
      setNewPassword('');
      setConfirmPassword('');
      setDevOtp('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to verify OTP');
    } finally {
      setPwSending(false);
    }
  };

  const buildingName = user?.building?.name || user?.restaurant?.building?.name || '';
  const restaurantName = user?.restaurant?.name || '';

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader title="Profile" subtitle="Manage your account details" icon={UserCircleIcon} />

      <Card className="p-6">
        <div className="flex items-start gap-5">
          <div className="relative group">
            {avatarPreview ? (
              <img src={avatarPreview} alt="" className="w-20 h-20 rounded-full object-cover border border-gray-200 dark:border-gray-700" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center border border-gray-200 dark:border-gray-700">
                <UserCircleIcon className="w-10 h-10 text-primary-600" />
              </div>
            )}
            {editing && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary-600 text-white rounded-full flex items-center justify-center shadow hover:bg-primary-700"
              >
                <PhotoIcon className="w-3.5 h-3.5" />
              </button>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
          </div>
          <div className="flex-1 min-w-0 pt-1">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">{user?.username}</h2>
            <p className="text-sm text-gray-500">{user?.email}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant={user?.role === 'SUPERADMIN' ? 'purple' : 'success'}>{ROLE_LABELS[user?.role] || user?.role}</Badge>
              {buildingName && <Badge variant="info">{buildingName}</Badge>}
              {restaurantName && <Badge variant="info">{restaurantName}</Badge>}
            </div>
            {user?.phone && <p className="text-xs text-gray-400 mt-2">{user.phone}</p>}
          </div>
          <Button variant="secondary" size="sm" onClick={() => setEditing(!editing)}>
            <PencilIcon className="w-4 h-4 mr-1" />
            {editing ? 'Cancel' : 'Edit'}
          </Button>
        </div>

        {editing && (
          <form onSubmit={handleSave} className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 space-y-4">
            <Input label="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
            <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />

            {avatarPreview !== user?.avatar && avatarPreview && (
              <button
                type="button"
                onClick={() => { setAvatarPreview(user?.avatar || ''); setForm({ ...form, avatar: user?.avatar || '' }); }}
                className="text-xs text-red-500 hover:underline"
              >
                Reset avatar
              </button>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Button type="submit" loading={saving}>Save Changes</Button>
            </div>
          </form>
        )}
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Password</h3>
            <p className="text-xs text-gray-400">Change your password with OTP verification</p>
          </div>
          <Button variant="secondary" size="sm" onClick={() => { setPwOpen(!pwOpen); setPwStep('current'); setCurrentPassword(''); setOtpCode(''); setNewPassword(''); setConfirmPassword(''); setDevOtp(''); }}>
            {pwOpen ? 'Cancel' : 'Change Password'}
          </Button>
        </div>

        {pwOpen && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-4">
            {devOtp && (
              <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-center">
                <p className="text-xs text-green-700 dark:text-green-400 font-medium">Dev mode OTP: <span className="text-lg font-bold ml-1">{devOtp}</span></p>
              </div>
            )}

            {pwStep === 'current' && (
              <>
                <Input label="Current Password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Enter your current password" />
                <Input label="New Password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="At least 6 characters" />
                <Input label="Confirm New Password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter new password" />
                <div className="flex justify-end">
                  <Button onClick={handleSendOtp} loading={pwSending}>Send OTP</Button>
                </div>
              </>
            )}

            {pwStep === 'verify' && (
              <>
                <p className="text-sm text-gray-600 dark:text-gray-400">Enter the OTP sent to your email <strong>{user?.email}</strong></p>
                <Input label="OTP Code" value={otpCode} onChange={(e) => setOtpCode(e.target.value)} placeholder="Enter 6-digit OTP" maxLength={6} />
                <div className="flex justify-end">
                  <Button onClick={handleVerifyOtp} loading={pwSending}>Verify & Change Password</Button>
                </div>
              </>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
