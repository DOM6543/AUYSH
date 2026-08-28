import React, { useState, useEffect } from "react";
import { Search, User, FileText, HeartPulse, Sparkles, X, ArrowRight, Activity } from "lucide-react";
import { usePatient } from "../../context/PatientContext";

export default function CommandPalette() {
  const {
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    samplePatientsList,
    setActiveNav,
    setIsAiChatOpen,
    setIsEditModalOpen,
    setSelectedDocument,
    patient
  } = usePatient();

  const [query, setQuery] = useState("");

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setQuery("");
    }
  }, [isCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  const actions = [
    {
      id: "ai-chat",
      title: "Ask AI Assistant about Arun Kumar",
      category: "AI Copilot",
      icon: Sparkles,
      action: () => {
        setIsCommandPaletteOpen(false);
        setIsAiChatOpen(true);
      }
    },
    {
      id: "edit-sum",
      title: "Edit AI Clinical Summary Draft",
      category: "Patient Actions",
      icon: FileText,
      action: () => {
        setIsCommandPaletteOpen(false);
        setIsEditModalOpen(true);
      }
    },
    {
      id: "view-doc1",
      title: "View Prescription_26052025.pdf",
      category: "Documents",
      icon: FileText,
      action: () => {
        setIsCommandPaletteOpen(false);
        setSelectedDocument(patient.documents[0]);
      }
    },
    {
      id: "view-doc2",
      title: "View Lab_Report_26052025.jpg (Lipid Profile)",
      category: "Documents",
      icon: Activity,
      action: () => {
        setIsCommandPaletteOpen(false);
        setSelectedDocument(patient.documents[1]);
      }
    }
  ];

  const filteredPatients = samplePatientsList.filter(
    (p) =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.id.toLowerCase().includes(query.toLowerCase()) ||
      p.complaint.toLowerCase().includes(query.toLowerCase())
  );

  const filteredActions = actions.filter((a) =>
    a.title.toLowerCase().includes(query.toLowerCase()) ||
    a.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-start justify-center pt-20 p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
        {/* Search Input */}
        <div className="p-3 border-b border-slate-200 flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search patients, vitals, documents, or type a clinical query..."
            className="w-full text-sm outline-none text-slate-800 placeholder:text-slate-400"
          />
          <button
            onClick={() => setIsCommandPaletteOpen(false)}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-md cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto p-2 text-xs divide-y divide-slate-100">
          {/* Patients */}
          <div className="py-2">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2.5 mb-1">
              Patients in Queue
            </div>
            {filteredPatients.map((p) => (
              <div
                key={p.id}
                onClick={() => {
                  setIsCommandPaletteOpen(false);
                  setActiveNav("dashboard");
                }}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-emerald-50/70 hover:text-emerald-950 transition cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                    {p.name[0]}
                  </div>
                  <div>
                    <div className="font-bold text-slate-800 group-hover:text-emerald-950">{p.name} ({p.id})</div>
                    <div className="text-[11px] text-slate-500">{p.complaint} · {p.time}</div>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  p.risk === "High Risk" ? "bg-red-50 text-red-700" : "bg-slate-100 text-slate-700"
                }`}>
                  {p.risk}
                </span>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="py-2">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2.5 mb-1">
              Quick Clinical Actions
            </div>
            {filteredActions.map((act) => {
              const Icon = act.icon;
              return (
                <div
                  key={act.id}
                  onClick={act.action}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 text-slate-700 hover:text-slate-900 transition cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 text-emerald-700" />
                    <span className="font-medium">{act.title}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                    {act.category}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Navigate with mouse or keyboard</span>
          <span>ESC to close</span>
        </div>
      </div>
    </div>
  );
}
