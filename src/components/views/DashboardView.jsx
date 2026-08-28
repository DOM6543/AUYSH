import React from "react";
import PatientHeader from "../patient/PatientHeader";
import QuickStatsRow from "../patient/QuickStatsRow";
import PatientInfoCard from "../patient/PatientInfoCard";
import PatientTimelineCard from "../patient/PatientTimelineCard";
import AISummaryCard from "../patient/AISummaryCard";
import VitalsCard from "../patient/VitalsCard";
import DocumentsCard from "../patient/DocumentsCard";
import Footer from "../layout/Footer";
import { usePatient } from "../../context/PatientContext";

export default function DashboardView() {
  const { patient, loading } = usePatient();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-3">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-semibold text-slate-600">Connecting to Firebase Realtime Database...</span>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-4 shadow-xs">
        <h3 className="text-lg font-bold text-slate-800">No Active Patient Record Found</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          No patient is currently selected or registered in Firebase Realtime Database. Use the Patient Kiosk tab to submit a new intake.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 1. Patient Subheader */}
      <PatientHeader />

      {/* 2. Top Metric Stat Cards (5 across) */}
      <QuickStatsRow />

      {/* 3. Main 3-Column Content Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 lg:grid-cols-12 gap-4 items-start">
        {/* Left Column: Patient Information & Timeline (3 cols) */}
        <div className="md:col-span-4 lg:col-span-3 space-y-4">
          <PatientInfoCard />
          <PatientTimelineCard />
        </div>

        {/* Middle Column: AI Generated Summary & Clinical Sub-tabs (6 cols) */}
        <div className="md:col-span-8 lg:col-span-6">
          <AISummaryCard />
        </div>

        {/* Right Column: Vitals & Documents (3 cols) */}
        <div className="md:col-span-12 lg:col-span-3 space-y-4">
          <VitalsCard />
          <DocumentsCard />
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
