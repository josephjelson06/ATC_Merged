export interface ApiTenantDTO {
  id: string;
  hotel_name: string;
  address?: string | null;
  plan_id?: string | null;
  owner_user_id?: string | null;
  gstin?: string | null;
  pan?: string | null;
  status?: string | null;
}

export interface ApiPlanDTO {
  id: string;
  name: string;
  price: number;
  period_months?: number;
  max_users?: number;
  max_roles?: number;
  max_rooms?: number;
}

export interface ApiPermissionDTO {
  id: string;
  key: string;
  description?: string | null;
}

export interface ApiRoleDTO {
  id: string;
  name: string;
  description?: string | null;
  status?: string | null;
  color?: string | null;
  permissions?: string[]; 
}

export interface ApiUserDTO {
  id: string;
  email: string;
  name?: string | null;
  phone?: string | null;
  mobile?: string | null;
  role?: ApiRoleDTO | null; // Nested object now
  tenant_id?: string | null;
  status?: string | null;
  last_login?: string | null;
  avatar?: string | null;
  date_added?: string | null;
  is_admin?: boolean;
}

export interface ApiSubscriptionDTO {
  id: string;
  tenant_id: string;
  plan_id?: string;
  start_date?: string | null;
  end_date?: string | null;
  status: string;
}

// Support DTOs
export interface ApiMessageDTO {
  id: string;
  ticket_id: string;
  sender_id?: string | null;
  message: string;
  created_at?: string | null;
  is_internal: boolean;
}

export interface ApiTicketDTO {
  id: string;
  tenant_id: string;
  title: string;
  description?: string | null;
  category?: string | null;
  priority?: string | null;
  status?: string | null;
  created_at?: string | null;
  messages?: ApiMessageDTO[];
}

// --- Kiosk Integration DTOs ---

export interface ApiRoomTypeDTO {
  id: string;
  tenant_id: string;
  name: string;
  code: string;
  price: number;
  amenities: string[] | null;
  image_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApiRoomDTO {
  id: string;
  tenant_id: string;
  room_type_id: string;
  room_number: string;
  floor?: number | null;
  status: string;
  created_at: string;
  updated_at: string;
  room_type_name?: string | null;
}

export interface ApiBookingDTO {
  id: string;
  tenant_id: string;
  guest_id?: string | null;
  guest_name: string;
  check_in_date: string;
  check_out_date: string;
  adults: number;
  children?: number | null;
  nights: number;
  total_price?: number | null;
  session_id?: string | null;
  idempotency_key?: string | null;
  payment_ref?: string | null;
  status: string;
  room_type_id: string;
  created_at: string;
  updated_at: string;
  room_type_name?: string | null;
}

export interface ApiGuestDTO {
  id: string;
  tenant_id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  id_type?: string | null;
  id_number?: string | null;
  id_scan_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApiKioskDTO {
  id: string;
  tenant_id: string;
  name: string;
  api_key: string;
  firmware_version?: string | null;
  status: string;
  last_heartbeat_at?: string | null;
  created_at: string;
  updated_at: string;
}

