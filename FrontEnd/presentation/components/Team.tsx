
import React from 'react';
import { UserPlus, MoreHorizontal, Mail, Shield, User } from 'lucide-react';
import GlassCard from './ui/GlassCard';
import { useTheme } from '../hooks/useTheme';

const teamMembers = [
  { name: 'Aditya Sharma', role: 'Super Admin', email: 'aditya@atc.com', hotel: 'Global', status: 'active' },
  { name: 'Sarah Jenkins', role: 'Account Manager', email: 'sarah.j@atc.com', hotel: 'Royal Orchid', status: 'active' },
  { name: 'Vijay Kumar', role: 'Maintenance', email: 'vijay@lemon-tree.com', hotel: 'Lemon Tree', status: 'offline' },
  { name: 'Elena Petrova', role: 'Viewer', email: 'elena@taj.com', hotel: 'Taj Palace', status: 'active' },
];

const RoleBadge = ({ role }: { role: string }) => {
  const styles = {
    'Super Admin': 'bg-purple-500/10 text-purple-600',
    'Account Manager': 'bg-blue-500/10 text-accent-strong',
    'Maintenance': 'bg-accent-muted text-accent-strong',
    'Viewer': 'bg-gray-500/10 text-gray-600',
  };
  return (
    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${styles[role as keyof typeof styles] || 'bg-gray-100'}`}>
      {role}
    </span>
  );
};

const Team: React.FC = () => {
  const { isDarkMode } = useTheme();

  return (
    <div className="p-8 space-y-8 min-h-screen pb-20 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Team Management</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">Manage user roles and platform access</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-black font-bold text-sm shadow-lg hover:scale-105 transition-all">
          <UserPlus size={18} />
          Invite Member
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {teamMembers.map((member, i) => (
          <GlassCard key={i} className="flex flex-col items-center text-center group">
            <div className="relative mb-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-gray-100 to-gray-200 dark:from-zinc-800 dark:to-zinc-700 flex items-center justify-center text-gray-400">
                <User size={40} />
              </div>
              <div className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-white dark:border-black shadow-sm ${member.status === 'active' ? 'bg-emerald-500' : 'bg-gray-400'}`}></div>
            </div>
            
            <h3 className="font-bold dark:text-white mb-1">{member.name}</h3>
            <p className="text-xs text-gray-500 mb-4">{member.email}</p>
            
            <div className="flex flex-col gap-2 w-full mt-auto">
              <div className="flex justify-between items-center px-4 py-2 rounded-xl bg-black/5 dark:bg-white/5">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Role</span>
                <RoleBadge role={member.role} />
              </div>
              <div className="flex justify-between items-center px-4 py-2 rounded-xl bg-black/5 dark:bg-white/5">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Property</span>
                <span className="text-[10px] font-bold dark:text-white">{member.hotel}</span>
              </div>
            </div>
            
            <button className="mt-6 p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreHorizontal size={20} />
            </button>
          </GlassCard>
        ))}
      </div>

      <GlassCard noPadding className="overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-white/5">
          <h3 className="font-bold text-sm dark:text-white">Recent Logins</h3>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-white/5">
          {[1, 2, 3].map((_, i) => (
            <div key={i} className="px-6 py-4 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10 text-accent"><Mail size={14} /></div>
                <div>
                  <p className="font-bold dark:text-white">sarah.j@atc.com</p>
                  <p className="text-gray-500">Chrome on macOS • Mumbai, IN</p>
                </div>
              </div>
              <span className="text-gray-400 font-mono">15m ago</span>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
};

export default Team;
