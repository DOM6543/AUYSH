import React, { useState } from "react";
import {
  Users,
  Search,
  Filter,
  Plus,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  FileText,
  Download,
  Printer,
  FileDown
} from "lucide-react";
import { usePatient } from "../../context/PatientContext";

export default function PatientsListView() {
  const { patientsList, samplePatientsList, setSelectedPatientId, setActiveNav, downloadPatientData, downloadFhir } = usePatient();

  const [searchQuery, setSearchQuery] = useState("");
  const patients = (patientsList && patientsList.length > 0) ? patientsList : (samplePatientsList || []);

  const filteredPatients = patients.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.id && p.id.toLowerCase().includes(q)) ||
      (p.abhaNumber && p.abhaNumber.toLowerCase().includes(q)) ||
      (p.complaint && p.complaint.toLowerCase().includes(q))
    );
  });

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
            Real-time roster of {patients.length} patients with deterministic triage, progress notes, and downloadable FHIR R4 & EHR records
          </p>
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search patient name, ABHA or ID..."
              className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 focus:border-red-500 rounded-xl text-xs font-semibold text-slate-800 outline-none w-56 transition"
            />
          </div>

          <button
            onClick={() => setActiveNav("appointments")}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold rounded-xl transition shadow-sm cursor-pointer active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
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
                <th className="p-3.5">Chief Symptom</th>
                <th className="p-3.5">Triage Severity</th>
                <th className="p-3.5">Vitals (BP/Pulse)</th>
                <th className="p-3.5 text-right">Clinician Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {filteredPatients.map((p) => {
                const complaintText = p.complaint || p.stats?.chiefComplaint?.value || p.aiSummary?.chiefComplaint || "General Consultation";
                const abhaText = p.abha || p.abhaNumber || "91-XXXX-XXXX-0000";
                const avatar = p.avatarUrl || p.photo || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80";
                const triageTier = p.triage?.tier || "LOW";

                return (
                  <tr key={p.id} className="hover:bg-red-50/30 transition">
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={avatar}
                          alt={p.name}
                          className="w-11 h-11 rounded-xl object-cover border-2 border-red-400 shrink-0 shadow-xs"
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
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-xs ${
                        triageTier === "HIGH / PRIORITY" || triageTier === "HIGH"
                          ? "bg-red-600 text-white border-red-700 animate-pulse"
                          : triageTier === "MODERATE"
                          ? "bg-amber-100 text-amber-900 border-amber-300"
                          : "bg-emerald-100 text-emerald-900 border-emerald-300"
                      }`}>
                        {triageTier}
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
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Download FHIR R4 Button */}
                        <button
                          onClick={() => downloadFhir(p)}
                          className="p-1.5 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-800 rounded-lg transition cursor-pointer"
                          title="Export HL7 FHIR R4 Bundle"
                        >
                          <span className="font-mono text-[10px] font-black">FHIR</span>
                        </button>

                        {/* Download EHR Button */}
                        <button
                          onClick={() => downloadPatientData(p)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition cursor-pointer"
                          title="Download Patient EHR Dossier"
                        >
                          <FileDown className="w-3.5 h-3.5 text-red-600" />
                        </button>

                        {/* View Chart & Notes Button */}
                        <button
                          onClick={() => handleSelectPatient(p.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-600 hover:text-white text-red-900 border border-red-200 hover:border-red-600 rounded-xl font-bold text-xs transition cursor-pointer active:scale-95 shadow-xs"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>View Chart</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
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
