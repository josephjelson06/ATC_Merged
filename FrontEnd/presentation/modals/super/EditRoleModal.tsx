"use client";

import React, { useState } from "react";
import { Save, Check } from "lucide-react";
import ModalShell from "../../components/ui/ModalShell";
import Button from "../../components/ui/Button";
import type { Role } from "@/domain/entities/User";

interface EditRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: Role & { id?: string };
  onSaveRole: (payload: { description?: string }) => Promise<void>;
}

const EditRoleModal: React.FC<EditRoleModalProps> = ({
  isOpen,
  onClose,
  role,
  onSaveRole,
}) => {
  const [description, setDescription] = useState(role.description || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSaveRole({ description });
      onClose();
    } catch (error) {
      console.error("Failed to save role", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Role Details"
      subtitle={`Modify attributes for ${role.name}`}
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            variant="action"
            onClick={handleSave}
            disabled={isSaving}
            icon={!isSaving ? <Check size={16} strokeWidth={3} /> : undefined}
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      }
    >
      <div className="p-8 space-y-6">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-gray-500 dark:text-gray-400">
            Role Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full h-32 px-4 py-3 rounded-xl bg-black/5 dark:bg-white/5 border border-white/10 text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-accent/10 transition-all resize-none placeholder:text-gray-600"
            placeholder="Describe the primary responsibilities and scope of this role..."
          />
        </div>
      </div>
    </ModalShell>
  );
};

export default EditRoleModal;
