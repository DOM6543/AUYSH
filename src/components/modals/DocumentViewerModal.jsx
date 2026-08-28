import React, { useState } from "react";
import { X, FileText, Download, CheckCircle, ShieldCheck, Eye, ListTree } from "lucide-react";
import { usePatient } from "../../context/PatientContext";

export default function DocumentViewerModal() {
  const { selectedDocument, setSelectedDocument, showToast } = usePatient();
  const [viewMode, setViewMode] = useState("preview"); // preview, ocr, metadata

  if (!selectedDocument) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-sm">{selectedDocument.name}</div>
              <div className="text-[11px] text-slate-400">
                Uploaded: {selectedDocument.uploadedAt} · Size: {selectedDocument.size}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => showToast(`Downloaded "${selectedDocument.name}"`, "info")}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              title="Download file"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={() => setSelectedDocument(null)}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sub-bar / Mode Tabs */}
        <div className="px-6 py-2 bg-slate-100 border-b border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setViewMode("preview")}
              className={`flex items-center gap-1.5 py-1 font-semibold cursor-pointer ${
                viewMode === "preview" ? "text-emerald-700 border-b-2 border-emerald-700" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              Document Preview
            </button>
            <button
              onClick={() => setViewMode("ocr")}
              className={`flex items-center gap-1.5 py-1 font-semibold cursor-pointer ${
                viewMode === "ocr" ? "text-emerald-700 border-b-2 border-emerald-700" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <ListTree className="w-3.5 h-3.5" />
              Extracted OCR Entities
            </button>
          </div>
          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            <CheckCircle className="w-3 h-3" />
            Verified by Kiosk OCR
          </span>
        </div>

        {/* Content Viewer */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50 text-xs">
          {viewMode === "preview" ? (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs max-w-xl mx-auto space-y-4">
              {/* Document Header */}
              <div className="border-b pb-3 flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    {selectedDocument.previewContent?.hospital || "AIIMS Healthcare Repository"}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Patient: Arun Kumar | ABHA: 91-XXXX-XXXX-1234
                  </p>
                </div>
                <div className="text-right text-[11px] text-slate-400">
                  {selectedDocument.previewContent?.date || selectedDocument.uploadedAt}
                </div>
              </div>

              {/* Lab findings if available */}
              {selectedDocument.previewContent?.findings && (
                <div>
                  <h5 className="font-bold text-slate-800 mb-2">Diagnostic Test Results</h5>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 text-slate-600 font-semibold border-b">
                        <tr>
                          <th className="p-2">Test Name</th>
                          <th className="p-2">Result</th>
                          <th className="p-2">Reference</th>
                          <th className="p-2">Flag</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y text-slate-700">
                        {selectedDocument.previewContent.findings.map((f, i) => (
                          <tr key={i}>
                            <td className="p-2 font-medium">{f.test}</td>
                            <td className="p-2 font-bold">{f.result}</td>
                            <td className="p-2 text-slate-500">{f.reference}</td>
                            <td className="p-2">
                              <span
                                className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                  f.status === "Normal"
                                    ? "bg-slate-100 text-slate-700"
                                    : "bg-red-50 text-red-700"
                                }`}
                              >
                                {f.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Rx if prescription */}
              {selectedDocument.previewContent?.rx && (
                <div>
                  <h5 className="font-bold text-slate-800 mb-2">Prescribed Medications</h5>
                  <ul className="space-y-1.5">
                    {selectedDocument.previewContent.rx.map((r, i) => (
                      <li key={i} className="p-2 bg-slate-50 rounded-lg border border-slate-200 font-medium text-slate-800">
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Doctor / Hospital Notes */}
              {selectedDocument.previewContent?.notes && (
                <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-200/60">
                  <span className="font-bold text-emerald-950 block mb-1">Clinical Impressions:</span>
                  <p className="text-emerald-900 leading-relaxed">
                    {selectedDocument.previewContent.notes}
                  </p>
                </div>
              )}

              {/* Admission / Diagnosis */}
              {selectedDocument.previewContent?.primaryDiagnosis && (
                <div className="space-y-2">
                  <div>
                    <span className="font-bold text-slate-800">Primary Diagnosis: </span>
                    <span className="text-slate-700">{selectedDocument.previewContent.primaryDiagnosis}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-800">Course in Hospital: </span>
                    <span className="text-slate-700">{selectedDocument.previewContent.treatment}</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-900 text-emerald-400 p-4 rounded-xl font-mono text-xs leading-relaxed max-w-2xl mx-auto overflow-x-auto">
              <div className="text-slate-500 mb-2">// MEDIKIOSK AI OCR INGEST ENGINE v4.2</div>
              <div>PATIENT_NAME: "Arun Kumar"</div>
              <div>ABHA_ID: "arun.kumar@abdm"</div>
              <div>DOCUMENT_REF: "{selectedDocument.name}"</div>
              <div>CONFIDENCE_SCORE: 0.994</div>
              <div>INGEST_TIMESTAMP: "{selectedDocument.uploadedAt}"</div>
              <div>--- ENTITIES EXTRACTED ---</div>
              <div>SYMPTOM: "Chest heaviness on exertion"</div>
              <div>DRUG: "Amlodipine 5mg OD"</div>
              <div>BP_VALUE: "140/90 mmHg"</div>
              <div>DISCLAIMER: "All extracted values verified against digital health standards."</div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Encrypted & ABDM compliant storage
          </span>
          <button
            onClick={() => setSelectedDocument(null)}
            className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold transition cursor-pointer"
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
}
