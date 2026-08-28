import React from "react";
import { usePatient } from "../../context/PatientContext";
import { Sparkles, HeartPulse, Stethoscope, Utensils, AlertCircle } from "lucide-react";

export default function HistoryTabs() {
  const { activeTab, setActiveTab, patient, ayushInfo } = usePatient();
  const { aiSummary = {}, examination = {}, lifestyle = {} } = patient || {};

  const tabs = [
    { id: "history", label: "History Summary" },
    { id: "ayush", label: "AYUSH History" },
    { id: "vitals", label: "Vitals" },
    { id: "examination", label: "Examination" },
    { id: "lifestyle", label: "Lifestyle" },
  ];

  return (
    <div className="pt-4 border-t border-slate-100">
      {/* Sub-Tabs Nav */}
      <div className="flex items-center gap-6 border-b border-slate-200 text-xs font-semibold overflow-x-auto pb-0.5">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-2.5 transition-all relative whitespace-nowrap cursor-pointer ${
                isActive
                  ? "text-emerald-800 font-bold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {tab.label}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-700 rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      <div className="pt-4 text-xs">
        {/* Tab 1: History Summary (Exact match with screenshot) */}
        {activeTab === "history" && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* Systemic Review (ROS) */}
            <div>
              <h4 className="font-bold text-slate-800 text-xs mb-1">
                Systemic Review (ROS)
              </h4>
              <p className="text-slate-600 leading-relaxed">
                {aiSummary.systemicReview}
              </p>
            </div>

            {/* Family History */}
            <div>
              <h4 className="font-bold text-slate-800 text-xs mb-1.5">
                Family History
              </h4>
              <div className="space-y-1 text-slate-600">
                {aiSummary.familyHistory.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                    <span>
                      <strong className="text-slate-700">{item.relation}:</strong>{" "}
                      {item.condition}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: AYUSH History (Ayurvedic Intake) */}
        {activeTab === "ayush" && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* Prakriti & Vikriti */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-amber-50/50 p-3 rounded-lg border border-amber-200/60">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-amber-900">Prakriti (Constitution)</span>
                  <span className="text-[11px] font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                    {ayushInfo.prakriti.primary} Dominant
                  </span>
                </div>
                <div className="space-y-1.5">
                  {ayushInfo.prakriti.distribution.map((d, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-[11px] font-medium text-slate-600 mb-0.5">
                        <span>{d.dosha} ({d.traits})</span>
                        <span className="font-bold">{d.percentage}%</span>
                      </div>
                      <div className="w-full bg-amber-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-1.5 rounded-full"
                          style={{ width: `${d.percentage}%`, backgroundColor: d.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-emerald-50/50 p-3 rounded-lg border border-emerald-200/60 flex flex-col justify-between">
                <div>
                  <span className="font-bold text-emerald-950 block mb-1">
                    Vikriti (Current Imbalance)
                  </span>
                  <p className="text-[11px] text-emerald-900 leading-relaxed font-medium">
                    {ayushInfo.vikriti.description}
                  </p>
                </div>
                <div className="mt-2 text-[11px] text-emerald-800">
                  <span className="font-bold">Agni Status:</span> {ayushInfo.agniState.type}
                </div>
              </div>
            </div>

            {/* Ashtavidha Pariksha Mini-Grid */}
            <div>
              <h5 className="font-bold text-slate-800 text-xs mb-2">
                Ashtavidha Pariksha (Eight-Fold Clinical Examination)
              </h5>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px]">
                {ayushInfo.ashtavidhaPariksha.slice(0, 4).map((p, idx) => (
                  <div key={idx} className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                    <span className="font-bold text-slate-700 block">{p.name}</span>
                    <span className="text-emerald-700 font-semibold">{p.finding}</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">{p.note}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Formulations */}
            <div>
              <h5 className="font-bold text-slate-800 text-xs mb-2">
                Recommended Formulations & Regimen
              </h5>
              <div className="space-y-1.5">
                {ayushInfo.suggestedFormulations.map((f, i) => (
                  <div key={i} className="flex items-start gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200/80">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                    <div>
                      <span className="font-bold text-slate-800">{f.name}</span>{" "}
                      <span className="text-[11px] text-slate-500 font-medium">({f.dose})</span>
                      <p className="text-[11px] text-slate-600">{f.purpose}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Detailed Vitals Log */}
        {activeTab === "vitals" && (
          <div className="space-y-3 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-1">
              <h4 className="font-bold text-slate-800">Kiosk K-03 Telemetry Session</h4>
              <span className="text-[11px] text-slate-500">Auto-calibrated sensor data</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
                <thead className="bg-slate-50 text-slate-600 font-semibold">
                  <tr>
                    <th className="p-2 border-b">Time</th>
                    <th className="p-2 border-b">BP (mmHg)</th>
                    <th className="p-2 border-b">Pulse (bpm)</th>
                    <th className="p-2 border-b">SpO₂ (%)</th>
                    <th className="p-2 border-b">Temp (°F)</th>
                    <th className="p-2 border-b">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  <tr>
                    <td className="p-2 font-medium">10:15 AM</td>
                    <td className="p-2 font-bold text-red-600">140/90</td>
                    <td className="p-2">98</td>
                    <td className="p-2">98%</td>
                    <td className="p-2">98.6</td>
                    <td className="p-2"><span className="bg-red-50 text-red-700 px-1.5 py-0.5 rounded text-[10px] font-bold">Elevated BP</span></td>
                  </tr>
                  <tr>
                    <td className="p-2 font-medium">10:25 AM</td>
                    <td className="p-2 font-bold text-amber-600">138/88</td>
                    <td className="p-2">95</td>
                    <td className="p-2">98%</td>
                    <td className="p-2">98.6</td>
                    <td className="p-2"><span className="bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded text-[10px] font-medium">Stable</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Physical Examination */}
        {activeTab === "examination" && (
          <div className="space-y-2.5 animate-in fade-in duration-150">
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <span className="font-bold text-slate-800">General Physical: </span>
              <span className="text-slate-600">{examination.general}</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <span className="font-bold text-slate-800">Cardiovascular System (CVS): </span>
              <span className="text-slate-600">{examination.cvs}</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <span className="font-bold text-slate-800">Respiratory System (RS): </span>
              <span className="text-slate-600">{examination.rs}</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <span className="font-bold text-slate-800">Abdomen: </span>
              <span className="text-slate-600">{examination.abdomen}</span>
            </div>
          </div>
        )}

        {/* Tab 5: Lifestyle Assessment */}
        {activeTab === "lifestyle" && (
          <div className="space-y-2.5 animate-in fade-in duration-150">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-800 block mb-0.5">Diet & Nutrition:</span>
                <span className="text-slate-600">{lifestyle.diet}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-800 block mb-0.5">Sleep Pattern:</span>
                <span className="text-slate-600">{lifestyle.sleep}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-800 block mb-0.5">Physical Activity:</span>
                <span className="text-slate-600">{lifestyle.physicalActivity}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-800 block mb-0.5">Stress Level:</span>
                <span className="text-amber-700 font-semibold">{lifestyle.stressLevel}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
