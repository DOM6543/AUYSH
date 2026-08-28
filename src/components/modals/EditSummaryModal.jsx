import React, { useState } from "react";
import { X, Save, RefreshCw } from "lucide-react";
import { usePatient } from "../../context/PatientContext";

export default function EditSummaryModal() {
  const { isEditModalOpen, setIsEditModalOpen, patient, updateSummaryData } = usePatient();
  const { aiSummary } = patient;

  const [formData, setFormData] = useState({
    chiefComplaint: aiSummary.chiefComplaint,
    hpiText: aiSummary.hpi.join("\n"),
    pastHistoryText: aiSummary.pastHistory.join("\n"),
    medicationsText: aiSummary.medications.map(m => `${m.name} ${m.dosage} ${m.frequency}`).join(", "),
    allergiesText: aiSummary.allergies.join(", "),
    systemicReview: aiSummary.systemicReview,
  });

  if (!isEditModalOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    const updated = {
      chiefComplaint: formData.chiefComplaint,
      hpi: formData.hpiText.split("\n").filter(Boolean),
      pastHistory: formData.pastHistoryText.split("\n").filter(Boolean),
      medications: [{ name: formData.medicationsText, dosage: "", frequency: "" }],
      allergies: formData.allergiesText.split(",").map(s => s.trim()).filter(Boolean),
      systemicReview: formData.systemicReview,
    };
    updateSummaryData(updated);
    setIsEditModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Edit AI Clinical Summary (Draft)
            </h3>
            <p className="text-xs text-slate-500">
              Review and adjust synthesized clinical entities for Arun Kumar
            </p>
          </div>
          <button
            onClick={() => setIsEditModalOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
          {/* Chief Complaint */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Chief Complaint (CC)
            </label>
            <input
              type="text"
              value={formData.chiefComplaint}
              onChange={(e) => setFormData({ ...formData, chiefComplaint: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600 font-medium"
            />
          </div>

          {/* History of Present Illness (HPI) */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              History of Present Illness (HPI - One point per line)
            </label>
            <textarea
              rows={4}
              value={formData.hpiText}
              onChange={(e) => setFormData({ ...formData, hpiText: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600 font-medium leading-relaxed"
            />
          </div>

          {/* Past History & Medications Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Past Medical History
              </label>
              <textarea
                rows={2}
                value={formData.pastHistoryText}
                onChange={(e) => setFormData({ ...formData, pastHistoryText: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Current Medications
              </label>
              <textarea
                rows={2}
                value={formData.medicationsText}
                onChange={(e) => setFormData({ ...formData, medicationsText: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600"
              />
            </div>
          </div>

          {/* Allergies & ROS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Known Allergies
              </label>
              <input
                type="text"
                value={formData.allergiesText}
                onChange={(e) => setFormData({ ...formData, allergiesText: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Systemic Review (ROS)
              </label>
              <input
                type="text"
                value={formData.systemicReview}
                onChange={(e) => setFormData({ ...formData, systemicReview: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600"
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg border border-slate-300 hover:bg-slate-50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-[#0b5344] hover:bg-[#084236] rounded-lg shadow-sm flex items-center gap-1.5 transition cursor-pointer"
            >
              <Save className="w-4 h-4" />
              Save Draft Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
