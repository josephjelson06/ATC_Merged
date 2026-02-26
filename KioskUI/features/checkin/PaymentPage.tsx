import React from "react";
import { useUIState } from "../../state/uiContext";
import { ProgressBar } from "../../components/ProgressBar";
import { CreditCard, Lock, Wifi, Loader2 } from "lucide-react";

export const PaymentPage: React.FC = () => {
  const { data, emit, loading } = useUIState();
  const room = data.selectedRoom || {};
  const bookingSlots = data.bookingSlots || {};

  // Calculate real bill instead of using mocked data
  const baseRate = room.price || 1500;
  const nights = bookingSlots.nights || 1;
  const subtotal = baseRate * nights;
  const taxes = subtotal * 0.18; // 18% GST typical for hotels
  const total = subtotal + taxes;

  const bill = {
    nights,
    subtotal: subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 }),
    taxes: taxes.toLocaleString(undefined, { minimumFractionDigits: 2 }),
    total: total.toLocaleString(undefined, { minimumFractionDigits: 2 }),
    currencySymbol: "₹",
  };

  const progress = data.progress || {
    currentStep: 3,
    totalSteps: 4,
    steps: ["Payment"],
  };

  const [cardData, setCardData] = React.useState({
    number: "",
    name: bookingSlots.guestName || "",
    expiry: "",
    cvv: "",
  });
  const [isProcessing, setIsProcessing] = React.useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCardData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    // Simulate payment gateway delay
    setTimeout(() => {
      emit("CONFIRM_PAYMENT");
    }, 2000);
  };

  return (
    <div className="h-screen w-full flex flex-col p-8 bg-slate-900">
      <ProgressBar
        currentStep={progress.currentStep}
        totalSteps={progress.totalSteps}
        labels={progress.steps}
      />

      <div className="flex-1 flex items-center justify-center gap-12 max-w-5xl mx-auto w-full">
        {/* Summary Card */}
        <div className="flex-1 bg-slate-800 rounded-2xl p-8 border border-slate-700 shadow-2xl">
          <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-6">
            Reservation Summary
          </h3>

          <div className="flex items-start gap-4 mb-6">
            <img
              src={room.image}
              alt="Room"
              className="w-24 h-24 rounded-lg object-cover"
            />
            <div>
              <h4 className="text-white font-bold text-xl">{room.name}</h4>
              <p className="text-slate-400 text-sm">
                {bill.nights} Nights • 2 Guests
              </p>
            </div>
          </div>

          <div className="space-y-4 border-t border-slate-700 pt-6">
            <div className="flex justify-between text-slate-300">
              <span>Room Rate ({bill.nights} nights)</span>
              <span>
                {bill.currencySymbol}
                {bill.subtotal}
              </span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Taxes & Fees</span>
              <span>
                {bill.currencySymbol}
                {bill.taxes}
              </span>
            </div>
            <div className="flex justify-between text-white font-bold text-xl pt-4 border-t border-slate-700">
              <span>Total</span>
              <span>
                {bill.currencySymbol}
                {bill.total}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Form Visual */}
        <div className="flex-1 flex flex-col">
          <form
            onSubmit={handlePayment}
            className="bg-slate-800 rounded-3xl p-8 shadow-2xl border border-slate-700 relative overflow-hidden flex flex-col"
          >
            {(loading || isProcessing) && (
              <div className="absolute inset-0 z-20 bg-slate-900/90 flex flex-col items-center justify-center text-center p-4 backdrop-blur-sm">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                <p className="text-white font-mono text-sm">
                  AUTHORIZING TRANSACTION...
                </p>
                <p className="text-slate-400 text-xs mt-2">
                  Please do not close or refresh.
                </p>
              </div>
            )}

            <div className="text-center border-b border-slate-700 pb-6 mb-6">
              <CreditCard className="mx-auto text-blue-500 mb-2" size={32} />
              <h3 className="text-white font-medium text-lg">
                Payment Details
              </h3>
              <p className="text-slate-400 text-sm">
                Enter your card information
              </p>
            </div>

            <div className="space-y-4 flex-1">
              <div>
                <label className="block text-xs font-medium text-slate-400 uppercase tracking-widest mb-1.5">
                  Card Number
                </label>
                <input
                  type="text"
                  name="number"
                  value={cardData.number}
                  onChange={handleInputChange}
                  placeholder="0000 0000 0000 0000"
                  maxLength={19}
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 uppercase tracking-widest mb-1.5">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={cardData.name}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all uppercase"
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-slate-400 uppercase tracking-widest mb-1.5">
                    Expiry
                  </label>
                  <input
                    type="text"
                    name="expiry"
                    value={cardData.expiry}
                    onChange={handleInputChange}
                    placeholder="MM/YY"
                    maxLength={5}
                    required
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-mono"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-slate-400 uppercase tracking-widest mb-1.5">
                    CVV
                  </label>
                  <input
                    type="password"
                    name="cvv"
                    value={cardData.cvv}
                    onChange={handleInputChange}
                    placeholder="•••"
                    maxLength={4}
                    required
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-mono tracking-widest"
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-between items-center bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
              <span className="text-slate-400 text-sm">Amount due</span>
              <span className="text-2xl font-bold text-white tracking-tight">
                {bill.currencySymbol}
                {bill.total}
              </span>
            </div>

            <button
              type="submit"
              disabled={
                loading ||
                isProcessing ||
                !cardData.number ||
                !cardData.name ||
                !cardData.expiry ||
                !cardData.cvv
              }
              className="mt-6 w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-blue-900/20 flex justify-center items-center gap-2"
            >
              {isProcessing
                ? "Processing..."
                : `Pay ${bill.currencySymbol}${bill.total}`}
            </button>

            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
              <Lock size={12} /> Secure 256-bit encryption
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
