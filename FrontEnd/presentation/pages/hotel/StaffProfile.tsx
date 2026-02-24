import React, { useState, useEffect } from "react";
import { User, Mail, Phone, Lock, Camera, Save, Loader2 } from "lucide-react";
import GlassCard from "../../components/ui/GlassCard";
import PageHeader from "../../components/ui/PageHeader";
import Button from "../../components/ui/Button";
import { useAuth } from "@/application/hooks/useAuth";

const StaffProfile: React.FC = () => {
  const { user, updateMyProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        mobile: user.mobile || user.phone || "",
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
        alert("Passwords do not match");
        return;
      }

      await updateMyProfile({
        name: formData.name,
        mobile: formData.mobile,
        ...(newPassword ? { password: newPassword } : {}),
      });

      setNewPassword("");
      setConfirmPassword("");
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to update profile", error);
      alert("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const profileName = formData.name || "Staff Member";
  const profileRole = user?.roleName || user?.role || "Unassigned Role";
  const profileId = user?.id || "N/A";
  const profileJoinedOn = user?.dateAdded || "N/A";
  const avatarName = encodeURIComponent(
    profileName.replace(/\s+/g, "+") || "Staff",
  );

  const inputClass =
    "w-full px-4 py-3 rounded-xl outline-none transition-all duration-200 text-sm font-bold border bg-white dark:bg-black/40 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-accent/50 dark:focus:border-accent/50";

  const labelClass =
    "block text-[10px] font-bold uppercase tracking-widest mb-2 text-gray-500 dark:text-gray-400";

  return (
    <div className="p-8 space-y-8 min-h-screen pb-24 animate-in fade-in duration-500">
      <PageHeader title="My Profile" subtitle="Staff Profile & Preferences">
        <Button
          variant="primary"
          size="lg"
          icon={
            loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Save size={18} strokeWidth={3} />
            )
          }
          onClick={handleSave}
          disabled={loading}
        >
          {success ? "Saved!" : "Save Changes"}
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-4 space-y-8">
          <GlassCard className="flex flex-col items-center text-center p-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
            <div className="relative mb-6">
              <div className="w-32 h-32 rounded-[2.5rem] bg-accent-muted flex items-center justify-center text-accent-strong shadow-inner overflow-hidden border-4 border-white dark:border-white/10">
                <img
                  src={
                    user?.avatar ||
                    `https://ui-avatars.com/api/?name=${avatarName}&background=f97316&color=fff&size=128`
                  }
                  alt={profileName}
                />
              </div>
              <button className="absolute -bottom-2 -right-2 p-3 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-black shadow-xl hover:scale-110 transition-transform">
                <Camera size={18} />
              </button>
            </div>
            <h3 className="text-2xl font-black dark:text-white tracking-tighter uppercase mb-1">
              {profileName}
            </h3>
            <p className="text-[10px] font-bold uppercase tracking-widest text-accent-strong bg-blue-500/10 px-3 py-1 rounded-full border border-accent/20">
              {profileRole}
            </p>

            <div className="mt-8 pt-8 border-t border-white/5 w-full space-y-4">
              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                <span className="text-gray-500">Employee ID</span>
                <span className="dark:text-white font-mono">{profileId}</span>
              </div>
              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                <span className="text-gray-500">Joined On</span>
                <span className="dark:text-white">{profileJoinedOn}</span>
              </div>
              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                <span className="text-gray-500">Status</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                    user?.status === "Active"
                      ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                      : "bg-red-500/10 text-red-500 border border-red-500/20"
                  }`}
                >
                  {user?.status || "Active"}
                </span>
              </div>
            </div>
          </GlassCard>
        </div>

        <div className="lg:col-span-8 space-y-8">
          <GlassCard>
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 rounded-xl bg-blue-500/10 text-accent">
                <User size={20} />
              </div>
              <h3 className="text-sm font-black uppercase tracking-widest dark:text-white">
                Personal Identity
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className={labelClass}>Full Legal Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Work Email</label>
                <div className="relative">
                  <Mail
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                  />
                  <input
                    type="email"
                    name="email"
                    value={user?.email || ""}
                    readOnly
                    className={`${inputClass} pl-11 opacity-60 cursor-not-allowed`}
                    title="Email is managed by your administrator"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[8px] font-bold uppercase tracking-widest text-gray-400">
                    Admin Only
                  </span>
                </div>
              </div>
              <div>
                <label className={labelClass}>Contact Mobile</label>
                <div className="relative">
                  <Phone
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                  />
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
              <h3 className="text-sm font-black uppercase tracking-widest dark:text-white">
                Security & Access
              </h3>
            </div>
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className={labelClass}>New Secret Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New password"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Repeat Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm password"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default StaffProfile;
