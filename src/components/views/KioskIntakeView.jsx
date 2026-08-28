import React, { useState } from "react";
import { Mic, Heart, Activity, CheckCircle2, ArrowRight, UserCheck, Stethoscope, AlertTriangle, ShieldCheck } from "lucide-react";
import { usePatient } from "../../context/PatientContext";

export default function KioskIntakeView() {
  const { submitKioskIntake, setActiveNav } = usePatient();
  const [step, setStep] = useState(1); // 1: Language/Identity, 2: Chief Complaint, 3: Vitals Sensor, 4: Complete
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("Male");
  const [language, setLanguage] = useState("Tamil");
  const [chiefComplaint, setChiefComplaint] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [submittedId, setSubmittedId] = useState(null);

  const handleVoiceSim = () => {
    setIsRecording(true);
    setTimeout(() => {
      setIsRecording(false);
      setChiefComplaint("Pain in center of chest for 2 days, breathlessness when walking up stairs.");
    }, 2000);
  };

  const handleSubmitIntake = async () => {
    const payload = {
      name: name || "Ramesh V.",
      age: age || "38",
      gender: gender,
      language: language,
      chiefComplaint: chiefComplaint || "Exertional chest discomfort and fatigue",
      hpi: [
        chiefComplaint || "Center chest heaviness reported",
        "Aggravated by physical exertion",
        "Relieved slightly by resting",
        "Associated mild shortness of breath"
      ],
      redFlags: chiefComplaint.toLowerCase().includes("chest") || chiefComplaint.toLowerCase().includes("pain") ? ["Chest pain on exertion", "Breathlessness"] : [],
      vitals: {
        bp: { value: "136/86", unit: "mmHg", status: "normal", label: "BP" },
        pulse: { value: "84", unit: "bpm", status: "normal", label: "Pulse" },
        spo2: { value: "98", unit: "%", status: "normal", label: "SpO₂" },
        temperature: { value: "98.4", unit: "°F", status: "normal", label: "Temperature" }
      }
    };

    const newId = await submitKioskIntake(payload);
    setSubmittedId(newId);
    setStep(4);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 select-none font-sans">
      {/* Top Kiosk Header */}
      <div className="bg-[#032e25] text-white p-6 rounded-2xl shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-bold text-xl shadow-lg">
            MK
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight">MediKiosk Health Touch Station</h1>
            <p className="text-xs text-emerald-300 font-medium">Self-Service Intake · OPD Kiosk K-03</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-emerald-900/60 px-3 py-1.5 rounded-full border border-emerald-500/30 text-xs font-semibold text-emerald-200">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          Firebase Live Connected
        </div>
      </div>

      {/* Kiosk Step Progress Indicator */}
      <div className="grid grid-cols-4 gap-2 text-center text-xs font-bold">
        <div className={`p-3 rounded-xl border ${step === 1 ? "bg-emerald-600 text-white border-emerald-700" : step > 1 ? "bg-emerald-100 text-emerald-900 border-emerald-200" : "bg-white text-slate-400 border-slate-200"}`}>
          1. Identity & Language
        </div>
        <div className={`p-3 rounded-xl border ${step === 2 ? "bg-emerald-600 text-white border-emerald-700" : step > 2 ? "bg-emerald-100 text-emerald-900 border-emerald-200" : "bg-white text-slate-400 border-slate-200"}`}>
          2. Symptoms & AI Voice
        </div>
        <div className={`p-3 rounded-xl border ${step === 3 ? "bg-emerald-600 text-white border-emerald-700" : step > 3 ? "bg-emerald-100 text-emerald-900 border-emerald-200" : "bg-white text-slate-400 border-slate-200"}`}>
          3. Kiosk Vitals Check
        </div>
        <div className={`p-3 rounded-xl border ${step === 4 ? "bg-emerald-600 text-white border-emerald-700" : "bg-white text-slate-400 border-slate-200"}`}>
          4. Complete & Sent
        </div>
      </div>

      {/* Step 1: Identity & Language Selection */}
      {step === 1 && (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-lg space-y-6 animate-in fade-in duration-150">
          <h2 className="text-xl font-bold text-slate-900">Welcome to OPD Intake. Please enter your details:</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Patient Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ramesh Varma"
                className="w-full p-4 text-lg border-2 border-slate-300 focus:border-emerald-600 rounded-2xl font-semibold outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Age (Years)</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="38"
                  className="w-full p-4 text-lg border-2 border-slate-300 focus:border-emerald-600 rounded-2xl font-semibold outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full p-4 text-lg border-2 border-slate-300 focus:border-emerald-600 rounded-2xl font-semibold outline-none bg-white"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Preferred Language for Voice Intake</label>
              <div className="grid grid-cols-3 gap-3">
                {["Tamil", "Hindi", "English"].map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setLanguage(lang)}
                    className={`p-4 rounded-2xl text-base font-bold transition border-2 cursor-pointer ${
                      language === lang ? "bg-emerald-50 text-emerald-950 border-emerald-600" : "bg-slate-50 text-slate-700 border-slate-200"
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={() => setStep(2)}
            className="w-full py-5 bg-[#0b5344] hover:bg-[#084236] text-white text-lg font-bold rounded-2xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Next: Describe Symptoms</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Step 2: Symptoms & Voice Intake */}
      {step === 2 && (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-lg space-y-6 animate-in fade-in duration-150">
          <h2 className="text-xl font-bold text-slate-900">What symptoms are you experiencing today?</h2>

          <div className="bg-emerald-50/60 p-6 rounded-2xl border border-emerald-200 text-center space-y-4">
            <button
              onClick={handleVoiceSim}
              className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center transition shadow-lg cursor-pointer ${
                isRecording ? "bg-red-600 text-white animate-pulse" : "bg-emerald-600 hover:bg-emerald-700 text-white"
              }`}
            >
              <Mic className="w-9 h-9" />
            </button>
            <p className="text-sm font-bold text-emerald-950">
              {isRecording ? "Listening to your voice..." : "Tap Microphone to speak your symptoms"}
            </p>
            <span className="text-xs text-emerald-800 font-medium block">
              Supported languages: Tamil, Hindi, English
            </span>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Or type symptoms below:</label>
            <textarea
              rows={3}
              value={chiefComplaint}
              onChange={(e) => setChiefComplaint(e.target.value)}
              placeholder="e.g. Chest pain since 2 days, breathless when walking..."
              className="w-full p-4 text-base border-2 border-slate-300 focus:border-emerald-600 rounded-2xl font-medium outline-none"
            />
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setStep(1)}
              className="w-1/3 py-4 border-2 border-slate-300 text-slate-700 font-bold rounded-2xl hover:bg-slate-50 cursor-pointer"
            >
              Back
            </button>
            <button
              onClick={() => setStep(3)}
              className="w-2/3 py-4 bg-[#0b5344] hover:bg-[#084236] text-white text-base font-bold rounded-2xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Next: Take Vitals</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Vitals Telemetry Sensor */}
      {step === 3 && (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-lg space-y-6 animate-in fade-in duration-150 text-center">
          <h2 className="text-xl font-bold text-slate-900">Please place your arm in the Kiosk BP Cuff & O2 Clip</h2>

          <div className="grid grid-cols-2 gap-4 text-left">
            <div className="bg-red-50 p-4 rounded-2xl border border-red-200 flex items-center gap-3">
              <Heart className="w-8 h-8 text-red-600" />
              <div>
                <span className="text-xs text-slate-500 font-bold">Blood Pressure</span>
                <div className="text-xl font-bold text-slate-900">136/86 mmHg</div>
              </div>
            </div>
            <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 flex items-center gap-3">
              <Activity className="w-8 h-8 text-emerald-600" />
              <div>
                <span className="text-xs text-slate-500 font-bold">Pulse Rate</span>
                <div className="text-xl font-bold text-slate-900">84 bpm</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-emerald-50 rounded-2xl text-xs font-semibold text-emerald-900">
            ✓ Automatic sensors calibrated & captured successfully.
          </div>

          <button
            onClick={handleSubmitIntake}
            className="w-full py-5 bg-[#0b5344] hover:bg-[#084236] text-white text-lg font-bold rounded-2xl shadow-xl transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <CheckCircle2 className="w-6 h-6 text-emerald-300" />
            <span>Submit Intake to Doctor Dashboard</span>
          </button>
        </div>
      )}

      {/* Step 4: Submission Confirmation */}
      {step === 4 && (
        <div className="bg-white p-8 rounded-3xl border border-emerald-200 shadow-xl space-y-6 text-center animate-in zoom-in-95 duration-200">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-700 rounded-full mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900">Intake Submitted Live to Firebase!</h2>
            <p className="text-sm text-slate-600 mt-2">
              Patient Record ID: <strong className="text-emerald-900">{submittedId}</strong>
            </p>
            <p className="text-xs text-emerald-800 font-semibold mt-1">
              Data synchronized to https://medikiosk-7cf65-default-rtdb.firebaseio.com/
            </p>
          </div>

          <div className="pt-4 flex gap-4">
            <button
              onClick={() => {
                setStep(1);
                setChiefComplaint("");
                setName("");
              }}
              className="flex-1 py-4 border-2 border-slate-300 text-slate-700 font-bold rounded-2xl hover:bg-slate-50 cursor-pointer"
            >
              Start New Patient Intake
            </button>
            <button
              onClick={() => setActiveNav("dashboard")}
              className="flex-1 py-4 bg-[#0b5344] hover:bg-[#084236] text-white font-bold rounded-2xl shadow-lg transition cursor-pointer"
            >
              View on Doctor Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
