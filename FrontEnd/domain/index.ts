// Domain barrel export — import from '@/domain' for all entities and contracts

// Entities
export * from './entities/Tenant';
export * from './entities/User';
export * from './entities/Plan';
export * from './entities/common';
export * from './entities/Subscription';
export * from './entities/Auth';

// Contracts
export type { ITenantRepository } from './contracts/ITenantRepository';
export type { IUserRepository } from './contracts/IUserRepository';
export type { IPlanRepository } from './contracts/IPlanRepository';
export type { IAuthService } from './contracts/IAuthService';
export type { IHotelStaffRepository } from './contracts/IHotelStaffRepository';
export type { ISubscriptionRepository } from './contracts/ISubscriptionRepository';
