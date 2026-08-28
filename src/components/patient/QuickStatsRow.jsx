import React from "react";
import { User, Calendar, Briefcase, Flag, Clock } from "lucide-react";
import { usePatient } from "../../context/PatientContext";

export default function QuickStatsRow() {
  const { patient, setIsRedFlagsModalOpen } = usePatient();
  const { stats } = patient;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
      {/* 1. Chief Complaint */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-xs flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
          <User className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <div className="text-[11px] font-medium text-slate-500 truncate">
            {stats.chiefComplaint.title}
          </div>
          <div className="text-sm font-bold text-slate-900 truncate">
            {stats.chiefComplaint.value}
          </div>
          <div className="text-[11px] text-slate-400">
            {stats.chiefComplaint.subtitle}
          </div>
        </div>
      </div>

      {/* 2. Kiosk Session */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-xs flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
          <Calendar className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <div className="text-[11px] font-medium text-slate-500 truncate">
            {stats.kioskSession.title}
          </div>
          <div className="text-sm font-bold text-slate-900 truncate">
            {stats.kioskSession.value}
          </div>
          <div className="text-[11px] text-slate-400">
            {stats.kioskSession.subtitle}
          </div>
        </div>
      </div>

      {/* 3. Consultation Type */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-xs flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-cyan-50 border border-cyan-100 flex items-center justify-center text-cyan-600 shrink-0">
          <Briefcase className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <div className="text-[11px] font-medium text-slate-500 truncate">
            {stats.consultationType.title}
          </div>
          <div className="text-sm font-bold text-slate-900 truncate">
            {stats.consultationType.value}
          </div>
          <div className="text-[11px] text-slate-400">
            {stats.consultationType.subtitle}
          </div>
        </div>
      </div>

      {/* 4. Red Flags */}
      <div
        onClick={() => setIsRedFlagsModalOpen(true)}
        className="bg-white p-3.5 rounded-xl border border-red-100 hover:border-red-300 shadow-xs flex items-center gap-3 cursor-pointer transition-all group"
      >
        <div className="w-11 h-11 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600 shrink-0 group-hover:scale-105 transition-transform">
          <Flag className="w-5 h-5 fill-red-100" />
        </div>
        <div className="min-w-0">
          <div className="text-[11px] font-medium text-slate-500 truncate">
            {stats.redFlags.title}
          </div>
          <div className="text-sm font-bold text-red-600 truncate flex items-center gap-1">
            {stats.redFlags.value}
          </div>
          <div className="text-[11px] text-red-500 font-medium">
            {stats.redFlags.subtitle}
          </div>
        </div>
      </div>

      {/* 5. Last Updated */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-xs flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
          <Clock className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <div className="text-[11px] font-medium text-slate-500 truncate">
            {stats.lastUpdated.title}
          </div>
          <div className="text-sm font-bold text-slate-900 truncate">
            {stats.lastUpdated.value}
          </div>
          <div className="text-[11px] text-slate-400">
            {stats.lastUpdated.subtitle}
          </div>
        </div>
      </div>
    </div>
  );
}
