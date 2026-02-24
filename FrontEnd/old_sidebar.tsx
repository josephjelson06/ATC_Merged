import React from 'react';
import {
  LayoutDashboard,
  Building2,
  MonitorSmartphone,
  FileText,
  CreditCard,
  Receipt,
  BarChart3,
  Users,
  Shield,
  Zap,
  User,
  ClipboardList,
  DoorOpen,
  HelpCircle,
  LifeBuoy,
  PanelLeftClose,
  PanelLeft,
  X,
} from 'lucide-react';

interface SidebarProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  viewMode?: 'super' | 'hotel';
  onSwitchBack?: () => void;
  onSwitchToHotel?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  onLogout?: () => void;
  permissions?: string[];
  isOrphan?: boolean;
}

const SidebarItem = ({
  icon: Icon,
  label,
  active = false,
  onClick,
  collapsed = false,
}: {
  icon: any;
  label: string;
  active?: boolean;
  onClick?: () => void;
  collapsed?: boolean;
}) => {
  return (
    <div
      onClick={onClick}
      title={collapsed ? label : undefined}
      className={`
      flex items-center gap-3 px-4 py-3.5 rounded-[1.25rem] cursor-pointer transition-all duration-300 group relative
      ${
        active
          ? 'bg-white text-accent-strong shadow-[0_10px_20px_-5px_rgba(0,0,0,0.1)] dark:bg-white/10 dark:text-white dark:shadow-none'
          : 'text-gray-500 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-white/5'
      }
      ${collapsed ? 'justify-center px-0 w-12 h-12 mx-auto' : ''}
    `}
    >
      <Icon
        size={collapsed ? 24 : 20}
        strokeWidth={2.5}
        className={`
        ${active ? 'text-accent-strong' : 'group-hover:scale-110 transition-transform text-gray-500 dark:text-gray-400'}
        ${collapsed ? 'shrink-0' : ''}
      `}
      />
      {!collapsed && (
        <span className={`text-[14px] font-bold whitespace-nowrap transition-all duration-300 ${active ? 'text-accent-strong dark:text-white' : ''}`}>
          {label}
        </span>
      )}
      {collapsed && active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-accent-strong rounded-r-full" />}
    </div>
  );
};

const SidebarSection = ({
  title,
  children,
  collapsed = false,
}: {
  title: string;
  children?: React.ReactNode;
  collapsed?: boolean;
}) => (
  <div className={`mb-6 ${collapsed ? '' : 'px-2'}`}>
    {!collapsed ? (
      <h3 className="px-5 text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-4 opacity-70">{title}</h3>
    ) : (
      <div className="h-px bg-black/5 dark:bg-white/5 mx-2 mb-4" />
    )}
    <div className="space-y-1">{children}</div>
  </div>
);

const Sidebar: React.FC<SidebarProps> = ({
  currentRoute,
  onNavigate,
  viewMode = 'super',
  isCollapsed = false,
  onToggleCollapse,
  isMobileOpen = false,
  onCloseMobile,
  onLogout,
  permissions = [],
  isOrphan = false,
}) => {
  const isHotelMode = viewMode === 'hotel';

  const hasPerm = (perm: string) =>
    permissions.includes('*') || permissions.includes('*:*:*') || permissions.includes(perm);

  return (
    <>
      <aside
        className={`
        fixed lg:static inset-y-0 left-0 z-50 flex flex-col h-full sidebar-glass border-r border-black/5 dark:border-white/10 transition-all duration-500 ease-in-out
        ${isCollapsed ? 'w-20' : 'w-72'}
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        lg:rounded-[2.5rem] lg:m-4 lg:h-[calc(100vh-2rem)] overflow-hidden
      `}
      >
        <div className={`h-full flex flex-col scrollbar-none overflow-x-hidden transition-all duration-300 ${isCollapsed ? 'p-4' : 'p-4 md:p-6'}`}>
          <div className={`flex items-center gap-3 mb-10 mt-2 transition-all duration-300 ${isCollapsed ? 'justify-center px-0' : 'px-2'}`}>
            <div className="rounded-xl bg-accent-strong flex items-center justify-center text-white shadow-xl shadow-accent-strong/20 transition-all shrink-0 w-11 h-11">
              <Zap size={24} fill="currentColor" strokeWidth={0} className="relative z-10" />
            </div>
            {!isCollapsed && (
              <span className="text-[20px] font-black text-[#1e293b] dark:text-white tracking-tight whitespace-nowrap animate-in fade-in slide-in-from-left-2 duration-300">
                {isHotelMode ? 'HMS Hotel' : 'ATC Admin'}
              </span>
            )}
          </div>

          <div className="flex-1">
            {isHotelMode ? (
              <>
                {isOrphan ? (
                  <SidebarSection title="Account" collapsed={isCollapsed}>
                    <SidebarItem icon={User} label="My Profile" active={currentRoute === 'hotel-profile'} onClick={() => onNavigate('hotel-profile')} collapsed={isCollapsed} />
                  </SidebarSection>
                ) : (
                  <>
                    <SidebarSection title="Operations" collapsed={isCollapsed}>
                      {hasPerm('hotel:dashboard:read') && <SidebarItem icon={LayoutDashboard} label="Dashboard" active={currentRoute === 'hotel-dashboard'} onClick={() => onNavigate('hotel-dashboard')} collapsed={isCollapsed} />}
                      {hasPerm('hotel:guests:read') && <SidebarItem icon={Users} label="Guest Registry" active={currentRoute === 'guest-registry'} onClick={() => onNavigate('guest-registry')} collapsed={isCollapsed} />}
                      {hasPerm('hotel:rooms:read') && <SidebarItem icon={DoorOpen} label="Room Management" active={currentRoute === 'room-mgmt'} onClick={() => onNavigate('room-mgmt')} collapsed={isCollapsed} />}
                      {hasPerm('hotel:incidents:read') && <SidebarItem icon={ClipboardList} label="Incidents Record" active={currentRoute === 'incidents'} onClick={() => onNavigate('incidents')} collapsed={isCollapsed} />}
                    </SidebarSection>

                    <SidebarSection title="Management" collapsed={isCollapsed}>
                      {hasPerm('hotel:users:read') && <SidebarItem icon={Users} label="Staff Registry" active={currentRoute === 'user-mgmt'} onClick={() => onNavigate('user-mgmt')} collapsed={isCollapsed} />}
                    </SidebarSection>

                    <SidebarSection title="Insights" collapsed={isCollapsed}>
                      <SidebarItem icon={HelpCircle} label="Help & Support" active={currentRoute === 'help'} onClick={() => onNavigate('help')} collapsed={isCollapsed} />
                      {hasPerm('hotel:reports:read') && <SidebarItem icon={BarChart3} label="Reports" active={currentRoute === 'hotel-reports'} onClick={() => onNavigate('hotel-reports')} collapsed={isCollapsed} />}
                    </SidebarSection>
                  </>
                )}
              </>
            ) : (
              <>
                {isOrphan ? (
                  <SidebarSection title="Account" collapsed={isCollapsed}>
                    <SidebarItem icon={User} label="My Profile" active={currentRoute === 'profile'} onClick={() => onNavigate('profile')} collapsed={isCollapsed} />
                  </SidebarSection>
                ) : (
                  <>
                    <SidebarSection title="Main" collapsed={isCollapsed}>
                      <SidebarItem icon={LayoutDashboard} label="Dashboard" active={currentRoute === 'dashboard'} onClick={() => onNavigate('dashboard')} collapsed={isCollapsed} />
                      <SidebarItem icon={Building2} label="Hotels" active={currentRoute === 'hotels' || currentRoute === 'hotel-details'} onClick={() => onNavigate('hotels')} collapsed={isCollapsed} />
                      <SidebarItem icon={MonitorSmartphone} label="Kiosk Fleet" active={currentRoute === 'kiosk-fleet' || currentRoute === 'kiosk-detail'} onClick={() => onNavigate('kiosk-fleet')} collapsed={isCollapsed} />
                    </SidebarSection>

                    <SidebarSection title="Finance" collapsed={isCollapsed}>
                      <SidebarItem icon={FileText} label="Plans" active={currentRoute === 'plans'} onClick={() => onNavigate('plans')} collapsed={isCollapsed} />
                      <SidebarItem icon={CreditCard} label="Subscriptions" active={currentRoute === 'subscriptions'} onClick={() => onNavigate('subscriptions')} collapsed={isCollapsed} />
                      <SidebarItem icon={Receipt} label="Invoices" active={currentRoute === 'invoices'} onClick={() => onNavigate('invoices')} collapsed={isCollapsed} />
                      <SidebarItem icon={BarChart3} label="Reports" active={currentRoute === 'reports'} onClick={() => onNavigate('reports')} collapsed={isCollapsed} />
                    </SidebarSection>

                    <SidebarSection title="Support" collapsed={isCollapsed}>
                      <SidebarItem icon={LifeBuoy} label="Helpdesk" active={currentRoute === 'helpdesk'} onClick={() => onNavigate('helpdesk')} collapsed={isCollapsed} />
                    </SidebarSection>

                    <SidebarSection title="Settings" collapsed={isCollapsed}>
                      <SidebarItem icon={Shield} label="Users Management" active={currentRoute === 'users-mgmt'} onClick={() => onNavigate('users-mgmt')} collapsed={isCollapsed} />
                    </SidebarSection>
                  </>
                )}
              </>
            )}
          </div>
        </div>

        <div className="hidden lg:flex p-4 border-t border-black/5 dark:border-white/10 items-center justify-center shrink-0">
          <button
            onClick={onToggleCollapse}
            className="p-2.5 rounded-xl bg-black/5 dark:bg-white/5 text-gray-400 hover:text-[#1e293b] dark:hover:text-white hover:bg-black/10 transition-all duration-300"
          >
            {isCollapsed ? <PanelLeft size={20} /> : <PanelLeftClose size={20} />}
          </button>
        </div>
      </aside>

      {isMobileOpen && (
        <button
          onClick={onCloseMobile}
          className="fixed top-4 right-4 z-[60] lg:hidden p-3 rounded-2xl bg-white dark:bg-zinc-900 shadow-2xl text-gray-500 dark:text-gray-300"
        >
          <X size={24} />
        </button>
      )}
    </>
  );
};

export default Sidebar;
