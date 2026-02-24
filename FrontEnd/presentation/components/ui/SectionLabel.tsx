
import React from 'react';

interface SectionLabelProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Micro-typography label used for field labels, section titles,
 * and metadata captions throughout the app.
 */
const SectionLabel: React.FC<SectionLabelProps> = ({ children, className = '' }) => {
  return (
    <span
      className={`text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest ${className}`}
    >
      {children}
    </span>
  );
};

export default React.memo(SectionLabel);
