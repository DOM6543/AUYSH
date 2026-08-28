import React from "react";
import { RotateCw, Heart, Activity, Droplets, Thermometer } from "lucide-react";
import { usePatient } from "../../context/PatientContext";

export default function VitalsCard() {
  const { patient, refreshVitals, setActiveTab } = usePatient();
  const { vitals } = patient;

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-4 flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900">
            Vitals (Kiosk)
          </h3>
          <button
            onClick={refreshVitals}
            className="text-slate-400 hover:text-emerald-700 p-1 rounded-md transition cursor-pointer hover:rotate-180 duration-300"
            title="Sync telemetry from Kiosk sensor"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>

        {/* 2x2 Metric Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* BP Card */}
          <div className="bg-red-50/40 border border-red-100 rounded-xl p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100/70 text-red-600 flex items-center justify-center shrink-0">
              <Heart className="w-5 h-5 fill-red-200" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-semibold text-slate-500">
                {vitals.bp.label}
              </div>
              <div className="text-base font-bold text-slate-900 leading-tight">
                {vitals.bp.value}
              </div>
              <div className="text-[10px] text-slate-400">
                {vitals.bp.unit}
              </div>
            </div>
          </div>

          {/* Pulse Card */}
          <div className="bg-emerald-50/40 border border-emerald-100 rounded-xl p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100/70 text-emerald-600 flex items-center justify-center shrink-0">
              <Activity className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-semibold text-slate-500">
                {vitals.pulse.label}
              </div>
              <div className="text-base font-bold text-slate-900 leading-tight">
                {vitals.pulse.value}
              </div>
              <div className="text-[10px] text-slate-400">
                {vitals.pulse.unit}
              </div>
            </div>
          </div>

          {/* SpO2 Card */}
          <div className="bg-blue-50/40 border border-blue-100 rounded-xl p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100/70 text-blue-600 flex items-center justify-center shrink-0">
              <Droplets className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-semibold text-slate-500">
                {vitals.spo2.label}
              </div>
              <div className="text-base font-bold text-slate-900 leading-tight">
                {vitals.spo2.value}
              </div>
              <div className="text-[10px] text-slate-400">
                {vitals.spo2.unit}
              </div>
            </div>
          </div>

          {/* Temperature Card */}
          <div className="bg-orange-50/40 border border-orange-100 rounded-xl p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100/70 text-orange-600 flex items-center justify-center shrink-0">
              <Thermometer className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-semibold text-slate-500">
                {vitals.temperature.label}
              </div>
              <div className="text-base font-bold text-slate-900 leading-tight">
                {vitals.temperature.value}
              </div>
              <div className="text-[10px] text-slate-400">
                {vitals.temperature.unit}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Link */}
      <div className="pt-4 text-center">
        <button
          onClick={() => setActiveTab("vitals")}
          className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 transition cursor-pointer"
        >
          View All Vitals
        </button>
      </div>
    </div>
  );
}
