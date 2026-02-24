import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import ImpersonationBanner from '../ui/ImpersonationBanner';
import { useTheme } from '../../hooks/useTheme';

interface AppShellProps {
  children: React.ReactNode;
  currentRoute: string;
  viewMode: 'super' | 'hotel';
  isSidebarCollapsed: boolean;
  isMobileMenuOpen: boolean;
  isImpersonating: boolean;
  impersonatedHotel: string | null;
  onNavigate: (route: string) => void;
  onToggleCollapse: () => void;
  onCloseMobile: () => void;
  onOpenMobileMenu: () => void;
  onLogout: () => void;
  permissions?: string[];
  isAdmin?: boolean;
  isOrphan?: boolean;
}

const AppShell: React.FC<AppShellProps> = ({
  children,
  currentRoute,
  viewMode,
  isSidebarCollapsed,
  isMobileMenuOpen,
  isImpersonating,
  impersonatedHotel,
  onNavigate,
  onToggleCollapse,
  onCloseMobile,
  onOpenMobileMenu,
  onLogout,
  permissions = [],
  isAdmin = false,
  isOrphan = false,
}) => {
  const { isDarkMode } = useTheme();

  return (
    <div className={`
      flex h-screen w-screen overflow-hidden font-sans transition-colors duration-500
      ${isDarkMode ? 'bg-theme-dark text-white' : 'bg-theme-light text-slate-900'}
      ${isImpersonating ? 'pt-12' : ''}
    `}>
      {isImpersonating && impersonatedHotel && (
        <ImpersonationBanner 
          hotelName={impersonatedHotel} 
          onExit={onLogout} // For now, exit impersonation by logging out or we can re-add handle
        />
      )}

      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-300"
          onClick={onCloseMobile}
        />
      )}

      <Sidebar 
        currentRoute={currentRoute} 
        onNavigate={onNavigate}
        viewMode={viewMode} 
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={onToggleCollapse}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={onCloseMobile}
        onLogout={onLogout}
        permissions={permissions}
        isOrphan={isOrphan}
      />
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <Header 
          viewMode={viewMode} 
          onNavigate={onNavigate} 
          onOpenMobileMenu={onOpenMobileMenu}
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={onToggleCollapse}
          onLogout={onLogout}
          isAdmin={isAdmin}
        />
        
        <main className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth custom-scrollbar">
          <div className="p-2 md:p-4 pb-10 max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppShell;
