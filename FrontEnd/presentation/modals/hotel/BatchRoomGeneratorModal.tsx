
import React, { useState, useMemo } from 'react';
import { Layers, CheckCircle2, Building2, ArrowRight } from 'lucide-react';
import ModalShell from '../../components/ui/ModalShell';
import GlassInput from '../../components/ui/GlassInput';
import Button from '../../components/ui/Button';

interface BatchRoomGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  buildings: { name: string; id?: string }[];
  categories: { name: string; id?: string }[];
  onGenerate: (config: any) => void;
}

const BatchRoomGeneratorModal: React.FC<BatchRoomGeneratorModalProps> = ({ 
    isOpen, 
    onClose, 
    buildings, 
    categories,
    onGenerate 
}) => {
  const [buildingMode, setBuildingMode] = useState<'EXISTING' | 'NEW'>('EXISTING');
  const [selectedBuilding, setSelectedBuilding] = useState('');
  const [newBuildingName, setNewBuildingName] = useState('');
  
  const [floorStart, setFloorStart] = useState('1');
  const [floorEnd, setFloorEnd] = useState('3');
  
  const [roomsPerFloor, setRoomsPerFloor] = useState('10');
  const [startRoomNumber, setStartRoomNumber] = useState('1');
  
  const [selectedCategory, setSelectedCategory] = useState('');

  const generatedPreview = useMemo(() => {
    const fStart = parseInt(floorStart) || 0;
    const fEnd = parseInt(floorEnd) || 0;
    const rCount = parseInt(roomsPerFloor) || 0;
    const rStart = parseInt(startRoomNumber) || 1;
    
    if (fEnd < fStart || rCount <= 0) return [];

    const rooms = [];
    for (let f = fStart; f <= fEnd; f++) {
        for (let r = 0; r < rCount; r++) {
            const roomNum = rStart + r;
            // Pad room number to 2 digits if needed, but usually 101, 102
            // Pattern: Floor + Pad(Room, 2)
            const roomSuffix = roomNum.toString().padStart(2, '0');
            const id = `${f}${roomSuffix}`;
            rooms.push({
                id,
                floor: f,
                category: selectedCategory,
                building: buildingMode === 'NEW' ? newBuildingName : selectedBuilding
            });
        }
    }
    return rooms;
  }, [floorStart, floorEnd, roomsPerFloor, startRoomNumber, selectedCategory, buildingMode, newBuildingName, selectedBuilding]);

  const handleSubmit = () => {
    const building = buildingMode === 'NEW' ? newBuildingName : selectedBuilding;
    if (!building || !selectedCategory) return;
    
    onGenerate({
        building,
        buildingMode,
        rooms: generatedPreview
    });
    onClose();
  };

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-2xl"
      headerContent={
        <div className="flex items-center gap-3">
           <div className="p-2 rounded-xl bg-blue-600 text-white shadow-lg">
              <Layers size={20} />
           </div>
           <div>
              <h2 className="text-xl font-black dark:text-white tracking-tighter uppercase">Batch Generator</h2>
              <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mt-0.5">Bulk Room Creation Wizard</p>
           </div>
        </div>
      }
      footer={
        <div className="flex justify-between w-full items-center">
            <div className="text-xs font-bold text-gray-500">
                Generating <span className="text-accent-strong">{generatedPreview.length}</span> units
            </div>
            <div className="flex gap-3">
               <Button variant="ghost" onClick={onClose}>Cancel</Button>
               <Button 
                variant="primary" 
                onClick={handleSubmit} 
                disabled={generatedPreview.length === 0 || !selectedCategory || (!selectedBuilding && !newBuildingName)}
                icon={<CheckCircle2 size={16} />}
               >
                Generate Rooms
               </Button>
            </div>
        </div>
      }
    >
      <div className="p-8 space-y-8">
        {/* Building Section */}
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Building Configuration</label>
                <div className="flex bg-black/5 dark:bg-white/5 p-1 rounded-lg">
                    <button 
                        onClick={() => setBuildingMode('EXISTING')}
                        className={`px-3 py-1 text-[9px] font-bold uppercase rounded-md transition-all ${buildingMode === 'EXISTING' ? 'bg-white dark:bg-white/10 shadow text-black dark:text-white' : 'text-gray-500'}`}
                    >
                        Select Existing
                    </button>
                    <button 
                        onClick={() => setBuildingMode('NEW')}
                        className={`px-3 py-1 text-[9px] font-bold uppercase rounded-md transition-all ${buildingMode === 'NEW' ? 'bg-white dark:bg-white/10 shadow text-black dark:text-white' : 'text-gray-500'}`}
                    >
                        Create New
                    </button>
                </div>
            </div>
            
            {buildingMode === 'EXISTING' ? (
                <select 
                    value={selectedBuilding}
                    onChange={(e) => setSelectedBuilding(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl outline-none transition-all duration-200 text-sm font-medium border bg-gray-50 dark:bg-black/20 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:border-accent/50 focus:ring-4 focus:ring-accent/10 appearance-none"
                >
                    <option value="">Select Building...</option>
                    {buildings.map(b => <option key={b.name} value={b.name}>{b.name}</option>)}
                </select>
            ) : (
                <GlassInput 
                    label="New Building Name" 
                    placeholder="e.g. North Tower" 
                    value={newBuildingName}
                    onChange={(e) => setNewBuildingName(e.target.value)}
                />
            )}
        </div>

        <div className="grid grid-cols-2 gap-6">
            <GlassInput 
                label="Create Floors From" 
                type="number" 
                value={floorStart}
                onChange={(e) => setFloorStart(e.target.value)}
            />
            <GlassInput 
                label="To Floor" 
                type="number" 
                value={floorEnd}
                onChange={(e) => setFloorEnd(e.target.value)}
            />
        </div>

        <div className="grid grid-cols-2 gap-6">
            <GlassInput 
                label="Rooms Per Floor" 
                type="number" 
                value={roomsPerFloor}
                onChange={(e) => setRoomsPerFloor(e.target.value)}
            />
            <GlassInput 
                label="Start Numbering at" 
                type="number" 
                value={startRoomNumber}
                onChange={(e) => setStartRoomNumber(e.target.value)}
                placeholder="e.g. 1 (results in 101)"
            />
        </div>

        <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Room Category</label>
            <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-xl outline-none transition-all duration-200 text-sm font-medium border bg-gray-50 dark:bg-black/20 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:border-accent/50 focus:ring-4 focus:ring-accent/10 appearance-none"
            >
                <option value="">Select Category...</option>
                {categories.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
            </select>
        </div>

        {/* Preview Strip */}
        {generatedPreview.length > 0 && (
            <div className="p-4 bg-accent-strong/5 border border-accent-strong/10 rounded-xl space-y-2">
                <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase text-accent-strong tracking-widest">Preview Sequence</span>
                    <span className="text-[10px] font-mono opacity-50">{generatedPreview[0].id} <ArrowRight size={10} className="inline mx-1" /> {generatedPreview[generatedPreview.length-1].id}</span>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                    {generatedPreview.slice(0, 10).map(r => (
                        <div key={r.id} className="px-2 py-1 bg-white dark:bg-white/10 rounded border border-black/5 text-[10px] font-mono font-bold whitespace-nowrap">
                            #{r.id}
                        </div>
                    ))}
                    {generatedPreview.length > 10 && <span className="text-xs text-gray-400 self-center">+{generatedPreview.length - 10} more</span>}
                </div>
            </div>
        )}
      </div>
    </ModalShell>
  );
};

export default BatchRoomGeneratorModal;
