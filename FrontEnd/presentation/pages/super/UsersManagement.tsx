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
  ChevronDown,
  ChevronRight,
  Lock,
  Edit2,
  Trash2,
  Plus,
  MoreVertical,
  KeyRound,
  ShieldAlert,
  ShieldCheck,
  Eye,
  ArrowLeft,
  UserX,
  ShieldOff,
} from "lucide-react";
import ConfirmationModal from "../../components/ui/ConfirmationModal";
import GlassCard from "../../components/ui/GlassCard";
import GlassDropdown from "../../components/ui/GlassDropdown";
import AddUserModal from "../../modals/super/AddUserModal";
import EditUserModal from "../../modals/super/EditUserModal";
import CreateRoleModal from "../../modals/super/CreateRoleModal";
import RoleDetailView from "../../modals/super/RoleDetailView";
import PageHeader from "../../components/ui/PageHeader";
import Button from "../../components/ui/Button";
import type { User, Role } from "@/domain/entities/User";
import { useUsers } from "@/application/hooks/useUsers";

type Tab = "USERS" | "ROLES" | "VIEW_ROLE";

const UsersManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>("USERS");
  const {
    users,
    roles,
    loading,
    fetchUsers,
    fetchRoles,
    updateUser,
    deleteUser,
    createRole,
    updateRole,
    deleteRole,
    getAvailablePermissions,
    getRolePermissions,
    setRolePermissions,
  } = useUsers();

  const [selectedRoleForView, setSelectedRoleForView] = useState<Role | null>(
    null,
  );

  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [isCreateRoleOpen, setIsCreateRoleOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [confirmDelete, setConfirmDelete] = useState<{
    isOpen: boolean;
    type: "USER" | "ROLE";
    idOrName: string;
    displayName?: string;
  }>({
    isOpen: false,
    type: "USER",
    idOrName: "",
  });

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, [fetchUsers, fetchRoles]);

  const filteredUsers = useMemo(() => {
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [searchQuery, users]);

  const filteredRoles = useMemo(() => {
    return roles.filter(
      (r) =>
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.description || "").toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [searchQuery, roles]);

  const handleViewRole = (role: Role) => {
    setSelectedRoleForView(role);
    setActiveTab("VIEW_ROLE");
  };

  const handleToggleUserStatus = async (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;
    try {
      await updateUser(userId, {
        status: user.status === "Active" ? "Inactive" : "Active",
      });
    } catch (err) {
      console.error("Failed to toggle user status", err);
    }
  };

  const handleRoleCreated = (roleName: string) => {
    // Refresh roles
    fetchRoles();
  };

  const handleToggleRoleStatus = async (roleId: string) => {
    const role = roles.find(
      (r) => (r as any).id === roleId || r.name === roleId,
    );
    if (!role) return;
    const actualId = (role as any).id || role.name;
    try {
      await updateRole(actualId, {
        status: role.status === "Active" ? "Inactive" : "Active",
      });
    } catch (err) {
      console.error("Failed to toggle role status", err);
    }
  };

  const handleRemoveRole = (roleId: string, roleName: string) => {
    setConfirmDelete({
      isOpen: true,
      type: "ROLE",
      idOrName: roleId,
      displayName: roleName,
    });
  };

  const handleRemoveUser = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    setConfirmDelete({
      isOpen: true,
      type: "USER",
      idOrName: userId,
      displayName: user?.name || userId,
    });
  };

  const executeDelete = async () => {
    try {
      if (confirmDelete.type === "USER") {
        await deleteUser(confirmDelete.idOrName);
      } else {
        await deleteRole(confirmDelete.idOrName);
      }
      setConfirmDelete((prev) => ({ ...prev, isOpen: false }));
    } catch (err) {
      console.error("Deletion failed", err);
    }
  };

  const openEditModal = (user: User) => {
    setUserToEdit(user);
    setIsEditUserOpen(true);
  };

  const handleUpdateUser = async (updatedUser: User) => {
    try {
      await updateUser(updatedUser.id, updatedUser);
      setIsEditUserOpen(false);
      setUserToEdit(null);
    } catch (err) {
      console.error("Failed to update user", err);
    }
  };

  if (activeTab === "VIEW_ROLE" && selectedRoleForView) {
    // Find users with this role name or id
    const roleUsers = users.filter(
      (u) =>
        u.role?.name === selectedRoleForView.name ||
        u.role?.id === selectedRoleForView.id,
    );
    return (
      <RoleDetailView
        role={selectedRoleForView}
        users={roleUsers}
        onBack={() => {
          setSelectedRoleForView(null);
          setActiveTab("ROLES");
        }}
        type="super"
        fetchAvailable={getAvailablePermissions}
        fetchRolePerms={getRolePermissions}
        saveRolePerms={setRolePermissions}
        onUpdateStatus={handleToggleRoleStatus}
        onDelete={handleRemoveRole}
        onEditRole={async (roleId, payload) => {
          await updateRole(roleId, { description: payload.description } as any);
        }}
      />
    );
  }

  return (
    <div className="p-8 space-y-8 min-h-screen pb-24 animate-in fade-in duration-500">
      <PageHeader
        title="Access Control"
        subtitle="Team Governance ÔÇó Platform Security"
      >
        {activeTab === "USERS" ? (
          <Button
            size="md"
            onClick={() => setIsAddUserOpen(true)}
            icon={<UserPlus size={18} strokeWidth={3} />}
          >
            Add New Member
          </Button>
        ) : (
          <Button
            variant="action"
            size="md"
            onClick={() => setIsCreateRoleOpen(true)}
            icon={<Plus size={18} strokeWidth={3} />}
          >
            Add New Role
          </Button>
        )}
      </PageHeader>

      <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
        <div className="flex p-1.5 rounded-[1.5rem] bg-black/5 dark:bg-white/5 border border-white/5 w-fit">
          <button
            onClick={() => setActiveTab("USERS")}
            className={`px-8 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === "USERS" ? "bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-lg" : "text-gray-500 hover:text-white"}`}
          >
            Users Registry
          </button>
          <button
            onClick={() => setActiveTab("ROLES")}
            className={`px-8 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === "ROLES" ? "bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-lg" : "text-gray-500 hover:text-white"}`}
          >
            System Roles
          </button>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-80 group">
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-accent transition-colors"
            />
            <input
              type="text"
              placeholder={`Search ${activeTab === "USERS" ? "Team Member" : "Role"}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/40 dark:bg-black/40 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-xs font-bold dark:text-white focus:outline-none focus:ring-4 focus:ring-accent/10 transition-all backdrop-blur-md shadow-sm"
            />
          </div>
        </div>
      </div>

      {activeTab === "USERS" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {filteredUsers.map((user) => (
            <GlassCard
              key={user.id}
              noPadding
              className="group flex flex-col h-full border-white/10 hover:border-blue-500/30"
            >
              <div className="p-6 pb-0 flex justify-between items-start">
                <div className="relative">
                  <div className="w-16 h-16 rounded-[1.5rem] bg-blue-500/10 flex items-center justify-center shadow-inner overflow-hidden border-2 border-white/40 dark:border-white/5">
                    <img
                      src={`https://ui-avatars.com/api/?name=${user.name}&background=0D8ABC&color=fff&size=128`}
                      alt={user.name}
                    />
                  </div>
                  <div
                    className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-[#050505] shadow-sm ${user.status === "Active" ? "bg-emerald-500" : "bg-gray-400"}`}
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
                      label: "Edit Member",
                      onClick: () => openEditModal(user),
                    },
                    {
                      icon: ShieldAlert,
                      label:
                        user.status === "Active" ? "Deactivate" : "Activate",
                      onClick: () => handleToggleUserStatus(user.id),
                      variant: user.status === "Active" ? "warning" : "primary",
                      hasSeparatorAfter: true,
                    },
                    {
                      icon: Trash2,
                      label: "Remove Identity",
                      onClick: () => handleRemoveUser(user.id),
                      variant: "danger",
                    },
                  ]}
                />
              </div>

              <div className="p-6 space-y-5 flex-1 flex flex-col">
                <div>
                  <h3
                    className={`text-lg font-black leading-none mb-1 uppercase tracking-tighter transition-colors ${user.status === "Inactive" ? "text-gray-400 dark:text-gray-600" : "dark:text-white"}`}
                  >
                    {user.name}
                  </h3>
                  <p className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest">
                    {user.id}
                  </p>
                </div>

                <div className="flex gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest border transition-all ${
                      user.status === "Inactive"
                        ? "bg-gray-500/5 text-gray-500 border-gray-500/10 grayscale"
                        : user.role?.name === "Super Admin"
                          ? "bg-purple-500/10 text-purple-500 border-purple-500/20"
                          : user.role?.name === "Finance"
                            ? "bg-accent-muted text-accent border-accent/20"
                            : "bg-blue-500/10 text-accent border-accent/20"
                    }`}
                  >
                    {user.role?.name || "No Role"}
                  </span>
                </div>

                <div className="pt-4 border-t border-white/5 space-y-3">
                  <div className="flex items-center gap-4">
                    <a
                      href={
                        user.status === "Active"
                          ? `mailto:${user.email}`
                          : undefined
                      }
                      title="Email Work"
                      className={`flex items-center gap-2 group/link ${user.status === "Inactive" ? "cursor-default" : ""}`}
                    >
                      <div
                        className={`p-2 rounded-xl bg-black/5 dark:bg-white/5 text-gray-500 transition-colors ${user.status === "Active" ? "group-hover/link:text-accent" : ""}`}
                      >
                        <Mail size={14} />
                      </div>
                      <span
                        className={`text-[10px] font-bold text-gray-400 truncate max-w-[120px] transition-colors ${user.status === "Active" ? "group-hover/link:text-accent" : "text-gray-500"}`}
                      >
                        {user.email}
                      </span>
                    </a>
                  </div>
                  <div className="flex items-center gap-4">
                    <a
                      href={
                        user.status === "Active"
                          ? `tel:${user.mobile}`
                          : undefined
                      }
                      title="Call Mobile"
                      className={`flex items-center gap-2 group/link ${user.status === "Inactive" ? "cursor-default" : ""}`}
                    >
                      <div
                        className={`p-2 rounded-xl bg-black/5 dark:bg-white/5 text-gray-500 transition-colors ${user.status === "Active" ? "group-hover/link:text-accent" : ""}`}
                      >
                        <Phone size={14} />
                      </div>
                      <span
                        className={`text-[10px] font-bold text-gray-400 transition-colors ${user.status === "Active" ? "group-hover/link:text-accent" : "text-gray-500"}`}
                      >
                        {user.mobile}
                      </span>
                    </a>
                  </div>
                </div>

                <div className="mt-auto pt-6 flex items-center justify-between border-t border-white/5">
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black text-gray-500 uppercase">
                      Last Session
                    </span>
                    <span
                      className={`text-[10px] font-bold transition-colors ${user.status === "Inactive" ? "text-gray-500" : "dark:text-gray-300"}`}
                    >
                      {user.lastLogin || "Never"}
                    </span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[8px] font-black text-gray-500 uppercase">
                      Joined
                    </span>
                    <span
                      className={`text-[10px] font-bold transition-colors ${user.status === "Inactive" ? "text-gray-500" : "dark:text-gray-300"}`}
                    >
                      {user.dateAdded || "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {filteredRoles.map((role) => {
            const isInactive = role.status === "Inactive";
            return (
              <GlassCard
                key={role.id || role.name}
                noPadding
                onClick={() => handleViewRole(role)}
                className={`group border-white/10 hover:border-blue-500/30 h-full flex flex-col relative transition-all duration-300 cursor-pointer ${isInactive ? "grayscale opacity-60" : ""}`}
              >
                {isInactive && (
                  <div className="absolute top-4 right-10 px-3 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-[8px] font-bold uppercase tracking-widest z-10">
                    Deactivated
                  </div>
                )}

                <div className="p-8 pb-0 flex flex-col items-center text-center flex-1">
                  <div
                    className={`w-20 h-20 rounded-[2rem] flex items-center justify-center mb-6 shadow-2xl transition-all relative group-hover:scale-110 duration-500 ${
                      isInactive
                        ? "bg-gray-500/10 text-gray-500"
                        : "bg-accent-strong text-white shadow-accent-strong/40"
                    }`}
                  >
                    <Shield size={36} className="drop-shadow-lg" />
                    <div
                      className={`absolute -bottom-2 -right-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${
                        isInactive
                          ? "bg-gray-100 text-gray-500 border-gray-200"
                          : "bg-white text-accent-strong border-white"
                      }`}
                    >
                      {role.userCount || 0}
                    </div>
                  </div>

                  <h3
                    className={`text-2xl font-black tracking-tighter uppercase mb-3 truncate w-full transition-colors ${isInactive ? "text-gray-400 dark:text-zinc-600" : "dark:text-white"}`}
                    title={role.name}
                  >
                    {role.name}
                  </h3>

                  <p
                    className={`text-xs font-bold uppercase tracking-widest mb-8 line-clamp-2 px-4 transition-colors ${isInactive ? "text-gray-400 dark:text-zinc-700" : "text-gray-500"}`}
                  >
                    {role.description || "No description provided"}
                  </p>

                  <div className="mt-auto w-full pt-6 border-t border-white/5 flex items-center justify-between px-2">
                    <span
                      className={`text-[10px] font-black uppercase tracking-widest ${isInactive ? "text-red-400" : "text-emerald-400"}`}
                    >
                      {role.status}
                    </span>
                    <span className="text-[10px] font-bold text-gray-500 uppercase">
                      {(role.userCount || 0) === 1
                        ? "1 Member"
                        : `${role.userCount || 0} Members`}
                    </span>
                  </div>
                </div>

                <div className="p-10 pt-0 mt-auto">
                  <div className="flex items-center justify-end">
                    <GlassDropdown
                      trigger={
                        <button
                          className={`p-4 rounded-2xl bg-black/5 dark:bg-white/5 text-gray-500 transition-all shadow-sm ${!isInactive ? "hover:text-white hover:bg-accent-strong" : ""}`}
                        >
                          <MoreVertical size={20} />
                        </button>
                      }
                      items={[
                        {
                          icon: Eye,
                          label: "View Details",
                          onClick: () => handleViewRole(role),
                        },
                        {
                          icon: Edit2,
                          label: "Edit Role Name",
                          onClick: () => handleViewRole(role),
                        },
                        {
                          icon: isInactive ? ShieldCheck : ShieldAlert,
                          label: isInactive
                            ? "Activate Role"
                            : "Deactivate Role",
                          onClick: () =>
                            handleToggleRoleStatus(
                              (role as any).id || role.name,
                            ),
                          variant: isInactive ? "primary" : "warning",
                          hasSeparatorAfter: true,
                        },
                        {
                          icon: Trash2,
                          label: "Delete Role",
                          onClick: () =>
                            handleRemoveRole(
                              (role as any).id || role.name,
                              role.name,
                            ),
                          variant: "danger",
                        },
                      ]}
                    />
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}

      <AddUserModal
        isOpen={isAddUserOpen}
        onClose={() => setIsAddUserOpen(false)}
        roles={roles}
      />
      {userToEdit && (
        <EditUserModal
          isOpen={isEditUserOpen}
          user={userToEdit}
          onClose={() => setIsEditUserOpen(false)}
          onUpdate={handleUpdateUser}
        />
      )}
      <CreateRoleModal
        isOpen={isCreateRoleOpen}
        onClose={() => setIsCreateRoleOpen(false)}
        onCreated={handleRoleCreated}
      />

      <ConfirmationModal
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={executeDelete}
        title={
          confirmDelete.type === "USER" ? "Remove Identity" : "Dissolve Role"
        }
        message={
          confirmDelete.type === "USER"
            ? `This will permanently sever all access for ${confirmDelete.displayName}. This action is absolute and cannot be undone.`
            : `Are you certain you want to dissolve the ${confirmDelete.displayName} role? This may impact multiple identity access patterns.`
        }
        confirmLabel={
          confirmDelete.type === "USER" ? "Remove Permanently" : "Dissolve Role"
        }
        variant="danger"
        icon={confirmDelete.type === "USER" ? UserX : ShieldOff}
      />
    </div>
  );
};

export default UsersManagement;
