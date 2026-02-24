// Booking domain entity

export type BookingStatus = 'DRAFT' | 'CONFIRMED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELLED';

export interface Booking {
  id: string;
  tenantId: string;
  guestId?: string;
  guestName: string;
  checkInDate: string;
  checkOutDate: string;
  adults: number;
  children?: number;
  nights: number;
  totalPrice?: number;
  sessionId?: string;
  idempotencyKey?: string;
  paymentRef?: string;
  status: BookingStatus;
  roomTypeId: string;
  createdAt: string;
  updatedAt: string;
  // Populated on read
  roomTypeName?: string;
}
