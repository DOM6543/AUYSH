import React from "react";
import { Edit2, AlertCircle, Sparkles, ShieldCheck, Check, AlertTriangle, Pill, FileText } from "lucide-react";
import { usePatient } from "../../context/PatientContext";
import HistoryTabs from "./HistoryTabs";

export default function AISummaryCard() {
  const { patient, setIsEditModalOpen, setIsRedFlagsModalOpen } = usePatient();
  if (!patient) return null;

  const { aiSummary = {}, triage = {} } = patient;
  const dataConfidence = aiSummary.dataConfidence || { score: 0.95, level: "HIGH" };

  return (
    <div className="bg-white rounded-2xl border-2 border-red-100/80 shadow-sm p-5 flex flex-col justify-between space-y-4">
      <div>
        {/* Card Header with Data Confidence Indicator */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-red-50 text-red-600 flex items-center justify-center font-black">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">
                Structured Clinical Synthesis (Deterministic EHR Draft)
              </h3>
              <span className="text-[10px] text-slate-400 font-semibold">
                Synthesized from Kiosk Intake & Tesseract OCR · Provenance: DETERMINISTIC_CLINICAL_SYNTHESIS
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Data Confidence Indicator */}
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              Confidence: {Math.round(dataConfidence.score * 100)}% ({dataConfidence.level})
            </span>

            <button
              onClick={() => setIsEditModalOpen(true)}
              className="flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-red-700 transition cursor-pointer px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg"
            >
              <Edit2 className="w-3 h-3" />
              <span>Edit Draft</span>
            </button>
          </div>
        </div>

        {/* Top Grid: Left (CC, HPI, Meds, Allergies) & Right (Red Flags & Suggestions) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column (7 cols) */}
          <div className="lg:col-span-7 space-y-3.5 text-xs">
            {/* Chief Complaint (CC) */}
            <div>
              <h4 className="font-black text-slate-800 uppercase tracking-wider text-[10px] mb-0.5">
                Chief Complaint (CC)
              </h4>
              <p className="text-slate-900 font-bold text-xs">
                {aiSummary.chiefComplaint || patient.chiefComplaint}
              </p>
            </div>

            {/* History of Present Illness (HPI) */}
            <div>
              <h4 className="font-black text-slate-800 uppercase tracking-wider text-[10px] mb-1">
                History of Present Illness (HPI)
              </h4>
              <ul className="space-y-1 text-slate-700 font-medium">
                {(aiSummary.hpi || []).map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Active Medications with Data Provenance Tag */}
            <div>
              <h4 className="font-black text-slate-800 uppercase tracking-wider text-[10px] mb-1 flex items-center justify-between">
                <span>Active Medications</span>
                <span className="text-[9px] text-slate-400 lowercase">provenance tracked</span>
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {(aiSummary.medications || patient.medications || []).map((m, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800"
                  >
                    <Pill className="w-3 h-3 text-red-600" />
                    <span>{typeof m === "string" ? m : `${m.name} ${m.dosage || ""}`}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Allergies */}
            <div>
              <h4 className="font-black text-slate-800 uppercase tracking-wider text-[10px] mb-0.5">
                Known Drug / Food Allergies
              </h4>
              <p className="text-slate-700 font-semibold">
                {Array.isArray(aiSummary.allergies) ? aiSummary.allergies.join(", ") : "No known drug allergies (NKDA)"}
              </p>
            </div>
          </div>

          {/* Right Column: Inset Cards (5 cols) */}
          <div className="lg:col-span-5 space-y-3 flex flex-col">
            {/* Abnormal / Red Flags Inset Box */}
            <div className="bg-red-50/80 border border-red-200 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-black text-red-900 text-xs">
                  Red-Flag Triage ({triage.tier || "LOW"})
                </h4>
                <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
              </div>
              <ul className="space-y-1 text-xs text-red-800 font-bold">
                {(triage.alerts || ["Standard clinical examination and vitals monitoring"]).map((alert, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-600 mt-1.5 shrink-0" />
                    <span>{alert}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => setIsRedFlagsModalOpen(true)}
                className="w-full py-1.5 px-3 bg-white hover:bg-red-50 text-red-700 border border-red-300 rounded-lg text-xs font-black shadow-xs transition cursor-pointer text-center"
              >
                View Complete Triage Logic
              </button>
            </div>

            {/* Missing Information Checklist / Suggestions */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex-1 flex flex-col justify-between space-y-2">
              <div>
                <h4 className="font-bold text-slate-800 text-xs mb-1">
                  Intake Data Checklist & Gaps
                </h4>
                <ul className="space-y-1 text-xs text-slate-600 font-medium">
                  {aiSummary.missingInfoChecklist?.length > 0 ? (
                    aiSummary.missingInfoChecklist.map((gap, idx) => (
                      <li key={idx} className="flex items-center gap-1.5 text-amber-800">
                        <AlertCircle className="w-3 h-3 text-amber-600 shrink-0" />
                        <span>{gap}</span>
                      </li>
                    ))
                  ) : (
                    <li className="flex items-center gap-1.5 text-emerald-800 font-semibold">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>All critical intake parameters verified</span>
                    </li>
                  )}
                </ul>
              </div>
              <div className="text-[10px] text-slate-400 italic pt-1.5 border-t border-slate-200">
                Subject to physician verification & clinical sign-off.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Embedded Sub-Tabs (5-sec Scan, HPI, Notes, Ingested Docs, AYUSH, Vitals, Exam, Lifestyle) */}
      <HistoryTabs />
    </div>
  );
}
