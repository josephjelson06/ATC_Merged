"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  PlusCircle,
  DoorOpen,
  Brush,
  Wrench,
  Ban,
  AlertTriangle,
  Play,
  Check,
  ChevronRight,
  Building2,
  Layers,
  ShieldCheck,
  Smartphone,
  Clock,
  Bell,
  Plus,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  Layout,
  IndianRupee,
  Info,
  CheckCircle2,
  AlertCircle,
  Edit3,
  Trash2,
  Users,
  FileOutput,
  Search,
  LayoutGrid,
  Tags,
} from "lucide-react";

import GlassCard from "../../components/ui/GlassCard";
import PageHeader from "../../components/ui/PageHeader";
import Button from "../../components/ui/Button";
import ConfirmationModal from "../../components/ui/ConfirmationModal";

// Modals
import RoomDetailPanel from "../../modals/hotel/RoomDetailPanel";
import AddRoomModal from "../../modals/hotel/AddRoomModal";
import AddBuildingModal from "../../modals/hotel/AddBuildingModal";
import ManageRoomTypeModal from "../../modals/hotel/ManageRoomTypeModal";
import BatchRoomGeneratorModal from "../../modals/hotel/BatchRoomGeneratorModal";

import { useAuth } from "@/application/hooks/useAuth";
import { useRooms } from "@/application/hooks/useRooms";
import type { Room, RoomType } from "@/domain/entities/Room";

type RoomViewMode = "GRID" | "TYPES";

export default function HotelRooms() {
  const { user } = useAuth();
  const tenantId = user?.tenantId ?? "";

  const {
    roomTypes: backendRoomTypes,
    rooms: backendRooms,
    loading,
    error,
    fetchRoomTypes,
    fetchRooms,
    createRoomType,
    deleteRoomType,
    createRoom,
    updateRoomStatus,
  } = useRooms(tenantId);

  useEffect(() => {
    if (tenantId) {
      fetchRoomTypes();
      fetchRooms();
    }
  }, [tenantId, fetchRoomTypes, fetchRooms]);

  // Mock buildings for UI since they don't exist in backend yet
  const [buildings, setBuildings] = useState([
    { id: "b1", name: "Building 01" },
  ]);

  const [viewMode, setViewMode] = useState<RoomViewMode>("GRID");
  const [activeBuilding, setActiveBuilding] = useState("Building 01");
  const [activeFloor, setActiveFloor] = useState<number | "All">("All");
  const [search, setSearch] = useState("");
  const [selectedRoom, setSelectedRoom] = useState<any>(null);

  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);
  const [isAddBuildingOpen, setIsAddBuildingOpen] = useState(false);
  const [isBatchOpen, setIsBatchOpen] = useState(false);

  const [isManageTypeModalOpen, setIsManageTypeModalOpen] = useState(false);
  const [editingType, setEditingType] = useState<any>(null);
  const [confirmDelete, setConfirmDelete] = useState<{
    isOpen: boolean;
    typeId: string;
    displayName: string;
  }>({
    isOpen: false,
    typeId: "",
    displayName: "",
  });

  // Map backend rooms to UI rooms
  const allRooms = useMemo(() => {
    return backendRooms.map((r) => ({
      ...r,
      id: r.roomNumber || r.id,
      floor: r.floor || 1,
      category:
        backendRoomTypes.find((rt) => rt.id === r.roomTypeId)?.name ||
        "Unknown",
      building: "Building 01",
      status: r.status,
      isDND: false,
    }));
  }, [backendRooms, backendRoomTypes]);

  // Map backend types to UI
  const roomTypes = useMemo(() => {
    return backendRoomTypes.map((rt: any) => ({
      ...rt,
      rate: rt.price || 0,
      occupancy: rt.occupancy || 2,
    }));
  }, [backendRoomTypes]);

  const handleSaveRoomType = async (typeData: any) => {
    if (editingType) {
      console.warn("Update type not supported fully in UI hook");
    } else {
      await createRoomType({
        name: typeData.name,
        code: typeData.name.toUpperCase().substring(0, 4),
        price: parseFloat(typeData.rate || typeData.price || "0"),
        amenities:
          typeof typeData.amenities === "string"
            ? typeData.amenities.split(",")
            : typeData.amenities || [],
      } as any);
    }
    setEditingType(null);
  };

  const handleDeleteRoomType = (id: string, name: string) => {
    setConfirmDelete({
      isOpen: true,
      typeId: id,
      displayName: name,
    });
  };

  const executeDeleteRoomType = async () => {
    await deleteRoomType(confirmDelete.typeId);
    setConfirmDelete((prev) => ({ ...prev, isOpen: false }));
  };

  const handleBatchGenerate = async (config: any) => {
    alert("Batch generate not supported in new merged backend yet.");
    setIsBatchOpen(false);
  };

  const filteredRooms = useMemo(() => {
    return allRooms.filter((r) => {
      const matchesBuilding = r.building === activeBuilding;
      const matchesFloor = activeFloor === "All" || r.floor === activeFloor;
      const matchesSearch =
        r.id.toString().includes(search) ||
        r.category.toLowerCase().includes(search.toLowerCase());
      return matchesBuilding && matchesFloor && matchesSearch;
    });
  }, [allRooms, activeBuilding, activeFloor, search]);

  const availableFloors = useMemo(() => {
    const floors = new Set<number>();
    allRooms.forEach((room) => {
      if (room.building === activeBuilding) {
        floors.add(Number(room.floor));
      }
    });
    return ["All", ...Array.from(floors).sort((a, b) => a - b)];
  }, [allRooms, activeBuilding]);

  const ViewSwitcher = () => (
    <div className="flex p-1.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-white/10">
      <button
        onClick={() => setViewMode("GRID")}
        className={`p-2.5 rounded-xl transition-all ${viewMode === "GRID" ? "bg-white dark:bg-white/10 text-accent-strong shadow-md" : "text-gray-400 hover:text-gray-900 dark:hover:text-white"}`}
      >
        <LayoutGrid size={20} />
      </button>
      <button
        onClick={() => setViewMode("TYPES")}
        className={`p-2.5 rounded-xl transition-all ${viewMode === "TYPES" ? "bg-white dark:bg-white/10 text-accent-strong shadow-md" : "text-gray-400 hover:text-gray-900 dark:hover:text-white"}`}
      >
        <Tags size={20} />
      </button>
    </div>
  );

  return (
    <div className="p-4 md:p-8 space-y-8 min-h-screen pb-32 animate-in fade-in duration-500">
      <PageHeader
        title={
          viewMode === "TYPES" ? "Room Types Definition" : "Room Management"
        }
      >
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <div className="hidden lg:flex items-center gap-4">
            <ViewSwitcher />
          </div>
        </div>
      </PageHeader>

      {viewMode === "GRID" && (
        <div className="flex flex-col xl:flex-row gap-6 items-center animate-in fade-in duration-500">
          <div className="flex p-1.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-white/5 w-full xl:w-auto overflow-x-auto no-scrollbar items-center">
            {(buildings.length > 0 ? buildings : [{ name: "Building 01" }]).map(
              (b) => (
                <button
                  key={b.name}
                  onClick={() => setActiveBuilding(b.name)}
                  className={`px-10 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${activeBuilding === b.name ? "bg-gray-900 text-white dark:bg-white dark:text-black shadow-lg" : "text-gray-500 hover:text-gray-900 dark:hover:text-gray-300"}`}
                >
                  {b.name}
                </button>
              ),
            )}
            <button
              onClick={() => setIsAddBuildingOpen(true)}
              className="px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest text-accent-strong hover:bg-white/5 transition-all whitespace-nowrap flex items-center gap-2"
            >
              <Plus size={14} strokeWidth={3} /> Add
            </button>
            <button
              onClick={() => setIsBatchOpen(true)}
              className="px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest text-blue-500 hover:bg-white/5 transition-all whitespace-nowrap flex items-center gap-2"
            >
              <Layers size={14} strokeWidth={3} /> Auto Gen
            </button>
          </div>

          <div className="relative flex-1 w-full group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-accent transition-colors" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full pl-16 pr-6 py-4 border border-white/10 rounded-[1.5rem] bg-white/40 dark:bg-black/40 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-accent/10 sm:text-sm shadow-sm backdrop-blur-md font-bold uppercase tracking-widest"
              placeholder="Search Room Identity..."
            />
          </div>
        </div>
      )}

      {viewMode === "GRID" && (
        <div className="space-y-6 animate-in fade-in duration-500">
          <GlassCard
            className="border border-white/5 bg-black/5 dark:bg-white/[0.01]"
            noPadding
          >
            <div className="px-6 py-4 flex items-center justify-between border-b border-white/5">
              <div className="flex gap-10 overflow-x-auto no-scrollbar">
                {availableFloors.map((f) => (
                  <button
                    key={f}
                    onClick={() => setActiveFloor(f as any)}
                    className={`text-[10px] font-bold uppercase tracking-widest pb-3 border-b-2 transition-all ${activeFloor === f ? "text-accent-strong border-blue-600 dark:text-accent dark:border-accent" : "text-gray-400 border-transparent hover:text-gray-600"}`}
                  >
                    {f === "All" ? "All Floors" : `Floor ${f}`}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-10 gap-5">
                <button
                  onClick={() => setIsAddRoomOpen(true)}
                  className="group flex flex-col items-center justify-center h-32 rounded-2xl border-2 border-dashed border-gray-200 dark:border-white/10 hover:border-blue-500/50 hover:bg-blue-50/50 dark:hover:bg-white/5 transition-all bg-white/40 dark:bg-transparent"
                >
                  <PlusCircle
                    size={28}
                    className="text-gray-300 group-hover:text-accent transition-colors mb-2"
                  />
                  <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400 group-hover:text-accent">
                    + Add Room
                  </span>
                </button>

                {filteredRooms.map((room) => (
                  <div
                    key={room.id}
                    onClick={() => setSelectedRoom(room)}
                    className="flex flex-col items-center justify-between h-32 p-4 rounded-2xl bg-white dark:bg-white/5 border border-white/10 shadow-sm hover:shadow-xl hover:border-blue-500/30 hover:-translate-y-1 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-1">
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest group-hover:text-accent transition-colors">
                        Room no
                      </span>
                      {room.isDND && <Ban size={8} className="text-red-500" />}
                    </div>
                    <span className="text-2xl font-black dark:text-white group-hover:scale-110 transition-transform tracking-tighter">
                      #{room.id}
                    </span>
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-tighter bg-gray-100 dark:bg-white/5 px-2.5 py-1 rounded-lg group-hover:bg-accent-muted group-hover:text-accent transition-colors">
                      {room.category}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {viewMode === "TYPES" && (
        <div className="space-y-6 animate-in fade-in duration-500">
          <GlassCard className="border-white/10" noPadding>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-8">
              <button
                onClick={() => {
                  setEditingType(null);
                  setIsManageTypeModalOpen(true);
                }}
                className="group flex flex-col items-center justify-center p-8 rounded-[2.5rem] border-2 border-dashed border-gray-200 dark:border-white/10 hover:border-blue-500/50 hover:bg-blue-50/50 dark:hover:bg-white/5 transition-all bg-white/40 dark:bg-transparent min-h-[250px]"
              >
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-gray-500 group-hover:text-accent group-hover:scale-110 transition-all mb-4">
                  <Plus size={32} />
                </div>
                <h4 className="text-sm font-black dark:text-white uppercase tracking-widest">
                  New Category
                </h4>
                <p className="text-[10px] font-bold text-gray-500 uppercase mt-2">
                  Define new room type
                </p>
              </button>

              {roomTypes.map((rt) => (
                <div
                  key={rt.id}
                  className="p-6 rounded-[2.5rem] bg-black/5 dark:bg-white/[0.02] border border-white/5 flex flex-col justify-between group hover:border-blue-500/30 transition-all min-h-[250px]"
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-lg font-black dark:text-white uppercase leading-tight mb-1">
                          {rt.name}
                        </h4>
                        <p className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest">
                          {rt.id}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-black/5 dark:bg-white/5 border border-white/5">
                        <CheckCircle2 size={12} className="text-emerald-500" />
                        <span className="text-[9px] font-black text-gray-500 uppercase">
                          Active
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div>
                        <p className="text-[9px] font-black text-gray-500 uppercase mb-1">
                          Base Rate
                        </p>
                        <p className="text-lg font-black text-accent-strong tracking-tighter">
                          ₹{rt.rate}
                        </p>
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-gray-500 uppercase mb-1">
                          Max Guests
                        </p>
                        <p className="text-lg font-black dark:text-white flex items-center gap-1">
                          {rt.occupancy}{" "}
                          <Users size={14} className="text-gray-400" />
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-[9px] font-black text-gray-500 uppercase mb-2">
                        Amenities Included
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {(rt.amenities || []).map((a: string, i: number) => (
                          <span
                            key={i}
                            className="text-[8px] font-bold uppercase text-gray-500 bg-black/5 dark:bg-white/5 px-1.5 py-0.5 rounded border border-white/5"
                          >
                            {a}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 mt-auto border-t border-white/5">
                    <button
                      onClick={() => {
                        setEditingType(rt);
                        setIsManageTypeModalOpen(true);
                      }}
                      className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-all flex items-center justify-center gap-2"
                    >
                      <Edit3 size={14} /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteRoomType(rt.id, rt.name)}
                      className="p-2.5 rounded-xl bg-white/5 hover:bg-red-500/10 text-gray-500 hover:text-red-500 transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      )}

      <RoomDetailPanel
        isOpen={!!selectedRoom}
        room={selectedRoom}
        onClose={() => setSelectedRoom(null)}
      />

      <AddRoomModal
        isOpen={isAddRoomOpen}
        onClose={() => setIsAddRoomOpen(false)}
        onAdd={async (data) => {
          const cat = roomTypes.find((c: any) => c.name === data.category);
          if (!cat) {
            alert("Invalid Category selected");
            return;
          }
          await createRoom({
            roomTypeId: cat.id,
            roomNumber: data.roomNumber,
            floor: parseInt(data.floor),
            status: "available",
          });
        }}
      />

      <AddBuildingModal
        isOpen={isAddBuildingOpen}
        onClose={() => setIsAddBuildingOpen(false)}
        onAdd={async (data) => {
          setBuildings((prev) => [...prev, { id: "new", name: data.name }]);
        }}
      />

      <BatchRoomGeneratorModal
        isOpen={isBatchOpen}
        onClose={() => setIsBatchOpen(false)}
        buildings={buildings as any}
        categories={roomTypes as any}
        onGenerate={handleBatchGenerate}
      />

      <ManageRoomTypeModal
        isOpen={isManageTypeModalOpen}
        onClose={() => setIsManageTypeModalOpen(false)}
        onSave={handleSaveRoomType}
        initialData={editingType}
      />

      <ConfirmationModal
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={executeDeleteRoomType}
        title="Delete Room Category"
        message={`Are you absolutely sure you want to remove the ${confirmDelete.displayName} category? This will dissolve the classification registry for these units.`}
        variant="danger"
        confirmLabel="Remove Category"
      />
    </div>
  );
}
