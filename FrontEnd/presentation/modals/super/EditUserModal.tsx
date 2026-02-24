"use client";

import React, { useState, useEffect } from "react";
import { User as UserIcon, Mail, Phone, Shield, Save } from "lucide-react";
import ModalShell from "../../components/ui/ModalShell";
import GlassInput from "../../components/ui/GlassInput";
import Button from "../../components/ui/Button";
import type { User } from "@/domain/entities/User";
import { useUsers } from "@/application/hooks/useUsers";

interface EditUserModalProps {
  isOpen: boolean;
  user: User;
  onClose: () => void;
  onUpdate: (user: User) => void;
}

const selectClass = `w-full px-4 py-3 rounded-xl outline-none transition-all duration-200 text-sm font-medium border bg-gray-50 dark:bg-black/20 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-accent/50 focus:ring-4 focus:ring-accent/10 appearance-none cursor-pointer`;

const EditUserModal: React.FC<EditUserModalProps> = ({
  isOpen,
  user,
  onClose,
  onUpdate,
}) => {
  const { roles } = useUsers();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [name, setName] = useState(user.name || "");
  const [email, setEmail] = useState(user.email || "");
  const [mobile, setMobile] = useState(user.mobile || "");
  const [role, setRole] = useState(user.role?.name || "");

  useEffect(() => {
    if (isOpen) {
      setName(user.name || "");
      setEmail(user.email || "");
      setMobile(user.mobile || "");
      setRole(user.role?.name || "");
    }
  }, [isOpen, user]);

  const handleUpdate = async () => {
    setIsSubmitting(true);
    try {
      const selectedRole = roles.find((r) => r.name === role);

      await onUpdate({
        ...user,
        name,
        email,
        mobile,
        role: selectedRole || user.role, // Update nested role object
      });
      onClose();
    } catch (err) {
      console.error("Failed to update user", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-lg"
      title="Modify Identity"
      subtitle={`Editing UID: ${user.id}`}
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            Discard
          </Button>
          <Button
            variant="action"
            onClick={handleUpdate}
            disabled={isSubmitting}
            icon={!isSubmitting ? <Save size={16} /> : undefined}
          >
            {isSubmitting ? "Syncing..." : "Update Profile"}
          </Button>
        </div>
      }
    >
      <div className="p-8 space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="col-span-2">
            <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-gray-500 dark:text-gray-400">
              Full Legal Name *
            </label>
            <div className="relative group">
              <UserIcon
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-accent transition-colors z-10"
              />
              <GlassInput
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Vikram Patel"
                className="pl-11"
              />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-gray-500 dark:text-gray-400">
              Work Email *
            </label>
            <div className="relative group">
              <Mail
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-accent transition-colors z-10"
              />
              <GlassInput
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="v.patel@atc.com"
                className="pl-11"
              />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-gray-500 dark:text-gray-400">
              Contact Mobile *
            </label>
            <div className="relative group">
              <Phone
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-accent transition-colors z-10"
              />
              <GlassInput
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="+91 99999 00000"
                className="pl-11"
              />
            </div>
          </div>
          <div className="col-span-2">
            <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-gray-500 dark:text-gray-400">
              Assign RBAC Role *
            </label>
            <div className="relative group">
              <Shield
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none z-10"
              />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className={`${selectClass} pl-11`}
              >
                {roles.map((r) => (
                  <option key={r.id || r.name} value={r.name}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </ModalShell>
  );
};

export default EditUserModal;
