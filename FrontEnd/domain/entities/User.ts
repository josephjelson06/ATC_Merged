// User domain entities — pure TypeScript, no framework dependencies

export interface PermissionAction {
  key: string;
  label?: string; // Optional - strictly speaking BE just sends keys now, but UI might map them
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  status?: string;
  color?: string;
  permissions?: string[];
  userCount?: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role?: Role;     // Nested role object
  tenantId?: string;
  status?: string;
  phone?: string;
  mobile?: string;
  lastLogin?: string;
  avatar?: string;
  dateAdded?: string;
  employeeId?: string; // Optional, might be removed if not in BE
  isAdmin?: boolean;
}

// Deprecated but kept if needed for UI mapping compatibility temporarily
export interface StaffMember extends User {
  department?: string;
}
