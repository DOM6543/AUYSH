import React from "react";
import { BellRing, AlertTriangle, Info, CheckCircle2 } from "lucide-react";
import { usePatient } from "../../context/PatientContext";

export default function AlertsView() {
  const { notifications, markAllNotificationsRead } = usePatient();

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Clinical Alerts & Hardware Notifications</h2>
          <p className="text-xs text-slate-500">Real-time alerts triggered by AI triage algorithms and kiosk sensors</p>
        </div>
        <button
          onClick={markAllNotificationsRead}
          className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 px-3 py-1.5 bg-emerald-50 rounded-lg transition cursor-pointer"
        >
          Mark all as read
        </button>
      </div>

      <div className="space-y-3">
        {(notifications || []).map((n) => (
          <div
            key={n.id}
            className={`p-4 rounded-xl border text-xs flex items-start gap-3 bg-white shadow-xs ${
              n.type === "alert" ? "border-red-200" : "border-slate-200"
            }`}
          >
            {n.type === "alert" ? (
              <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <Info className="w-4 h-4" />
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 text-sm">{n.title}</h4>
                <span className="text-[11px] text-slate-400">{n.time}</span>
              </div>
              <p className="text-slate-600 mt-1">{n.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
