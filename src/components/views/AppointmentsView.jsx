import React from "react";
import { Calendar, Clock, User, CheckCircle, Plus } from "lucide-react";

export default function AppointmentsView() {
  const slots = [
    { time: "10:15 AM", patient: "Arun Kumar", doctor: "Dr. Ramesh Kumar", type: "Chest Pain / Follow-up", status: "In Consultation" },
    { time: "10:45 AM", patient: "Priya Sundaram", doctor: "Dr. Ramesh Kumar", type: "Migraine & AYUSH Assessment", status: "Waiting in Lobby" },
    { time: "11:15 AM", patient: "Rajesh Varma", doctor: "Dr. Ramesh Kumar", type: "Joint Pain & Vitals Review", status: "Scheduled" },
    { time: "11:45 AM", patient: "Deepa Narayanan", doctor: "Dr. Ramesh Kumar", type: "Gastric Distress Intake", status: "Scheduled" },
    { time: "12:15 PM", patient: "Sanjay Menon", doctor: "Dr. Ramesh Kumar", type: "Routine Health Checkup", status: "Scheduled" }
  ];

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">OPD Consultation Schedule</h2>
          <p className="text-xs text-slate-500">Today: May 26, 2025 · Department: AIIMS Ayurveda OPD</p>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0b5344] text-white text-xs font-semibold rounded-lg hover:bg-[#084236] transition cursor-pointer">
          <Plus className="w-4 h-4" />
          <span>Book Slot</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 font-semibold border-b">
            <tr>
              <th className="p-3">Appointment Time</th>
              <th className="p-3">Patient Name</th>
              <th className="p-3">Doctor</th>
              <th className="p-3">Consultation Type</th>
              <th className="p-3">Queue Status</th>
            </tr>
          </thead>
          <tbody className="divide-y text-slate-700">
            {slots.map((s, i) => (
              <tr key={i} className="hover:bg-slate-50">
                <td className="p-3 font-semibold text-slate-900 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {s.time}
                </td>
                <td className="p-3 font-bold">{s.patient}</td>
                <td className="p-3">{s.doctor}</td>
                <td className="p-3">{s.type}</td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    s.status === "In Consultation" ? "bg-emerald-50 text-emerald-700" :
                    s.status === "Waiting in Lobby" ? "bg-amber-50 text-amber-700" :
                    "bg-slate-100 text-slate-600"
                  }`}>
                    {s.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
