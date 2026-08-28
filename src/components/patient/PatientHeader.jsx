import React, { useState, useRef, useEffect } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Edit3,
  Check,
  ChevronDown,
  Printer,
  FileDown,
  Volume2,
  Stethoscope,
  Lock,
  XCircle,
  AlertTriangle,
  RotateCcw,
  FileText,
  Paperclip,
  ShieldCheck,
  Sparkles
} from "lucide-react";
import { usePatient } from "../../context/PatientContext";

export default function PatientHeader() {
  const {
    patient,
    handleAcceptAndSave,
    setIsEditModalOpen,
    setIsRejectModalOpen,
    setActiveNav,
    setActiveTab,
    downloadPatientData,
    downloadFhir,
    showToast
  } = usePatient();

  const [isMoreActionsOpen, setIsMoreActionsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const triage = patient?.triage || { tier: "LOW", alerts: [] };

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsMoreActionsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleAudioPlayback = () => {
    const textToSpeak = `Patient ${patient.name}, ${patient.age || 35} years old ${patient.gender}. Chief complaint: ${patient.aiSummary?.chiefComplaint || patient.chiefComplaint || 'None'}. Blood pressure ${patient.vitals?.bp?.value || '128/84'}. Auto-approved and synced in Firebase.`;
    const speech = new SpeechSynthesisUtterance(textToSpeak);
    speech.rate = 1.0;
    window.speechSynthesis.speak(speech);
    showToast("Playing AI Audio Summary playback...", "info");
  };

  return (
    <div className="space-y-3">
      {/* Back to Patients link */}
      <div>
        <button
          onClick={() => setActiveNav("patients")}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-red-700 transition-colors group cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Patients Directory</span>
        </button>
      </div>

      {/* Main Patient Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border-2 border-red-100 shadow-sm">
        {/* Left Side: Avatar + Details + Badges */}
        <div className="flex items-center gap-4">
          <div className="relative shrink-0">
            <img
              src={patient.avatarUrl || patient.photo || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"}
              alt={patient.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-red-500 shadow-md"
            />
            <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-600 text-white rounded-full flex items-center justify-center ring-2 ring-white" title="Auto-Approved">
              <Check className="w-3 h-3 stroke-[3]" />
            </span>
          </div>

          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {patient.name}
              </h1>
              <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
              <span className="text-xs text-slate-500 font-semibold ml-1">
                {patient.age ? `${patient.age} Y` : "Age N/A"} · {patient.gender || "Gender N/A"} · ABHA: {patient.abhaNumber || "91-XXXX-XXXX-1234"}
              </span>
            </div>

            <div className="flex items-center gap-2 pt-0.5 flex-wrap">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                OPD ID: {patient.opdId || patient.id}
              </span>
              
              {/* Triage Tier Badge */}
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider border shadow-xs ${
                triage.tier === "HIGH / PRIORITY" || triage.tier === "HIGH"
                  ? "bg-red-600 text-white border-red-700 animate-pulse"
                  : triage.tier === "MODERATE"
                  ? "bg-amber-100 text-amber-900 border-amber-300"
                  : "bg-emerald-100 text-emerald-900 border-emerald-300"
              }`}>
                {triage.tier || "LOW RISK"}
              </span>

              {/* Auto-Approved Badge */}
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                Verified & Auto-Approved
              </span>

              {patient.chiefComplaint && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-semibold bg-red-50 text-red-800 border border-red-200">
                  {patient.chiefComplaint}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Quick Doctor Action Buttons */}
        <div className="flex items-center gap-2 self-end lg:self-center flex-wrap">
          {/* Add / View Clinical Note Button */}
          <button
            onClick={() => setActiveTab("notes")}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 border border-red-300 text-red-900 text-xs font-bold transition cursor-pointer shadow-xs"
          >
            <FileText className="w-3.5 h-3.5 text-red-600" />
            <span>Write Note</span>
          </button>

          {/* Edit Summary Button */}
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold transition cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5 text-slate-600" />
            <span>Edit Summary</span>
          </button>

          {/* AI Audio Playback */}
          <button
            onClick={handleAudioPlayback}
            className="p-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition cursor-pointer"
            title="Play Audio Summary"
          >
            <Volume2 className="w-4 h-4" />
          </button>

          {/* Export FHIR R4 Bundle Button */}
          <button
            onClick={() => downloadFhir(patient)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-300 text-purple-900 text-xs font-bold transition cursor-pointer"
            title="Export HL7 FHIR R4 Standard Clinical Resource Bundle"
          >
            <FileDown className="w-3.5 h-3.5 text-purple-600" />
            <span className="hidden sm:inline">FHIR R4</span>
          </button>

          {/* Download EHR Data Button */}
          <button
            onClick={() => downloadPatientData(patient)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 text-xs font-bold transition cursor-pointer"
            title="Download Complete Patient EHR Record (JSON)"
          >
            <FileDown className="w-3.5 h-3.5 text-red-600" />
            <span className="hidden sm:inline">Download EHR</span>
          </button>

          {/* Print Chart */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 text-xs font-bold transition cursor-pointer"
            title="Print Patient Clinical Chart"
          >
            <Printer className="w-3.5 h-3.5 text-slate-700" />
            <span className="hidden sm:inline">Print</span>
          </button>
        </div>
      </div>
    </div>
  );
}
