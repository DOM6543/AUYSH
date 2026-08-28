import React from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { usePatient } from "../../context/PatientContext";

export default function Toast() {
  const { toasts } = usePatient();

  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-xs font-semibold animate-in slide-in-from-bottom-5 duration-200 ${
            toast.type === "success"
              ? "bg-slate-900 text-white border-slate-800"
              : toast.type === "error"
              ? "bg-red-600 text-white border-red-700"
              : "bg-emerald-800 text-white border-emerald-900"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : toast.type === "error" ? (
            <AlertCircle className="w-4 h-4 text-white shrink-0" />
          ) : (
            <Info className="w-4 h-4 text-emerald-300 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  );
}
