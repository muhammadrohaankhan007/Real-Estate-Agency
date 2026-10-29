"use client";

import React, { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Building2, 
  MapPin, 
  Send, 
  Mail, 
  Phone, 
  Lock, 
  X, 
  Sparkles,
  ArrowRight
} from "lucide-react";

const LOCATION_OPTIONS = [
  "DHA Phase 8 (Zone A)",
  "DHA Phase 8 (Zone B Waterfront)",
  "DHA Phase 8 (Khayaban-e-Ghalib)",
  "EMAAR Crescent Bay",
  "DHA Phase 6 (Main Avenue)",
  "DHA Phase 7 / Khayaban-e-Ittehad",
  "DHA Phase 5",
  "Clifton (Blocks 1–9)",
  "HMR Waterfront"
];

const PROPERTY_TYPE_OPTIONS = [
  "Luxury Bungalow",
  "Waterfront Apartment",
  "Residential Plot",
  "Commercial Building",
  "Penthouse"
];

interface ToastState {
  show: boolean;
  type: "success" | "error";
  title: string;
  message: string;
  leadId?: string;
}

export default function PrivateAdvisoryDesk() {
  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"valuation" | "briefing">("valuation");

  // Valuation Form States
  const [fullName, setFullName] = useState("");
  const [phoneWhatsapp, setPhoneWhatsapp] = useState("");
  const [locationPhase, setLocationPhase] = useState(LOCATION_OPTIONS[0]);
  const [propertyType, setPropertyType] = useState(PROPERTY_TYPE_OPTIONS[0]);
  const [sizeCovered, setSizeCovered] = useState("");
  const [objectivesNotes, setObjectivesNotes] = useState("");
  const [isValuationLoading, setIsValuationLoading] = useState(false);

  // Newsletter Subscription States
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [isSubscribeLoading, setIsSubscribeLoading] = useState(false);

  // Toast Notification State
  const [toast, setToast] = useState<ToastState>({
    show: false,
    type: "success",
    title: "",
    message: "",
  });

  // Strict Hydration Guard
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Auto-dismiss toast
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast((prev) => ({ ...prev, show: false }));
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  const dismissToast = () => {
    setToast((prev) => ({ ...prev, show: false }));
  };

  // Section A: Handle Valuation Form Submission
  const handleValuationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim() || !phoneWhatsapp.trim()) {
      setToast({
        show: true,
        type: "error",
        title: "Required Details Missing",
        message: "Please provide both client full name and direct phone/WhatsApp contact.",
      });
      return;
    }

    setIsValuationLoading(true);

    try {
      const response = await fetch("/api/advisory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName.trim(),
          phone_whatsapp: phoneWhatsapp.trim(),
          location_phase: locationPhase,
          property_type: propertyType,
          size_covered: sizeCovered.trim() || undefined,
          objectives_notes: objectivesNotes.trim() || undefined,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok && data.success) {
        setToast({
          show: true,
          type: "success",
          title: "Valuation Assessment Mandate Registered",
          message: data.message || "Your confidential mandate has been received. Nadeem Sulemani and our senior advisory desk will contact you under non-disclosure protocol.",
          leadId: data.lead_id,
        });

        // Reset form inputs
        setFullName("");
        setPhoneWhatsapp("");
        setSizeCovered("");
        setObjectivesNotes("");
      } else {
        setToast({
          show: true,
          type: "error",
          title: "Registration Failed",
          message: data.message || `Server responded with status ${response.status}.`,
        });
      }
    } catch (err: any) {
      console.error("Valuation submission error:", err);
      setToast({
        show: true,
        type: "error",
        title: "Network Dispatch Error",
        message: err?.message || "Unable to reach the advisory desk. Please verify connection or reach us via WhatsApp directly.",
      });
    } finally {
      setIsValuationLoading(false);
    }
  };

  // Section B: Handle Newsletter Subscription
  const handleSubscribeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!emailOrPhone.trim()) {
      setToast({
        show: true,
        type: "error",
        title: "Contact Required",
        message: "Please enter your confidential email or phone number.",
      });
      return;
    }

    setIsSubscribeLoading(true);

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email_or_phone: emailOrPhone.trim(),
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok && data.success) {
        setToast({
          show: true,
          type: "success",
          title: "Enrolled in Private Briefings",
          message: data.message || "You have been enrolled. Direct dispatches on newly listed off-market villas and DHA Phase 8 land movements will be transmitted directly.",
          leadId: data.subscriber_id,
        });
        setEmailOrPhone("");
      } else {
        setToast({
          show: true,
          type: "error",
          title: "Subscription Failed",
          message: data.message || "Failed to process enrollment.",
        });
      }
    } catch (err: any) {
      console.error("Subscription submission error:", err);
      setToast({
        show: true,
        type: "error",
        title: "Network Dispatch Error",
        message: err?.message || "Failed to communicate with briefings network.",
      });
    } finally {
      setIsSubscribeLoading(false);
    }
  };

  if (!isMounted) {
    return (
      <div className="py-20 bg-[#0a0a0a] text-white flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-[#D4AF37] animate-spin" />
      </div>
    );
  }

  return (
    <section 
      id="valuation" 
      className="relative py-20 sm:py-28 bg-[#0a0a0a] text-zinc-100 overflow-hidden border-t border-b border-white/10"
    >
      {/* Subtle Radial Luxury Background Glow */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#D4AF37]/5 blur-[140px] pointer-events-none rounded-full" 
        aria-hidden="true" 
      />

      {/* ==================== GLASSMORPHIC TOAST BANNER ==================== */}
      {toast.show && (
        <div className="fixed top-4 sm:top-6 left-4 sm:left-auto right-4 sm:right-6 z-50 max-w-md w-auto sm:w-full animate-in fade-in slide-in-from-top-4 duration-300">
          <div
            className={`p-4 xs:p-5 backdrop-blur-xl border shadow-2xl transition-all duration-300 ${
              toast.type === "success"
                ? "bg-black/95 border-emerald-500/60 text-white shadow-emerald-500/10"
                : "bg-black/95 border-rose-500/60 text-white shadow-rose-500/10"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex-shrink-0">
                  {toast.type === "success" ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-rose-400" />
                  )}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-serif text-sm font-medium tracking-wide">
                      {toast.title}
                    </h4>
                    {toast.leadId && (
                      <span className="text-[10px] tracking-wider uppercase bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37] px-2 py-0.5 font-mono">
                        #{toast.leadId}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed font-light">
                    {toast.message}
                  </p>
                </div>
              </div>
              <button
                onClick={dismissToast}
                className="text-zinc-400 hover:text-white p-1 transition-colors"
                aria-label="Dismiss notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="relative max-w-6xl mx-auto px-4 xs:px-5 sm:px-8 lg:px-12">
        {/* Section Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto mb-8 sm:mb-12">
          <div className="inline-flex items-center space-x-2 text-[10px] tracking-[0.25em] xs:tracking-[0.3em] uppercase text-[#D4AF37] font-mono bg-[#D4AF37]/10 border border-[#D4AF37]/30 px-3 py-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Private Advisory Mandate Desk</span>
          </div>

          <h2 className="font-serif text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-light text-white tracking-tight">
            Confidential Client <span className="text-[#D4AF37]">Assessment & Briefings</span>
          </h2>

          <p className="text-xs sm:text-sm text-zinc-400 font-light leading-relaxed">
            Directly supervised by Nadeem Sulemani. Commission an authoritative cadastral property valuation or enroll in private off-market dispatches.
          </p>
        </div>

        {/* Dual Tab Navigation with Mobile Full Fit */}
        <div className="flex flex-col xs:flex-row items-stretch sm:items-center justify-center gap-2 sm:gap-4 mb-8 sm:mb-10 w-full max-w-md sm:max-w-none mx-auto">
          <button
            type="button"
            onClick={() => setActiveTab("valuation")}
            className={`px-4 xs:px-5 py-3 text-[11px] xs:text-xs uppercase tracking-wider xs:tracking-widest font-semibold transition-colors duration-200 border text-center ${
              activeTab === "valuation"
                ? "bg-[#D4AF37] text-neutral-950 border-[#D4AF37] shadow-lg shadow-[#D4AF37]/20 font-bold"
                : "bg-white/[0.03] text-zinc-400 border-white/10 hover:border-white/30 hover:text-white"
            }`}
          >
            <span>Section A: Commission Valuation</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("briefing")}
            className={`px-4 xs:px-5 py-3 text-[11px] xs:text-xs uppercase tracking-wider xs:tracking-widest font-semibold transition-colors duration-200 border text-center ${
              activeTab === "briefing"
                ? "bg-[#D4AF37] text-neutral-950 border-[#D4AF37] shadow-lg shadow-[#D4AF37]/20 font-bold"
                : "bg-white/[0.03] text-zinc-400 border-white/10 hover:border-white/30 hover:text-white"
            }`}
          >
            <span>Section B: Private Briefings</span>
          </button>
        </div>

        {/* ==================== SECTION A: CONFIDENTIAL VALUATION ASSESSMENT ==================== */}
        {activeTab === "valuation" && (
          <form
            onSubmit={handleValuationSubmit}
            className="bg-white/[0.02] border border-white/15 p-5 xs:p-7 sm:p-10 lg:p-12 rounded-xl backdrop-blur-md shadow-2xl space-y-6 sm:space-y-8 animate-in fade-in duration-300"
          >
            <div className="border-b border-white/10 pb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="font-serif text-xl sm:text-2xl font-light text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-[#D4AF37]" />
                  <span>Confidential Property Valuation Commission</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Accurate FBR benchmark, CBC taxation analysis, and prevailing private market valuation.
                </p>
              </div>

              <div className="inline-flex items-center space-x-1.5 text-[10px] font-mono text-[#D4AF37] bg-black/60 px-3 py-1.5 border border-[#D4AF37]/30 self-start sm:self-auto">
                <Lock className="w-3 h-3 text-[#D4AF37]" />
                <span>NON-DISCLOSURE PROTOCOL</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Full Name */}
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider text-zinc-300 font-medium">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Tariq Mansoor"
                  className="w-full bg-black/70 border border-white/15 rounded-lg p-3.5 text-white placeholder-zinc-600 text-sm focus:border-[#D4AF37] outline-none transition-colors"
                />
              </div>

              {/* Direct Phone / WhatsApp */}
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider text-zinc-300 font-medium flex items-center justify-between">
                  <span>Direct Phone / WhatsApp *</span>
                  <span className="text-[10px] text-zinc-500 font-mono">Confidential Dispatch</span>
                </label>
                <input
                  type="text"
                  required
                  value={phoneWhatsapp}
                  onChange={(e) => setPhoneWhatsapp(e.target.value)}
                  placeholder="+92 300 1234567 / name@domain.com"
                  className="w-full bg-black/70 border border-white/15 rounded-lg p-3.5 text-white placeholder-zinc-600 text-sm focus:border-[#D4AF37] outline-none transition-colors font-mono"
                />
              </div>

              {/* Location / Phase Dropdown */}
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider text-zinc-300 font-medium flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Location / Phase *</span>
                </label>
                <select
                  value={locationPhase}
                  onChange={(e) => setLocationPhase(e.target.value)}
                  className="w-full bg-black/70 border border-white/15 rounded-lg p-3.5 text-white text-sm focus:border-[#D4AF37] outline-none transition-colors cursor-pointer"
                >
                  {LOCATION_OPTIONS.map((loc) => (
                    <option key={loc} value={loc} className="bg-neutral-900 text-white">
                      {loc}
                    </option>
                  ))}
                </select>
              </div>

              {/* Property Type Dropdown */}
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider text-zinc-300 font-medium flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Property Type *</span>
                </label>
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="w-full bg-black/70 border border-white/15 rounded-lg p-3.5 text-white text-sm focus:border-[#D4AF37] outline-none transition-colors cursor-pointer"
                >
                  {PROPERTY_TYPE_OPTIONS.map((type) => (
                    <option key={type} value={type} className="bg-neutral-900 text-white">
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Plot / Unit Size */}
              <div className="space-y-2 sm:col-span-2">
                <label className="text-xs uppercase tracking-wider text-zinc-300 font-medium flex items-center justify-between">
                  <span>Plot / Unit Size (Optional)</span>
                  <span className="text-[10px] text-zinc-500 font-mono">e.g. 500 Sq. Yds / 1,000 Sq. Yds / 3,200 Sq. Ft.</span>
                </label>
                <input
                  type="text"
                  value={sizeCovered}
                  onChange={(e) => setSizeCovered(e.target.value)}
                  placeholder="e.g. 500 Sq. Yds / 1,000 Sq. Yds / 2,400 Sq. Ft."
                  className="w-full bg-black/70 border border-white/15 rounded-lg p-3.5 text-white placeholder-zinc-600 text-sm focus:border-[#D4AF37] outline-none transition-colors"
                />
              </div>

              {/* Confidential Objectives & Timing */}
              <div className="space-y-2 sm:col-span-2">
                <label className="text-xs uppercase tracking-wider text-zinc-300 font-medium flex items-center justify-between">
                  <span>Confidential Objectives & Timing</span>
                  <span className="text-[10px] text-zinc-500 font-mono">Discreet Handling</span>
                </label>
                <textarea
                  rows={4}
                  value={objectivesNotes}
                  onChange={(e) => setObjectivesNotes(e.target.value)}
                  placeholder="Specify architectural condition, desired sale timeline, overseas transfer requirements, or non-disclosure parameters..."
                  className="w-full bg-black/70 border border-white/15 rounded-lg p-3.5 text-white placeholder-zinc-600 text-sm focus:border-[#D4AF37] outline-none transition-colors resize-none"
                />
              </div>
            </div>

            {/* Bottom Guarantee & CTA Button */}
            <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-2 text-xs text-zinc-400 font-light">
                <ShieldCheck className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
                <span>Strict non-disclosure protocol • Direct review by Nadeem Sulemani</span>
              </div>

              <button
                type="submit"
                disabled={isValuationLoading}
                className="w-full sm:w-auto px-8 py-4 bg-[#D4AF37] hover:bg-amber-400 text-black font-semibold text-xs tracking-widest uppercase transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 rounded-lg shadow-xl shadow-[#D4AF37]/10"
              >
                {isValuationLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>TRANSMITTING MANDATE...</span>
                  </>
                ) : (
                  <>
                    <span>SCHEDULE VALUATION</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* ==================== SECTION B: PRIVATE BRIEFINGS NEWSLETTER DESK ==================== */}
        {activeTab === "briefing" && (
          <div className="bg-white/[0.02] border border-white/15 p-6 sm:p-10 lg:p-12 rounded-xl backdrop-blur-md shadow-2xl max-w-2xl mx-auto text-center space-y-8 animate-in fade-in duration-300">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center mx-auto text-[#D4AF37]">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-2xl sm:text-3xl font-light text-white">
                Private Briefings Newsletter Desk
              </h3>
              <p className="text-sm text-zinc-300 font-light leading-relaxed max-w-lg mx-auto">
                Direct dispatches on newly listed off-market villas, EMAAR releases, and DHA Phase 8 land movements transmitted strictly to verified recipients.
              </p>
            </div>

            <form onSubmit={handleSubscribeSubmit} className="space-y-4 max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row items-stretch gap-2">
                <input
                  type="text"
                  required
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  placeholder="Enter email or WhatsApp contact"
                  className="flex-1 bg-black/80 border border-white/20 rounded-lg px-4 py-3.5 text-sm text-white placeholder-zinc-500 focus:border-[#D4AF37] outline-none transition-colors font-mono"
                />

                <button
                  type="submit"
                  disabled={isSubscribeLoading}
                  className="px-6 py-3.5 bg-[#D4AF37] hover:bg-amber-400 text-black font-semibold text-xs tracking-wider uppercase transition-colors duration-200 disabled:opacity-50 flex items-center justify-center space-x-1.5 rounded-lg flex-shrink-0 shadow-lg shadow-[#D4AF37]/10"
                >
                  {isSubscribeLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>SUBSCRIBE TO BRIEFINGS</span>
                      <Send className="w-3.5 h-3.5 ml-1" />
                    </>
                  )}
                </button>
              </div>

              <p className="text-[11px] text-zinc-500 font-light tracking-wide">
                Direct dispatches from Nadeem Sulemani • Zero spam • Unsubscribe anytime
              </p>
            </form>

            <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-400">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Strict Confidentiality</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Direct Principal Access</span>
              </span>
              <span>•</span>
              <a 
                href="mailto:realpropertyprimetime@gmail.com" 
                className="text-[#D4AF37] hover:underline"
              >
                realpropertyprimetime@gmail.com
              </a>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
