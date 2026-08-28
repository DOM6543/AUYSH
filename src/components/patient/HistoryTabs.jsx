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
  Activity
} from "lucide-react";

export default function HistoryTabs() {
  const { activeTab, setActiveTab, patient, ayushInfo, addClinicalNote, uploadNewDocument } = usePatient();
  const { aiSummary = {}, examination = {}, lifestyle = {}, clinicalNotes = [], documents = [] } = patient || {};

  const [newNoteText, setNewNoteText] = useState("");
  const [noteCategory, setNoteCategory] = useState("Clinical Progress Note");
  const fileInputRef = useRef(null);

  const tabs = [
    { id: "history", label: "History & Kiosk Intake" },
    { id: "notes", label: `Physician Notes (${clinicalNotes.length})` },
    { id: "ayush", label: "AYUSH History" },
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
    <div className="pt-4 border-t border-slate-100">
      {/* Sub-Tabs Nav */}
      <div className="flex items-center gap-6 border-b border-slate-200 text-xs font-semibold overflow-x-auto pb-0.5 custom-scrollbar">
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
      <div className="pt-4 text-xs">
        
        {/* ========================================================================= */}
        {/* TAB 1: HISTORY & KIOSK INTAKE SUMMARY */}
        {/* ========================================================================= */}
        {activeTab === "history" && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* Kiosk Intake Telemetry Banner */}
            <div className="bg-red-50/70 border border-red-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
                <strong className="text-slate-900 font-black">Self-Service Kiosk Verified Intake:</strong>
                <span className="text-slate-700 font-semibold">{patient?.chiefComplaint || aiSummary.chiefComplaint}</span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-slate-600">
                <span>Duration: <strong className="text-slate-900">{patient?.duration || "2 - 3 Days"}</strong></span>
                <span>·</span>
                <span>Pain Score: <strong className="text-red-700">{patient?.painLevel ?? 4}/10</strong></span>
                <span>·</span>
                <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-800 font-bold border border-red-200">
                  Auto-Approved
                </span>
              </div>
            </div>

            {/* Systemic Review (ROS) */}
            <div>
              <h4 className="font-bold text-slate-800 text-xs mb-1">
                Systemic Review (ROS)
              </h4>
              <p className="text-slate-600 leading-relaxed">
                {aiSummary.systemicReview || "Patient completed automated ROS intake. No acute distress observed."}
              </p>
            </div>

            {/* Past Medical History & Pre-existing Illnesses */}
            <div>
              <h4 className="font-bold text-slate-800 text-xs mb-1.5">
                Past Medical History & Chronic Conditions
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600">
                {(aiSummary.pastHistory || []).map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                    <span className="text-slate-800 font-semibold">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Family History */}
            <div>
              <h4 className="font-bold text-slate-800 text-xs mb-1.5">
                Family History
              </h4>
              <div className="space-y-1 text-slate-600">
                {(aiSummary.familyHistory || []).map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                    <span>
                      <strong className="text-slate-700">{item.relation || "Family"}:</strong>{" "}
                      {item.condition || "Non-contributory"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: PHYSICIAN CLINICAL NOTES & FILE ATTACHMENTS (DOCTOR EXCLUSIVE) */}
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

                  {/* Quick File Attach Button */}
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
                    title="Attach file for this patient"
                  >
                    <Paperclip className="w-3.5 h-3.5" />
                    <span>Attach File</span>
                  </button>
                </div>
              </div>

              <textarea
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                placeholder="Type clinical observations, prescription advice, diagnostic findings, or patient instructions..."
                rows={3}
                className="w-full p-3 bg-slate-50 focus:bg-white border border-slate-200 focus:border-red-500 rounded-xl text-xs font-medium text-slate-900 outline-none transition resize-none placeholder:text-slate-400"
              />

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-400">
                  Signed as: <strong>Dr. Ramesh Kumar</strong> · Synced with Firebase
                </span>

                <button
                  type="submit"
                  disabled={!newNoteText.trim()}
                  className="px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 disabled:opacity-50 text-white font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm cursor-pointer active:scale-95"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Save Note to Firebase</span>
                </button>
              </div>
            </form>

            {/* List of Clinical Notes for this Patient */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800 px-1">
                <span>Recorded Clinical Notes ({clinicalNotes.length})</span>
                <span className="text-[11px] text-slate-400">Chronological Record</span>
              </div>

              {clinicalNotes.length === 0 ? (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center text-slate-500">
                  <FileText className="w-8 h-8 mx-auto text-slate-400 mb-1.5" />
                  <p className="font-semibold">No progress notes written for {patient?.name} yet.</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Use the form above to add remarks or attach medical documents.</p>
                </div>
              ) : (
                clinicalNotes.map((note, idx) => (
                  <div key={note.id || idx} className="bg-white border border-red-100 rounded-xl p-3.5 shadow-xs space-y-2">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-700 font-bold text-[10px] border border-red-200">
                          {note.category || "Clinical Note"}
                        </span>
                        <strong className="text-slate-800 font-bold text-xs">{note.author || "Dr. Ramesh Kumar"}</strong>
                        <span className="text-[10px] text-slate-400">({note.role || "Consultant"})</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                        <Clock className="w-3 h-3" />
                        <span>{note.timestamp || "Just now"} · {note.date || "Today"}</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-700 font-normal leading-relaxed whitespace-pre-wrap">
                      {note.content}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Attached Patient Documents for this Patient */}
            {documents.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <h4 className="font-bold text-slate-800 text-xs px-1">Attached Files for {patient?.name} ({documents.length})</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {documents.map((doc) => (
                    <div key={doc.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <Paperclip className="w-4 h-4 text-red-600 shrink-0" />
                        <div className="truncate">
                          <span className="font-bold text-slate-800 text-xs block truncate">{doc.name}</span>
                          <span className="text-[10px] text-slate-400">{doc.uploadedAt} · {doc.size || "1.2 MB"}</span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {doc.status || "Synced"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: AYUSH HISTORY (AYURVEDIC INTAKE) */}
        {/* ========================================================================= */}
        {activeTab === "ayush" && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* Prakriti & Vikriti */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-amber-50/50 p-3 rounded-xl border border-amber-200/60">
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

              <div className="bg-rose-50/40 p-3 rounded-xl border border-rose-200/60">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-rose-900">Vikriti (Imbalance State)</span>
                  <span className="text-[11px] font-semibold text-rose-800 bg-rose-100 px-2 py-0.5 rounded">
                    {ayushInfo.vikriti.imbalanceSeverity} Imbalance
                  </span>
                </div>
                <p className="text-[11px] text-slate-700 leading-relaxed">
                  {ayushInfo.vikriti.clinicalNotes}
                </p>
                <div className="mt-2 text-[11px] font-semibold text-rose-800">
                  Imbalanced Sub-doshas: {ayushInfo.vikriti.affectedSubdoshas.join(", ")}
                </div>
              </div>
            </div>

            {/* Agni, Koshtha, Dhatu */}
            <div className="grid grid-cols-3 gap-2.5">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 font-medium block">Agni Status:</span>
                <strong className="text-slate-900 text-xs">{ayushInfo.agniStatus.type}</strong>
                <span className="text-[10px] text-slate-400 block mt-0.5">{ayushInfo.agniStatus.appetite}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 font-medium block">Koshtha:</span>
                <strong className="text-slate-900 text-xs">{ayushInfo.koshtha.type}</strong>
                <span className="text-[10px] text-slate-400 block mt-0.5">{ayushInfo.koshtha.bowelHabit}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 font-medium block">Primary Dhatu:</span>
                <strong className="text-slate-900 text-xs">{ayushInfo.dhatuKshaya.primaryAffected}</strong>
                <span className="text-[10px] text-slate-400 block mt-0.5">{ayushInfo.dhatuKshaya.status}</span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: VITALS TELEMETRY */}
        {/* ========================================================================= */}
        {activeTab === "vitals" && (
          <div className="space-y-3 animate-in fade-in duration-150">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Blood Pressure</span>
                <span className="text-base font-black text-red-700">{patient?.vitals?.bp?.value || "128/84"} mmHg</span>
                <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">Automated Scan</span>
              </div>
              <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Heart Rate</span>
                <span className="text-base font-black text-red-700">{patient?.vitals?.pulse?.value || "78"} bpm</span>
                <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">Normal Rhythm</span>
              </div>
              <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Blood Oxygen (SpO2)</span>
                <span className="text-base font-black text-red-700">{patient?.vitals?.spo2?.value || "98"}%</span>
                <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">Optimal</span>
              </div>
              <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Body Temperature</span>
                <span className="text-base font-black text-red-700">{patient?.vitals?.temperature?.value || "98.4"} °F</span>
                <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">Afebrile</span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: PHYSICAL EXAMINATION */}
        {/* ========================================================================= */}
        {activeTab === "examination" && (
          <div className="space-y-2.5 animate-in fade-in duration-150">
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-800">General Physical: </span>
              <span className="text-slate-600">{examination.general || "Conscious, oriented to time, place, and person."}</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-800">Cardiovascular System (CVS): </span>
              <span className="text-slate-600">{examination.cvs || "S1, S2 heard. No murmurs detected."}</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-800">Respiratory System (RS): </span>
              <span className="text-slate-600">{examination.rs || "Bilateral normal vesicular breath sounds."}</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-800">Abdomen: </span>
              <span className="text-slate-600">{examination.abdomen || "Soft, non-tender, no organomegaly."}</span>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: LIFESTYLE ASSESSMENT */}
        {/* ========================================================================= */}
        {activeTab === "lifestyle" && (
          <div className="space-y-2.5 animate-in fade-in duration-150">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-800 block mb-0.5">Diet & Nutrition:</span>
                <span className="text-slate-600">{lifestyle.diet || "Balanced regular home meals"}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-800 block mb-0.5">Sleep Pattern:</span>
                <span className="text-slate-600">{lifestyle.sleep || "6-7 hours/night"}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-800 block mb-0.5">Physical Activity:</span>
                <span className="text-slate-600">{lifestyle.physicalActivity || "Moderate walking"}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-800 block mb-0.5">Stress Level:</span>
                <span className="text-amber-700 font-semibold">{lifestyle.stressLevel || "Mild"}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
