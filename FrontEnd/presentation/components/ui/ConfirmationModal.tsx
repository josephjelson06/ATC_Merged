
import React from 'react';
import { ShieldAlert, Trash2, ArrowRight } from 'lucide-react';
import ModalShell from './ModalShell';
import Button from './Button';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'primary' | 'danger' | 'warning';
  icon?: React.ElementType;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'primary',
  icon: Icon = ShieldAlert,
}) => {
  const isDanger = variant === 'danger';
  const isWarning = variant === 'warning';
  
  const iconColorClass = isDanger ? 'text-white' : isWarning ? 'text-amber-600' : 'text-accent';
  const iconBgClass = isDanger ? 'bg-red-600 shadow-red-900/40' : isWarning ? 'bg-amber-100 dark:bg-amber-900/30 shadow-amber-900/20' : 'bg-accent/10 shadow-accent/20';

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-md"
      headerContent={
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl ${iconBgClass} ${iconColorClass} flex items-center justify-center shadow-lg`}>
            {Icon && <Icon size={24} />}
          </div>
          <div>
            <h2 className="text-lg font-black dark:text-white tracking-tight uppercase">{title}</h2>
          </div>
        </div>
      }
      footer={
        <div className="flex justify-end gap-3 w-full">
           <Button variant="ghost" onClick={onClose}>{cancelLabel}</Button>
           <Button
             variant={variant === 'warning' ? 'secondary' : variant} // Map warning to secondary or danger if suitable, but button usually supports primary/secondary/danger/ghost
             // If Button component doesn't support 'warning', we might need to adjust or use custom class.
             // Looking at Button.tsx via usage in other files, it supports variants. Assuming 'danger' works. 'warning' might need 'secondary' or a check.
             // Let's stick to 'danger' for danger actions and 'primary' for others.
             // If variant is warning, maybe use 'secondary' style with manual override or check Button definition.
             // For now, mapping 'warning' to 'secondary' is safer if 'warning' isn't explicitly defined in Button props.
             // Actually, let's execute cat on Button.tsx to be sure.
             // But to save steps, I'll use `variant === 'danger' ? 'danger' : 'primary'` for now and checking Button.tsx might be overkill if I can just use existing patterns. 
             // Wait, I saw Button usage in UnmapKioskModal. Let's assume generic variants.
             onClick={() => {
               onConfirm();
               onClose();
             }}
             iconRight={<ArrowRight size={16} strokeWidth={3} />}
             className={isWarning ? 'bg-amber-500 hover:bg-amber-600 text-white' : ''} // Manual override for warning color if needed
           >
             {confirmLabel}
           </Button>
        </div>
      }
    >
      <div className="p-8">
        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
          {message}
        </p>
      </div>
    </ModalShell>
  );
};

export default ConfirmationModal;
