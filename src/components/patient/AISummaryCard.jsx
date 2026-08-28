import React from "react";
import { Edit2, AlertCircle, Sparkles } from "lucide-react";
import { usePatient } from "../../context/PatientContext";
import HistoryTabs from "./HistoryTabs";

export default function AISummaryCard() {
  const { patient, setIsEditModalOpen, setIsRedFlagsModalOpen } = usePatient();
  const { aiSummary } = patient;

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-5 flex flex-col justify-between">
      <div>
        {/* Card Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900">
              AI Generated Summary (Draft)
            </h3>
          </div>
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-700 transition cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>
        </div>

        {/* Top Grid: Left (CC, HPI, Past History, Meds, Allergies) & Right (Red Flags & Suggestions) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column (7 cols) */}
          <div className="lg:col-span-7 space-y-4 text-xs">
            {/* Chief Complaint (CC) */}
            <div>
              <h4 className="font-bold text-slate-800 text-xs mb-0.5">
                Chief Complaint (CC)
              </h4>
              <p className="text-slate-700 font-medium">
                {aiSummary.chiefComplaint}
              </p>
            </div>

            {/* History of Present Illness (HPI) */}
            <div>
              <h4 className="font-bold text-slate-800 text-xs mb-1">
                History of Present Illness (HPI)
              </h4>
              <ul className="space-y-1 text-slate-600">
                {aiSummary.hpi.map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Past History */}
            <div>
              <h4 className="font-bold text-slate-800 text-xs mb-0.5">
                Past History
              </h4>
              <ul className="space-y-1 text-slate-600">
                {aiSummary.pastHistory.map((item, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Medications */}
            <div>
              <h4 className="font-bold text-slate-800 text-xs mb-0.5">
                Medications
              </h4>
              <div className="text-slate-700">
                {aiSummary.medications.map((m, idx) => (
                  <span key={idx} className="font-medium">
                    {m.name} {m.dosage} {m.frequency}
                  </span>
                ))}
              </div>
            </div>

            {/* Allergies */}
            <div>
              <h4 className="font-bold text-slate-800 text-xs mb-0.5">
                Allergies
              </h4>
              <p className="text-slate-600">
                {aiSummary.allergies.join(", ")}
              </p>
            </div>
          </div>

          {/* Right Column: Inset Cards (5 cols) */}
          <div className="lg:col-span-5 space-y-3 flex flex-col">
            {/* Abnormal / Red Flags Inset Box */}
            <div className="bg-red-50/60 border border-red-100 rounded-xl p-3.5">
              <h4 className="font-bold text-red-900 text-xs mb-2">
                Abnormal / Red Flags
              </h4>
              <ul className="space-y-1.5 text-xs text-red-800 mb-3">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                  <span>Chest pain on exertion</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                  <span>Breathlessness</span>
                </li>
              </ul>
              <button
                onClick={() => setIsRedFlagsModalOpen(true)}
                className="w-full py-1.5 px-3 bg-white hover:bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer text-center"
              >
                View All (3)
              </button>
            </div>

            {/* AI Suggestions (Not Diagnosis) Inset Box */}
            <div className="bg-emerald-50/40 border border-emerald-100/80 rounded-xl p-3.5 flex-1 flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-slate-800 text-xs mb-2">
                  AI Suggestions (Not Diagnosis)
                </h4>
                <ul className="space-y-1 text-xs text-slate-700 mb-3">
                  {aiSummary.suggestions.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="text-[10px] text-slate-400 italic pt-2 border-t border-emerald-100/60">
                Physician verification required.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Embedded Sub-Tabs (History Summary, AYUSH History, Vitals, Examination, Lifestyle) */}
      <HistoryTabs />
    </div>
  );
}
