
import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
  // Added style prop to support dynamic styling (e.g., border color) in consuming components
  style?: React.CSSProperties;
  // Added onClick prop to support click interactions in consuming components
  onClick?: () => void;
  // Option to specifically clip contents if needed
  clipContent?: boolean;
}

const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className = '', 
  noPadding = false, 
  style, 
  onClick,
  clipContent = false 
}) => {
  return (
    <div
      style={style}
      onClick={onClick}
      className={`
        glass-card rounded-[1.5rem] 
        ${clipContent ? 'overflow-hidden' : 'overflow-visible'}
        ${noPadding ? '' : 'p-6'}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default React.memo(GlassCard);
