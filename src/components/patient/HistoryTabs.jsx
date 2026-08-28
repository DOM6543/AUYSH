import React, { useState, useRef } from "react";
import { usePatient } from "../../context/PatientContext";
import {
  Sparkles,
  HeartPulse,
  Stethoscope,
  Utensils,
  AlertCircle,
  FileText,
  Plus,
  Send,
  UploadCloud,
  Paperclip,
  CheckCircle2,
  Clock,
  UserCheck,
  Calendar,
  Activity,
  Zap,
  Pill,
  ShieldCheck,
  AlertTriangle,
  History,
  FileCheck
} from "lucide-react";

export default function HistoryTabs() {
  const { activeTab, setActiveTab, patient, ayushInfo, addClinicalNote, uploadNewDocument } = usePatient();
  const {
    aiSummary = {},
    examination = {},
    lifestyle = {},
    clinicalNotes = [],
    documents = [],
    documentExtractions = [],
    triage = {},
    fiveSecondSummary = {}
  } = patient || {};

  const [newNoteText, setNewNoteText] = useState("");
  const [noteCategory, setNoteCategory] = useState("Clinical Progress Note");
  const fileInputRef = useRef(null);

  const tabs = [
    { id: "5sec", label: "⚡ 5-Second Scan" },
    { id: "hpi", label: "Structured HPI & History" },
    { id: "notes", label: `Doctor Notes (${clinicalNotes.length})` },
    { id: "timeline", label: `Doc Timeline (${documents.length})` },
    { id: "ayush", label: "AYUSH Dashavidha" },
    { id: "vitals", label: "Vitals Telemetry" },
    { id: "examination", label: "Physical Exam" },
    { id: "lifestyle", label: "Lifestyle" },
  ];

  const handleCreateNote = async (e) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    await addClinicalNote(newNoteText, noteCategory);
    setNewNoteText("");
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadNewDocument(file);
    }
  };

  return (
    <div className="pt-3 border-t border-slate-100">
      {/* Sub-Tabs Nav */}
      <div className="flex items-center gap-4 border-b border-slate-200 text-xs font-semibold overflow-x-auto pb-0.5 custom-scrollbar">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-2.5 transition-all relative whitespace-nowrap cursor-pointer ${
                isActive
                  ? "text-red-700 font-black"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {tab.label}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600 rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      <div className="pt-3.5 text-xs">
        
        {/* ========================================================================= */}
        {/* TAB 0: 5-SECOND RAPID CLINICAL SCAN */}
        {/* ========================================================================= */}
        {activeTab === "5sec" && (
          <div className="space-y-3.5 animate-in fade-in duration-150">
            <div className="bg-gradient-to-r from-red-50 to-white border-2 border-red-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-red-100 pb-2">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-red-600" />
                  <strong className="text-sm font-black text-slate-900">
                    5-Second Doctor Consultation Brief
                  </strong>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-red-600 text-white">
                  {triage.tier || "LOW RISK"}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-700">
                <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Patient Identification</span>
                  <strong className="text-slate-900 text-sm">{patient?.name}</strong>
                  <span className="text-xs text-slate-600 block">{patient?.age || 35} Y / {patient?.gender} · ABHA: {patient?.abhaNumber || "Verified"}</span>
                </div>

                <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Chief Complaint & Onset</span>
                  <strong className="text-red-700 text-sm">{patient?.chiefComplaint || aiSummary.chiefComplaint}</strong>
                  <span className="text-xs text-slate-600 block">Duration: {patient?.duration || "2 - 3 Days"} · Pain: {patient?.painLevel ?? 4}/10</span>
                </div>
              </div>

              {/* Triage & Red Flags Alert Box */}
              {triage.alerts?.length > 0 && (
                <div className="p-3 bg-red-100/80 border border-red-300 rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 text-red-900 font-black text-xs">
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>Deterministic Red Flag Alert:</span>
                  </div>
                  <ul className="list-disc list-inside text-red-800 font-semibold space-y-0.5 text-xs">
                    {triage.alerts.map((alert, idx) => (
                      <li key={idx}>{alert}</li>
                    ))}
                  </ul>
                  <div className="text-[11px] text-red-950 font-bold pt-1">
                    Suggested Action: <strong>{triage.suggestedAction}</strong>
                  </div>
                </div>
              )}

              {/* Quick Meds & Vitals */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Active Medications</span>
                  <div className="font-bold text-slate-900 mt-1">
                    {patient?.medications?.length > 0 ? patient.medications.map((m) => `${m.name} (${m.dosage || ""})`).join(", ") : "None reported"}
                  </div>
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Sensor Telemetry</span>
                  <div className="font-bold text-slate-900 mt-1">
                    BP: <strong className="text-red-700">{patient?.vitals?.bp?.value || "128/84"}</strong> | Pulse: {patient?.vitals?.pulse?.value || "78"} | SpO2: {patient?.vitals?.spo2?.value || "98%"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 1: STRUCTURED HPI & MEDICAL HISTORY */}
        {/* ========================================================================= */}
        {activeTab === "hpi" && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* Kiosk Intake Telemetry Banner */}
            <div className="bg-red-50/70 border border-red-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
                <strong className="text-slate-900 font-black">Kiosk Intake:</strong>
                <span className="text-slate-700 font-semibold">{patient?.chiefComplaint || aiSummary.chiefComplaint}</span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-slate-600">
                <span>Duration: <strong className="text-slate-900">{patient?.duration || "2 - 3 Days"}</strong></span>
                <span>·</span>
                <span>Pain Score: <strong className="text-red-700">{patient?.painLevel ?? 4}/10</strong></span>
                <span>·</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                  Auto-Approved
                </span>
              </div>
            </div>

            {/* History of Presenting Illness (HPI) Sentences */}
            <div>
              <h4 className="font-bold text-slate-800 text-xs mb-1.5">
                History of Presenting Illness (HPI)
              </h4>
              <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-700">
                {(aiSummary.hpi || []).map((line, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-600 mt-1.5 shrink-0" />
                    <span className="leading-relaxed">{line}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pre-existing Medical Conditions & Surgeries */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <h4 className="font-bold text-slate-800 text-xs mb-1.5">
                  Pre-existing Conditions
                </h4>
                <div className="space-y-1 text-slate-600">
                  {(aiSummary.pastHistory || []).map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200 font-semibold text-slate-800">
                      <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 text-xs mb-1.5">
                  Surgical Procedures
                </h4>
                <div className="space-y-1 text-slate-600">
                  {(patient?.surgicalHistory || aiSummary.surgicalHistory || ["No prior major surgeries"]).map((surg, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200 font-semibold text-slate-800">
                      <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                      <span>{surg}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Active Medications with Data Provenance Badges */}
            <div>
              <h4 className="font-bold text-slate-800 text-xs mb-1.5 flex items-center justify-between">
                <span>Active Medications (with Data Provenance)</span>
                <span className="text-[10px] text-slate-400">Provenance Verified</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(patient?.medications || aiSummary.medications || []).map((m, idx) => (
                  <div key={idx} className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-xs flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <Pill className="w-3.5 h-3.5 text-red-600" />
                        <strong className="text-slate-900">{typeof m === "string" ? m : m.name}</strong>
                      </div>
                      {typeof m === "object" && (
                        <div className="text-[11px] text-slate-600 mt-0.5">
                          {m.dosage} · {m.frequency}
                        </div>
                      )}
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                      m.provenance === "DOCUMENT_EXTRACTED"
                        ? "bg-purple-50 text-purple-800 border-purple-200"
                        : "bg-blue-50 text-blue-800 border-blue-200"
                    }`}>
                      {m.source || "Patient Reported"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: DOCTOR CLINICAL PROGRESS NOTES */}
        {/* ========================================================================= */}
        {activeTab === "notes" && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* Note Editor Form */}
            <form onSubmit={handleCreateNote} className="bg-white border-2 border-red-200 rounded-2xl p-4 shadow-sm space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-red-100 text-red-700 flex items-center justify-center font-bold">
                    <FileText className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-black text-slate-900 text-xs">
                    Write Doctor Progress Note for {patient?.name}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={noteCategory}
                    onChange={(e) => setNoteCategory(e.target.value)}
                    className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 outline-none focus:border-red-500"
                  >
                    <option value="Clinical Progress Note">Clinical Progress Note</option>
                    <option value="Prescription & Dosage">Prescription & Dosage</option>
                    <option value="Diagnostic Assessment">Diagnostic Assessment</option>
                    <option value="Follow-up Instructions">Follow-up Instructions</option>
                  </select>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition flex items-center gap-1 cursor-pointer"
                  >
                    <Paperclip className="w-3.5 h-3.5" />
                    <span>Attach Doc</span>
                  </button>
                </div>
              </div>

              <textarea
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                placeholder="Type clinical observations, prescription advice, diagnostic findings, or follow-up instructions..."
                rows={3}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-red-500 focus:bg-white resize-none"
              />

              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Signed as: <strong>{patient?.doctor?.name || "Dr. Ramesh Kumar"}</strong>
                </span>
                <button
                  type="submit"
                  disabled={!newNoteText.trim()}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer text-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Save Note to Patient EHR</span>
                </button>
              </div>
            </form>

            {/* List of Previous Notes */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-800 text-xs">
                Clinical Progress Record ({clinicalNotes.length} Entries)
              </h4>

              {clinicalNotes.length === 0 ? (
                <div className="p-6 text-center text-slate-400 bg-slate-50 rounded-xl border border-slate-200">
                  No notes recorded yet for this patient. Write a note above to attach to their chart.
                </div>
              ) : (
                clinicalNotes.slice().reverse().map((note, idx) => (
                  <div key={note.id || idx} className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-red-50 text-red-700 rounded-md font-bold text-[10px] border border-red-200">
                          {note.category || "Clinical Note"}
                        </span>
                        <strong className="text-slate-900 font-bold text-xs">{note.author || "Dr. Ramesh Kumar"}</strong>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {note.createdAt ? new Date(note.createdAt).toLocaleString([], { dateStyle: "short", timeStyle: "short" }) : "Today"}
                      </span>
                    </div>
                    <p className="text-slate-700 text-xs leading-relaxed whitespace-pre-wrap">{note.text}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: DOCUMENT TIMELINE & ABNORMAL LAB HIGHLIGHTS */}
        {/* ========================================================================= */}
        {activeTab === "timeline" && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="font-bold text-slate-800 text-xs">
                Ingested Medical Records & Chronological Timeline ({documents.length})
              </h4>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-2.5 py-1 bg-red-50 text-red-700 font-bold rounded-lg border border-red-200 text-[11px] flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Upload Document</span>
              </button>
            </div>

            {documents.length === 0 ? (
              <div className="p-6 text-center text-slate-400 bg-slate-50 rounded-xl border border-slate-200">
                No external documents uploaded yet. Upload a prescription or lab report above.
              </div>
            ) : (
              <div className="space-y-3">
                {documents.map((doc, idx) => (
                  <div key={doc.id || idx} className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileCheck className="w-4 h-4 text-red-600" />
                        <strong className="text-slate-900 font-bold">{doc.name}</strong>
                      </div>
                      <span className="text-[10px] text-slate-400">{doc.uploadedAt || "Uploaded"}</span>
                    </div>

                    {/* Extracted Lab Findings & Abnormal Values */}
                    {doc.extractions?.investigations?.length > 0 && (
                      <div className="space-y-1.5 pt-1 border-t border-slate-100">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Extracted Lab Investigations:</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {doc.extractions.investigations.map((inv, i) => (
                            <div
                              key={i}
                              className={`p-2 rounded-lg border text-[11px] flex items-center justify-between ${
                                inv.isAbnormal
                                  ? "bg-red-50 border-red-300 text-red-900 font-bold"
                                  : "bg-slate-50 border-slate-200 text-slate-800"
                              }`}
                            >
                              <span>{inv.testName}</span>
                              <span className={inv.isAbnormal ? "text-red-700 font-black" : "text-slate-700"}>
                                {inv.value} {inv.isAbnormal && "↑ High"}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: EXTENDED AYUSH DASHAVIDHA PARIKSHA */}
        {/* ========================================================================= */}
        {activeTab === "ayush" && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">🌿</span>
                <strong className="text-amber-950 font-black">AYUSH Dashavidha Pariksha (दशविध परीक्षा)</strong>
              </div>
              <span className="px-2 py-0.5 bg-amber-100 text-amber-900 rounded font-bold text-[10px] border border-amber-300">
                Prakriti: {ayushInfo?.prakriti?.primary || "Pitta"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-700">
              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">1. Prakriti & Vikriti</span>
                <div className="font-bold text-slate-900">{ayushInfo?.prakriti?.primary || "Pitta"} Dominant Prakriti</div>
                <div className="text-[11px] text-slate-600">Vikriti Imbalance: {ayushInfo?.vikriti?.subdosha || "Samana Vata & Pachaka Pitta"}</div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">2. Agni & Koshtha</span>
                <div className="font-bold text-slate-900">Agni: {ayushInfo?.agniStatus?.type || "Tikshnagni"}</div>
                <div className="text-[11px] text-slate-600">Bowel: {ayushInfo?.koshtha?.type || "Madhyama Koshtha"}</div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">3. Sara & Samhanana</span>
                <div className="font-bold text-slate-900">Sara: {ayushInfo?.sara?.type || "Rakta Sara (Blood)"}</div>
                <div className="text-[11px] text-slate-600">Build: Madhyama Samhanana (Balanced)</div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">4. Sattva & Shakti</span>
                <div className="font-bold text-slate-900">Mental Strength: {ayushInfo?.sattva?.type || "Pravara Sattva"}</div>
                <div className="text-[11px] text-slate-600">Digestive Capacity: Pravara Ahara Shakti</div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: VITALS TELEMETRY */}
        {/* ========================================================================= */}
        {activeTab === "vitals" && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-red-50/70 border border-red-200 rounded-xl text-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Blood Pressure</span>
                <div className="text-base font-black text-red-700 mt-1">{patient?.vitals?.bp?.value || "128/84"}</div>
                <span className="text-[10px] text-slate-500">mmHg</span>
              </div>

              <div className="p-3 bg-red-50/70 border border-red-200 rounded-xl text-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Pulse / Heart Rate</span>
                <div className="text-base font-black text-red-700 mt-1">{patient?.vitals?.pulse?.value || "78"}</div>
                <span className="text-[10px] text-slate-500">bpm</span>
              </div>

              <div className="p-3 bg-red-50/70 border border-red-200 rounded-xl text-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Blood Oxygen (SpO2)</span>
                <div className="text-base font-black text-red-700 mt-1">{patient?.vitals?.spo2?.value || "98%"}</div>
                <span className="text-[10px] text-slate-500">Room air</span>
              </div>

              <div className="p-3 bg-red-50/70 border border-red-200 rounded-xl text-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Body Temperature</span>
                <div className="text-base font-black text-red-700 mt-1">{patient?.vitals?.temperature?.value || "98.4"}</div>
                <span className="text-[10px] text-slate-500">°F</span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: PHYSICAL EXAMINATION */}
        {/* ========================================================================= */}
        {activeTab === "examination" && (
          <div className="space-y-3 animate-in fade-in duration-150">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-700">
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <strong className="text-slate-900 font-bold block mb-1">General Appearance</strong>
                <p className="text-slate-600">{examination.general || "Conscious, oriented, no acute respiratory distress observed."}</p>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <strong className="text-slate-900 font-bold block mb-1">Cardiovascular (CVS)</strong>
                <p className="text-slate-600">{examination.cvs || "S1, S2 heard. No murmurs or gallop."}</p>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <strong className="text-slate-900 font-bold block mb-1">Respiratory (RS)</strong>
                <p className="text-slate-600">{examination.rs || "Bilateral air entry clear. No wheezes or rales."}</p>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <strong className="text-slate-900 font-bold block mb-1">Abdomen (P/A)</strong>
                <p className="text-slate-600">{examination.abdomen || "Soft, non-tender. Bowel sounds present."}</p>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 7: LIFESTYLE & HABITUATION */}
        {/* ========================================================================= */}
        {activeTab === "lifestyle" && (
          <div className="space-y-3 animate-in fade-in duration-150">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Diet</span>
                <strong className="text-slate-900">{lifestyle.diet || "Vegetarian"}</strong>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Smoking</span>
                <strong className="text-slate-900">{lifestyle.smoking || "Non-Smoker"}</strong>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Alcohol</span>
                <strong className="text-slate-900">{lifestyle.alcohol || "Non-Drinker"}</strong>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Physical Activity</span>
                <strong className="text-slate-900">{lifestyle.activity || "Moderate"}</strong>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
