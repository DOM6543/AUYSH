import React from "react";
import { BarChart3, TrendingUp, Users, AlertCircle, Clock } from "lucide-react";

export default function AnalyticsView() {
  const stats = [
    { title: "Total Kiosk Intakes Today", value: "48", change: "+14% vs yesterday", color: "emerald" },
    { title: "Avg Intake Time", value: "3.2 mins", change: "-45s reduction", color: "blue" },
    { title: "High Risk Flag Rate", value: "8.3%", change: "4 patients flagged", color: "red" },
    { title: "Doctor Review Time", value: "1.8 mins", change: "60% faster", color: "purple" }
  ];

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <h2 className="text-lg font-bold text-slate-900">Hospital Intake & Triage Analytics</h2>
        <p className="text-xs text-slate-500">Live operational throughput and clinical efficiency metrics</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
            <span className="text-xs font-medium text-slate-500">{s.title}</span>
            <div className="text-2xl font-bold text-slate-900">{s.value}</div>
            <span className="text-[11px] font-semibold text-emerald-700 block">{s.change}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <h3 className="font-bold text-sm text-slate-900">Top Chief Complaints Recorded</h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b">
              <span>Chest Pain / Cardiac Symptoms</span>
              <span className="font-bold">28%</span>
            </div>
            <div className="flex justify-between py-1 border-b">
              <span>Joint / Musculoskeletal Pain</span>
              <span className="font-bold">24%</span>
            </div>
            <div className="flex justify-between py-1 border-b">
              <span>Gastrointestinal / Dyspepsia</span>
              <span className="font-bold">19%</span>
            </div>
            <div className="flex justify-between py-1">
              <span>Headache & Migraine</span>
              <span className="font-bold">15%</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <h3 className="font-bold text-sm text-slate-900">Language Distribution in Multilingual Kiosks</h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b">
              <span>Hindi</span>
              <span className="font-bold">42%</span>
            </div>
            <div className="flex justify-between py-1 border-b">
              <span>Tamil</span>
              <span className="font-bold">26%</span>
            </div>
            <div className="flex justify-between py-1 border-b">
              <span>English</span>
              <span className="font-bold">18%</span>
            </div>
            <div className="flex justify-between py-1">
              <span>Telugu / Kannada / Others</span>
              <span className="font-bold">14%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
