
import React, { useState } from 'react';
import { CheckCircle2, Building2, MapPin } from 'lucide-react';
import ModalShell from '../../components/ui/ModalShell';
import GlassInput from '../../components/ui/GlassInput';
import Button from '../../components/ui/Button';

interface AddBuildingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd?: (buildingData: any) => void;
}

const AddBuildingModal: React.FC<AddBuildingModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [floors, setFloors] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onAdd) {
        onAdd({ name, floors, description });
    }
    onClose();
  };

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-lg"
      headerContent={
        <div className="flex items-center gap-3">
           <div className="p-2 rounded-xl bg-purple-600 dark:bg-purple-500 text-white shadow-lg">
              <Building2 size={20} />
           </div>
           <div>
              <h2 className="text-xl font-black dark:text-white tracking-tighter uppercase">Add Building</h2>
              <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mt-0.5">New Block Config</p>
           </div>
        </div>
      }
      footer={
        <div className="flex justify-end gap-3">
           <Button variant="ghost" onClick={onClose}>Cancel</Button>
           <Button variant="primary" onClick={handleSubmit} icon={<CheckCircle2 size={16} />}>Create Block</Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        <GlassInput
          label="Building Name / Block ID"
          placeholder="e.g. West Wing"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <GlassInput
          label="Number of Floors"
          type="number"
          placeholder="e.g. 5"
          value={floors}
          onChange={(e) => setFloors(e.target.value)}
          required
        />
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-gray-500 dark:text-gray-400">Location Description</label>
          <div className="relative">
            <MapPin size={16} className="absolute left-4 top-4 text-gray-500" />
            <textarea 
              rows={3}
              placeholder="e.g. Facing the pool area, accessible via main lobby." 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 pl-11 rounded-xl outline-none transition-all duration-200 text-sm font-medium border bg-gray-50 dark:bg-black/20 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-accent/50 focus:ring-4 focus:ring-accent/10 resize-none"
            />
          </div>
        </div>
      </form>
    </ModalShell>
  );
};

export default AddBuildingModal;
