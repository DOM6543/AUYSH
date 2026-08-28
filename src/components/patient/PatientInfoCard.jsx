import React from "react";
import { MoreVertical } from "lucide-react";
import { usePatient } from "../../context/PatientContext";

export default function PatientInfoCard() {
  const { patient, setIsProfileModalOpen } = usePatient();

  const details = [
    { label: "Age / Gender", value: `${patient.age} Years / ${patient.gender}` },
    { label: "Mobile Number", value: patient.mobile },
    { label: "Language", value: patient.language },
    { label: "Registration Type", value: patient.registrationType },
    { label: "ABHA Address", value: patient.abhaAddress },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-4 flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900">
            Patient Information
          </h3>
          <button className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition cursor-pointer">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>

        {/* Rows */}
        <div className="space-y-2.5 py-1">
          {details.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between text-xs"
            >
              <span className="text-slate-500 font-medium">{item.label}</span>
              <span className="text-slate-800 font-semibold text-right">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Action button */}
      <div className="pt-4 mt-2">
        <button
          onClick={() => setIsProfileModalOpen(true)}
          className="w-full py-2 px-3 border border-slate-300 hover:border-emerald-600 hover:text-emerald-700 hover:bg-emerald-50/50 rounded-lg text-xs font-semibold text-slate-700 transition cursor-pointer text-center"
        >
          View Full Profile
        </button>
      </div>
    </div>
  );
}
