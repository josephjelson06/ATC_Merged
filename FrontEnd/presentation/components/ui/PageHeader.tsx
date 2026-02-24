
import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  /** Optional badge/info element to show above the title */
  badge?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  children,
  badge,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
      <div className="space-y-1">
        {badge && <div className="mb-4">{badge}</div>}
        <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tighter uppercase leading-none">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mt-3">
            {subtitle}
          </p>
        )}
      </div>
      {children && (
        <div className="flex items-center gap-4 shrink-0">{children}</div>
      )}
    </div>
  );
};

export default React.memo(PageHeader);
