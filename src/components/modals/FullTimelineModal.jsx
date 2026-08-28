import React from "react";
import { X, CheckCircle2, Clock, Calendar, ShieldCheck } from "lucide-react";
import { usePatient } from "../../context/PatientContext";

export default function FullTimelineModal() {
  const { isTimelineModalOpen, setIsTimelineModalOpen, patient } = usePatient();

  if (!isTimelineModalOpen) return null;

  const fullLogs = [
    { time: "10:12 AM", event: "Patient Arrived at Kiosk K-03", actor: "Arun Kumar", desc: "Aadhaar e-KYC authentication successful." },
    { time: "10:15 AM", event: "Vitals Telemetry Captured", actor: "MediKiosk Telemetry Unit", desc: "BP recorded 140/90 mmHg, Pulse 98 bpm, SpO2 98%, Temp 98.6°F." },
    { time: "10:18 AM", event: "Voice Intake & CC Recorded", actor: "MediKiosk Multilingual AI", desc: "Audio intake in Tamil transcribed and translated to English." },
    { time: "10:20 AM", event: "Documents Scanned", actor: "Kiosk Document Feed", desc: "Prescription_26052025.pdf ingested & OCR validated." },
    { time: "10:22 AM", event: "Lab Report Uploaded", actor: "Kiosk Document Feed", desc: "Lab_Report_26052025.jpg OCR extracted 5 lipid biomarkers." },
    { time: "10:25 AM", event: "Discharge Summary Uploaded", actor: "ABDM Health Locker", desc: "Discharge_Summary_2024.pdf pulled via ABHA gateway." },
    { time: "10:35 AM", event: "AI Clinical Entities Synthesized", actor: "MediKiosk Clinical LLM", desc: "Drafted CC, HPI, past history, ROS, and flagged high risk." },
    { time: "10:40 AM", event: "Routed to Physician Queue", actor: "OPD Triage Controller", desc: "Assigned to Dr. Ramesh Kumar (AIIMS Ayurveda OPD)." }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Clock className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-bold text-sm">Full Clinical Audit Trail</h3>
              <p className="text-[11px] text-slate-400">Session ID: MK-2025-05-26-0001</p>
            </div>
          </div>
          <button
            onClick={() => setIsTimelineModalOpen(false)}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 max-h-96 overflow-y-auto space-y-4 text-xs">
          <div className="relative pl-6 space-y-4">
            <div className="absolute left-[9px] top-3 bottom-3 w-0.5 bg-slate-200" />
            {fullLogs.map((log, i) => (
              <div key={i} className="relative group">
                <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-emerald-600 ring-2 ring-emerald-100 flex items-center justify-center text-white">
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{log.event}</span>
                    <span className="text-[10px] text-slate-400">{log.time}</span>
                  </div>
                  <div className="text-[11px] text-emerald-800 font-medium">By: {log.actor}</div>
                  <p className="text-[11px] text-slate-600 mt-0.5">{log.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={() => setIsTimelineModalOpen(false)}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition cursor-pointer"
          >
            Close Audit Trail
          </button>
        </div>
      </div>
    </div>
  );
}
