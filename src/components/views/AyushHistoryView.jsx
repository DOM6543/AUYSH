import React from "react";
import { Flower2, Activity, Sparkles, BookOpen, ShieldCheck, HeartPulse } from "lucide-react";
import { ayushData } from "../../data/ayushData";
import { usePatient } from "../../context/PatientContext";

export default function AyushHistoryView() {
  const { patient } = usePatient();

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Flower2 className="w-5 h-5 text-emerald-700" />
            AYUSH & Ayurvedic Clinical Assessment Module
          </h2>
          <p className="text-xs text-slate-500">Comprehensive Dosha, Dhatu, Agni, and Prakriti evaluation for {patient.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Prakriti Breakdown */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <h3 className="font-bold text-sm text-slate-900">Prakriti (Tridosha Analysis)</h3>
          <div className="space-y-3">
            {ayushData.prakriti.distribution.map((d, i) => (
              <div key={i}>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span>{d.dosha}</span>
                  <span>{d.percentage}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="h-2 rounded-full" style={{ width: `${d.percentage}%`, backgroundColor: d.color }} />
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">{d.traits}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Ashtavidha Pariksha */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <h3 className="font-bold text-sm text-slate-900">Ashtavidha Pariksha (Eight-Fold Clinical Examination)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {ayushData.ashtavidhaPariksha.map((p, i) => (
              <div key={i} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-800 block">{p.name}</span>
                <span className="text-emerald-700 font-semibold">{p.finding}</span>
                <p className="text-[11px] text-slate-500 mt-0.5">{p.note}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ayurvedic Clinical Formulations */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-600" />
          Integrative Ayurvedic Formulations
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {ayushData.suggestedFormulations.map((f, i) => (
            <div key={i} className="p-3 bg-emerald-50/40 rounded-xl border border-emerald-200/70 space-y-1">
              <div className="font-bold text-emerald-950 text-xs">{f.name}</div>
              <div className="text-[11px] text-emerald-800 font-semibold">{f.dose}</div>
              <p className="text-[11px] text-slate-600 leading-relaxed">{f.purpose}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
