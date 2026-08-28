import React, { useState } from "react";
import {
  Stethoscope,
  Touchpad,
  ShieldCheck,
  Building2,
  Users,
  Activity,
  HeartPulse,
  Sparkles,
  ArrowRight,
  Monitor,
  CheckCircle2,
  Volume2,
  Lock,
  Globe,
  UserPlus,
  LogIn,
  Plus
} from "lucide-react";
import { usePatient } from "../../context/PatientContext";
import DoctorAuthModal from "./DoctorAuthModal";
import LanguageSelector from "../common/LanguageSelector";

export default function PortalLoginPage() {
  const { setPortalMode, t } = usePatient();
  const [showDoctorAuthModal, setShowDoctorAuthModal] = useState(false);
  const [initialDoctorTab, setInitialDoctorTab] = useState("login");

  const openDoctorAuth = (tabName = "login") => {
    setInitialDoctorTab(tabName);
    setShowDoctorAuthModal(true);
  };

  const handleLaunchKiosk = () => {
    setPortalMode("kiosk");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-red-50/40 text-slate-900 flex flex-col justify-between p-4 sm:p-8 font-sans selection:bg-red-600 selection:text-white">
      {/* Top Header */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between py-4 border-b border-red-100">
        <div className="flex items-center gap-3">
          {/* Medical Red Cross Icon */}
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-red-600/25">
            <Plus className="w-7 h-7 stroke-[3.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight text-slate-900">{t.appName}</span>
              <span className="px-2.5 py-0.5 rounded-full bg-red-100 border border-red-200 text-[10px] font-black text-red-700 uppercase tracking-wider">
                {t.emergencyBadge}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium hidden sm:block">
              {t.networkTitle}
            </p>
          </div>
        </div>

        {/* Top Right Controls: Firebase Sync status + Language Selector */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 bg-white border border-red-100 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>{t.connectedStatus}</span>
          </div>

          {/* Top Right Local Language Selector */}
          <LanguageSelector variant="light" />
        </div>
      </header>

      {/* Main Choice Section */}
      <main className="max-w-5xl w-full mx-auto py-8 sm:py-12 space-y-8">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-50 border border-red-200 text-red-700 text-xs font-bold shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-red-600" />
            <span>{t.selectLanguage}: {t.networkTitle}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
            {t.welcomeTitle}
          </h1>
          <p className="text-sm sm:text-base text-slate-600">
            {t.welcomeSubtitle}
          </p>
        </div>

        {/* 2 Big Red & White Choice Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-stretch pt-4">
          
          {/* OPTION 1: DOCTOR / CLINICIAN PORTAL */}
          <div className="relative group bg-white hover:bg-white border-2 border-slate-200 hover:border-red-500 rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-red-500/10">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center shadow-sm group-hover:scale-105 group-hover:bg-red-600 group-hover:text-white transition-all">
                  <Stethoscope className="w-8 h-8" />
                </div>
                <span className="px-3 py-1 rounded-full bg-red-50 border border-red-200 text-xs font-bold text-red-700">
                  {t.doctorCardRole}
                </span>
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-black text-slate-900 group-hover:text-red-600 transition-colors">
                  {t.doctorCardTitle}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {t.doctorCardDesc}
                </p>
              </div>

              {/* Feature Highlights */}
              <div className="space-y-2.5 pt-2 border-t border-slate-100 text-xs text-slate-700 font-medium">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{t.doctorFeature1}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{t.doctorFeature2}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{t.doctorFeature3}</span>
                </div>
              </div>
            </div>

            <div className="pt-8 space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => openDoctorAuth("login")}
                  className="flex-1 py-3.5 px-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black rounded-2xl shadow-lg shadow-red-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer text-sm active:scale-95"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{t.doctorSignInBtn}</span>
                </button>

                <button
                  onClick={() => openDoctorAuth("register")}
                  className="flex-1 py-3.5 px-4 bg-white hover:bg-red-50 border-2 border-red-200 hover:border-red-400 text-red-700 font-bold rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer text-sm active:scale-95 shadow-xs"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{t.doctorRegisterBtn}</span>
                </button>
              </div>

              <p className="text-[11px] text-center text-slate-500">
                {t.doctorSecureNotice}
              </p>
            </div>
          </div>

          {/* OPTION 2: PATIENT TOUCH KIOSK */}
          <div className="relative group bg-gradient-to-br from-red-600 via-rose-600 to-red-700 text-white border-2 border-red-500 rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 shadow-2xl hover:shadow-red-600/30 ring-4 ring-red-100">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="w-16 h-16 rounded-2xl bg-white text-red-600 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                  <Touchpad className="w-8 h-8 text-red-600" />
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 border border-white/30 text-xs font-black text-white">
                  <Volume2 className="w-3.5 h-3.5 text-white animate-pulse" />
                  <span>{t.kioskBadge}</span>
                </div>
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-black text-white transition-colors flex items-center gap-2">
                  <span>{t.kioskCardTitle}</span>
                </h2>
                <p className="text-xs sm:text-sm text-red-100 leading-relaxed">
                  {t.kioskCardDesc}
                </p>
              </div>

              {/* Patient Kiosk Highlights */}
              <div className="space-y-2.5 pt-2 border-t border-white/20 text-xs text-white/95 font-medium">
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-white shrink-0" />
                  <span>{t.kioskFeature1}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-white shrink-0" />
                  <span>{t.kioskFeature2}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-white shrink-0" />
                  <span>{t.kioskFeature3}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-white shrink-0" />
                  <span>{t.kioskFeature4}</span>
                </div>
              </div>
            </div>

            <div className="pt-8 space-y-3">
              <button
                onClick={handleLaunchKiosk}
                className="w-full py-4 px-6 bg-white hover:bg-red-50 text-red-700 hover:text-red-800 font-black rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3 cursor-pointer group-hover:scale-[1.02] text-lg active:scale-95"
              >
                <Touchpad className="w-6 h-6 text-red-600" />
                <span>{t.kioskStartBtn}</span>
                <ArrowRight className="w-5 h-5 text-red-600" />
              </button>
              <p className="text-[11px] text-center text-red-100">
                {t.kioskSyncNotice}
              </p>
            </div>
          </div>

        </div>

        {/* Local Language Banner */}
        <div className="bg-white border border-red-100 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-700 shadow-xs">
          <div className="flex items-center gap-2 text-red-700 font-bold">
            <Globe className="w-4 h-4 text-red-600 shrink-0" />
            <span>{t.selectLanguage} (8 Regional Languages Available on Top Right):</span>
          </div>
          <div className="flex flex-wrap items-center gap-2 font-semibold text-slate-800">
            <span className="px-2.5 py-1 bg-red-50 text-red-800 rounded-lg border border-red-100">🇬🇧 English</span>
            <span className="px-2.5 py-1 bg-red-50 text-red-800 rounded-lg border border-red-100">🇮🇳 हिन्दी (Hindi)</span>
            <span className="px-2.5 py-1 bg-red-50 text-red-800 rounded-lg border border-red-100">🇮🇳 தமிழ் (Tamil)</span>
            <span className="px-2.5 py-1 bg-red-50 text-red-800 rounded-lg border border-red-100">🇮🇳 తెలుగు (Telugu)</span>
            <span className="px-2.5 py-1 bg-red-50 text-red-800 rounded-lg border border-red-100">🇮🇳 ಕನ್ನಡ (Kannada)</span>
            <span className="px-2.5 py-1 bg-red-50 text-red-800 rounded-lg border border-red-100">🇮🇳 বাংলা (Bengali)</span>
            <span className="px-2.5 py-1 bg-red-50 text-red-800 rounded-lg border border-red-100">🇮🇳 मराठी (Marathi)</span>
            <span className="px-2.5 py-1 bg-red-50 text-red-800 rounded-lg border border-red-100">🇮🇳 ગુજરાતી (Gujarati)</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl w-full mx-auto py-4 border-t border-red-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
        <div className="flex items-center gap-2 font-medium">
          <Building2 className="w-4 h-4 text-red-600" />
          <span>{t.networkTitle} · MediKiosk Red & White Health Platform</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Source: Firebase Realtime Database</span>
          <span>·</span>
          <span>Integrative Healthcare OPD</span>
        </div>
      </footer>

      {/* Doctor Login & Registration Modal */}
      <DoctorAuthModal
        isOpen={showDoctorAuthModal}
        initialTab={initialDoctorTab}
        onClose={() => setShowDoctorAuthModal(false)}
      />
    </div>
  );
}
