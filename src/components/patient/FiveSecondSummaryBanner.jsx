import React from "react";
import { AlertTriangle, ShieldCheck, HeartPulse, Pill, Clock, Activity, ArrowRight, Zap, CheckCircle2 } from "lucide-react";
import { usePatient } from "../../context/PatientContext";

export default function FiveSecondSummaryBanner() {
  const { patient, setActiveTab } = usePatient();
  if (!patient) return null;

  const summary = patient.fiveSecondSummary || {};
  const triage = patient.triage || { tier: "LOW", alerts: [] };
  const isHighRisk = triage.tier === "HIGH / PRIORITY" || triage.tier === "HIGH";

  return (
    <div className={`rounded-2xl border-2 p-4 sm:p-5 shadow-md transition-all ${
      isHighRisk
        ? "bg-gradient-to-r from-red-50 via-rose-50 to-white border-red-300 ring-2 ring-red-400/30"
        : triage.tier === "MODERATE"
        ? "bg-gradient-to-r from-amber-50 via-yellow-50 to-white border-amber-300"
        : "bg-gradient-to-r from-emerald-50 via-teal-50 to-white border-emerald-300"
    }`}>
      {/* Top Rapid Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 pb-2.5">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black ${
            isHighRisk ? "bg-red-600 text-white shadow-sm shadow-red-500/40" : "bg-emerald-600 text-white"
          }`}>
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-slate-900 text-sm sm:text-base tracking-tight uppercase">
                5-Second Clinical Summary
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                isHighRisk
                  ? "bg-red-600 text-white border-red-700 animate-pulse"
                  : triage.tier === "MODERATE"
                  ? "bg-amber-100 text-amber-900 border-amber-300"
                  : "bg-emerald-100 text-emerald-900 border-emerald-300"
              }`}>
                {triage.tier || "LOW RISK"}
              </span>
            </div>
            <span className="text-[11px] text-slate-500 font-semibold">
              Kiosk Pre-Consultation Synthesis · Instant Clinician Scan
            </span>
          </div>
        </div>

        <button
          onClick={() => setActiveTab("5sec")}
          className="flex items-center gap-1 text-xs font-bold text-red-700 hover:text-red-900 transition cursor-pointer"
        >
          <span>View Full Snapshot</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 5-Second Rapid Data Grid (5 Key Columns) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-3 text-xs">
        
        {/* 1. Patient & Chief Complaint */}
        <div className="p-2.5 bg-white/90 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">1. Patient & Complaint</span>
          <strong className="text-slate-900 text-xs sm:text-sm font-black block truncate mt-0.5">
            {patient.name} ({patient.age || 35} Y / {patient.gender})
          </strong>
          <span className="text-red-700 font-bold text-[11px] block truncate">
            {patient.chiefComplaint || patient.aiSummary?.chiefComplaint}
          </span>
        </div>

        {/* 2. Triage & Red Flags */}
        <div className="p-2.5 bg-white/90 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">2. Triage & Red Flags</span>
          <div className="mt-0.5">
            {triage.alerts?.length > 0 ? (
              <span className="text-red-700 font-bold text-[11px] leading-tight block line-clamp-2">
                ⚠️ {triage.alerts[0]}
              </span>
            ) : (
              <span className="text-emerald-700 font-bold text-[11px]">
                ✅ Normal vital signs & low risk
              </span>
            )}
          </div>
        </div>

        {/* 3. Vitals Telemetry */}
        <div className="p-2.5 bg-white/90 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">3. Critical Vitals</span>
          <div className="mt-0.5 font-bold text-slate-800 text-xs">
            BP: <span className="text-red-700 font-black">{patient.vitals?.bp?.value || "128/84"}</span> · Pulse: {patient.vitals?.pulse?.value || "78"}
          </div>
          <span className="text-[10px] text-slate-500 font-medium">
            SpO2: {patient.vitals?.spo2?.value || "98%"} · Temp: {patient.vitals?.temperature?.value || "98.4 °F"}
          </span>
        </div>

        {/* 4. Medications & Allergies */}
        <div className="p-2.5 bg-white/90 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">4. Meds & Allergies</span>
          <div className="mt-0.5 text-[11px] font-bold text-slate-900 truncate">
            {patient.medications?.length > 0 ? patient.medications.map((m) => m.name).join(", ") : "None reported"}
          </div>
          <span className="text-[10px] text-slate-500 font-medium">
            Allergies: {patient.allergies?.length ? patient.allergies.join(", ") : "NKDA"}
          </span>
        </div>

        {/* 5. Recommended Action */}
        <div className="p-2.5 bg-white/90 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">5. Suggested Protocol</span>
          <span className="text-[11px] text-slate-800 font-bold block line-clamp-2 mt-0.5">
            {triage.suggestedAction || "Standard OPD Consultation"}
          </span>
        </div>

      </div>
    </div>
  );
}
