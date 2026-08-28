import React from "react";
import { MonitorCheck, Wifi, Activity, CheckCircle2 } from "lucide-react";

export default function KioskSessionsView() {
  const kiosks = [
    { id: "K-01", location: "Main Hospital Lobby (Gate 1)", status: "Active", patient: "Priya Sundaram", intakeProgress: "75% Complete", lastPing: "Just now" },
    { id: "K-02", location: "Cardiology Waiting Lounge", status: "Active", patient: "Rajesh Varma", intakeProgress: "100% Done", lastPing: "1 min ago" },
    { id: "K-03", location: "Ayurveda OPD Wing", status: "Active", patient: "Arun Kumar", intakeProgress: "Completed (Ready for Review)", lastPing: "Just now" },
    { id: "K-04", location: "Emergency Reception", status: "Standby", patient: "None", intakeProgress: "Idle", lastPing: "Just now" },
  ];

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <MonitorCheck className="w-5 h-5 text-emerald-700" />
          MediKiosk Hardware & Telemetry Grid
        </h2>
        <p className="text-xs text-slate-500">Live health intake kiosks connected across hospital campus</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {kiosks.map((k) => (
          <div key={k.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                  {k.id}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">{k.location}</h4>
                  <span className="text-[11px] text-slate-400">Ping: {k.lastPing}</span>
                </div>
              </div>
              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                <Wifi className="w-3 h-3" />
                {k.status}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Active Patient:</span>
                <span className="font-bold text-slate-800">{k.patient}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Session Status:</span>
                <span className="font-semibold text-emerald-800">{k.intakeProgress}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
