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

  const system = patient?.treatmentSystem || patient?.careSystem || "AYURVEDA";
  const ayushTabLabel =
    system === "SIDDHA" ? "🌿 Siddha Assessment" :
    system === "UNANI" ? "🏺 Unani Assessment" :
    system === "HOMEOPATHY" ? "💊 Homeopathy Modalities" :
    system === "YOGA_NATUROPATHY" ? "🧘 Yoga & Naturopathy Assessment" :
    "🌿 AYUSH Dashavidha";

  const tabs = [
    { id: "5sec", label: "⚡ 5-Second Scan" },
    { id: "hpi", label: "Structured HPI & History" },
    { id: "notes", label: `Doctor Notes (${clinicalNotes.length})` },
    { id: "timeline", label: `Doc Timeline (${documents.length})` },
    { id: "ayush", label: ayushTabLabel },
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
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 1: STRUCTURED HPI & HISTORY */}
        {/* ========================================================================= */}
        {activeTab === "hpi" && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Structured HPI / OPQRST */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <Sparkles className="w-4 h-4 text-red-600" />
                  <h4 className="font-bold text-slate-900 text-xs">Structured History of Present Illness (HPI)</h4>
                </div>

                <div className="space-y-2 text-slate-700">
                  <div className="flex justify-between border-b border-slate-50 pb-1">
                    <span className="text-slate-400 font-medium">Onset & Chronicity:</span>
                    <strong className="text-slate-900">{patient?.hpi?.duration || patient?.duration || "2 - 3 Days"}</strong>
                  </div>
                  <div className="flex justify-between border-b border-slate-50 pb-1">
                    <span className="text-slate-400 font-medium">Sensation / Quality:</span>
                    <strong className="text-slate-900 uppercase">{patient?.hpi?.character || "Heaviness / Pressure"}</strong>
                  </div>
                  <div className="flex justify-between border-b border-slate-50 pb-1">
                    <span className="text-slate-400 font-medium">Radiation / Spread:</span>
                    <strong className="text-slate-900">{patient?.hpi?.radiation || "Left arm & jaw"}</strong>
                  </div>
                  <div className="flex justify-between border-b border-slate-50 pb-1">
                    <span className="text-slate-400 font-medium">Aggravating Factors:</span>
                    <strong className="text-slate-900">{patient?.hpi?.aggravating || "Exertion / walking"}</strong>
                  </div>
                  <div className="flex justify-between border-b border-slate-50 pb-1">
                    <span className="text-slate-400 font-medium">Relieving Factors:</span>
                    <strong className="text-slate-900">{patient?.hpi?.relieving || "Rest / Sitting"}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Pain Severity:</span>
                    <strong className="text-red-700 font-black">{patient?.hpi?.painScore ?? patient?.painLevel ?? 4} / 10</strong>
                  </div>
                </div>
              </div>

              {/* Medical History & Allergies */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <Pill className="w-4 h-4 text-red-600" />
                  <h4 className="font-bold text-slate-900 text-xs">Past Illnesses & Drug Allergies</h4>
                </div>

                <div className="space-y-2">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Known Co-Morbidities</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {(patient?.medicalHistory?.pastIllnesses || ["None"]).map((illness, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded-md font-bold text-[11px] border border-slate-200">
                          {illness}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Daily Medications</span>
                    <span className="text-xs text-slate-700 font-semibold block mt-0.5">
                      {patient?.medicalHistory?.takesDailyMeds ? "💊 Prescribed Daily Medicines Active" : "❌ No regular daily medications"}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Drug Allergies</span>
                    <span className={`text-xs font-bold block mt-0.5 ${patient?.medicalHistory?.hasAllergies ? "text-amber-700" : "text-emerald-700"}`}>
                      {patient?.medicalHistory?.hasAllergies ? "⚠️ Drug Allergies Reported" : "✅ No known drug allergies (NKDA)"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: DOCTOR CLINICAL NOTES */}
        {/* ========================================================================= */}
        {activeTab === "notes" && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <form onSubmit={handleCreateNote} className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-red-600" />
                  <h4 className="font-bold text-slate-900 text-xs">Add Doctor Consultation Note</h4>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={noteCategory}
                    onChange={(e) => setNoteCategory(e.target.value)}
                    className="p-1 px-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-700 text-xs font-bold outline-none"
                  >
                    <option>Clinical Progress Note</option>
                    <option>Prescription & Advice</option>
                    <option>Diagnostic Order</option>
                    <option>Follow-up Plan</option>
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
                    <span>Attach</span>
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
        {/* TAB 4: AYUSH / SYSTEM SPECIFIC ASSESSMENT */}
        {/* ========================================================================= */}
        {activeTab === "ayush" && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* 1. AYURVEDA ASSESSMENT */}
            {system === "AYURVEDA" && (
              <div className="space-y-3">
                <div className="bg-emerald-50/80 border-2 border-emerald-300 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🌿</span>
                    <div>
                      <strong className="text-emerald-950 font-black text-sm block">AYUSH Dashavidha Pariksha (दशविध परीक्षा)</strong>
                      <span className="text-[11px] text-emerald-800">10-Point Holistic Ayurvedic Examination · Patient-Reported Assessment</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-900 rounded-full font-black text-[11px] border border-emerald-300 shadow-xs">
                    Prakriti: {patient?.ayurveda?.prakriti || ayushInfo?.prakriti?.primary || "Pitta"}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">1. Agni Status (Digestive Power)</span>
                    <div className="font-bold text-slate-900">{patient?.ayurveda?.agni || "Samagni (Balanced)"}</div>
                    <span className="text-[9px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">Patient Reported</span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">2. Koshtha (Bowel Pattern)</span>
                    <div className="font-bold text-slate-900">{patient?.ayurveda?.koshtha || "Madhyama (Regular)"}</div>
                    <span className="text-[9px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">Patient Reported</span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">3. Prakriti (Thermal Constitution)</span>
                    <div className="font-bold text-slate-900">{patient?.ayurveda?.prakriti || "Pitta Predominant"}</div>
                    <span className="text-[9px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">Patient Reported</span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">4. Vyayama Shakti (Physical Stamina)</span>
                    <div className="font-bold text-slate-900">{patient?.ayurveda?.stamina || "Pravara (High Stamina)"}</div>
                    <span className="text-[9px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">Patient Reported</span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">5. Sattva & Nidra (Sleep & Mind)</span>
                    <div className="font-bold text-slate-900">{patient?.ayurveda?.sleep || "Prasanna (Deep Sleep)"}</div>
                    <span className="text-[9px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">Patient Reported</span>
                  </div>
                </div>
              </div>
            )}

            {/* 2. SIDDHA ASSESSMENT */}
            {system === "SIDDHA" && (
              <div className="space-y-3">
                <div className="bg-teal-50/80 border-2 border-teal-300 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🌿</span>
                    <div>
                      <strong className="text-teal-950 font-black text-sm block">Siddha Mukkutram & Envagai Thervu (சித்தா முக்குற்றம்)</strong>
                      <span className="text-[11px] text-teal-800">Tridosha Humoral Balance (Vatham, Pitham, Kabam) · Patient-Reported Intake</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-teal-100 text-teal-900 rounded-full font-black text-[11px] border border-teal-300 shadow-xs">
                    Dominance: {patient?.siddha?.theham || "Vatham (Joint Comfort)"}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">1. Theham & Mukkutram (Joints & Bodily Heat)</span>
                    <div className="font-bold text-slate-900">{patient?.siddha?.theham || "Vatham (Joint Stiffness/Dryness)"}</div>
                    <span className="text-[9px] text-teal-700 font-bold bg-teal-50 px-1.5 py-0.5 rounded">Patient Reported</span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">2. Suvai (Taste Preference & Digestive Suitability)</span>
                    <div className="font-bold text-slate-900">{patient?.siddha?.suvai || "Inippu (Sweet / Nourishing)"}</div>
                    <span className="text-[9px] text-teal-700 font-bold bg-teal-50 px-1.5 py-0.5 rounded">Patient Reported</span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">3. Valimai (Physical Endurance & Vigor)</span>
                    <div className="font-bold text-slate-900">{patient?.siddha?.valimai || "Uttama Valimai (High Vigor)"}</div>
                    <span className="text-[9px] text-teal-700 font-bold bg-teal-50 px-1.5 py-0.5 rounded">Patient Reported</span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">4. Amaidhi & Thookkam (Mental Composure & Sleep)</span>
                    <div className="font-bold text-slate-900">{patient?.siddha?.amaidhi || "Amaidhi (Deep Calm Sleep)"}</div>
                    <span className="text-[9px] text-teal-700 font-bold bg-teal-50 px-1.5 py-0.5 rounded">Patient Reported</span>
                  </div>
                </div>
              </div>
            )}

            {/* 3. UNANI ASSESSMENT */}
            {system === "UNANI" && (
              <div className="space-y-3">
                <div className="bg-amber-50/80 border-2 border-amber-300 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🏺</span>
                    <div>
                      <strong className="text-amber-950 font-black text-sm block">Unani Mizaj, Akhlat & Quwa (طب یونانی - مزاج و اخلاط)</strong>
                      <span className="text-[11px] text-amber-800">Four Humours (Dam, Balgham, Safra, Sawda) · Patient Intake Profile</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-amber-100 text-amber-900 rounded-full font-black text-[11px] border border-amber-300 shadow-xs">
                    Mizaj: {patient?.unani?.mizaj || "Damawi (Sanguine)"}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">1. Mizaj (Natural Bodily Temperament)</span>
                    <div className="font-bold text-slate-900">{patient?.unani?.mizaj || "Damawi (Sanguine / Warm & Moist)"}</div>
                    <span className="text-[9px] text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded">Patient Reported</span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">2. Hazm & Atash (Appetite & Thirst Patterns)</span>
                    <div className="font-bold text-slate-900">{patient?.unani?.hazm || "Hazm Sari (Fast Digestion)"}</div>
                    <span className="text-[9px] text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded">Patient Reported</span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">3. Quwa (Physical Vitality & Strength)</span>
                    <div className="font-bold text-slate-900">{patient?.unani?.quwa || "Quwa Qawiyya (Robust Vital Strength)"}</div>
                    <span className="text-[9px] text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded">Patient Reported</span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">4. Naum & Khwab (Sleep Quality & Dreams)</span>
                    <div className="font-bold text-slate-900">{patient?.unani?.naum || "Naum Mutadil (Sound 7-8h Sleep)"}</div>
                    <span className="text-[9px] text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded">Patient Reported</span>
                  </div>
                </div>
              </div>
            )}

            {/* 4. HOMEOPATHY ASSESSMENT */}
            {system === "HOMEOPATHY" && (
              <div className="space-y-3">
                <div className="bg-blue-50/80 border-2 border-blue-300 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">💊</span>
                    <div>
                      <strong className="text-blue-950 font-black text-sm block">Homeopathic Constitutional Modalities & Generals</strong>
                      <span className="text-[11px] text-blue-800">Thermal Reactions, Thirst Modalities & Mental Generals</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-blue-100 text-blue-900 rounded-full font-black text-[11px] border border-blue-300 shadow-xs">
                    Thermal: {patient?.homeopathy?.thermal || "Chilly"}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">1. Thermal Reaction (Cold vs Heat Sensitivity)</span>
                    <div className="font-bold text-slate-900">{patient?.homeopathy?.thermal || "Chilly Patient"}</div>
                    <span className="text-[9px] text-blue-700 font-bold bg-blue-50 px-1.5 py-0.5 rounded">Patient Reported</span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">2. Thirst & Water Modalities</span>
                    <div className="font-bold text-slate-900">{patient?.homeopathy?.thirst || "Thirst for Large Quantities"}</div>
                    <span className="text-[9px] text-blue-700 font-bold bg-blue-50 px-1.5 py-0.5 rounded">Patient Reported</span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">3. Weather & Time Modalities (Aggravations)</span>
                    <div className="font-bold text-slate-900">{patient?.homeopathy?.weather || "Aggravated by Damp / Cold Weather"}</div>
                    <span className="text-[9px] text-blue-700 font-bold bg-blue-50 px-1.5 py-0.5 rounded">Patient Reported</span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">4. Mental & Emotional Generals</span>
                    <div className="font-bold text-slate-900">{patient?.homeopathy?.mind || "Calm, Quiet & Contented"}</div>
                    <span className="text-[9px] text-blue-700 font-bold bg-blue-50 px-1.5 py-0.5 rounded">Patient Reported</span>
                  </div>
                </div>
              </div>
            )}

            {/* 5. YOGA & NATUROPATHY ASSESSMENT */}
            {system === "YOGA_NATUROPATHY" && (
              <div className="space-y-3">
                <div className="bg-indigo-50/80 border-2 border-indigo-300 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🧘</span>
                    <div>
                      <strong className="text-indigo-950 font-black text-sm block">Yoga Therapy & Naturopathy Holistic Profile</strong>
                      <span className="text-[11px] text-indigo-800">Physical Movement, Regularity, Stress Profile & Therapeutic Goals</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-indigo-100 text-indigo-900 rounded-full font-black text-[11px] border border-indigo-300 shadow-xs">
                    Goal: {patient?.yogaNaturopathy?.goal || "Pain Relief & Joint Mobility"}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">1. Physical Activity / Sedentary Index</span>
                    <div className="font-bold text-slate-900">{patient?.yogaNaturopathy?.activity || "Moderate Activity (Daily Chores)"}</div>
                    <span className="text-[9px] text-indigo-700 font-bold bg-indigo-50 px-1.5 py-0.5 rounded">Patient Reported</span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">2. Regularity of Yoga / Exercise Practice</span>
                    <div className="font-bold text-slate-900">{patient?.yogaNaturopathy?.practice || "Regular Practitioner"}</div>
                    <span className="text-[9px] text-indigo-700 font-bold bg-indigo-50 px-1.5 py-0.5 rounded">Patient Reported</span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">3. Stress & Muscle Tension Profile</span>
                    <div className="font-bold text-slate-900">{patient?.yogaNaturopathy?.stress || "Calm & Relaxed"}</div>
                    <span className="text-[9px] text-indigo-700 font-bold bg-indigo-50 px-1.5 py-0.5 rounded">Patient Reported</span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">4. Primary Naturopathy & Yoga Therapy Goal</span>
                    <div className="font-bold text-slate-900">{patient?.yogaNaturopathy?.goal || "Pain Relief & Joint Mobility"}</div>
                    <span className="text-[9px] text-indigo-700 font-bold bg-indigo-50 px-1.5 py-0.5 rounded">Patient Reported</span>
                  </div>
                </div>
              </div>
            )}
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
