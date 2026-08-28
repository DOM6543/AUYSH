import React, { useState, useEffect } from "react";
import {
  Stethoscope,
  Lock,
  Mail,
  User,
  ShieldCheck,
  Building2,
  Award,
  Eye,
  EyeOff,
  CheckCircle2,
  X,
  Sparkles,
  ArrowRight,
  UserPlus,
  LogIn,
  AlertCircle,
  Plus
} from "lucide-react";
import { usePatient } from "../../context/PatientContext";

export default function DoctorAuthModal({ isOpen, initialTab = "login", onClose }) {
  const { loginAsDoctor, showToast, t } = usePatient();

  const [tab, setTab] = useState(initialTab);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setTab(initialTab);
    setErrorMessage("");
  }, [initialTab, isOpen]);

  // Login Form States
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Registration Form States
  const [regName, setRegName] = useState("");
  const [regLicense, setRegLicense] = useState("");
  const [regDepartment, setRegDepartment] = useState("AIIMS Ayurveda & Integrative OPD");
  const [regHospital, setRegHospital] = useState("AIIMS New Delhi");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [isAbdmAgreed, setIsAbdmAgreed] = useState(true);

  if (!isOpen) return null;

  // Handle Sign In
  const handleSignIn = (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!loginEmail.trim()) {
      setErrorMessage("Please enter your official email or Medical License ID.");
      return;
    }
    if (!loginPassword.trim()) {
      setErrorMessage("Please enter your password.");
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);

      // Check registered doctors in localStorage fallback
      let savedDoctors = [];
      try {
        savedDoctors = JSON.parse(localStorage.getItem("medikiosk_doctors") || "[]");
      } catch (err) {
        console.warn(err);
      }

      const found = savedDoctors.find(
        (d) =>
          d.email?.toLowerCase() === loginEmail.trim().toLowerCase() ||
          d.license?.toLowerCase() === loginEmail.trim().toLowerCase()
      );

      if (found) {
        if (found.password && found.password !== loginPassword) {
          setErrorMessage("Invalid password. Please verify your credentials.");
          return;
        }
        loginAsDoctor({
          name: found.name,
          role: found.role || "Consultant Physician",
          department: found.department,
          hospital: found.hospital,
          license: found.license
        });
        showToast(`Welcome back, ${found.name}!`, "success");
        onClose();
        return;
      }

      // Default demo login fallback
      loginAsDoctor({
        name: loginEmail.toLowerCase().includes("dr") ? loginEmail : "Dr. Ramesh Kumar",
        role: "Chief Physician & OPD Head",
        department: "AIIMS Ayurveda & Integrative OPD",
        hospital: "AIIMS New Delhi",
        license: "MCI-2021-88492"
      });
      showToast("Signed in to Physician Workstation successfully!", "success");
      onClose();
    }, 400);
  };

  // Handle Registration
  const handleRegister = (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!regName.trim()) {
      setErrorMessage("Please enter your full name with Dr. prefix.");
      return;
    }
    if (!regLicense.trim()) {
      setErrorMessage("Please enter your Medical Council Registration Number (e.g. MCI-2024-12345).");
      return;
    }
    if (!regEmail.trim() || !regEmail.includes("@")) {
      setErrorMessage("Please enter a valid professional email address.");
      return;
    }
    if (!regPassword || regPassword.length < 4) {
      setErrorMessage("Password must be at least 4 characters long.");
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setErrorMessage("Passwords do not match. Please re-enter.");
      return;
    }
    if (!isAbdmAgreed) {
      setErrorMessage("Please accept the ABDM medical registry verification consent.");
      return;
    }

    setIsSubmitting(true);

    const formattedName = regName.trim().startsWith("Dr.") ? regName.trim() : `Dr. ${regName.trim()}`;

    const newDoctor = {
      id: `doc-${Date.now()}`,
      name: formattedName,
      license: regLicense.trim().toUpperCase(),
      department: regDepartment,
      hospital: regHospital,
      email: regEmail.trim().toLowerCase(),
      password: regPassword,
      role: `Consultant (${regDepartment.split(" ")[0]})`,
      registeredAt: new Date().toISOString()
    };

    // Save to localStorage
    try {
      const existing = JSON.parse(localStorage.getItem("medikiosk_doctors") || "[]");
      existing.push(newDoctor);
      localStorage.setItem("medikiosk_doctors", JSON.stringify(existing));
    } catch (err) {
      console.warn("Storage save error:", err);
    }

    setTimeout(() => {
      setIsSubmitting(false);
      loginAsDoctor({
        name: newDoctor.name,
        role: newDoctor.role,
        department: newDoctor.department,
        hospital: newDoctor.hospital,
        license: newDoctor.license
      });
      showToast(`Account created for ${newDoctor.name}! Signed in.`, "success");
      onClose();
    }, 500);
  };

  // Quick 1-Click Demo Fill
  const handleQuickDemoFill = () => {
    setLoginEmail("dr.ramesh@aiims.edu");
    setLoginPassword("aiims1234");
    setErrorMessage("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border-2 border-red-200 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-slate-900">
        
        {/* Header with Red Cross */}
        <div className="p-6 border-b border-red-100 bg-red-50/50 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 to-rose-600 text-white flex items-center justify-center shadow-md shadow-red-600/20">
              <Plus className="w-7 h-7 stroke-[3.5]" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">{t.authModalTitle}</h2>
              <p className="text-xs text-red-700 font-semibold">{t.authModalSub}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher (Sign In vs Register) */}
        <div className="grid grid-cols-2 p-1.5 bg-slate-100 border-b border-slate-200 text-xs font-black">
          <button
            type="button"
            onClick={() => {
              setTab("login");
              setErrorMessage("");
            }}
            className={`py-3 rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
              tab === "login"
                ? "bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md font-black"
                : "text-slate-600 hover:text-red-600"
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>{t.tabSignIn}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setTab("register");
              setErrorMessage("");
            }}
            className={`py-3 rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
              tab === "register"
                ? "bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md font-black"
                : "text-slate-600 hover:text-red-600"
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>{t.tabRegister}</span>
          </button>
        </div>

        {/* Error Alert Message */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2 animate-in fade-in font-medium">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Scrollable Form Body */}
        <div className="p-6 overflow-y-auto space-y-4 custom-scrollbar">
          
          {/* ========================================================================= */}
          {/* TAB 1: SIGN IN */}
          {/* ========================================================================= */}
          {tab === "login" && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {t.emailOrLicense}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-red-500/70 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="dr.ramesh@aiims.edu or MCI-88492"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 focus:border-red-500 focus:bg-white rounded-xl text-sm text-slate-900 placeholder-slate-400 outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {t.password}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-red-500/70 absolute left-3.5 top-3.5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder={t.enterPassword}
                    className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 focus:border-red-500 focus:bg-white rounded-xl text-sm text-slate-900 placeholder-slate-400 outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-red-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Demo Account Quick-Fill */}
              <div className="bg-red-50/60 border border-red-100 rounded-xl p-3 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-500 block text-[11px]">Demo Physician:</span>
                  <span className="font-bold text-red-800">dr.ramesh@aiims.edu</span>
                </div>
                <button
                  type="button"
                  onClick={handleQuickDemoFill}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  {t.fillDemo}
                </button>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black rounded-2xl shadow-xl shadow-red-600/30 transition flex items-center justify-center gap-2 cursor-pointer text-base active:scale-95 mt-2"
              >
                {isSubmitting ? (
                  <span>{t.signingIn}</span>
                ) : (
                  <>
                    <span>{t.signInSubmit}</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: REGISTER NEW DOCTOR */}
          {/* ========================================================================= */}
          {tab === "register" && (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.regFullName}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-red-500/70 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Dr. Sneha Roy, MD"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-red-500 focus:bg-white rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 outline-none transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.regLicenseNo}
                  </label>
                  <div className="relative">
                    <Award className="w-4 h-4 text-red-500/70 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={regLicense}
                      onChange={(e) => setRegLicense(e.target.value)}
                      placeholder="MCI-2024-99881"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-red-500 focus:bg-white rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.regDepartment}
                  </label>
                  <select
                    value={regDepartment}
                    onChange={(e) => setRegDepartment(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 focus:border-red-500 focus:bg-white rounded-xl text-xs sm:text-sm text-slate-900 outline-none transition font-medium"
                  >
                    <option value="AIIMS Ayurveda & Integrative OPD">Ayurveda & Integrative OPD</option>
                    <option value="Cardiology & Vascular OPD">Cardiology & Vascular OPD</option>
                    <option value="General Internal Medicine">General Internal Medicine</option>
                    <option value="Pulmonology & Respiratory Care">Pulmonology & Respiratory Care</option>
                    <option value="Orthopedics & Panchakarma">Orthopedics & Panchakarma</option>
                    <option value="Endocrinology & Diabetes Care">Endocrinology & Diabetes Care</option>
                    <option value="Gastroenterology OPD">Gastroenterology OPD</option>
                    <option value="Dermatology & Twak Roga">Dermatology & Twak Roga</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.regHospital}
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-red-500/70 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={regHospital}
                      onChange={(e) => setRegHospital(e.target.value)}
                      placeholder="AIIMS New Delhi"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-red-500 focus:bg-white rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.regEmail}
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-red-500/70 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="doctor@hospital.org"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-red-500 focus:bg-white rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 outline-none transition"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.regCreatePassword}
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-red-500/70 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="At least 4 chars"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-red-500 focus:bg-white rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.regConfirmPassword}
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-red-500/70 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-red-500 focus:bg-white rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 outline-none transition"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2 pt-1">
                <input
                  type="checkbox"
                  id="abdmConsent"
                  checked={isAbdmAgreed}
                  onChange={(e) => setIsAbdmAgreed(e.target.checked)}
                  className="mt-0.5 rounded text-red-600 focus:ring-red-500 cursor-pointer accent-red-600"
                />
                <label htmlFor="abdmConsent" className="text-[11px] text-slate-600 leading-snug cursor-pointer font-medium">
                  {t.regConsent}
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black rounded-2xl shadow-xl shadow-red-600/30 transition flex items-center justify-center gap-2 cursor-pointer text-sm active:scale-95"
              >
                {isSubmitting ? (
                  <span>{t.registering}</span>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5" />
                    <span>{t.regSubmit}</span>
                  </>
                )}
              </button>
            </form>
          )}

        </div>

      </div>
    </div>
  );
}
