import React from "react";
import {
  LayoutDashboard,
  Users,
  Calendar,
  MonitorCheck,
  FileText,
  FileBarChart,
  Flower2,
  BellRing,
  BarChart3,
  Settings,
  Bot,
  ChevronDown,
  Sparkles,
  Touchpad,
  Monitor,
  LogOut,
  Plus
} from "lucide-react";
import { usePatient } from "../../context/PatientContext";

export default function Sidebar() {
  const { activeNav, setActiveNav, setIsAiChatOpen, patient, currentUser, logoutToPortal, t } = usePatient();

  const navItems = [
    { id: "dashboard", label: t.navDashboard || "Dashboard", icon: LayoutDashboard },
    { id: "patients", label: t.navPatients || "Patients Directory", icon: Users },
    { id: "appointments", label: t.navAppointments || "Appointments", icon: Calendar },
    { id: "kiosks", label: t.navKiosks || "Kiosk Telemetry", icon: MonitorCheck },
    { id: "documents", label: t.navDocuments || "Documents", icon: FileText },
    { id: "reports", label: t.navReports || "Clinical Reports", icon: FileBarChart },
    { id: "ayush", label: t.navAyush || "AYUSH Assessment", icon: Flower2 },
    { id: "alerts", label: t.navAlerts || "Red-Flag Alerts", icon: BellRing },
    { id: "analytics", label: t.navAnalytics || "Analytics", icon: BarChart3 },
    { id: "settings", label: t.navSettings || "Settings", icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#0f172a] text-slate-200 flex flex-col justify-between shrink-0 h-screen sticky top-0 border-r border-slate-800 select-none font-sans z-30 overflow-y-auto custom-scrollbar">
      {/* Top Logo Section with Medical Red Cross */}
      <div className="p-4">
        <div className="flex items-center gap-3 px-2 py-1.5 cursor-pointer" onClick={() => setActiveNav("dashboard")}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-rose-600 flex items-center justify-center shadow-lg shadow-red-950/50 text-white font-black">
            <Plus className="w-6 h-6 stroke-[3.5]" />
          </div>
          <div>
            <div className="font-extrabold text-lg tracking-tight text-white flex items-center gap-1.5">
              MediKiosk
            </div>
            <div className="text-[11px] font-semibold text-red-400 -mt-0.5 tracking-wide">
              Clinical Intranet
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="mt-5 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveNav(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 text-left cursor-pointer ${
                  isActive
                    ? "bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md shadow-red-950/50 font-black"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/80"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-[18px] h-[18px] shrink-0 ${
                      isActive ? "text-white" : "text-slate-400"
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-bold bg-red-500/20 text-red-300 px-1.5 py-0.5 rounded border border-red-500/30">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: AI Assistant Widget & Doctor Profile */}
      <div className="p-4 space-y-3">
        {/* AI Assistant Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 shadow-md">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-lg bg-red-500/20 flex items-center justify-center text-red-400">
              <Bot className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-white">AI Copilot</span>
          </div>
          <p className="text-[11px] text-slate-400 mb-2.5 leading-tight">
            Ask clinical questions about patient records
          </p>
          <button
            onClick={() => setIsAiChatOpen(true)}
            className="w-full bg-slate-800 hover:bg-red-600 hover:text-white text-slate-200 border border-slate-700 hover:border-red-500 text-xs font-bold py-1.5 px-3 rounded-xl transition shadow-xs flex items-center justify-center gap-1.5 group cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-red-400 group-hover:text-white group-hover:rotate-12 transition-transform" />
            Start Copilot Chat
          </button>
        </div>

        {/* Doctor Profile Footer */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between px-1">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src={currentUser?.avatar || patient?.doctor?.avatar || "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80"}
              alt={currentUser?.name || "Doctor"}
              className="w-8 h-8 rounded-full object-cover border border-red-500/40 shrink-0"
            />
            <div className="leading-tight truncate">
              <div className="text-xs font-bold text-white truncate">
                {currentUser?.name || patient?.doctor?.name || "Dr. Ramesh Kumar"}
              </div>
              <div className="text-[10px] text-slate-400 truncate">
                {currentUser?.role || currentUser?.department || patient?.doctor?.role || "Consultant Physician"}
              </div>
            </div>
          </div>
          <button
            onClick={logoutToPortal}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition cursor-pointer"
            title="Sign Out / Return to Portal Login"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
