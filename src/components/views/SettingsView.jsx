import React from "react";
import { Settings, Shield, Globe, Bell, Sliders } from "lucide-react";
import { usePatient } from "../../context/PatientContext";

export default function SettingsView() {
  const { clinic, setClinic, showToast } = usePatient();

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Settings className="w-5 h-5 text-emerald-700" />
          Clinical Platform Preferences
        </h2>
        <p className="text-xs text-slate-500">Configure ABHA gateway credentials, AI thresholds, and active hospital unit</p>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs max-w-2xl space-y-4 text-xs">
        <div>
          <label className="font-bold text-slate-800 block mb-1">Active Department / OPD</label>
          <select
            value={clinic}
            onChange={(e) => {
              setClinic(e.target.value);
              showToast(`Department changed to ${e.target.value}`, "info");
            }}
            className="w-full p-2 border border-slate-300 rounded-lg text-xs"
          >
            <option value="AIIMS Ayurveda OPD">AIIMS Ayurveda OPD</option>
            <option value="AIIMS Cardiology OPD">AIIMS Cardiology OPD</option>
            <option value="Apollo Hospital - General Medicine">Apollo Hospital - General Medicine</option>
            <option value="Fortis Healthcare - Urgent Care">Fortis Healthcare - Urgent Care</option>
          </select>
        </div>

        <div className="pt-2 border-t border-slate-100">
          <label className="font-bold text-slate-800 block mb-1">AI Triage Risk Sensitivity</label>
          <select className="w-full p-2 border border-slate-300 rounded-lg text-xs">
            <option>High (Strict Cardiac & Sepsis Flags - Recommended)</option>
            <option>Standard</option>
            <option>Low</option>
          </select>
        </div>

        <div className="pt-2 border-t border-slate-100">
          <label className="font-bold text-slate-800 block mb-1">Default Ingest Language</label>
          <select className="w-full p-2 border border-slate-300 rounded-lg text-xs">
            <option>Tamil + English Auto-Translate</option>
            <option>Hindi + English Auto-Translate</option>
            <option>English Only</option>
          </select>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={() => showToast("Preferences saved to local station.", "success")}
            className="px-4 py-2 bg-[#0b5344] hover:bg-[#084236] text-white font-semibold rounded-lg transition cursor-pointer"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
}
