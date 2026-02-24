import React, { useState } from "react";
import { Calendar, Zap, ArrowRight, CheckCircle2 } from "lucide-react";
import ModalShell from "../../components/ui/ModalShell";
import Button from "../../components/ui/Button";
import type { Subscription } from "@/domain/entities/Subscription";

interface ExtendSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: Subscription & { renewalDate?: string; price?: number }; // Intersection for ViewModel props
  onUpdate: (id: string, data: Partial<Subscription>) => Promise<void>;
}

const ExtendSubscriptionModal: React.FC<ExtendSubscriptionModalProps> = ({
  isOpen,
  onClose,
  subscription,
  onUpdate,
}) => {
  const [months, setMonths] = useState(1);
  const [loading, setLoading] = useState(false);

  const options = [
    { label: "1 Month", value: 1, discount: 0 },
    { label: "6 Months", value: 6, discount: 5 },
    { label: "12 Months", value: 12, discount: 15 },
  ];

  // Use renewalDate from ViewModel if present, otherwise fallback to startDate + 1 month or now
  const currentRenewalDate = new Date(
    subscription.renewalDate || subscription.endDate || new Date(),
  );
  const newRenewalDate = new Date(currentRenewalDate);
  newRenewalDate.setMonth(newRenewalDate.getMonth() + months);

  const selectedOption = options.find((o) => o.value === months);
  const price = subscription.price || 0; // Usage of VM prop
  const subtotal = price * months;
  const discountAmount = (subtotal * (selectedOption?.discount || 0)) / 100;
  const total = subtotal - discountAmount;

  const handleExtend = async () => {
    setLoading(true);
    try {
      await onUpdate(subscription.id, {
        endDate: newRenewalDate.toISOString(),
        // invoiceAmount: total // Ignored by backend
      });
      onClose();
    } catch (error) {
      console.error("Failed to extend subscription", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-xl"
      headerContent={
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-accent text-white flex items-center justify-center shadow-lg shadow-accent-strong/40">
            <Zap size={24} fill="currentColor" />
          </div>
          <div>
            <h2 className="text-xl font-black dark:text-white tracking-tighter uppercase leading-none">
              Extend Validity
            </h2>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">
              Tenant Renewal Terminal
            </p>
          </div>
        </div>
      }
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleExtend}
            disabled={loading}
            iconRight={<CheckCircle2 size={16} />}
          >
            {loading ? "Processing..." : "Execute Extension"}
          </Button>
        </div>
      }
    >
      <div className="p-8 space-y-8">
        <div className="flex items-center justify-between p-6 rounded-[2.5rem] bg-black/5 dark:bg-white/[0.02] border border-white/5">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-white/5 text-gray-500">
              <Calendar size={24} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                Current Expiry
              </p>
              <p className="text-lg font-black dark:text-white">
                {currentRenewalDate.toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="p-2 rounded-full bg-white/5 text-gray-600">
            <ArrowRight size={20} />
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-accent-strong uppercase tracking-widest">
              Projected Expiry
            </p>
            <p className="text-lg font-black text-accent-strong">
              {newRenewalDate.toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-[10px] font-bold uppercase text-gray-500 tracking-widest">
            Extension Duration
          </label>
          <div className="grid grid-cols-3 gap-3">
            {options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setMonths(opt.value)}
                className={`p-5 rounded-[1.5rem] border transition-all text-center group relative ${
                  months === opt.value
                    ? "border-accent bg-accent/5 shadow-lg"
                    : "border-white/5 bg-black/5 hover:border-white/10"
                }`}
              >
                {opt.discount > 0 && (
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[7px] font-bold uppercase">
                    -{opt.discount}% OFF
                  </span>
                )}
                <p
                  className={`text-sm font-bold uppercase tracking-tighter mb-1 ${months === opt.value ? "text-accent" : "dark:text-white"}`}
                >
                  {opt.label}
                </p>
                <p className="text-[8px] font-medium text-gray-500 uppercase">
                  {opt.value === 1 ? "Standard" : "Bulk Saver"}
                </p>
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 rounded-[2.5rem] bg-black/20 border border-white/5 space-y-3">
          <div className="flex justify-between items-center text-xs font-medium text-gray-500">
            <span>Pro-rated Fee ({months} Mo)</span>
            <span className="font-mono">₹{subtotal.toLocaleString()}</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between items-center text-xs font-medium text-emerald-500">
              <span>Bulk Discount Applied</span>
              <span className="font-mono">
                - ₹{discountAmount.toLocaleString()}
              </span>
            </div>
          )}
          <div className="pt-3 border-t border-white/5 flex justify-between items-end">
            <span className="text-[10px] font-bold uppercase dark:text-white">
              Amount to Settle
            </span>
            <span className="text-3xl font-black text-accent tracking-tighter">
              ₹{total.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </ModalShell>
  );
};

export default ExtendSubscriptionModal;
