export interface DetachedAuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  module: string;
  description: string;
  ip: string;
  isImpersonated: boolean;
  impersonationDetail?: string;
}

export interface DetachedHotelAuditLog {
  id: string;
  timestamp: string;
  user: string;
  isImpersonated: boolean;
  action: string;
  module: string;
  description: string;
  ip: string;
}

export interface DetachedBillingInvoice {
  id: string;
  guestName: string;
  companyName?: string;
  companyGstin?: string;
  room: string;
  checkOutDate: string;
  grandTotal: number;
  paidAmount: number;
  balance: number;
  status: string;
  bookingRef: string;
  rateAudited?: boolean;
}
export type DetachedBillingInvoiceStatus = 'Draft' | 'Issued' | 'Paid' | 'Void';
export type DetachedInvoiceStatus = DetachedBillingInvoiceStatus;

export interface DetachedBookingBlock {
  id: string;
  guestName: string;
  status: string;
  startDate: string;
  nights: number;
  roomId: string;
  balance: number;
  source: string;
}

export interface DetachedBookingRoom {
  id: string;
  type: string;
  floor: number;
}
export const DETACHED_BOOKING_CELL_WIDTH = 120;
export const DETACHED_BOOKING_ROOM_LIST_WIDTH = 280;
export const DETACHED_BOOKING_DAYS_TO_SHOW = 21;
export const DETACHED_BOOKING_ROW_HEIGHT = 80;

export interface DetachedGuest {
  id: string;
  refId: string;
  name: string;
  mobile: string;
  email: string;
  room: string;
  roomCategory: string;
  checkIn: string;
  checkOut: string;
  kycStatus: string;
  balance: number;
  status: string;
  source: string;
  nationality: string;
  isReturning: boolean;
  visitCount?: number;
  checkedInAt?: string;
}
export type DetachedGuestStatus = 'Reserved' | 'Checked-In' | 'Checked-Out' | 'Cancelled' | 'No-Show';
export type DetachedKYCStatus = 'Verified' | 'Pending' | 'Manual Review' | 'Failed';

export interface DetachedIncident {
  id: string;
  category: string;
  subject: string;
  room: string;
  bookingRef?: string;
  guestName?: string;
  priority: string;
  status: string;
  reportedBy: string;
  assignedTo: string;
  createdAt: string;
  updatedAt: string;
  slaBreached: boolean;
  description: string;
}
export type DetachedIncidentCategory = 'Maintenance' | 'Housekeeping' | 'Guest Complaint' | 'Security' | 'IT' | 'Other';
export type DetachedIncidentPriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type DetachedIncidentStatus = 'Open' | 'In Progress' | 'Resolved' | 'Closed';

export interface DetachedHotelTicket {
  id: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  description: string;
  hotelId?: number;
  hotelName?: string;
  hotel?: string;
  assignedTo?: string;
  lastUpdate?: string;
}
export type DetachedHotelTicketCategory = 'Hardware' | 'Software' | 'Billing' | 'General';
export type DetachedHotelTicketPriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type DetachedHotelTicketStatus = 'Open' | 'In Progress' | 'Waiting on Client' | 'Resolved' | 'Closed' | 'Pending';

export interface DetachedKiosk {
  id: string;
  hotel: string;
  status: string;
  signal: number;
  battery: number;
  lastSeen: string;
  paper: number;
  firmware: string;
  update: boolean;
}

export interface DetachedFirmwareRelease {
  version: string;
  releaseDate: string;
  channel: string;
  activeDevices: number;
  status: string;
  compatibility: string;
}

export interface DetachedTicket {
  id: string;
  subject: string;
  hotel: string;
  status: string;
  priority: string;
  assignedTo: string;
  createdAt?: string;
  createdDate?: string;
  lastUpdate?: string;
  lastUpdated?: string;
  category?: string;
  description?: string;
  slaBreached?: boolean;
  linkedKiosk?: string;
}
export type DetachedTicketStatus = 'Open' | 'In Progress' | 'Resolved' | 'Closed' | 'Pending' | 'Waiting on Client';
export type DetachedTicketPriority = 'Critical' | 'High' | 'Medium' | 'Low';
export type DetachedTicketCategory = 'Hardware' | 'Software' | 'Billing' | 'General';
