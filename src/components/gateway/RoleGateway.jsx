import React from "react";
import { Stethoscope, User, Plus, ArrowRight, ShieldCheck } from "lucide-react";
import { usePatient } from "../../context/PatientContext";

export default function RoleGateway({ onSelectRole }) {
  const { t } = usePatient();

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between p-6 sm:p-12 font-sans selection:bg-transparent">
      {/* Header */}
      <header className="max-w-5xl w-full mx-auto flex items-center justify-between py-4 border-b border-slate-800">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-red-600 text-white flex items-center justify-center font-black shadow-lg shadow-red-600/20">
            <Plus className="w-7 h-7 stroke-[3.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-xl tracking-tight text-white">MediKiosk</span>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-[10px] font-black text-slate-300 uppercase tracking-wider">
                OPD Terminal
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              AIIMS Integrated Healthcare Network
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>Realtime System Online</span>
        </div>
      </header>

      {/* Main Choice Section */}
      <main className="max-w-4xl w-full mx-auto py-12 space-y-10">
        <div className="text-center space-y-3">
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Select Your Application Station
          </h1>
          <p className="text-sm sm:text-base text-slate-400 max-w-lg mx-auto">
            Please choose the appropriate interface for patient self-service check-in or physician clinical chart evaluation.
          </p>
        </div>

        {/* 2 Big Station Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch pt-2">
          
          {/* STATION 1: PATIENT KIOSK */}
          <button
            onClick={() => onSelectRole("patient")}
            className="p-8 sm:p-10 bg-slate-800 hover:bg-slate-750 border-3 border-slate-700 hover:border-red-500 rounded-3xl text-left flex flex-col justify-between gap-8 cursor-pointer transition shadow-xl group active:scale-98"
          >
            <div className="space-y-6">
              <div className="w-20 h-20 rounded-3xl bg-red-600/20 border border-red-500/30 text-red-500 flex items-center justify-center group-hover:scale-105 group-hover:bg-red-600 group-hover:text-white transition">
                <User className="w-10 h-10 stroke-[2.5]" />
              </div>

              <div className="space-y-2">
                <div className="text-xs font-black text-red-400 uppercase tracking-wider">
                  Self-Service Check-in
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white group-hover:text-red-400 transition">
                  Patient Kiosk Station
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Touchscreen-first, voice-guided intake in 8 Indian regional languages. Choose Regular or Ayurveda doctor and report symptoms.
                </p>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between text-sm font-black text-red-400 border-t border-slate-700/80">
              <span>Open Patient Station</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* STATION 2: DOCTOR WORKSTATION */}
          <button
            onClick={() => onSelectRole("doctor")}
            className="p-8 sm:p-10 bg-slate-800 hover:bg-slate-750 border-3 border-slate-700 hover:border-slate-400 rounded-3xl text-left flex flex-col justify-between gap-8 cursor-pointer transition shadow-xl group active:scale-98"
          >
            <div className="space-y-6">
              <div className="w-20 h-20 rounded-3xl bg-slate-700/50 border border-slate-600 text-slate-300 flex items-center justify-center group-hover:scale-105 group-hover:bg-slate-100 group-hover:text-slate-900 transition">
                <Stethoscope className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <div className="text-xs font-black text-slate-400 uppercase tracking-wider">
                  Physician & Clinician Portal
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white group-hover:text-slate-200 transition">
                  Doctor Workstation
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Information-dense clinical dashboard with real-time patient queue, 5-second summary, triage alerts, AYUSH assessment, and FHIR export.
                </p>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between text-sm font-black text-slate-300 border-t border-slate-700/80">
              <span>Open Doctor Workstation</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-5xl w-full mx-auto py-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
        <div className="flex items-center gap-2 font-medium">
          <ShieldCheck className="w-4 h-4 text-slate-400" />
          <span>MediKiosk Healthcare Platform · ABHA / ABDM Compliant</span>
        </div>
        <div>
          Realtime Database Synced
        </div>
      </footer>
    </div>
  );
}
