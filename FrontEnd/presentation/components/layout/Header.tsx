
import React from 'react';
import { Search, Bell, Moon, Sun, ChevronDown, User, LogOut, Settings, Menu } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import GlassDropdown, { type DropdownItem } from '../ui/GlassDropdown';

interface HeaderProps {
  viewMode?: 'super' | 'hotel';
  onNavigate?: (route: string) => void;
  onOpenMobileMenu?: () => void;
  isSidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
  onLogout?: () => void;
  isAdmin?: boolean;
}

const Header: React.FC<HeaderProps> = ({ 
  viewMode = 'super', 
  onNavigate, 
  onOpenMobileMenu,
  isSidebarCollapsed,
  onToggleSidebar,
  onLogout,
  isAdmin = false,
}) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const dropdownItems: DropdownItem[] = [
    {
      icon: User,
      label: 'My Profile',
      onClick: () => onNavigate?.(viewMode === 'hotel' ? 'hotel-profile' : 'profile'),
      hasSeparatorAfter: !isAdmin,
    },
    ...(isAdmin
      ? [
          {
            icon: Settings,
            label: 'Settings',
            onClick: () => onNavigate?.(viewMode === 'hotel' ? 'hotel-settings' : 'platform-settings'),
            hasSeparatorAfter: true,
          } as DropdownItem,
        ]
      : []),
    { icon: LogOut, label: 'Log Out', variant: 'danger', onClick: onLogout },
  ];

  return (
    <header className="z-30 flex items-center justify-between px-4 md:px-8 py-4 md:py-6 shrink-0 bg-transparent border-b border-white/5">
      
      {/* Left: Mobile Menu & Desktop Toggle */}
      <div className="flex items-center gap-4">
        <button 
          onClick={onOpenMobileMenu}
          className="lg:hidden p-3 rounded-xl text-gray-500 dark:text-gray-300 bg-white/80 dark:bg-black/40 border border-white/60 dark:border-white/5 shadow-sm backdrop-blur-md"
        >
          <Menu size={22} />
        </button>


        {/* Search Bar - hidden on small mobile */}
        <div className="relative w-64 xl:w-96 hidden md:block group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400 group-focus-within:text-accent transition-colors" />
          </div>
          <input
            type="text"
            className="block w-full pl-11 pr-4 py-2.5 border border-white/60 rounded-2xl leading-5 bg-white/60 dark:bg-black/40 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-accent/10 sm:text-sm transition-all shadow-sm backdrop-blur-md font-medium"
            placeholder="Search command..."
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 md:gap-5">
        

        <div className="flex items-center gap-1.5 md:gap-3">
          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme}
            className="p-2.5 md:p-3 rounded-xl text-gray-500 dark:text-gray-300 bg-white/80 dark:bg-black/40 border border-white/60 dark:border-white/5 hover:shadow-md transition-all duration-300 backdrop-blur-md"
          >
            {isDarkMode ? <Sun size={18} className="md:w-5 md:h-5" /> : <Moon size={18} className="md:w-5 md:h-5" />}
          </button>

          {/* Notifications */}
          <button className="relative p-2.5 md:p-3 rounded-xl text-gray-500 dark:text-gray-300 bg-white/80 dark:bg-black/40 border border-white/60 dark:border-white/5 hover:shadow-md transition-all duration-300 backdrop-blur-md">
            <Bell size={18} className="md:w-5 md:h-5" />
            <span className="absolute top-2.5 right-2.5 md:right-3 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-black" />
          </button>
        </div>

        {/* User Profile */}
        <GlassDropdown 
          trigger={
            <div className="flex items-center gap-2 md:gap-3 pl-1 md:pl-2 cursor-pointer group">
                <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden border-2 shadow-sm transition-all group-hover:scale-105 ${viewMode === 'hotel' ? 'border-accent' : 'border-white dark:border-gray-600'}`}>
                     <img src={viewMode === 'hotel' ? "https://ui-avatars.com/api/?name=Riya+Mehta&background=f97316&color=fff" : "https://ui-avatars.com/api/?name=Vikram+Patel&background=0D8ABC&color=fff"} alt="Profile" />
                </div>
                <div className="hidden lg:block">
                  <p className="text-xs font-black dark:text-white leading-tight uppercase tracking-tighter">
                    {viewMode === 'hotel' ? 'RM' : 'VP'}
                  </p>
                </div>
                <ChevronDown size={14} className="text-gray-400 hidden sm:block" />
            </div>
          }
          items={dropdownItems}
        />

      </div>
    </header>
  );
};

export default Header;
