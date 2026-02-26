
import React, { useState, useEffect } from 'react';
import { CheckCircle2, BedDouble, IndianRupee, Users, Tag, Plus, Trash2, X } from 'lucide-react';
import ModalShell from '../../components/ui/ModalShell';
import GlassInput from '../../components/ui/GlassInput';
import Button from '../../components/ui/Button';

interface ManageRoomTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (typeData: any) => void;
  initialData?: any;
}

const inputClass = `w-full px-4 py-3 rounded-xl outline-none transition-all duration-200 text-sm font-medium border bg-gray-50 dark:bg-black/20 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-accent/50 focus:ring-4 focus:ring-accent/10`;

const ManageRoomTypeModal: React.FC<ManageRoomTypeModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [name, setName] = useState('');
  const [rate, setRate] = useState('');
  const [occupancy, setOccupancy] = useState('');
  const [amenities, setAmenities] = useState<string[]>([]);
  const [newAmenity, setNewAmenity] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name);
        setRate(initialData.rate);
        setOccupancy(initialData.occupancy);
        setAmenities(initialData.amenities || []);
      } else {
        setName('');
        setRate('');
        setOccupancy('');
        setAmenities(['WiFi', 'TV']);
      }
    }
  }, [isOpen, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ 
        id: initialData?.id || Math.random().toString(36).substr(2, 9),
        name, 
        rate: Number(rate), 
        occupancy: Number(occupancy), 
        amenities 
    });
    onClose();
  };

  const addAmenity = () => {
    if (newAmenity.trim()) {
      setAmenities([...amenities, newAmenity.trim()]);
      setNewAmenity('');
    }
  };

  const removeAmenity = (idx: number) => {
    setAmenities(amenities.filter((_, i) => i !== idx));
  };

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-lg"
      headerContent={
        <div className="flex items-center gap-3">
           <div className="p-2 rounded-xl bg-purple-600 dark:bg-purple-500 text-white shadow-lg">
              <BedDouble size={20} />
           </div>
           <div>
              <h2 className="text-xl font-black dark:text-white tracking-tighter uppercase">{initialData ? 'Edit Room Type' : 'Define Room Type'}</h2>
              <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">Inventory Category Config</p>
           </div>
        </div>
      }
      footer={
        <div className="flex justify-end gap-3">
           <Button variant="ghost" onClick={onClose}>Cancel</Button>
           <Button variant="primary" onClick={handleSubmit} icon={<CheckCircle2 size={16} />}>Save Definition</Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-gray-500 dark:text-gray-400">Category Name</label>
            <div className="relative">
                <Tag size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 z-10" />
                <input 
                    type="text" 
                    placeholder="e.g. Ocean View Suite" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`${inputClass} pl-11`}
                    required 
                />
            </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
            <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-gray-500 dark:text-gray-400">Base Rack Rate</label>
                <div className="relative">
                    <IndianRupee size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 z-10" />
                    <input 
                        type="number" 
                        placeholder="5500" 
                        value={rate}
                        onChange={(e) => setRate(e.target.value)}
                        className={`${inputClass} pl-11`}
                        required 
                    />
                </div>
            </div>
            <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-gray-500 dark:text-gray-400">Max Occupancy</label>
                <div className="relative">
                    <Users size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 z-10" />
                    <input 
                        type="number" 
                        placeholder="2" 
                        value={occupancy}
                        onChange={(e) => setOccupancy(e.target.value)}
                        className={`${inputClass} pl-11`}
                        required 
                    />
                </div>
            </div>
        </div>

        <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-gray-500 dark:text-gray-400">Included Amenities</label>
            <div className="flex gap-2 mb-3">
                <input 
                    type="text" 
                    placeholder="Add feature (e.g. Balcony)" 
                    value={newAmenity}
                    onChange={(e) => setNewAmenity(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addAmenity())}
                    className={`${inputClass} flex-1`}
                />
                <button 
                    type="button" 
                    onClick={addAmenity}
                    className="p-3 rounded-xl bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 transition-all text-gray-600 dark:text-white"
                >
                    <Plus size={20} />
                </button>
            </div>
            <div className="flex flex-wrap gap-2">
                {amenities.map((amenity, idx) => (
                    <div key={idx} className="flex items-center gap-1 pl-3 pr-1 py-1 rounded-lg bg-accent/10 text-accent-strong border border-accent/20 text-[10px] font-bold uppercase tracking-wider">
                        {amenity}
                        <button type="button" onClick={() => removeAmenity(idx)} className="p-1 hover:bg-accent/20 rounded-md ml-1"><X size={12} /></button>
                    </div>
                ))}
            </div>
        </div>
      </form>
    </ModalShell>
  );
};

export default ManageRoomTypeModal;
