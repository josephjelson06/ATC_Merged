"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Users,
  Shield,
  Search,
  UserPlus,
  MoreHorizontal,
  Mail,
  Phone,
  Edit2,
  Trash2,
  ShieldAlert,
  MoreVertical,
  Eye,
  Loader2,
} from "lucide-react";
import GlassCard from "../../components/ui/GlassCard";
import GlassDropdown from "../../components/ui/GlassDropdown";
import Pagination from "../../components/ui/Pagination";
import PageHeader from "../../components/ui/PageHeader";
import Button from "../../components/ui/Button";
import AddHotelUserModal from "../../modals/hotel/AddHotelUserModal";
import CreateHotelRoleModal from "../../modals/hotel/CreateHotelRoleModal";
import RoleDetailView from "../../modals/super/RoleDetailView";
import type {
  User as StaffMember,
  Role as HotelRole,
} from "@/domain/entities/User";
import { useHotelStaff } from "@/application/hooks/useHotelStaff";
import { useAuth } from "@/application/hooks/useAuth";

type Tab = "STAFF" | "ROLES" | "VIEW_ROLE";

interface HotelUsersProps {
  initialTab?: Tab;
}

export default function HotelUsers({ initialTab = "STAFF" }: HotelUsersProps) {
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const { user } = useAuth();
  const tenantId = user?.tenantId;

  const {
    staff: allStaff,
    roles: allRoles,
    loading,
    updateStaff,
    deleteStaff,
    updateRole,
    deleteRole,
    getAvailablePermissions,
    getRolePermissions,
    setRolePermissions,
    fetchStaff,
    fetchRoles,
  } = useHotelStaff(tenantId || "");

  const [selectedRoleForView, setSelectedRoleForView] =
    useState<HotelRole | null>(null);
  const [selectedStaffForEdit, setSelectedStaffForEdit] =
    useState<StaffMember | null>(null);
  const [search, setSearch] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    if (tenantId) {
      fetchStaff();
      fetchRoles();
    }
  }, [tenantId, fetchStaff, fetchRoles]);

  const filteredStaff = useMemo(() => {
    return allStaff.filter(
      (s) =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase()) ||
        (s.mobile && s.mobile.includes(search)) ||
        (s.phone && s.phone.includes(search)),
    );
  }, [allStaff, search]);

  const filteredRoles = useMemo(() => {
    return allRoles.filter(
      (r) =>
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        (r.description &&
          r.description.toLowerCase().includes(search.toLowerCase())),
    );
  }, [allRoles, search]);

  const currentDataLength =
    activeTab === "STAFF" ? filteredStaff.length : filteredRoles.length;
  const totalPages = Math.max(1, Math.ceil(currentDataLength / itemsPerPage));

  const handleViewRole = (role: HotelRole) => {
    setSelectedRoleForView(role);
    setActiveTab("VIEW_ROLE");
  };

  const handleEditStaff = (staff: StaffMember) => {
    setSelectedStaffForEdit(staff);
    setIsAddModalOpen(true);
  };

  const handleSuspendStaff = async (staff: StaffMember) => {
    if (
      confirm(
        `Are you sure you want to ${staff.status === "Active" ? "suspend" : "activate"} ${staff.name}?`,
      )
    ) {
      try {
        await updateStaff(staff.id, {
          status: staff.status === "Active" ? "Inactive" : "Active",
        });
      } catch (err) {
        alert("Failed to update staff status");
      }
    }
  };

  const handleDeleteStaff = async (staff: StaffMember) => {
    if (
      confirm(
        `CRITICAL: Are you sure you want to delete ${staff.name}? This action is irreversible.`,
      )
    ) {
      try {
        await deleteStaff(staff.id);
      } catch (err) {
        alert("Failed to delete staff member");
      }
    }
  };

  const handleDeleteRole = async (role: HotelRole) => {
    if (
      confirm(
        `CRITICAL: Are you sure you want to delete the role "${role.name}"? All assigned staff will lose access.`,
      )
    ) {
      try {
        await deleteRole(role.id);
      } catch (err) {
        alert("Failed to delete role");
      }
    }
  };

  const handlePrimaryAction = () => {
    if (activeTab === "STAFF") {
      setSelectedStaffForEdit(null);
      setIsAddModalOpen(true);
    } else {
      setIsRoleModalOpen(true);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [search, activeTab, itemsPerPage]);

  const paginatedStaff = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredStaff.slice(start, start + itemsPerPage);
  }, [filteredStaff, currentPage, itemsPerPage]);

  const paginatedRoles = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredRoles.slice(start, start + itemsPerPage);
  }, [filteredRoles, currentPage, itemsPerPage]);

  if (!tenantId) {
    return (
      <div className="p-8 text-red-500 font-bold">
        Error: No Property Context
      </div>
    );
  }

  if (activeTab === "VIEW_ROLE" && selectedRoleForView) {
    const roleStaff = allStaff.filter(
      (s) =>
        s.role?.id === selectedRoleForView.id ||
        s.role?.name === selectedRoleForView.name,
    );
    return (
      <div className="p-4 md:p-8">
        <RoleDetailView
          role={selectedRoleForView as any}
          users={roleStaff}
          onBack={() => {
            setActiveTab("ROLES");
            fetchRoles(); // Reload in case permission changes affect user counts/status
          }}
          type="hotel"
          fetchAvailable={getAvailablePermissions as any}
          fetchRolePerms={getRolePermissions}
          saveRolePerms={setRolePermissions as any}
          onUpdateStatus={async () => {
            await updateRole(selectedRoleForView.id, {
              status:
                selectedRoleForView.status === "Active" ? "Inactive" : "Active",
            });
            fetchRoles();
          }}
          onDelete={async () => {
            await deleteRole(selectedRoleForView.id);
            setActiveTab("ROLES");
            fetchRoles();
          }}
          onEditRole={async (roleId, payload) => {
            const targetRole = allRoles.find(
              (r) => r.id === roleId || r.name === roleId,
            );
            if (!targetRole) {
              throw new Error("Role not found");
            }
            await updateRole(targetRole.id, {
              description: payload.description,
            });
            await fetchRoles();
          }}
        />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-700 max-w-[1600px] mx-auto min-h-full">
      {/* Header with Integrated Action */}
      <PageHeader
        title="Team Sovereignty"
        subtitle="Staff Access & RBAC Configuration"
      >
        <Button
          variant="custom"
          className="bg-[#f97316] text-white shadow-xl shadow-orange-500/30 hover:scale-[1.02] active:scale-95 px-8"
          onClick={handlePrimaryAction}
          icon={
            activeTab === "STAFF" ? (
              <UserPlus size={20} strokeWidth={3} />
            ) : (
              <Shield size={20} strokeWidth={3} />
            )
          }
        >
          {activeTab === "STAFF" ? "Add Member" : "Add New Role"}
        </Button>
      </PageHeader>

      {/* Navigation & Search Area */}
      <div className="flex flex-col md:flex-row gap-6 items-center justify-between pt-2">
        <div className="flex p-1.5 rounded-[1.5rem] bg-black/5 dark:bg-white/5 border border-white/5 shadow-inner backdrop-blur-md">
          <button
            onClick={() => setActiveTab("STAFF")}
            className={`px-10 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${activeTab === "STAFF" ? "bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-xl" : "text-gray-500 hover:text-white"}`}
          >
            Staff Registry
          </button>
          <button
            onClick={() => setActiveTab("ROLES")}
            className={`px-10 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${activeTab === "ROLES" ? "bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-xl" : "text-gray-500 hover:text-white"}`}
          >
            Access Roles
          </button>
        </div>

        <div className="relative w-full md:w-96 group">
          <Search
            size={18}
            className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-accent transition-colors"
          />
          <input
            type="text"
            placeholder={`Search ${activeTab === "STAFF" ? "Staff Identity" : "Role Type"}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white dark:bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-sm font-bold dark:text-white focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all shadow-sm placeholder:text-gray-500/50"
          />
        </div>
      </div>

      <div className="relative z-10">
        {loading &&
        (activeTab === "STAFF"
          ? allStaff.length === 0
          : allRoles.length === 0) ? (
          <div className="py-32 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="h-10 w-10 animate-spin text-accent" />
            <p className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em]">
              Synchronizing Registry...
            </p>
          </div>
        ) : activeTab === "STAFF" ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
              {paginatedStaff.map((s) => (
                <GlassCard
                  key={s.id}
                  noPadding
                  className="group flex flex-col h-full border-white/10 hover:border-blue-500/30 overflow-hidden min-w-0"
                >
                  <div className="p-6 pb-0 flex justify-between items-start">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-[1.5rem] bg-accent-muted flex items-center justify-center shadow-inner overflow-hidden border-2 border-white/40 dark:border-white/5">
                        <img
                          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(s.name)}&background=f97316&color=fff&size=128`}
                          alt={s.name}
                        />
                      </div>
                      <div
                        className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-[#050505] shadow-sm ${s.status === "Active" ? "bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.8)]" : "bg-gray-400"}`}
                        title={s.status}
                      ></div>
                    </div>
                    <GlassDropdown
                      trigger={
                        <button className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 text-gray-500 transition-all">
                          <MoreHorizontal size={20} />
                        </button>
                      }
                      items={[
                        {
                          icon: Edit2,
                          label: "Edit Profile",
                          onClick: () => handleEditStaff(s),
                        },
                        {
                          icon: ShieldAlert,
                          label:
                            s.status === "Active"
                              ? "Suspend Account"
                              : "Activate Account",
                          onClick: () => handleSuspendStaff(s),
                          variant: "warning",
                          hasSeparatorAfter: true,
                        },
                        {
                          icon: Trash2,
                          label: "Delete Record",
                          onClick: () => handleDeleteStaff(s),
                          variant: "danger",
                        },
                      ]}
                    />
                  </div>

                  <div className="p-6 space-y-5 flex-1 flex flex-col min-w-0">
                    <div className="min-w-0">
                      <h3
                        className="text-lg font-black dark:text-white leading-tight mb-1 group-hover:text-accent-strong transition-colors uppercase tracking-tighter truncate w-full"
                        title={s.name}
                      >
                        {s.name}
                      </h3>
                      <p className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest">
                        {s.id.split("-")[0]}
                      </p>
                    </div>

                    <div className="flex gap-2 min-w-0">
                      <span
                        className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest border truncate max-w-full ${
                          s.role?.name === "General Manager"
                            ? "bg-purple-500/10 text-purple-500 border-purple-500/20"
                            : s.role?.name === "Night Auditor"
                              ? "bg-blue-500/10 text-accent border-accent/20"
                              : "bg-gray-500/10 text-gray-500 border-gray-500/20"
                        }`}
                      >
                        {s.role?.name || "No Role"}
                      </span>
                    </div>

                    <div className="pt-4 border-t border-white/5 space-y-4 min-w-0">
                      <div className="space-y-3">
                        <a
                          href={`mailto:${s.email}`}
                          title={s.email}
                          className="flex items-center gap-3 group/link min-w-0"
                        >
                          <div className="p-2 rounded-xl bg-black/5 dark:bg-white/5 text-gray-500 group-hover/link:text-accent transition-colors shrink-0">
                            <Mail size={14} />
                          </div>
                          <span className="text-[10px] font-bold text-gray-400 group-hover/link:text-accent transition-colors truncate flex-1">
                            {s.email}
                          </span>
                        </a>
                        <a
                          href={`tel:${s.mobile || s.phone}`}
                          className="flex items-center gap-3 group/link min-w-0"
                        >
                          <div className="p-2 rounded-xl bg-black/5 dark:bg-white/5 text-gray-500 group-hover/link:text-accent transition-colors shrink-0">
                            <Phone size={14} />
                          </div>
                          <span className="text-[10px] font-bold text-gray-400 group-hover/link:text-accent transition-colors truncate flex-1">
                            {s.mobile || s.phone || "N/A"}
                          </span>
                        </a>
                      </div>
                    </div>

                    <div className="mt-auto pt-6 flex items-center justify-between border-t border-white/5">
                      <div className="flex flex-col min-w-0">
                        <span className="text-[8px] font-black text-gray-500 uppercase">
                          Last Session
                        </span>
                        <span
                          className={`text-[10px] font-bold truncate ${s.lastLogin ? "dark:text-gray-300" : "text-red-500"}`}
                        >
                          {s.lastLogin || "Never"}
                        </span>
                      </div>
                      <div className="flex flex-col items-end min-w-0">
                        <span className="text-[8px] font-black text-gray-500 uppercase">
                          Registered
                        </span>
                        <span
                          className={`text-[10px] font-bold dark:text-gray-300 truncate`}
                        >
                          {s.dateAdded || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {paginatedRoles.map((roleItem) => (
                <GlassCard
                  key={roleItem.id}
                  noPadding
                  onClick={() => handleViewRole(roleItem)}
                  className="group border-white/10 hover:border-accent/30 h-full flex flex-col cursor-pointer"
                >
                  <div className="p-8 pb-0">
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-xl ${
                        roleItem.color === "purple"
                          ? "bg-purple-600/10 text-purple-600"
                          : roleItem.color === "blue"
                            ? "bg-accent-strong/10 text-accent-strong"
                            : roleItem.color === "emerald"
                              ? "bg-emerald-600/10 text-emerald-600"
                              : "bg-orange-600/10 text-accent-strong"
                      }`}
                    >
                      <Shield size={28} />
                    </div>
                    <h3
                      className="text-xl font-black dark:text-white tracking-tighter uppercase mb-2 truncate"
                      title={roleItem.name}
                    >
                      {roleItem.name}
                    </h3>
                    <p className="text-xs font-medium text-gray-500 leading-relaxed mb-6 h-12 overflow-hidden">
                      {roleItem.description || "No description provided"}
                    </p>
                  </div>

                  <div className="p-8 pt-0 mt-auto">
                    <div className="flex justify-end">
                      <GlassDropdown
                        trigger={
                          <button
                            onClick={(e) => e.stopPropagation()}
                            className="p-3 rounded-xl bg-black/5 dark:bg-white/5 text-gray-500 hover:text-white transition-all"
                          >
                            <MoreVertical size={18} />
                          </button>
                        }
                        items={[
                          {
                            icon: Eye,
                            label: "View Details",
                            onClick: () => handleViewRole(roleItem),
                          },
                          {
                            icon: Trash2,
                            label: "Delete Role",
                            onClick: () => handleDeleteRole(roleItem),
                            variant: "danger",
                          },
                        ]}
                      />
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        )}
      </div>

      {!loading &&
        (activeTab === "STAFF" ? filteredStaff : filteredRoles).length ===
          0 && (
          <div className="py-24 flex flex-col items-center justify-center text-center opacity-40">
            <Users size={64} className="text-gray-500 mb-6" />
            <h3 className="text-2xl font-black dark:text-white uppercase tracking-tighter">
              No Registry Matches
            </h3>
            <p className="text-sm font-bold text-gray-500 uppercase mt-2">
              Adjust your filters or try a different search query.
            </p>
          </div>
        )}

      {!loading && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={setItemsPerPage}
          totalItems={
            activeTab === "STAFF" ? filteredStaff.length : filteredRoles.length
          }
        />
      )}

      <AddHotelUserModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setSelectedStaffForEdit(null);
          fetchStaff();
        }}
        staffMember={selectedStaffForEdit}
        roles={allRoles}
        tenantId={tenantId}
      />

      <CreateHotelRoleModal
        isOpen={isRoleModalOpen}
        onClose={() => {
          setIsRoleModalOpen(false);
          fetchRoles();
        }}
        onCreated={(roleName) => {
          fetchRoles();
        }}
        tenantId={tenantId}
      />
    </div>
  );
}
