export type ViewMode = "super" | "hotel";

function cleanPathname(pathname: string): string {
  return pathname.split("?")[0].split("#")[0];
}

export function pathnameToLegacyRoute(pathname: string): string {
  const clean = cleanPathname(pathname);
  const parts = clean.split("/").filter(Boolean);
  const [mode, section, id] = parts;

  if (mode === "super") {
    switch (section) {
      case "dashboard": return "dashboard";
      case "hotels":    return id ? "tenant-details" : "tenants";
      case "tenants":   return id ? "tenant-details" : "tenants"; // Renamed from hotels
      case "kiosks":    return id ? "kiosk-details" : "kiosks";
      case "plans":     return "plans";
      case "subscriptions": return "subscriptions";
      case "invoices":  return "invoices";
      case "audit-logs": return "audit-logs";
      case "reports":   return "reports";
      case "settings":  return "settings";
      case "users":     return "users-mgmt";
      case "helpdesk":  return "helpdesk";
      case "profile":   return "profile";
      default:          return "dashboard";
    }
  }

  if (mode === "hotel") {
    switch (section) {
      case "dashboard": return "hotel-dashboard";
      case "rooms":     return "rooms";
      case "bookings":  return "bookings";
      case "guests":    return "guests";
      case "incidents": return "incidents";
      case "rates":     return "rates";
      case "reports":   return "hotel-reports";
      case "settings":  return "hotel-settings";
      case "users":     return "user-mgmt";
      case "roles":     return "role-mgmt";
      case "billing":   return "billing";
      case "help":      return "help";
      case "profile":   return "hotel-profile";
      default:          return "hotel-dashboard";
    }
  }

  return "dashboard";
}

export function legacyRouteToPath(route: string, viewMode: ViewMode): string {
  if (viewMode === "super") {
    switch (route) {
      case "dashboard":      return "/super/dashboard";
      case "tenants":        return "/super/tenants";
      case "tenant-details": return "/super/tenants/1"; // Placeholder ID
      case "kiosks":         return "/super/kiosks";
      case "kiosk-details":  return "/super/kiosks/1"; // Placeholder ID
      case "plans":          return "/super/plans";
      case "subscriptions":  return "/super/subscriptions";
      case "invoices":       return "/super/invoices";
      case "audit-logs":     return "/super/audit-logs";
      case "reports":        return "/super/reports";
      case "settings":       return "/super/settings";
      case "users-mgmt":     return "/super/users";
      case "helpdesk":       return "/super/helpdesk";
      case "profile":        return "/super/profile";
      default:               return "/super/dashboard";
    }
  }

  // viewMode === "hotel"
  switch (route) {
    case "hotel-dashboard": return "/hotel/dashboard";
    case "rooms":           return "/hotel/rooms";
    case "bookings":        return "/hotel/bookings";
    case "guests":          return "/hotel/guests";
    case "incidents":       return "/hotel/incidents";
    case "rates":           return "/hotel/rates";
    case "hotel-reports":   return "/hotel/reports";
    case "hotel-settings":  return "/hotel/settings";
    case "user-mgmt":       return "/hotel/users";
    case "role-mgmt":       return "/hotel/roles";
    case "billing":         return "/hotel/billing";
    case "help":            return "/hotel/help";
    case "hotel-profile":   return "/hotel/profile";
    default:                return "/hotel/dashboard";
  }
}
