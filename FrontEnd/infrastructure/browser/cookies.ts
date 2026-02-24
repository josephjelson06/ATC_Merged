type SameSite = "lax" | "strict" | "none";

export interface CookieOptions {
  path?: string;
  maxAgeSeconds?: number;
  sameSite?: SameSite;
  secure?: boolean;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const pattern = new RegExp(`(?:^|; )${escapeRegExp(name)}=([^;]*)`);
  const match = document.cookie.match(pattern);
  return match ? decodeURIComponent(match[1]) : null;
}

export function setCookie(name: string, value: string, options: CookieOptions = {}) {
  if (typeof document === "undefined") return;

  const path = options.path ?? "/";
  const sameSite = options.sameSite ?? "lax";
  const secure = options.secure ?? false;

  let cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
  cookie += `; Path=${path}`;
  cookie += `; SameSite=${sameSite}`;
  if (typeof options.maxAgeSeconds === "number") {
    cookie += `; Max-Age=${options.maxAgeSeconds}`;
  }
  if (secure) cookie += "; Secure";

  document.cookie = cookie;
}

export function deleteCookie(name: string, path = "/") {
  // Max-Age=0 immediately expires the cookie.
  setCookie(name, "", { path, maxAgeSeconds: 0 });
}

