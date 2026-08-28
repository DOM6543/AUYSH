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
  RotateCcw
} from "lucide-react";
import { usePatient } from "../../context/PatientContext";

export default function PatientHeader() {
  const {
    patient,
    handleAcceptAndSave,
    setIsEditModalOpen,
    setIsRejectModalOpen,
    setActiveNav,
    showToast
  } = usePatient();

  const [isMoreActionsOpen, setIsMoreActionsOpen] = useState(false);
  const dropdownRef = useRef(null);

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
    const textToSpeak = `Patient ${patient.name}, ${patient.age || 35} years old ${patient.gender}. Chief complaint: ${patient.aiSummary?.chiefComplaint || 'None'}. Blood pressure ${patient.vitals?.bp?.value || 'unknown'}. Recorded in Firebase.`;
    const speech = new SpeechSynthesisUtterance(textToSpeak);
    speech.rate = 1.0;
    window.speechSynthesis.speak(speech);
    showToast("Playing AI Audio Summary playback...", "info");
  };

  const reviewStatus = patient.doctorReview?.status || (patient.status === "Reviewed" ? "accepted" : "draft");

  return (
    <div className="space-y-3">
      {/* Back to Patients link */}
      <div>
        <button
          onClick={() => setActiveNav("patients")}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-800 transition-colors group cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Patients Directory</span>
        </button>
      </div>

      {/* Main Patient Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs">
        {/* Left Side: Avatar + Details + Badges */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={patient.avatarUrl}
              alt={patient.name}
              className="w-14 h-14 rounded-full object-cover border-2 border-emerald-500/30 shadow-xs"
            />
            {patient.verified && (
              <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-600 text-white rounded-full flex items-center justify-center ring-2 ring-white">
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              </span>
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                {patient.name}
              </h1>
              {patient.verified && (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-100" />
              )}
              <span className="text-xs text-slate-500 font-medium ml-1">
                {patient.age ? `${patient.age} Y` : "Age N/A"} · {patient.gender || "Gender N/A"} · ABHA: {patient.abhaNumber || "91-XXXX-XXXX-1234"}
              </span>
            </div>

            <div className="flex items-center gap-2 pt-0.5 flex-wrap">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                OPD ID: {patient.opdId || patient.id}
              </span>
              {patient.isNewPatient && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  New Patient
                </span>
              )}
              
              {/* Review Status Badges */}
              {reviewStatus === "accepted" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <Lock className="w-3 h-3 text-emerald-700" />
                  Verified & Signed
                </span>
              )}
              {reviewStatus === "edited" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-800 border border-blue-200">
                  <Edit3 className="w-3 h-3 text-blue-600" />
                  Physician Modified
                </span>
              )}
              {reviewStatus === "rejected" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-red-50 text-red-800 border border-red-200">
                  <XCircle className="w-3 h-3 text-red-600" />
                  Rejected / Re-Intake
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Action Buttons */}
        <div className="flex items-center gap-2.5 self-end lg:self-center flex-wrap">
          {/* Edit Summary Button */}
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-emerald-700 text-emerald-800 hover:bg-emerald-50/80 text-xs font-semibold transition cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5 text-emerald-700" />
            <span>Edit Summary</span>
          </button>

          {/* Reject Button */}
          <button
            onClick={() => setIsRejectModalOpen(true)}
            disabled={reviewStatus === "rejected"}
            className="flex items-center gap-1 px-3 py-2 rounded-lg border border-red-200 text-red-700 hover:bg-red-50 text-xs font-semibold transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-red-600" />
            <span>Reject</span>
          </button>

          {/* Accept & Save Button */}
          <button
            onClick={() => handleAcceptAndSave()}
            disabled={reviewStatus === "accepted"}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer shadow-sm ${
              reviewStatus === "accepted"
                ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                : "bg-[#0b5344] hover:bg-[#084236] text-white"
            }`}
          >
            <Check className="w-3.5 h-3.5" />
            <span>{reviewStatus === "accepted" ? "Accepted & Locked" : "Accept & Save"}</span>
          </button>

          {/* More Actions Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsMoreActionsOpen(!isMoreActionsOpen)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium transition cursor-pointer"
            >
              <span>More Actions</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            </button>

            {isMoreActionsOpen && (
              <div className="absolute right-0 mt-1.5 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-40 text-xs text-slate-700 animate-in fade-in zoom-in-95">
                <button
                  onClick={() => {
                    handlePrint();
                    setIsMoreActionsOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-slate-50 text-left cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-slate-500" />
                  <span>Print Summary</span>
                </button>
                <button
                  onClick={() => {
                    showToast("Exporting clinical report as encrypted PDF...", "info");
                    setIsMoreActionsOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-slate-50 text-left cursor-pointer"
                >
                  <FileDown className="w-4 h-4 text-slate-500" />
                  <span>Export ABHA PDF</span>
                </button>
                <button
                  onClick={() => {
                    handleAudioPlayback();
                    setIsMoreActionsOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-slate-50 text-left cursor-pointer"
                >
                  <Volume2 className="w-4 h-4 text-emerald-600" />
                  <span>Play AI Audio Intake</span>
                </button>
                <div className="my-1 border-t border-slate-100" />
                <button
                  onClick={() => {
                    showToast("Referral order generated for AIIMS Cardiology Department.", "success");
                    setIsMoreActionsOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-slate-50 text-left text-emerald-700 font-medium cursor-pointer"
                >
                  <Stethoscope className="w-4 h-4 text-emerald-600" />
                  <span>Refer to Specialist</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
