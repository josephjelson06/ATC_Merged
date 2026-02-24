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
      case "tenants":   return id ? "tenant-details" : "tenants"; // Renamed from hotels
      case "plans":     return "plans";
      case "subscriptions": return "subscriptions";
      case "users":     return "users-mgmt";
      // Dead routes removed: kiosks, invoices, reports, audit-logs, settings
      case "helpdesk":  return "helpdesk";
      case "profile":   return "profile";
      default:          return "dashboard";
    }
  }

  if (mode === "hotel") {
    switch (section) {
      case "dashboard": return "hotel-dashboard";
      case "users":     return "user-mgmt";
      case "roles":     return "role-mgmt";
      case "billing":   return "billing";
      case "help":      return "help";
      case "profile":   return "hotel-profile";
      // Dead routes removed: guests, rooms, bookings, rates, incidents, reports, audit, settings
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
      case "plans":          return "/super/plans";
      case "subscriptions":  return "/super/subscriptions";
      case "users-mgmt":     return "/super/users";
      case "helpdesk":       return "/super/helpdesk";
      case "profile":        return "/super/profile";
      default:               return "/super/dashboard";
    }
  }

  // viewMode === "hotel"
  switch (route) {
    case "hotel-dashboard": return "/hotel/dashboard";
    case "user-mgmt":       return "/hotel/users";
    case "role-mgmt":       return "/hotel/roles";
    case "billing":         return "/hotel/billing";
    case "help":            return "/hotel/help";
    case "hotel-profile":   return "/hotel/profile";
    default:                return "/hotel/dashboard";
  }
}
