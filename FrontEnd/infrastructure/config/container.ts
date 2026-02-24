// Dependency Injection Container
// This is the ONLY file that knows which implementation is active.
// Flip USE_MOCK to false when the backend is ready — zero other changes needed.

// --- Contracts ---
import type { ITenantRepository } from '../../domain/contracts/ITenantRepository';
import type { IUserRepository } from '../../domain/contracts/IUserRepository';
import type { IPlanRepository } from '../../domain/contracts/IPlanRepository';
import type { IAuthService } from '../../domain/contracts/IAuthService';
import type { IHotelStaffRepository } from '../../domain/contracts/IHotelStaffRepository';
import type { ISubscriptionRepository } from '../../domain/contracts/ISubscriptionRepository';
import type { ISupportRepository } from '../../domain/contracts/ISupportRepository';
import type { IRoomRepository } from '../../domain/contracts/IRoomRepository';
import type { IBookingRepository } from '../../domain/contracts/IBookingRepository';
import type { IGuestRepository } from '../../domain/contracts/IGuestRepository';
import type { IKioskRepository } from '../../domain/contracts/IKioskRepository';

// --- API Repositories ---
import { ApiTenantRepository } from '../repositories/TenantRepository';
import { ApiUserRepository } from '../repositories/UserRepository';
import { ApiPlanRepository } from '../repositories/PlanRepository';
import { ApiHotelStaffRepository } from '../repositories/HotelStaffRepository';
import { ApiSubscriptionRepository } from '../repositories/SubscriptionRepository';
import { ApiSupportRepository } from '../repositories/SupportRepository';
import { ApiRoomRepository } from '../repositories/RoomRepository';
import { ApiBookingRepository } from '../repositories/BookingRepository';
import { ApiGuestRepository } from '../repositories/GuestRepository';
import { ApiKioskRepository } from '../repositories/KioskRepository';

import { ApiAuthService } from '../services/ApiAuthService';

export interface Repositories {
  tenants: ITenantRepository;
  users: IUserRepository;
  plans: IPlanRepository;
  hotelStaff: IHotelStaffRepository;
  subscriptions: ISubscriptionRepository;
  support: ISupportRepository;
  rooms: IRoomRepository;
  bookings: IBookingRepository;
  guests: IGuestRepository;
  kiosks: IKioskRepository;
}

function createRepositories(): Repositories {
  return {
    tenants: new ApiTenantRepository(),
    users: new ApiUserRepository(),
    plans: new ApiPlanRepository(),
    hotelStaff: new ApiHotelStaffRepository(),
    subscriptions: new ApiSubscriptionRepository(),
    support: new ApiSupportRepository(),
    rooms: new ApiRoomRepository(),
    bookings: new ApiBookingRepository(),
    guests: new ApiGuestRepository(),
    kiosks: new ApiKioskRepository(),
  };
}

// Singleton instances
export const repositories = createRepositories();

export const authService: IAuthService = new ApiAuthService(); 
