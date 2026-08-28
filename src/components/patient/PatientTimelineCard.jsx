import React from "react";
import { CheckCircle2, Clock } from "lucide-react";
import { usePatient } from "../../context/PatientContext";

export default function PatientTimelineCard() {
  const { patient, setIsTimelineModalOpen } = usePatient();
  const { timeline } = patient;

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-4 flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900">
            Patient Timeline
          </h3>
        </div>

        {/* Vertical Connected Timeline */}
        <div className="relative pl-6 space-y-4 py-2">
          {/* Vertical connecting bar */}
          <div className="absolute left-[11px] top-4 bottom-4 w-0.5 bg-slate-200" />

          {timeline.map((step, idx) => {
            const isLast = idx === timeline.length - 1;
            return (
              <div key={idx} className="relative group">
                {/* Timeline Node Dot */}
                <div
                  className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center ${
                    isLast
                      ? "bg-emerald-600 ring-4 ring-emerald-100 text-white"
                      : "bg-slate-300 text-white"
                  }`}
                >
                  {isLast ? (
                    <div className="w-2 h-2 rounded-full bg-white animate-ping" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>

                {/* Content */}
                <div className="text-xs">
                  <div className="text-[11px] font-medium text-slate-400">
                    {step.time}
                  </div>
                  <div
                    className={`font-semibold ${
                      isLast ? "text-emerald-900 font-bold" : "text-slate-800"
                    }`}
                  >
                    {step.title}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {step.details}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action button */}
      <div className="pt-4 mt-2">
        <button
          onClick={() => setIsTimelineModalOpen(true)}
          className="w-full py-2 px-3 border border-slate-300 hover:border-emerald-600 hover:text-emerald-700 hover:bg-emerald-50/50 rounded-lg text-xs font-semibold text-slate-700 transition cursor-pointer text-center"
        >
          View Full Timeline
        </button>
      </div>
    </div>
  );
}
