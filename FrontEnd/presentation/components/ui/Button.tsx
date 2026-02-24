
import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'action' | 'custom';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  fullWidth?: boolean;
}

const baseClasses =
  'inline-flex items-center justify-center gap-2 font-black uppercase tracking-widest transition-all active:scale-95 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none whitespace-nowrap';

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-gray-900 dark:bg-white text-white dark:text-black shadow-xl hover:scale-[1.02] hover:shadow-2xl',
  action:
    'bg-accent text-white shadow-xl shadow-accent-strong/20 hover:bg-accent-strong hover:scale-[1.02]',
  secondary:
    'bg-black/5 dark:bg-white/5 text-gray-700 dark:text-gray-300 border border-white/10 hover:bg-black/10 dark:hover:bg-white/10',
  danger:
    'bg-red-600 text-white shadow-xl shadow-red-900/20 hover:bg-red-700 hover:scale-[1.02]',
  ghost:
    'text-gray-500 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white',
  custom: '',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 rounded-xl text-[9px]',
  md: 'px-8 py-3 rounded-2xl text-[10px]',
  lg: 'px-10 py-4 rounded-2xl text-xs',
};

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  fullWidth = false,
  className = '',
  children,
  ...props
}) => {
  return (
    <button
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {icon}
      {children}
      {iconRight}
    </button>
  );
};

export default React.memo(Button);
