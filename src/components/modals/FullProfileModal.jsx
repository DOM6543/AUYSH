import React from "react";
import { X, User, Phone, MapPin, Globe, Shield, CreditCard, HeartPulse } from "lucide-react";
import { usePatient } from "../../context/PatientContext";

export default function FullProfileModal() {
  const { isProfileModalOpen, setIsProfileModalOpen, patient } = usePatient();

  if (!isProfileModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-[#032e25] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={patient.avatarUrl}
              alt={patient.name}
              className="w-10 h-10 rounded-full border border-emerald-400 object-cover"
            />
            <div>
              <h3 className="font-bold text-base">{patient.name}</h3>
              <p className="text-xs text-emerald-300">ABHA ID: {patient.abhaAddress}</p>
            </div>
          </div>
          <button
            onClick={() => setIsProfileModalOpen(false)}
            className="p-1 text-emerald-200 hover:text-white rounded-lg transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-slate-500 font-medium block">Age & Gender</span>
              <span className="text-slate-900 font-bold text-sm mt-0.5 block">
                {patient.age} Years / {patient.gender}
              </span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-slate-500 font-medium block">Mobile Contact</span>
              <span className="text-slate-900 font-bold text-sm mt-0.5 block">
                {patient.mobile}
              </span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-slate-500 font-medium block">Primary Language</span>
              <span className="text-slate-900 font-bold text-sm mt-0.5 block">
                {patient.language} (English Proficient)
              </span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-slate-500 font-medium block">Registration Type</span>
              <span className="text-slate-900 font-bold text-sm mt-0.5 block">
                {patient.registrationType} (Kiosk Verified)
              </span>
            </div>
          </div>

          <div className="bg-emerald-50/60 p-3.5 rounded-xl border border-emerald-200">
            <div className="flex items-center gap-2 mb-1 text-emerald-900 font-bold">
              <Shield className="w-4 h-4 text-emerald-700" />
              Ayushman Bharat Digital Mission (ABDM) Integration
            </div>
            <p className="text-[11px] text-emerald-800 leading-relaxed">
              ABHA Number: <strong>{patient.abhaNumber}</strong> is linked and e-KYC verified via Aadhaar biometric authentication at Kiosk K-03.
            </p>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-slate-500 font-medium block mb-1">Emergency Contact</span>
            <div className="text-slate-800 font-medium">
              Kavitha Kumar (Spouse) — +91 98765 12345
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={() => setIsProfileModalOpen(false)}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
