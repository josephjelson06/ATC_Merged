
import React from 'react';
import ReactDOM from 'react-dom';
import { X } from 'lucide-react';
import GlassCard from './GlassCard';
import { useModalVisibility } from '../../hooks/useModalVisibility';

interface ModalShellProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /** Title shown in the header */
  title?: string;
  /** Subtitle below the title */
  subtitle?: string;
  /** Max width class — defaults to max-w-2xl */
  maxWidth?: string;
  /** Render custom header content instead of default title/subtitle */
  headerContent?: React.ReactNode;
  /** Render footer content (e.g., action buttons) */
  footer?: React.ReactNode;
  /** Whether the header should be hidden entirely */
  hideHeader?: boolean;
  /** Whether the close button appears */
  hideCloseButton?: boolean;
}

const ModalShell: React.FC<ModalShellProps> = ({
  isOpen,
  onClose,
  children,
  title,
  subtitle,
  maxWidth = 'max-w-2xl',
  headerContent,
  footer,
  hideHeader = false,
  hideCloseButton = false,
}) => {
  const { isVisible } = useModalVisibility(isOpen, 200);

  if (!isVisible && !isOpen) return null;

  return ReactDOM.createPortal(
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 transition-all duration-300 ${
        isOpen
          ? 'opacity-100 backdrop-blur-md bg-black/60'
          : 'opacity-0 pointer-events-none'
      }`}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal container */}
      <div
        className={`relative w-full ${maxWidth} transform transition-all duration-300 z-10 ${
          isOpen
            ? 'scale-100 translate-y-0'
            : 'scale-95 translate-y-4'
        }`}
      >
        <GlassCard
          className="relative flex flex-col max-h-[90vh] overflow-hidden shadow-2xl"
          noPadding
        >
          {/* Header */}
          {!hideHeader && (
            <div className="p-8 border-b border-white/10 flex justify-between items-center shrink-0">
              {headerContent || (
                <div>
                  {title && (
                    <h2 className="text-2xl font-bold dark:text-white">{title}</h2>
                  )}
                  {subtitle && (
                    <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest font-bold">
                      {subtitle}
                    </p>
                  )}
                </div>
              )}
              {!hideCloseButton && (
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-white/10 transition-colors text-gray-400"
                  aria-label="Close modal"
                >
                  <X size={20} />
                </button>
              )}
            </div>
          )}

          {/* Body */}
          <div className="flex-1 overflow-y-auto">{children}</div>

          {/* Footer */}
          {footer && (
            <div className="p-8 bg-black/5 dark:bg-white/5 border-t border-white/10 shrink-0">
              {footer}
            </div>
          )}
        </GlassCard>
      </div>
    </div>,
    document.body
  );
};

export default ModalShell;
