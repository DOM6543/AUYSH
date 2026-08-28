import React, { useRef } from "react";
import { FileText, Image as ImageIcon, UploadCloud } from "lucide-react";
import { usePatient } from "../../context/PatientContext";

export default function DocumentsCard() {
  const { patient, setSelectedDocument, uploadNewDocument, setActiveNav } = usePatient();
  const { documents } = patient;
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadNewDocument(file);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-4 flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900">
            Documents ({documents.length})
          </h3>
          <button
            onClick={() => setActiveNav("documents")}
            className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 transition cursor-pointer"
          >
            View All
          </button>
        </div>

        {/* Document List */}
        <div className="space-y-2 py-1">
          {documents.map((doc) => (
            <div
              key={doc.id}
              onClick={() => setSelectedDocument(doc)}
              className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition cursor-pointer group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {/* File Type Icon */}
                <div className="shrink-0">
                  {doc.type === "pdf" ? (
                    <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center border border-red-100">
                      <FileText className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                      <ImageIcon className="w-4 h-4" />
                    </div>
                  )}
                </div>

                {/* File Details */}
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-slate-800 group-hover:text-emerald-800 transition-colors truncate">
                    {doc.name}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    Uploaded on {doc.uploadedAt}
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <span className="shrink-0 ml-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                {doc.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Upload Dropzone */}
      <div className="pt-3 mt-1">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept=".pdf,.jpg,.jpeg,.png"
        />
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-200 hover:border-emerald-500 bg-slate-50/60 hover:bg-emerald-50/30 rounded-xl p-3.5 flex flex-col items-center justify-center text-center cursor-pointer transition group"
        >
          <div className="w-7 h-7 rounded-full bg-slate-100 group-hover:bg-emerald-100 flex items-center justify-center text-slate-500 group-hover:text-emerald-700 mb-1.5 transition">
            <UploadCloud className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold text-slate-700 group-hover:text-emerald-900 transition">
            Upload More Documents
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5">
            PDF, JPG, PNG up to 10MB
          </span>
        </div>
      </div>
    </div>
  );
}
