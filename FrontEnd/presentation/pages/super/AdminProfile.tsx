import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Lock, Camera, ShieldCheck, Save, Loader2 } from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../../application/hooks/useAuth';

const AdminProfile: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { user, updateMyProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        mobile: user.mobile || user.phone || '',
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    setSuccess(false);
    try {
      if (newPassword && newPassword !== confirmPassword) {
        alert('Passwords do not match');
        return;
      }

      await updateMyProfile({
        name: formData.name,
        mobile: formData.mobile,
        ...(newPassword ? { password: newPassword } : {}),
      });

      setNewPassword('');
      setConfirmPassword('');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to update profile', error);
      alert('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = `w-full px-4 py-3 rounded-xl outline-none transition-all duration-200 text-sm font-bold border
    ${
      isDarkMode
        ? 'bg-black/40 border-white/10 text-white placeholder-gray-500 focus:border-accent/50'
        : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-accent/50 focus:ring-2 focus:ring-accent/10'
    }`;

  const labelClass = `block text-[10px] font-bold uppercase tracking-widest mb-2 ${
    isDarkMode ? 'text-gray-400' : 'text-gray-500'
  }`;
  const avatarUrl =
    user?.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name || 'User')}&background=0D8ABC&color=fff&size=128`;

  return (
    <div className="p-8 space-y-8 min-h-screen pb-20 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">Account Settings</h1>
          <p className="text-sm text-gray-500 font-bold uppercase tracking-widest mt-1">
            Manage your personal profile & preferences
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={loading}
          className="flex items-center gap-2 bg-accent-strong text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          {success ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-8">
          <GlassCard className="flex flex-col items-center text-center p-10">
            <div className="relative mb-6">
              <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-tr from-blue-100 to-blue-200 dark:from-zinc-800 dark:to-zinc-700 flex items-center justify-center text-accent-strong dark:text-gray-300 shadow-inner overflow-hidden border-4 border-white dark:border-white/10">
                <img src={avatarUrl} alt="Profile" />
              </div>
              <button className="absolute -bottom-2 -right-2 p-3 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-black shadow-xl hover:scale-110 transition-transform">
                <Camera size={18} />
              </button>
            </div>
            <h3 className="text-xl font-black dark:text-white mb-1">{formData.name}</h3>
            <p className="text-[10px] font-bold uppercase tracking-widest text-accent-strong">
              {user?.roleName || user?.role} (Root Access)
            </p>
            <div className="mt-6 pt-6 border-t border-white/10 w-full">
              <div className="flex items-center justify-center gap-2 text-emerald-500">
                <ShieldCheck size={16} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Verified Identity</span>
              </div>
            </div>
          </GlassCard>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <GlassCard>
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 rounded-xl bg-blue-500/10 text-accent">
                <User size={20} />
              </div>
              <h3 className="text-sm font-black uppercase tracking-widest dark:text-white">Personal Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-2 md:col-span-1">
                <label className={labelClass}>Full Legal Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} className={inputClass} />
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className={labelClass}>Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    readOnly
                    className={`${inputClass} pl-11 opacity-60 cursor-not-allowed`}
                    title="Email is not editable from profile"
                  />
                </div>
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className={labelClass}>Mobile Number</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="tel"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    className={`${inputClass} pl-11`}
                  />
                </div>
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 rounded-xl bg-accent-muted text-accent">
                <Lock size={20} />
              </div>
              <h3 className="text-sm font-black uppercase tracking-widest dark:text-white">Security</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New password"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  className={inputClass}
                />
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
