import React, { useState } from "react";
import { usePatient } from "../../context/PatientContext";
import Sidebar from "../layout/Sidebar";
import TopNav from "../layout/TopNav";
import DoctorAuthModal from "../auth/DoctorAuthModal";

// Dynamic Clinical Views
import DashboardView from "../views/DashboardView";
import PatientsListView from "../views/PatientsListView";
import AppointmentsView from "../views/AppointmentsView";
import KioskSessionsView from "../views/KioskSessionsView";
import DocumentsView from "../views/DocumentsView";
import ReportsView from "../views/ReportsView";
import AyushHistoryView from "../views/AyushHistoryView";
import AlertsView from "../views/AlertsView";
import AnalyticsView from "../views/AnalyticsView";
import SettingsView from "../views/SettingsView";

// Clinician Modals & Drawers
import AIAssistantDrawer from "../modals/AIAssistantDrawer";
import EditSummaryModal from "../modals/EditSummaryModal";
import RejectSummaryModal from "../modals/RejectSummaryModal";
import DocumentViewerModal from "../modals/DocumentViewerModal";
import FullProfileModal from "../modals/FullProfileModal";
import FullTimelineModal from "../modals/FullTimelineModal";
import RedFlagsModal from "../modals/RedFlagsModal";
import CommandPalette from "../modals/CommandPalette";
import Toast from "../modals/Toast";

export default function DoctorWorkstationApp() {
  const { activeNav, isLoading, error, currentUser } = usePatient();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authTab, setAuthTab] = useState("login");

  const openAuth = (tabName = "login") => {
    setAuthTab(tabName);
    setShowAuthModal(true);
  };

  const renderActiveView = () => {
    switch (activeNav) {
      case "dashboard":
        return <DashboardView />;
      case "patients":
        return <PatientsListView />;
      case "appointments":
        return <AppointmentsView />;
      case "kiosks":
        return <KioskSessionsView />;
      case "documents":
        return <DocumentsView />;
      case "reports":
        return <ReportsView />;
      case "ayush":
        return <AyushHistoryView />;
      case "alerts":
        return <AlertsView />;
      case "analytics":
        return <AnalyticsView />;
      case "settings":
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f4f7f6] text-slate-800 font-sans antialiased">
      {/* 1. Left Sidebar Navigation */}
      <Sidebar onOpenAuth={openAuth} />

      {/* 2. Main Work Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Search & Controls */}
        <TopNav onOpenAuth={openAuth} />

        {/* Live Firebase Sync Bar */}
        <div className="bg-[#180808] text-red-100 text-[11px] font-semibold px-6 py-1 flex items-center justify-between border-b border-red-900/60">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span>Firebase Realtime Database: <strong>medikiosk-7cf65</strong> synchronized</span>
          </div>
          <div className="hidden sm:flex items-center gap-3 text-red-300/80">
            <span>Source of Truth: Realtime DB</span>
            <span>·</span>
            <span>ABDM Gateway Live</span>
            <span>·</span>
            <span>Physician: <strong>{currentUser?.name || "Dr. Ramesh Kumar"}</strong></span>
          </div>
        </div>

        {/* Dynamic Main View Content */}
        <main className="flex-1 p-4 sm:p-6 max-w-[1440px] w-full mx-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 space-y-3">
              <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-semibold text-slate-600">Connecting to Firebase Realtime Database...</span>
            </div>
          ) : error ? (
            <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm">
              <strong>Database Connection Error:</strong> {error}
            </div>
          ) : (
            renderActiveView()
          )}
        </main>
      </div>

      {/* Global Clinical Modals & Drawers */}
      <AIAssistantDrawer />
      <EditSummaryModal />
      <RejectSummaryModal />
      <DocumentViewerModal />
      <FullProfileModal />
      <FullTimelineModal />
      <RedFlagsModal />
      <CommandPalette />
      <Toast />

      {/* Doctor Authentication Modal */}
      <DoctorAuthModal
        isOpen={showAuthModal}
        initialTab={authTab}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
}
