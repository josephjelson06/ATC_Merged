
import React, { useState, useEffect } from 'react';
import { Moon, Sun, Shield } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import GlassInput from '../components/ui/GlassInput';
import Button from '../components/ui/Button';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../../application/hooks/useAuth';

interface LoginProps {
  onLogin: (role: 'super' | 'hotel' | string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { login, error: loginError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const user = await login(email, password);
      onLogin(user.role);
    } catch (err) {
      // Error is handled by useAuth
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center transition-colors duration-700 bg-[#f8fafc] dark:bg-black">
      
      {/* Top Right Theme Toggle — only render icon after mount to avoid hydration mismatch */}
      <button 
        onClick={toggleTheme}
        className="absolute top-8 right-8 p-3 rounded-2xl bg-white/80 dark:bg-white/5 border border-black/5 dark:border-white/10 shadow-sm backdrop-blur-md transition-all hover:scale-110 active:scale-95"
      >
        {mounted && (isDarkMode ? <Sun size={20} className="text-gray-300" /> : <Moon size={20} className="text-slate-600" />)}
      </button>

      {/* Main Login Card */}
      <div className="w-full max-w-lg px-6 animate-in fade-in zoom-in-95 duration-700">
        <GlassCard noPadding className="shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] dark:shadow-[0_40px_100px_rgba(0,0,0,0.6)] border-white/40 dark:border-white/10">
          <div className="p-10 md:p-14 space-y-10">
            
            {/* Header Section */}
            <div className="text-center md:text-left space-y-4">
              <div className="inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-accent-muted text-accent dark:bg-accent-muted dark:text-accent">
                HMS Foundation
              </div>
              <div className="space-y-1">
                <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">Welcome back</h1>
                <p className="text-sm font-medium text-slate-500 dark:text-gray-400">Sign in to manage your platform or hotel workspace.</p>
              </div>
            </div>

            {/* Error Message */}
            {loginError && (
              <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 text-red-600 dark:text-red-400 text-sm font-bold flex items-center gap-2 animate-in slide-in-from-top-2">
                <Shield size={16} />
                {loginError.message}
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-8">
              <GlassInput
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
              />
              <GlassInput
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
                required
              />

              <Button
                type="submit"
                variant="action"
                size="lg"
                fullWidth
                className="py-5 shadow-xl"
              >
                Sign in
              </Button>
            </form>
          </div>
        </GlassCard>
      </div>

      {/* Bottom Left Small Logo */}
      <div className="absolute bottom-10 left-10 flex items-center gap-3 opacity-80">
        <div className="w-10 h-10 rounded-full bg-slate-900 dark:bg-white flex items-center justify-center text-white dark:text-black">
          <span className="font-black text-xs">N</span>
        </div>
      </div>
    </div>
  );
};

export default Login;
