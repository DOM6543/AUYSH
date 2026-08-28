import React from "react";
import { PatientProvider, usePatient } from "./context/PatientContext";
import PortalLoginPage from "./components/auth/PortalLoginPage";
import AccessiblePatientKiosk from "./components/kiosk/AccessiblePatientKiosk";
import Sidebar from "./components/layout/Sidebar";
import TopNav from "./components/layout/TopNav";

// Views
import DashboardView from "./components/views/DashboardView";
import PatientsListView from "./components/views/PatientsListView";
import AppointmentsView from "./components/views/AppointmentsView";
import KioskSessionsView from "./components/views/KioskSessionsView";
import DocumentsView from "./components/views/DocumentsView";
import ReportsView from "./components/views/ReportsView";
import AyushHistoryView from "./components/views/AyushHistoryView";
import AlertsView from "./components/views/AlertsView";
import AnalyticsView from "./components/views/AnalyticsView";
import SettingsView from "./components/views/SettingsView";

// Modals
import AIAssistantDrawer from "./components/modals/AIAssistantDrawer";
import EditSummaryModal from "./components/modals/EditSummaryModal";
import RejectSummaryModal from "./components/modals/RejectSummaryModal";
import DocumentViewerModal from "./components/modals/DocumentViewerModal";
import FullProfileModal from "./components/modals/FullProfileModal";
import FullTimelineModal from "./components/modals/FullTimelineModal";
import RedFlagsModal from "./components/modals/RedFlagsModal";
import CommandPalette from "./components/modals/CommandPalette";
import Toast from "./components/modals/Toast";

function DoctorAppContent() {
  const { activeNav, isLoading, error, isConnected } = usePatient();

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
      <Sidebar />

      {/* 2. Main Work Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Search & Controls */}
        <TopNav />

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
          </div>
        </div>

        {/* Dynamic Main View Content */}
        <main className="flex-1 p-6 max-w-[1440px] w-full mx-auto">
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

      {/* Global Modals & Drawers */}
      <AIAssistantDrawer />
      <EditSummaryModal />
      <RejectSummaryModal />
      <DocumentViewerModal />
      <FullProfileModal />
      <FullTimelineModal />
      <RedFlagsModal />
      <CommandPalette />
      <Toast />
    </div>
  );
}

function MainPortalRouter() {
  const { portalMode } = usePatient();

  if (portalMode === "login") {
    return <PortalLoginPage />;
  }

  if (portalMode === "kiosk") {
    return <AccessiblePatientKiosk />;
  }

  return <DoctorAppContent />;
}

export default function App() {
  return (
    <PatientProvider>
      <MainPortalRouter />
    </PatientProvider>
  );
}
