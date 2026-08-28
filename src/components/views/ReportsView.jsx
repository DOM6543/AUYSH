import React from "react";
import { FileBarChart, Download, Printer, CheckCircle } from "lucide-react";
import { usePatient } from "../../context/PatientContext";

export default function ReportsView() {
  const { patient, showToast } = usePatient();

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Clinical History & Discharge Reports</h2>
          <p className="text-xs text-slate-500">Generate, review, and print synthesized medical encounter summaries</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 transition cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Report
          </button>
          <button
            onClick={() => showToast("Exporting signed consultation report...", "success")}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0b5344] text-white text-xs font-semibold rounded-lg hover:bg-[#084236] transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Download PDF
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs max-w-3xl mx-auto space-y-4 text-xs">
        <div className="border-b pb-4 flex justify-between items-center">
          <div>
            <h3 className="text-base font-bold text-slate-900">AIIMS Comprehensive Clinical Encounter Summary</h3>
            <p className="text-slate-500">OPD ID: {patient.opdId} | Date: May 26, 2025</p>
          </div>
          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            Physician Ready
          </span>
        </div>

        <div className="space-y-3">
          <div>
            <h4 className="font-bold text-slate-800">1. Patient Demographics:</h4>
            <p className="text-slate-600">{patient.name}, {patient.age} Y / {patient.gender}, ABHA: {patient.abhaNumber}</p>
          </div>
          <div>
            <h4 className="font-bold text-slate-800">2. Chief Complaint & Present Illness:</h4>
            <p className="text-slate-600">{patient.aiSummary.chiefComplaint}. {patient.aiSummary.hpi.join(". ")}.</p>
          </div>
          <div>
            <h4 className="font-bold text-slate-800">3. Vitals at Intake:</h4>
            <p className="text-slate-600">BP: {patient.vitals.bp.value} mmHg | Pulse: {patient.vitals.pulse.value} bpm | SpO2: {patient.vitals.spo2.value}% | Temp: {patient.vitals.temperature.value}°F</p>
          </div>
          <div>
            <h4 className="font-bold text-slate-800">4. Risk Stratification & Plan:</h4>
            <p className="text-slate-600">High cardiac risk profile due to exertional symptoms. Advised urgent 12-lead ECG, blood cardiac markers, and follow-up in cardiology OPD.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
