import { buildTenantApiUrl, getTenantHeaders } from "../tenant/tenantContext";
import type { RoomDTO } from "@contracts/api.contract";

export type { RoomDTO };

interface KioskRoomTypeApi {
  id: string;
  name: string;
  code: string;
  price: number | string;
  amenities?: string[] | null;
  image_url?: string | null;
}

export class RoomServiceError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "RoomServiceError";
    this.status = status;
    this.code = code;
  }
}

const DEFAULT_CURRENCY = process.env.NEXT_PUBLIC_KIOSK_CURRENCY || "USD";
const DEFAULT_ROOM_IMAGE =
  process.env.NEXT_PUBLIC_KIOSK_ROOM_FALLBACK_IMAGE ||
  "https://picsum.photos/400/300?blur=1";

function mapRoomTypeToCard(roomType: KioskRoomTypeApi): RoomDTO {
  return {
    id: roomType.id,
    name: roomType.name,
    code: roomType.code,
    price: Number(roomType.price),
    currency: DEFAULT_CURRENCY,
    image: roomType.image_url || DEFAULT_ROOM_IMAGE,
    features: roomType.amenities || [roomType.code],
  };
}

function normalizeRoomPayload(payload: unknown): KioskRoomTypeApi[] {
  if (Array.isArray(payload)) {
    return payload as KioskRoomTypeApi[];
  }

  if (payload && typeof payload === "object" && Array.isArray((payload as any).rooms)) {
    return (payload as any).rooms as KioskRoomTypeApi[];
  }

  return [];
}

export const RoomService = {
  async getAvailableRooms(): Promise<RoomDTO[]> {
    const response = await fetch(buildTenantApiUrl("rooms"), {
      headers: {
        ...getTenantHeaders(),
      },
    });

    if (!response.ok) {
      let errorCode: string | undefined;
      let errorMessage = `Failed to load rooms (${response.status})`;
      try {
        const payload = await response.json();
        errorCode = payload?.error?.code;

        if (payload?.error?.message) {
          errorMessage = payload.error.message;
        } else if (typeof payload?.detail === "string") {
          errorMessage = payload.detail;
        }
      } catch {
        // Ignore JSON parse failures and keep fallback message.
      }
      throw new RoomServiceError(errorMessage, response.status, errorCode);
    }

    const payload = await response.json();
    const roomTypes = normalizeRoomPayload(payload);
    return roomTypes.map(mapRoomTypeToCard);
  },

  async selectRoom(roomId: string): Promise<{ roomId: string }> {
    return { roomId };
  },
};
