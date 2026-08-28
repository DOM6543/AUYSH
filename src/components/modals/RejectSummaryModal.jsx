import React, { useState } from "react";
import { X, XCircle, AlertTriangle } from "lucide-react";
import { usePatient } from "../../context/PatientContext";

export default function RejectSummaryModal() {
  const { isRejectModalOpen, setIsRejectModalOpen, handleRejectSummary, patient } = usePatient();
  const [reason, setReason] = useState("Incomplete intake history / Discrepancy in vitals");

  if (!isRejectModalOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    handleRejectSummary(reason);
    setIsRejectModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-red-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 bg-red-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <XCircle className="w-5 h-5" />
            <h3 className="font-bold text-sm">Reject AI Draft Summary</h3>
          </div>
          <button
            onClick={() => setIsRejectModalOpen(false)}
            className="p-1 text-red-200 hover:text-white rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <p className="text-slate-600 leading-relaxed">
            Specify the reason for rejecting the AI draft for <strong>{patient?.name}</strong>. Rejection status will be logged in Firebase Realtime Database.
          </p>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Rejection Reason</label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-red-500 font-medium"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t">
            <button
              type="button"
              onClick={() => setIsRejectModalOpen(false)}
              className="px-4 py-2 border text-slate-600 rounded-lg font-semibold hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-sm cursor-pointer"
            >
              Confirm Rejection
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
