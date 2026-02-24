import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Smartphone,
  Shield,
  Info,
  CheckCircle2,
  ChevronDown,
  UserCheck,
} from "lucide-react";
import ModalShell from "../../components/ui/ModalShell";
import GlassInput from "../../components/ui/GlassInput";
import Button from "../../components/ui/Button";
import { useHotelStaff } from "@/application/hooks/useHotelStaff";
import type { User as StaffMember, Role } from "@/domain/entities/User";

interface AddHotelUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffMember?: StaffMember | null;
  roles: Role[];
  tenantId?: string;
}

const selectClass = `w-full px-4 py-4 rounded-2xl outline-none transition-all duration-200 text-sm font-medium border bg-gray-50 dark:bg-black/20 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-accent/50 focus:ring-4 focus:ring-accent/10 appearance-none cursor-pointer`;

const AddHotelUserModal: React.FC<AddHotelUserModalProps> = ({
  isOpen,
  onClose,
  staffMember,
  roles,
  tenantId,
}) => {
  const { createStaff, updateStaff } = useHotelStaff(tenantId || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    roleId: "",
    status: "Active" as "Active" | "Inactive",
    employee_id: "",
  });

  useEffect(() => {
    if (isOpen) {
      setIsSuccess(false);
      setError(null);
      if (staffMember) {
        setFormData({
          name: staffMember.name || "",
          email: staffMember.email || "",
          mobile: staffMember.mobile || staffMember.phone || "",
          roleId: staffMember.role?.id || "",
          status: (staffMember.status as any) || "Active",
          employee_id: staffMember.id,
        });
      } else {
        setFormData({
          name: "",
          email: "",
          mobile: "",
          roleId: roles.length > 0 ? roles[0].id : "",
          status: "Active",
          employee_id: "",
        });
      }
    }
  }, [isOpen, staffMember, roles]);

  const handleAction = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      const selectedRole = roles.find((r) => r.id === formData.roleId);

      if (staffMember) {
        await updateStaff(staffMember.id, {
          name: formData.name,
          email: formData.email,
          mobile: formData.mobile,
          role: selectedRole,
          status: formData.status,
        });
      } else {
        await createStaff({
          name: formData.name,
          email: formData.email,
          mobile: formData.mobile,
          role: selectedRole,
          status: formData.status,
          dateAdded: new RegExp(/^\d{4}-\d{2}-\d{2}$/).test(
            new Date().toISOString().split("T")[0],
          )
            ? new Date().toISOString().split("T")[0]
            : "", // placeholder date
          lastLogin: "Never",
        });
      }

      setIsSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err?.message || "Failed to process staff member");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-xl"
      title={
        isSuccess
          ? undefined
          : staffMember
            ? "Edit Property Member"
            : "Add Property Member"
      }
      subtitle={
        isSuccess
          ? undefined
          : staffMember
            ? "Update Identity Access"
            : "Direct Staff Provisioning"
      }
      hideHeader={isSuccess}
      footer={
        !isSuccess ? (
          <div className="flex justify-end gap-3 p-6 pt-0">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="action"
              size="lg"
              onClick={handleAction}
              disabled={isSubmitting || !formData.name || !formData.email}
              icon={
                !isSubmitting ? (
                  <UserCheck size={18} strokeWidth={3} />
                ) : undefined
              }
            >
              {isSubmitting
                ? staffMember
                  ? "Updating..."
                  : "Provisioning..."
                : staffMember
                  ? "Save Changes"
                  : "Confirm & Add Member"}
            </Button>
          </div>
        ) : undefined
      }
    >
      {!isSuccess ? (
        <div className="p-10 pt-4 space-y-8">
          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold uppercase tracking-widest">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-8">
            <div className="col-span-2">
              <label className="block text-[10px] font-bold uppercase tracking-widest mb-3 text-gray-500 dark:text-gray-400">
                Staff Full Name *
              </label>
              <div className="relative group">
                <User
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-accent transition-colors z-10"
                />
                <GlassInput
                  placeholder="e.g. Meera Lakhani"
                  className="pl-12"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest mb-3 text-gray-500 dark:text-gray-400">
                Staff Mobile *
              </label>
              <div className="relative group">
                <Smartphone
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-accent transition-colors z-10"
                />
                <GlassInput
                  type="tel"
                  placeholder="+91"
                  className="pl-12"
                  value={formData.mobile}
                  onChange={(e) =>
                    setFormData({ ...formData, mobile: e.target.value })
                  }
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest mb-3 text-gray-500 dark:text-gray-400">
                Staff Email *
              </label>
              <div className="relative group">
                <Mail
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-accent transition-colors z-10"
                />
                <GlassInput
                  type="email"
                  placeholder="meera.l@hotel.com"
                  className="pl-12"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
            </div>
            <div>
              <GlassInput
                label="Employee ID"
                placeholder="STAFF-000"
                mono
                className="pl-12"
                value={formData.employee_id}
                onChange={(e) =>
                  setFormData({ ...formData, employee_id: e.target.value })
                }
                disabled={!!staffMember}
                readOnly={!!staffMember}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest mb-3 text-gray-500 dark:text-gray-400">
                Assign Role *
              </label>
              <div className="relative group">
                <Shield
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none z-10"
                />
                <select
                  className={`${selectClass} pl-12`}
                  value={formData.roleId}
                  onChange={(e) =>
                    setFormData({ ...formData, roleId: e.target.value })
                  }
                >
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                  {roles.length === 0 && <option>No roles defined</option>}
                </select>
                <ChevronDown
                  size={14}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                />
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-accent/5 border border-white/5 flex gap-4">
            <Info size={20} className="text-accent shrink-0 mt-0.5" />
            <p className="text-[11px] font-medium text-gray-500 leading-relaxed uppercase">
              {staffMember
                ? "Updating staff identity will refresh their access policies. Changes are immediate."
                : "New staff members will receive an activation SMS with their initial PIN. Their identity will be cryptographically bound to this property."}
            </p>
          </div>
        </div>
      ) : (
        <div className="p-20 flex flex-col items-center text-center space-y-6 animate-in zoom-in-95 duration-500">
          <div className="w-24 h-24 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-2xl shadow-emerald-500/40">
            <CheckCircle2 size={48} strokeWidth={3} />
          </div>
          <div>
            <h3 className="text-3xl font-black dark:text-white tracking-tighter uppercase">
              {staffMember ? "Identity Updated" : "Member Registered"}
            </h3>
            <p className="text-sm font-medium text-gray-500 mt-2">
              {staffMember
                ? "Staff profile synchronized successfully."
                : "Identity sync successful. Staff ID activated."}
            </p>
          </div>
        </div>
      )}
    </ModalShell>
  );
};

export default AddHotelUserModal;
