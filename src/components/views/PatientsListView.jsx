import React from "react";
import { Users, Search, Filter, Plus, ArrowRight, CheckCircle2, AlertTriangle, Clock, ShieldCheck, FileText } from "lucide-react";
import { usePatient } from "../../context/PatientContext";

export default function PatientsListView() {
  const { patientsList, samplePatientsList, setSelectedPatientId, setActiveNav } = usePatient();

  const patients = (patientsList && patientsList.length > 0) ? patientsList : (samplePatientsList || []);

  const handleSelectPatient = (patientId) => {
    if (setSelectedPatientId) {
      setSelectedPatientId(patientId);
    }
    setActiveNav("dashboard");
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border-2 border-red-100 shadow-sm">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-red-600" />
            <span>OPD Patient Directory (Auto-Approved)</span>
          </h2>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            Real-time roster of {patients.length} patients with instant clinician access and clinical progress notes
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveNav("appointments")}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold rounded-xl transition shadow-sm cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Consultation Schedule</span>
          </button>
        </div>
      </div>

      {/* Patient Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-black border-b border-slate-200">
              <tr>
                <th className="p-3.5">Patient / Photo</th>
                <th className="p-3.5">Age / Gender</th>
                <th className="p-3.5">Chief Symptom & Duration</th>
                <th className="p-3.5">Vitals (BP/Pulse)</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Doctor Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {patients.map((p) => {
                const complaintText = p.complaint || p.stats?.chiefComplaint?.value || p.aiSummary?.chiefComplaint || "General Consultation";
                const abhaText = p.abha || p.abhaNumber || "91-XXXX-XXXX-0000";
                const avatar = p.avatarUrl || p.photo || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80";

                return (
                  <tr key={p.id} className="hover:bg-red-50/30 transition">
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={avatar}
                          alt={p.name}
                          className="w-10 h-10 rounded-xl object-cover border-2 border-red-400 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 text-sm truncate">{p.name}</div>
                          <div className="text-[11px] text-slate-400">ID: {p.id} · ABHA: {abhaText}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <span className="font-bold text-slate-800">{p.age ? `${p.age} Y` : "N/A"}</span>
                      <span className="text-slate-400"> / {p.gender}</span>
                    </td>
                    <td className="p-3.5 max-w-xs">
                      <span className="font-bold text-slate-900 block truncate" title={complaintText}>
                        {complaintText}
                      </span>
                      <span className="text-[10px] text-red-700 font-semibold capitalize">
                        Duration: {p.duration || "Few days"}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <div className="text-[11px] font-bold text-slate-800">
                        BP: <span className="text-red-700">{p.vitals?.bp?.value || "128/84"}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-semibold">
                        Pulse: {p.vitals?.pulse?.value || "78"} bpm
                      </div>
                    </td>
                    <td className="p-3.5">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        <ShieldCheck className="w-3 h-3 text-emerald-700" />
                        Auto-Approved
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => handleSelectPatient(p.id)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-red-50 hover:bg-red-600 hover:text-white text-red-900 border border-red-200 hover:border-red-600 rounded-xl font-bold text-xs transition cursor-pointer active:scale-95 shadow-xs"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>View Chart & Notes</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
