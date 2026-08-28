import React from "react";
import { FileText, Download, Eye, UploadCloud, ShieldCheck } from "lucide-react";
import { usePatient } from "../../context/PatientContext";

export default function DocumentsView() {
  const { patient, setSelectedDocument, showToast } = usePatient();

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">ABDM Clinical Documents & EHR Repository</h2>
          <p className="text-xs text-slate-500">Ingested prescriptions, imaging, lab summaries, and hospital discharge notes</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {patient.documents.map((doc) => (
          <div key={doc.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {doc.category}
                </span>
                <span className="text-[11px] text-slate-400">{doc.size}</span>
              </div>
              <h4 className="font-bold text-sm text-slate-900">{doc.name}</h4>
              <p className="text-[11px] text-slate-500 mt-1">Uploaded: {doc.uploadedAt}</p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                onClick={() => setSelectedDocument(doc)}
                className="flex-1 py-1.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-lg transition cursor-pointer text-center"
              >
                Preview OCR
              </button>
              <button
                onClick={() => showToast(`Downloaded "${doc.name}"`, "info")}
                className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
