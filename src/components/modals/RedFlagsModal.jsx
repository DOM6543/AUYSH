import React from "react";
import { X, AlertTriangle, ShieldAlert, HeartCrack, Activity } from "lucide-react";
import { usePatient } from "../../context/PatientContext";

export default function RedFlagsModal() {
  const { isRedFlagsModalOpen, setIsRedFlagsModalOpen, patient } = usePatient();

  if (!isRedFlagsModalOpen) return null;

  const redFlags = [
    {
      title: "Chest Pain on Exertion",
      severity: "High",
      rationale: "Patient describes retrosternal pressure pain that worsens with physical activity, indicating possible myocardial ischemia / unstable angina.",
      recommendedAction: "Stat 12-lead ECG, cardiac enzymes (Troponin I/T), cardiology consultation."
    },
    {
      title: "Breathlessness (Dyspnea) on Exertion",
      severity: "High",
      rationale: "Co-occurring breathlessness with exertional chest pain suggests anginal equivalent or elevated left ventricular filling pressure.",
      recommendedAction: "Auscultate lungs for basal crepitations, monitor continuous SpO2."
    },
    {
      title: "Elevated Blood Pressure (140/90 mmHg)",
      severity: "Moderate-High",
      rationale: "Stage 2 Hypertension in a known hypertensive patient taking Amlodipine 5mg OD suggests inadequate pressure control or acute distress.",
      recommendedAction: "Repeat BP measurement in 15 mins in sitting position; consider antihypertensive regimen review."
    }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-red-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 bg-red-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5" />
            <div>
              <h3 className="font-bold text-sm">Abnormal Clinical Red Flags (3)</h3>
              <p className="text-[11px] text-red-100">Patient: Arun Kumar | Triage Tier: Level 2 Urgent</p>
            </div>
          </div>
          <button
            onClick={() => setIsRedFlagsModalOpen(false)}
            className="p-1 text-red-200 hover:text-white rounded-lg transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-3.5 text-xs">
          {redFlags.map((flag, idx) => (
            <div key={idx} className="bg-red-50/60 border border-red-200 rounded-xl p-3.5 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-red-950 text-xs flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                  {flag.title}
                </span>
                <span className="bg-red-200/80 text-red-900 px-2 py-0.5 rounded text-[10px] font-bold">
                  {flag.severity}
                </span>
              </div>
              <p className="text-slate-700 leading-relaxed">
                {flag.rationale}
              </p>
              <div className="pt-1.5 border-t border-red-100 text-[11px] text-red-900 font-medium">
                <strong className="text-red-950">Suggested Protocol:</strong> {flag.recommendedAction}
              </div>
            </div>
          ))}
        </div>

        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={() => setIsRedFlagsModalOpen(false)}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition cursor-pointer"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
}
