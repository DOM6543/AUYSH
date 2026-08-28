import React from "react";
import { Users, Search, Filter, Plus, ArrowRight, CheckCircle2, AlertTriangle, Clock } from "lucide-react";
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900">OPD Patient Directory</h2>
          <p className="text-xs text-slate-500">Live queue of {patients.length} patients registered via MediKiosk intakes today</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveNav("appointments")}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0b5344] text-white text-xs font-semibold rounded-lg hover:bg-[#084236] transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Consultation Schedule</span>
          </button>
        </div>
      </div>

      {/* Patient Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
            <tr>
              <th className="p-3">Patient Name / ABHA</th>
              <th className="p-3">Age / Gender</th>
              <th className="p-3">Chief Complaint</th>
              <th className="p-3">Risk Tier</th>
              <th className="p-3">Kiosk Check-in</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {patients.map((p) => {
              const complaintText = p.complaint || p.stats?.chiefComplaint?.value || p.aiSummary?.chiefComplaint || "General Consultation";
              const riskText = p.risk || p.stats?.redFlags?.value || (p.aiSummary?.redFlagsList?.length > 0 ? "High Risk" : "Low Risk");
              const checkinTime = p.time || p.stats?.kioskSession?.subtitle || "Today";
              const statusText = p.status || (p.doctorReview?.status === "saved" ? "Reviewed" : "Ready for Review");
              const abhaText = p.abha || p.abhaNumber || "91-XXXX-XXXX-0000";

              return (
                <tr key={p.id} className="hover:bg-slate-50/80 transition">
                  <td className="p-3">
                    <div className="font-bold text-slate-900">{p.name}</div>
                    <div className="text-[11px] text-slate-400">ID: {p.id} · ABHA: {abhaText}</div>
                  </td>
                  <td className="p-3">{p.age} Y / {p.gender}</td>
                  <td className="p-3 font-medium text-slate-800 max-w-xs truncate" title={complaintText}>
                    {complaintText}
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      riskText === "High Risk" ? "bg-red-50 text-red-700 border border-red-200" :
                      riskText === "Moderate" || riskText === "Moderate Risk" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                      "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    }`}>
                      {riskText}
                    </span>
                  </td>
                  <td className="p-3">{checkinTime}</td>
                  <td className="p-3">
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-800">
                      <Clock className="w-3 h-3 text-emerald-600" />
                      {statusText}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleSelectPatient(p.id)}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg font-semibold text-xs transition cursor-pointer"
                    >
                      Open Summary
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
  );
}
