import React, { useEffect, useState } from "react";
import { buildKioskApiUrl, setTenantContext, type TenantPayload } from "../services/tenantContext";

interface LauncherPageProps {
  onTenantSelected?: () => void;
}

interface TenantLauncherDTO {
  slug: string;
  name: string;
  logo_url?: string | null;
}

export const LauncherPage: React.FC<LauncherPageProps> = ({ onTenantSelected }) => {
  const [tenants, setTenants] = useState<TenantLauncherDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadTenants = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(buildKioskApiUrl("tenants"));
        if (!response.ok) {
          throw new Error(`Failed to load tenants (${response.status})`);
        }
        const payload = await response.json();
        if (!active) {
          return;
        }
        setTenants(Array.isArray(payload) ? payload : []);
      } catch (loadError) {
        console.error("[LauncherPage] Tenant fetch failed:", loadError);
        if (!active) {
          return;
        }
        setError("Unable to load hotels. Please verify backend connectivity.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadTenants();

    return () => {
      active = false;
    };
  }, []);

  const handleTenantClick = (tenant: TenantLauncherDTO) => {
    const tenantPayload: TenantPayload = {
      slug: tenant.slug,
      name: tenant.name,
      logo_url: tenant.logo_url || null,
    };
    setTenantContext(tenant.slug, tenantPayload);
    onTenantSelected?.();
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 text-white flex flex-col">
      <div className="mx-auto w-full max-w-6xl px-6 py-10 md:py-14">
        <header className="mb-10 text-center">
          <p className="text-xs uppercase tracking-[0.28em] text-cyan-300/80 mb-3">Kiosk Launcher</p>
          <h1 className="text-3xl md:text-5xl font-light mb-3">Select Hotel</h1>
          <p className="text-slate-400">Choose a property to start the kiosk session.</p>
        </header>

        {loading ? (
          <div className="rounded-2xl border border-slate-700/70 bg-slate-900/60 p-8 text-center text-slate-300">
            Loading hotels...
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-700/70 bg-red-950/40 p-8 text-center text-red-200">
            {error}
          </div>
        ) : tenants.length === 0 ? (
          <div className="rounded-2xl border border-amber-600/60 bg-amber-950/30 p-8 text-center text-amber-100">
            No onboarded hotels found.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {tenants.map((tenant) => (
              <button
                key={tenant.slug}
                type="button"
                onClick={() => handleTenantClick(tenant)}
                className="group rounded-2xl border border-slate-700/80 bg-slate-900/70 p-6 text-left transition hover:border-cyan-400/60 hover:bg-slate-900"
              >
                <div className="h-14 w-14 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center mb-5 overflow-hidden">
                  {tenant.logo_url ? (
                    <img src={tenant.logo_url} alt={`${tenant.name} logo`} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-xl text-cyan-200">{tenant.name.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <h2 className="text-xl font-medium mb-1 group-hover:text-cyan-200">{tenant.name}</h2>
                <p className="text-sm text-slate-400">{tenant.slug}</p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
