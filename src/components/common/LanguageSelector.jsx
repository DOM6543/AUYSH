import React, { useState, useRef, useEffect } from "react";
import { Globe, ChevronDown, Check } from "lucide-react";
import { usePatient } from "../../context/PatientContext";
import { SUPPORTED_LANGUAGES } from "../../data/translations";

export default function LanguageSelector({ variant = "light" }) {
  const { currentLanguage = "en", setCurrentLanguage, t } = usePatient();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const activeLang = SUPPORTED_LANGUAGES.find((l) => l.code === currentLanguage) || SUPPORTED_LANGUAGES[0];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isDark = variant === "dark";

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer border ${
          isDark
            ? "bg-slate-900/90 text-white border-red-500/40 hover:bg-slate-800 hover:border-red-400"
            : "bg-white text-slate-800 border-red-200 hover:border-red-400 hover:bg-red-50/50 shadow-xs"
        }`}
        title="Select Language / भाषा चुनें"
      >
        <div className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0 shadow-xs">
          <Globe className="w-3.5 h-3.5" />
        </div>
        <div className="flex items-center gap-1.5 font-sans">
          <span>{activeLang.flag}</span>
          <span className="font-extrabold">{activeLang.name}</span>
          <span className="text-[11px] opacity-75 font-medium hidden sm:inline">({activeLang.nativeName})</span>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? "rotate-180" : ""} ${isDark ? "text-red-400" : "text-red-600"}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white text-slate-800 shadow-2xl border-2 border-red-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-100 divide-y divide-slate-100">
          <div className="px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wider text-red-600 flex items-center justify-between">
            <span>Choose Language</span>
            <span className="text-slate-400">8 Languages</span>
          </div>

          <div className="py-1 space-y-0.5 max-h-64 overflow-y-auto custom-scrollbar">
            {SUPPORTED_LANGUAGES.map((lang) => {
              const isSelected = lang.code === currentLanguage;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => {
                    setCurrentLanguage(lang.code);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer text-left ${
                    isSelected
                      ? "bg-red-600 text-white font-black shadow-sm"
                      : "text-slate-700 hover:bg-red-50 hover:text-red-700"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">{lang.flag}</span>
                    <div>
                      <div className="leading-tight font-bold">{lang.name}</div>
                      <div className={`text-[10px] ${isSelected ? "text-red-100" : "text-slate-400"}`}>
                        {lang.nativeName}
                      </div>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-white shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
