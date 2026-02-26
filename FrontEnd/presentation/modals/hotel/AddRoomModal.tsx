
import React, { useState } from 'react';
import { CheckCircle2, Bed, Layers, Hash, Building2 } from 'lucide-react';
import ModalShell from '../../components/ui/ModalShell';
import GlassInput from '../../components/ui/GlassInput';
import Button from '../../components/ui/Button';

interface AddRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd?: (roomData: any) => void;
}

const selectClass = `w-full px-4 py-3 rounded-xl outline-none transition-all duration-200 text-sm font-medium border bg-gray-50 dark:bg-black/20 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-accent/50 focus:ring-4 focus:ring-accent/10 appearance-none cursor-pointer`;

const AddRoomModal: React.FC<AddRoomModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [roomNumber, setRoomNumber] = useState('');
  const [floor, setFloor] = useState('');
  const [category, setCategory] = useState('Standard');
  const [building, setBuilding] = useState('Building 01');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onAdd) {
        onAdd({ roomNumber, floor, category, building });
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
           <div className="p-2 rounded-xl bg-accent-strong text-white shadow-lg">
              <Bed size={20} />
           </div>
           <div>
              <h2 className="text-xl font-black dark:text-white tracking-tighter uppercase">Add Room</h2>
              <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">Expand Inventory</p>
           </div>
        </div>
      }
      footer={
        <div className="flex justify-end gap-3">
           <Button variant="ghost" onClick={onClose}>Cancel</Button>
           <Button variant="primary" onClick={handleSubmit} icon={<CheckCircle2 size={16} />}>Save Room</Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        <div className="grid grid-cols-2 gap-6">
            <div className="col-span-1">
                <GlassInput
                  label="Room Number"
                  placeholder="e.g. 101"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  required
                />
            </div>
            <div className="col-span-1">
                <GlassInput
                  label="Floor Number"
                  type="number"
                  placeholder="e.g. 1"
                  value={floor}
                  onChange={(e) => setFloor(e.target.value)}
                  required
                />
            </div>
            <div className="col-span-2">
                <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-gray-500 dark:text-gray-400">Building</label>
                <div className="relative">
                    <Building2 size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 z-10" />
                    <select 
                        value={building} 
                        onChange={(e) => setBuilding(e.target.value)} 
                        className={`${selectClass} pl-11`}
                    >
                        <option>Building 01</option>
                        <option>Building 02</option>
                        <option>Annex Wing</option>
                    </select>
                </div>
            </div>
            <div className="col-span-2">
                <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-gray-500 dark:text-gray-400">Room Category</label>
                <div className="grid grid-cols-2 gap-3">
                    {['Standard', 'Deluxe', 'Suite', 'Dormitory'].map(cat => (
                        <button
                            key={cat}
                            type="button"
                            onClick={() => setCategory(cat)}
                            className={`p-3 rounded-xl border text-xs font-bold uppercase transition-all ${category === cat ? 'bg-accent-strong text-white border-transparent shadow-lg' : 'bg-transparent border-white/10 text-gray-500 hover:border-accent/50'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>
        </div>
      </form>
    </ModalShell>
  );
};

export default AddRoomModal;
