interface KioskRoomTypeApi {
  id: string;
  name: string;
  code: string;
  price: number | string;
  amenities?: string[] | null;
  image_url?: string | null;
}

export interface KioskRoomCard {
  id: string;
  name: string;
  price: number;
  currency: string;
  image: string;
  features: string[];
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const DEFAULT_CURRENCY = import.meta.env.VITE_KIOSK_CURRENCY || 'USD';
const DEFAULT_ROOM_IMAGE =
  import.meta.env.VITE_KIOSK_ROOM_FALLBACK_IMAGE ||
  'https://picsum.photos/400/300?blur=1';

function resolveSlug(slug?: string): string {
  const effectiveSlug = slug || import.meta.env.VITE_HOTEL_SLUG;
  if (!effectiveSlug) {
    throw new Error('Missing hotel slug. Set VITE_HOTEL_SLUG or pass slug to getAvailableRooms().');
  }
  return effectiveSlug;
}

function mapRoomTypeToCard(roomType: KioskRoomTypeApi): KioskRoomCard {
  return {
    id: roomType.id,
    name: roomType.name,
    price: Number(roomType.price),
    currency: DEFAULT_CURRENCY,
    image: roomType.image_url || DEFAULT_ROOM_IMAGE,
    features: roomType.amenities || [roomType.code],
  };
}

export const RoomService = {
  async getAvailableRooms(slug?: string): Promise<KioskRoomCard[]> {
    const tenantSlug = resolveSlug(slug);
    const response = await fetch(`${API_BASE_URL}/api/kiosk/${tenantSlug}/rooms`);
    if (!response.ok) {
      throw new Error(`Failed to fetch rooms (${response.status})`);
    }
    const roomTypes: KioskRoomTypeApi[] = await response.json();
    return roomTypes.map(mapRoomTypeToCard);
  },

  async selectRoom(roomId: string): Promise<{ roomId: string }> {
    // Selection is currently UI-local; booking confirmation happens in booking/payment flows.
    return { roomId };
  },
};
