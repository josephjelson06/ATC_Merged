import React from "react";
import ModalShell from "@/presentation/components/ui/ModalShell";
import Button from "@/presentation/components/ui/Button";

interface InvoiceHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: any;
}

const InvoiceHistoryModal: React.FC<InvoiceHistoryModalProps> = ({
  isOpen,
  onClose,
  subscription,
}) => {
  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-2xl"
      headerContent={
        <div>
          <h2 className="text-xl font-black dark:text-white tracking-tighter uppercase leading-none">
            Financial Ledger
          </h2>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">
            Invoice History for {subscription.hotel}
          </p>
        </div>
      }
    >
      <div className="p-8 space-y-4 max-h-[60vh] overflow-y-auto">
        <div className="text-center py-10 text-gray-500 italic">
          Invoicing module is currently undergoing scheduled maintenance.
          <br />
          Please contact support for historical records.
        </div>
      </div>
      <div className="p-4 border-t border-white/10 bg-black/5 flex justify-end">
        <Button variant="ghost" onClick={onClose}>
          Close Ledger
        </Button>
      </div>
    </ModalShell>
  );
};

export default InvoiceHistoryModal;
