import React from "react";
import { ShieldCheck } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-8 pt-4 pb-6 border-t border-slate-200 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3 px-1">
      <div className="flex items-center gap-2">
        <span>MediKiosk © 2025 | AI-Powered Patient Intake & Clinical History Platform</span>
      </div>
      <div className="flex items-center gap-4 font-medium text-slate-600">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600 inline" />
          Secure
        </span>
        <span>·</span>
        <span>Private</span>
        <span>·</span>
        <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
          ABHA Compliant
        </span>
      </div>
    </footer>
  );
}
