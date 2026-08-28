import React, { useEffect, useRef } from "react";
import { Search, Bell, HelpCircle, ChevronDown, Check, Building2, Stethoscope, AlertTriangle, FileText, Info, LogOut } from "lucide-react";
import { usePatient } from "../../context/PatientContext";
import LanguageSelector from "../common/LanguageSelector";

export default function TopNav() {
  const {
    clinic,
    setClinic,
    isClinicDropdownOpen,
    setIsClinicDropdownOpen,
    isNotificationsOpen,
    setIsNotificationsOpen,
    notifications = [],
    markAllNotificationsRead,
    setIsCommandPaletteOpen,
    logoutToPortal,
    t
  } = usePatient();

  const safeNotifications = notifications || [];
  const unreadCount = safeNotifications.filter((n) => n && n.unread).length;
  const clinicMenuRef = useRef(null);
  const notifMenuRef = useRef(null);

  const clinicsList = [
    "AIIMS Ayurveda OPD",
    "AIIMS Cardiology OPD",
    "Apollo Hospital - General Medicine",
    "Fortis Healthcare - Urgent Care"
  ];

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (clinicMenuRef.current && !clinicMenuRef.current.contains(event.target)) {
        setIsClinicDropdownOpen(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setIsClinicDropdownOpen, setIsNotificationsOpen]);

  // Keyboard shortcut Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setIsCommandPaletteOpen]);

  return (
    <header className="h-16 bg-white border-b border-red-100 px-6 flex items-center justify-between sticky top-0 z-20 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
      {/* Search Bar */}
      <div className="w-full max-w-md relative">
        <button
          onClick={() => setIsCommandPaletteOpen(true)}
          className="w-full flex items-center justify-between px-3.5 py-2 bg-slate-50 hover:bg-red-50/40 border border-slate-200 hover:border-red-300 rounded-xl text-sm text-slate-400 transition-all text-left group cursor-pointer shadow-inner"
        >
          <div className="flex items-center gap-2.5">
            <Search className="w-4 h-4 text-slate-400 group-hover:text-red-600 transition-colors" />
            <span className="text-slate-500 font-normal">Search patients, medical charts...</span>
          </div>
          <kbd className="inline-flex items-center px-1.5 py-0.5 text-[11px] font-bold text-slate-500 bg-white border border-slate-200 rounded shadow-xs">
            Ctrl K
          </kbd>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Direct Switch to Patient Kiosk */}
        <button
          type="button"
          onClick={() => setPortalMode("kiosk")}
          className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition active:scale-95"
          title="Launch Patient Touch Kiosk Interface"
        >
          <span>🖥️</span>
          <span className="hidden sm:inline">Patient Kiosk</span>
        </button>

        {/* Top Right Language Selector */}
        <LanguageSelector variant="light" />

        {/* Notifications */}
        <div className="relative" ref={notifMenuRef}>
          <button
            onClick={() => {
              setIsNotificationsOpen(!isNotificationsOpen);
              if (!isNotificationsOpen) markAllNotificationsRead();
            }}
            className="p-2 rounded-xl text-slate-500 hover:text-red-700 hover:bg-red-50 transition relative cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-600 text-white text-[10px] font-black rounded-full flex items-center justify-center ring-2 ring-white animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border-2 border-red-100 p-3 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  Clinical Notifications
                </span>
                <span className="text-[10px] bg-red-50 text-red-700 font-bold px-2 py-0.5 rounded-full border border-red-200">
                  {unreadCount} unread
                </span>
              </div>
              <div className="space-y-1.5 max-h-72 overflow-y-auto custom-scrollbar">
                {safeNotifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-2.5 rounded-xl border text-xs transition ${
                      n.unread
                        ? "bg-red-50/50 border-red-200 text-slate-900 font-medium"
                        : "bg-white border-slate-100 text-slate-600"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <div className="p-1 rounded-lg bg-red-100 text-red-700 mt-0.5">
                        {n.type === "alert" ? (
                          <AlertTriangle className="w-3.5 h-3.5" />
                        ) : (
                          <Info className="w-3.5 h-3.5" />
                        )}
                      </div>
                      <div className="flex-1">
                        <span className="font-bold text-slate-900 block">{n.title}</span>
                        <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">{n.message}</p>
                        <span className="text-[10px] text-slate-400 mt-1 block">{n.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Help Circle */}
        <button
          onClick={() => {
            alert("MediKiosk Clinical Intranet Helpdesk: Extension 4402 | Email: support@medikiosk.ai");
          }}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          title={t.help}
        >
          <HelpCircle className="w-5 h-5" />
        </button>

        {/* Logout / Return to Portal */}
        <button
          onClick={logoutToPortal}
          className="p-2 rounded-xl text-slate-500 hover:text-red-700 hover:bg-red-50 transition cursor-pointer"
          title={t.signOut}
        >
          <LogOut className="w-4 h-4" />
        </button>

        {/* Clinic Switcher */}
        <div className="relative" ref={clinicMenuRef}>
          <button
            onClick={() => setIsClinicDropdownOpen(!isClinicDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 bg-red-50/70 hover:bg-red-100 border border-red-200 rounded-xl text-xs font-bold text-red-900 transition shadow-xs cursor-pointer"
          >
            <div className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0">
              <Stethoscope className="w-3 h-3" />
            </div>
            <span>{clinic}</span>
            <ChevronDown className="w-3.5 h-3.5 text-red-700" />
          </button>

          {/* Clinic Menu Dropdown */}
          {isClinicDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border-2 border-red-100 p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="text-[10px] font-black uppercase tracking-wider text-red-600 px-2 py-1">
                Select Active Department
              </div>
              {clinicsList.map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    setClinic(item);
                    setIsClinicDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold text-left transition ${
                    clinic === item
                      ? "bg-red-50 text-red-900 font-black"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-red-600" />
                    <span>{item}</span>
                  </div>
                  {clinic === item && <Check className="w-3.5 h-3.5 text-red-600" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
