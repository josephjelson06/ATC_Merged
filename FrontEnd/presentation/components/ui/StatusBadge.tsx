
import React from 'react';

type StatusVariant = 'success' | 'danger' | 'warning' | 'neutral' | 'info';

interface StatusBadgeProps {
  label: string;
  variant?: StatusVariant;
  /** Show a glowing dot indicator */
  dot?: boolean;
  className?: string;
}

const variantStyles: Record<StatusVariant, { wrapper: string; dot: string }> = {
  success: {
    wrapper: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    dot: 'bg-emerald-500',
  },
  danger: {
    wrapper: 'text-red-500 bg-red-500/10 border-red-500/20',
    dot: 'bg-red-500',
  },
  warning: {
    wrapper: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    dot: 'bg-amber-500',
  },
  neutral: {
    wrapper: 'text-gray-400 bg-gray-500/10 border-gray-500/20',
    dot: 'bg-gray-400',
  },
  info: {
    wrapper: 'text-accent bg-blue-500/10 border-accent/20',
    dot: 'bg-accent',
  },
};

/** Map common status strings to semantic variants */
export const statusToVariant = (status: string): StatusVariant => {
  const map: Record<string, StatusVariant> = {
    Active: 'success',
    Online: 'success',
    Verified: 'success',
    Paid: 'success',
    Resolved: 'success',
    'Checked-In': 'success',
    Suspended: 'danger',
    Offline: 'danger',
    Overdue: 'danger',
    Critical: 'danger',
    Failed: 'danger',
    'Past Due': 'warning',
    Pending: 'warning',
    Onboarding: 'neutral',
    Draft: 'neutral',
    Open: 'info',
    'In Progress': 'info',
  };
  return map[status] || 'neutral';
};

const StatusBadge: React.FC<StatusBadgeProps> = ({
  label,
  variant = 'neutral',
  dot = true,
  className = '',
}) => {
  const styles = variantStyles[variant];

  return (
    <div
      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border ${styles.wrapper} w-fit backdrop-blur-md ${className}`}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${styles.dot} shadow-[0_0_8px_currentColor]`}
        />
      )}
      <span className="text-[10px] font-bold uppercase tracking-widest">
        {label}
      </span>
    </div>
  );
};

export default React.memo(StatusBadge);
