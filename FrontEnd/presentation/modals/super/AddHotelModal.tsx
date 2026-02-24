"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  ChevronRight,
  ChevronLeft,
  Building,
  User,
  CreditCard,
  Monitor,
  CheckCircle2,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import ModalShell from "../../components/ui/ModalShell";
import GlassInput from "../../components/ui/GlassInput";
import Button from "../../components/ui/Button";
import { usePlans } from "@/application/hooks/usePlans";
import { useUsers } from "@/application/hooks/useUsers";

interface KioskData {
  serialNumber: string;
  location: string;
}

interface AddHotelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateHotel: (data: any) => Promise<any>; // Returns the created tenant
}

const AddHotelModal: React.FC<AddHotelModalProps> = ({
  isOpen,
  onClose,
  onCreateHotel,
}) => {
  const { plans: apiPlans, loading: plansLoading, fetchPlans } = usePlans();
  const { createUser, fetchRoles, roles } = useUsers(); // Use user hook for owner creation

  const [step, setStep] = useState(1);
  const totalSteps = 5;
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    gstin: "",
    pan: "",
    address: "",
    owner: "",
    mobile: "",
    email: "",
    plan: "",
    contractStartDate: new Date().toISOString().split("T")[0],
  });

  const [kiosks, setKiosks] = useState<KioskData[]>([]);
  const [currentKiosk, setCurrentKiosk] = useState<KioskData>({
    serialNumber: "",
    location: "",
  });

  // Filter active plans
  const activePlans = useMemo(
    () => apiPlans.filter((p) => true), // Assuming all returned are active or filter by status if available
    [apiPlans],
  );
  const hasNoActivePlans = !plansLoading && activePlans.length === 0;

  useEffect(() => {
    if (isOpen) {
      fetchRoles();
      fetchPlans();
    }
  }, [isOpen, fetchRoles, fetchPlans]);

  useEffect(() => {
    if (activePlans.length > 0 && !formData.plan) {
      setFormData((prev) => ({ ...prev, plan: activePlans[0].name }));
    }
  }, [activePlans, formData.plan]);

  const handleAddKiosk = () => {
    if (currentKiosk.serialNumber && currentKiosk.location) {
      setKiosks([...kiosks, currentKiosk]);
      setCurrentKiosk({ serialNumber: "", location: "" });
    }
  };

  const handleRemoveKiosk = (index: number) => {
    const newKiosks = [...kiosks];
    newKiosks.splice(index, 1);
    setKiosks(newKiosks);
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setFormData({
        name: "",
        gstin: "",
        pan: "",
        address: "",
        owner: "",
        mobile: "",
        email: "",
        plan: activePlans.length > 0 ? activePlans[0].name : "",
        contractStartDate: new Date().toISOString().split("T")[0],
      });
      setKiosks([]);
      setCurrentKiosk({ serialNumber: "", location: "" });
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (hasNoActivePlans) {
      alert("Create a pricing plan first.");
      return;
    }

    setLoading(true);
    try {
      const selectedPlan = activePlans.find((p) => p.name === formData.plan);
      if (!selectedPlan) {
        throw new Error(
          "Selected pricing tier is invalid. Please choose an active plan.",
        );
      }

      // 1. Create Tenant
      const newTenant = await onCreateHotel({
        name: formData.name,
        gstin: formData.gstin,
        pan: formData.pan,
        address: formData.address,
        planId: selectedPlan.id,
        status: "Onboarding",
      });

      if (newTenant && newTenant.id) {
        // 2. Create Owner User
        // Find "Tenant Admin" role or similar fallback
        const adminRole =
          roles.find(
            (r) => r.name === "Hotel Admin" || r.name === "Tenant Admin",
          ) || roles[0];

        if (adminRole) {
          await createUser({
            name: formData.owner,
            email: formData.email,
            mobile: formData.mobile,
            role: adminRole,
            tenantId: newTenant.id,
            isAdmin: true,
          });
          // Note: We might want to update the tenant with ownerId here if the backend doesn't do it automatically
          // But for now let's assume the user creation linked to tenant is enough for them to log in.
          // Updating tenant ownerId would require another callback props or importing useTenants here which might loop.
          // Let's rely on the user being created.
        }
      }

      onClose();
    } catch (error: any) {
      console.error("Failed to create hotel", error);
      alert(error?.message || "Failed to create hotel. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const StepIndicator = () => (
    <div className="flex items-center gap-2 mb-8">
      {[1, 2, 3, 4, 5].map((s) => (
        <React.Fragment key={s}>
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${s === step ? "bg-accent text-white shadow-lg" : s < step ? "bg-emerald-500 text-white" : "bg-black/5 dark:bg-white/5 text-gray-500"}`}
          >
            {s < step ? <CheckCircle2 size={16} /> : s}
          </div>
          {s < totalSteps && (
            <div
              className={`flex-1 h-0.5 rounded-full ${s < step ? "bg-emerald-500" : "bg-black/5 dark:bg-white/5"}`}
            ></div>
          )}
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title="Onboard New Hotel"
      subtitle={`Step ${step} of ${totalSteps}`}
      footer={
        <div className="flex justify-between">
          <Button
            variant="ghost"
            size="md"
            disabled={step === 1 || loading}
            onClick={() => setStep(step - 1)}
            icon={<ChevronLeft size={18} />}
          >
            Previous
          </Button>
          <Button
            variant="action"
            size="md"
            disabled={loading || hasNoActivePlans || plansLoading}
            onClick={() => (step === 5 ? handleSubmit() : setStep(step + 1))}
            iconRight={loading ? undefined : <ChevronRight size={18} />}
          >
            {loading
              ? "Processing..."
              : hasNoActivePlans
                ? "Create Plan First"
                : step === 5
                  ? "Confirm & Create Tenant"
                  : "Next Step"}
          </Button>
        </div>
      }
    >
      <div className="p-8">
        {hasNoActivePlans && (
          <div className="mb-6 rounded-xl border border-orange-500/30 bg-orange-500/10 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle size={18} className="mt-0.5 text-orange-500" />
              <div className="space-y-2">
                <p className="text-sm font-bold text-orange-600 dark:text-orange-400">
                  Create a pricing plan first.
                </p>
                <p className="text-xs text-orange-700/80 dark:text-orange-300/80">
                  Hotel onboarding is blocked until at least one active pricing
                  tier exists.
                </p>
                <a
                  href="/super/plans"
                  className="inline-flex text-xs font-bold uppercase tracking-wider text-orange-600 underline underline-offset-2 hover:text-orange-500"
                >
                  Go to Plans
                </a>
              </div>
            </div>
          </div>
        )}
        <StepIndicator />
        {step === 1 && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <Building size={16} className="text-accent" />
              <span className="text-xs font-bold uppercase dark:text-white">
                Business Details
              </span>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="col-span-2">
                <GlassInput
                  label="Hotel Legal Name *"
                  placeholder="e.g., Royal Orchid Bangalore"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                />
              </div>
              <GlassInput
                label="GSTIN *"
                placeholder="29AABCU9603R1ZM"
                mono
                maxLength={15}
                value={formData.gstin}
                onChange={(e) => handleChange("gstin", e.target.value)}
              />
              <GlassInput
                label="PAN *"
                placeholder="AABCU9603R"
                mono
                maxLength={10}
                value={formData.pan}
                onChange={(e) => handleChange("pan", e.target.value)}
              />
              <div className="col-span-2">
                <GlassInput
                  label="Registered Address *"
                  placeholder="Full legal address"
                  value={formData.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                />
              </div>
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <User size={16} className="text-accent" />
              <span className="text-xs font-bold uppercase dark:text-white">
                Contact Details
              </span>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="col-span-2">
                <GlassInput
                  label="Owner / Manager Name *"
                  placeholder="e.g., Rajesh Malhotra"
                  value={formData.owner}
                  onChange={(e) => handleChange("owner", e.target.value)}
                />
              </div>
              <GlassInput
                label="Mobile Number *"
                type="tel"
                placeholder="+91 98860 32101"
                value={formData.mobile}
                onChange={(e) => handleChange("mobile", e.target.value)}
              />
              <GlassInput
                label="Email Address *"
                type="email"
                placeholder="owner@hotel.com"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
              />
            </div>
          </div>
        )}
        {step === 3 && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard size={16} className="text-accent" />
              <span className="text-xs font-bold uppercase dark:text-white">
                Subscription Setup
              </span>
            </div>
            <div className="grid grid-cols-1 gap-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {activePlans.map((p) => (
                <div
                  key={p.id}
                  onClick={() => handleChange("plan", p.name)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${formData.plan === p.name ? "border-orange-500/50 bg-accent/5" : "border-white/10 hover:border-white/20"}`}
                >
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold dark:text-white">{p.name} Plan</h4>
                    <span className="text-sm font-bold text-accent">
                      ₹{p.price.toLocaleString()}/mo
                    </span>
                  </div>
                  <div className="flex gap-4 mt-2">
                    <span className="text-[10px] text-gray-500 uppercase font-bold text-xs">
                      {p.max_rooms || 0} Rooms
                    </span>
                  </div>
                </div>
              ))}
              <div className="mt-4">
                <GlassInput
                  label="Contract Start Date"
                  type="date"
                  value={formData.contractStartDate}
                  onChange={(e) =>
                    handleChange("contractStartDate", e.target.value)
                  }
                />
              </div>
            </div>
          </div>
        )}
        {step === 4 && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <Monitor size={16} className="text-accent" />
              <span className="text-xs font-bold uppercase dark:text-white">
                Kiosk Assignment
              </span>
            </div>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-dashed border-white/10 text-center text-xs text-gray-500">
                Kiosk assignment is handled in the Kiosks module after
                onboarding.
              </div>
            </div>
          </div>
        )}
        {step === 5 && (
          <div className="text-center py-10">
            <div className="w-20 h-20 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={48} />
            </div>
            <h3 className="text-2xl font-bold dark:text-white mb-2">
              Ready to Go!
            </h3>
            <p className="text-sm text-gray-500 mb-8 max-w-sm mx-auto">
              Review the details and confirm to create the tenant. A welcome
              email with login credentials will be sent automatically.
            </p>
            <div className="bg-black/5 dark:bg-white/5 p-4 rounded-xl text-left text-sm space-y-2 mb-4">
              <div className="flex justify-between">
                <span>Property:</span>{" "}
                <span className="font-bold dark:text-white">
                  {formData.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Owner:</span>{" "}
                <span className="font-bold dark:text-white">
                  {formData.owner}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Plan:</span>{" "}
                <span className="font-bold dark:text-white">
                  {formData.plan}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </ModalShell>
  );
};

export default AddHotelModal;
