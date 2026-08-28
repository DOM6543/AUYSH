import React, { useState, useEffect, useRef } from "react";
import {
  Volume2,
  VolumeX,
  Languages,
  Fingerprint,
  Phone,
  UserCheck,
  CheckCircle2,
  HeartPulse,
  Activity,
  ArrowRight,
  RotateCcw,
  Sparkles,
  QrCode,
  Printer,
  ChevronLeft,
  AlertTriangle,
  Stethoscope,
  Smile,
  Meh,
  Frown,
  Mic,
  Thermometer,
  ShieldCheck,
  LogOut,
  Plus,
  Camera,
  RefreshCw,
  Clock,
  Check,
  User,
  Calendar,
  Flower2,
  Pill,
  GitMerge,
  HelpCircle
} from "lucide-react";
import { usePatient } from "../../context/PatientContext";
import LanguageSelector from "../common/LanguageSelector";
import { SUPPORTED_LANGUAGES } from "../../data/translations";
import { ADAPTIVE_SYMPTOM_TREES } from "../../data/adaptiveSymptoms";

export default function AccessiblePatientKiosk() {
  const { submitKioskIntake, setPortalMode, currentLanguage, setCurrentLanguage, t } = usePatient();

  // Kiosk 8-Step Progression:
  // 1: Language Selection
  // 2: Medical Stream (AYUSH / Allopathic / Integrative)
  // 3: Patient Name, Photo & Demographics (Age + Gender)
  // 4: Visual Body Map (Where does it hurt?)
  // 5: Adaptive Questioning Decision Tree (Tailored Symptom Questions)
  // 6: Duration & Chronic Medical History
  // 7: 1-Touch Machine Vitals Scan
  // 8: OPD Token Slip & Confirmation
  const [step, setStep] = useState(1);
  const [audioEnabled, setAudioEnabled] = useState(true);

  // Patient Intake State
  const [medicalStream, setMedicalStream] = useState("ayush"); // 'ayush' | 'allopathic' | 'integrative'
  const [patientName, setPatientName] = useState("");
  const [patientPhoto, setPatientPhoto] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const [ageGroup, setAgeGroup] = useState("adult"); // child, youth, adult, senior
  const [gender, setGender] = useState("male"); // male, female, other
  const [patientPhone, setPatientPhone] = useState("");
  
  const [selectedBodyPart, setSelectedBodyPart] = useState("chest");
  const [adaptiveSymptoms, setAdaptiveSymptoms] = useState([]);
  const [duration, setDuration] = useState("fewDays"); // today, fewDays, weeks, month
  const [chronicConditions, setChronicConditions] = useState(["none"]);
  const [painScore, setPainScore] = useState(4);
  
  const [vitalsProgress, setVitalsProgress] = useState(0);
  const [generatedToken, setGeneratedToken] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Camera references
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // Voice speech synthesis helper
  const speakPrompt = (text) => {
    if (!audioEnabled || typeof window === "undefined" || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      if (currentLanguage === "hi") utterance.lang = "hi-IN";
      else if (currentLanguage === "ta") utterance.lang = "ta-IN";
      else if (currentLanguage === "te") utterance.lang = "te-IN";
      else if (currentLanguage === "kn") utterance.lang = "kn-IN";
      else if (currentLanguage === "bn") utterance.lang = "bn-IN";
      else if (currentLanguage === "mr") utterance.lang = "mr-IN";
      else if (currentLanguage === "gu") utterance.lang = "gu-IN";
      else utterance.lang = "en-IN";
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("Speech synthesis notice:", e);
    }
  };

  // Webcam stream management on Step 3
  useEffect(() => {
    if (step === 3 && !patientPhoto) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [step, patientPhoto]);

  const startCamera = async () => {
    setCameraError(false);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        setIsCameraActive(true);
      } else {
        setCameraError(true);
      }
    } catch (err) {
      console.warn("Camera access fallback:", err);
      setCameraError(true);
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const takePhotoSnapshot = () => {
    if (videoRef.current && canvasRef.current && isCameraActive) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 480;
      canvas.height = video.videoHeight || 360;
      const ctx = canvas.getContext("2d");
      // Mirror image horizontal flip for natural selfie feel
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
      setPatientPhoto(dataUrl);
      stopCamera();
      speakPrompt(t.photoCapturedNotice || "Photo Captured!");
    } else {
      // High-res fallback avatar photo
      const fallbackAvatars = [
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80"
      ];
      setPatientPhoto(fallbackAvatars[Math.floor(Math.random() * fallbackAvatars.length)]);
      speakPrompt(t.photoCapturedNotice || "Photo Captured!");
    }
  };

  const retakePhoto = () => {
    setPatientPhoto(null);
    startCamera();
  };

  // Toggle Adaptive Symptoms
  const toggleAdaptiveSymptom = (symId) => {
    setAdaptiveSymptoms((prev) =>
      prev.includes(symId) ? prev.filter((id) => id !== symId) : [...prev, symId]
    );
  };

  // Toggle Chronic Conditions
  const toggleCondition = (condKey) => {
    if (condKey === "none") {
      setChronicConditions(["none"]);
      return;
    }
    setChronicConditions((prev) => {
      const filtered = prev.filter((k) => k !== "none");
      if (filtered.includes(condKey)) {
        const next = filtered.filter((k) => k !== condKey);
        return next.length === 0 ? ["none"] : next;
      } else {
        return [...filtered, condKey];
      }
    });
  };

  // Audio prompt on step change
  useEffect(() => {
    if (step === 1) {
      speakPrompt(t.langPrompt);
    } else if (step === 2) {
      speakPrompt("Please select your preferred system of medicine: AYUSH Ayurveda, Allopathy, or Integrative.");
    } else if (step === 3) {
      speakPrompt(`${t.namePrompt}. ${t.takePhotoPrompt}`);
    } else if (step === 4) {
      speakPrompt(t.bodyPrompt);
    } else if (step === 5) {
      const tree = ADAPTIVE_SYMPTOM_TREES[selectedBodyPart] || ADAPTIVE_SYMPTOM_TREES.chest;
      speakPrompt(currentLanguage === "hi" ? tree.titleHi : tree.prompt);
    } else if (step === 6) {
      speakPrompt(t.durationPrompt);
    } else if (step === 7) {
      speakPrompt(t.vitalsPrompt);
    } else if (step === 8) {
      speakPrompt(t.tokenTitle);
    }
  }, [step, currentLanguage]);

  // Simulate Vitals Reading on Step 7
  useEffect(() => {
    if (step === 7) {
      setVitalsProgress(10);
      const timer1 = setTimeout(() => setVitalsProgress(45), 900);
      const timer2 = setTimeout(() => setVitalsProgress(80), 1800);
      const timer3 = setTimeout(() => {
        setVitalsProgress(100);
        handleFinalSubmit();
      }, 2700);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }
  }, [step]);

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    const bodyInfo = t.bodyParts[selectedBodyPart] || t.bodyParts.chest;
    const tree = ADAPTIVE_SYMPTOM_TREES[selectedBodyPart] || ADAPTIVE_SYMPTOM_TREES.chest;
    const activeAdaptiveDetails = tree.options
      .filter((opt) => adaptiveSymptoms.includes(opt.id))
      .map((opt) => opt.label);

    const tokenNum = `A-${Math.floor(100 + Math.random() * 900)}`;
    const finalPatientName = patientName.trim() || (patientPhone ? `Patient (${patientPhone.slice(-4)})` : "Walk-in OPD Patient");

    const intakePayload = {
      name: finalPatientName,
      phone: patientPhone || "N/A",
      language: currentLanguage,
      medicalStream,
      photo: patientPhoto || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80",
      ageGroup,
      gender,
      chiefComplaint: bodyInfo.label,
      complaintCategory: selectedBodyPart,
      specificSymptoms: activeAdaptiveDetails.length > 0 ? activeAdaptiveDetails : [bodyInfo.sub],
      duration,
      chronicConditions,
      painLevel: painScore,
      tokenNumber: tokenNum,
      assignedDoctor: medicalStream === "ayush" ? "Dr. Ramesh Kumar (AYUSH OPD Room 4)" : "Dr. Sharma (General Medicine Room 2)",
      department: medicalStream === "ayush" ? "AIIMS AYUSH & Ayurvedic OPD" : medicalStream === "allopathic" ? "AIIMS Allopathic General Medicine" : "AIIMS Integrative Medicine OPD",
      vitals: {
        bp: "128/84 mmHg",
        pulse: "78 bpm",
        spo2: "98%",
        temp: "98.4 °F"
      },
      intakeTimestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    try {
      if (submitKioskIntake) {
        await submitKioskIntake(intakePayload);
      }
    } catch (err) {
      console.warn("Intake submission notice:", err);
    }

    setGeneratedToken({
      number: tokenNum,
      name: finalPatientName,
      medicalStream,
      room: medicalStream === "ayush" ? "AYUSH Room 4" : "OPD Room 2",
      doctor: medicalStream === "ayush" ? "Dr. Ramesh Kumar" : "Dr. Sharma",
      department: intakePayload.department,
      complaint: bodyInfo.label,
      specificSymptoms: activeAdaptiveDetails,
      photo: intakePayload.photo,
      ageGroup,
      gender,
      duration,
      chronicConditions,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      vitals: intakePayload.vitals
    });

    setIsSubmitting(false);
    setStep(8);
  };

  const bodyPartKeys = Object.keys(t.bodyParts || {});
  const activeTree = ADAPTIVE_SYMPTOM_TREES[selectedBodyPart] || ADAPTIVE_SYMPTOM_TREES.chest;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-[#180808] to-slate-950 text-white flex flex-col justify-between p-4 sm:p-6 font-sans select-none">
      
      {/* Hidden Canvas for Camera Snapshots */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Top Header */}
      <header className="max-w-5xl w-full mx-auto flex items-center justify-between py-3 border-b border-red-900/40">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 to-rose-600 text-white flex items-center justify-center font-black shadow-lg shadow-red-600/30">
            <Plus className="w-8 h-8 stroke-[3.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-black text-lg sm:text-xl tracking-tight text-white">{t.kioskTitle}</h1>
              <span className="px-2 py-0.5 rounded-full bg-red-500/20 border border-red-400/40 text-[10px] font-extrabold text-red-300">
                K-03
              </span>
            </div>
            <p className="text-xs text-red-200/80 hidden sm:block">
              {t.kioskSubtitle}
            </p>
          </div>
        </div>

        {/* Right Controls: Audio Toggle, Language Selector & Reset */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Audio Voice Assistant Toggle */}
          <button
            type="button"
            onClick={() => {
              setAudioEnabled(!audioEnabled);
              if (!audioEnabled) speakPrompt(t.kioskTitle);
            }}
            className={`p-2.5 sm:px-3 sm:py-2.5 rounded-xl border transition flex items-center gap-2 text-xs font-bold cursor-pointer ${
              audioEnabled
                ? "bg-red-600 text-white border-red-400 shadow-lg shadow-red-600/30"
                : "bg-slate-800 text-slate-400 border-slate-700"
            }`}
            title="Audio Voice Assistant"
          >
            {audioEnabled ? <Volume2 className="w-4 h-4 animate-pulse" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline">{audioEnabled ? t.voiceOn : t.voiceMuted}</span>
          </button>

          {/* Top Right Language Selector */}
          <LanguageSelector variant="dark" />

          {/* Reset button */}
          <button
            type="button"
            onClick={() => {
              setStep(1);
              setMedicalStream("ayush");
              setPatientName("");
              setPatientPhoto(null);
              setPatientPhone("");
              setSelectedBodyPart("chest");
              setAdaptiveSymptoms([]);
              setChronicConditions(["none"]);
              setPainScore(4);
            }}
            className="p-2.5 sm:px-3 sm:py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-xl text-xs font-bold text-slate-300 transition flex items-center gap-1.5 cursor-pointer"
            title="Restart Intake"
          >
            <RotateCcw className="w-4 h-4 text-red-400" />
            <span className="hidden md:inline">{t.resetBtn}</span>
          </button>
        </div>
      </header>

      {/* Step Progress Visual Bar (8 Steps) */}
      <div className="max-w-5xl w-full mx-auto py-2.5">
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-1 text-center text-[10px] sm:text-xs font-bold">
          {[
            { s: 1, label: "1. Language" },
            { s: 2, label: "2. Stream" },
            { s: 3, label: "3. Photo & ID" },
            { s: 4, label: "4. Body Map" },
            { s: 5, label: "5. Symptoms" },
            { s: 6, label: "6. History" },
            { s: 7, label: "7. Vitals" },
            { s: 8, label: "8. Slip" },
          ].map((item) => (
            <div
              key={item.s}
              onClick={() => {
                if (item.s < step) setStep(item.s);
              }}
              className={`py-2 px-1 rounded-xl transition-all border flex flex-col items-center justify-center gap-0.5 ${
                step === item.s
                  ? "bg-red-600 text-white border-red-400 shadow-md shadow-red-600/30 font-black scale-102"
                  : step > item.s
                  ? "bg-slate-800/90 text-red-300 border-red-900/60 cursor-pointer"
                  : "bg-slate-900/50 text-slate-500 border-slate-800"
              }`}
            >
              <span className="truncate w-full">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Interactive Stage */}
      <main className="max-w-5xl w-full mx-auto flex-1 flex flex-col justify-center py-3 sm:py-4">
        
        {/* ========================================================================= */}
        {/* STEP 1: CHOOSE LOCAL LANGUAGE */}
        {/* ========================================================================= */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="text-center space-y-2">
              <span className="inline-block px-4 py-1 rounded-full bg-red-600/20 border border-red-500/40 text-red-300 text-xs font-bold">
                Step 1 of 8
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                {t.langPrompt}
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {SUPPORTED_LANGUAGES.map((lang) => {
                const isSelected = currentLanguage === lang.code;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => {
                      setCurrentLanguage(lang.code);
                      setStep(2);
                    }}
                    className={`p-5 rounded-3xl border-3 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer active:scale-95 shadow-lg ${
                      isSelected
                        ? "bg-gradient-to-br from-red-600 to-rose-700 text-white border-white scale-105 shadow-red-600/40"
                        : "bg-slate-800/90 hover:bg-slate-800 text-slate-200 border-slate-700 hover:border-red-400"
                    }`}
                  >
                    <span className="text-4xl">{lang.flag}</span>
                    <span className="font-black text-lg">{lang.nativeName}</span>
                    <span className="text-xs text-red-200 font-semibold">{lang.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: CHOOSE MEDICAL STREAM (AYUSH / ALLOPATHIC / INTEGRATIVE) */}
        {/* ========================================================================= */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200 max-w-4xl mx-auto w-full">
            <div className="text-center space-y-2">
              <span className="inline-block px-4 py-1 rounded-full bg-red-600/20 border border-red-500/40 text-red-300 text-xs font-bold">
                Step 2 of 8 · Medicine System
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                Choose Preferred System of Medicine
              </h2>
              <p className="text-xs text-slate-400 max-w-lg mx-auto">
                Select whether you want to consult an Ayurvedic/AYUSH practitioner, Allopathic doctor, or Integrative OPD.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Option 1: AYUSH / Ayurvedic */}
              <button
                type="button"
                onClick={() => {
                  setMedicalStream("ayush");
                  speakPrompt("AYUSH and Ayurvedic Medicine selected");
                  setStep(3);
                }}
                className={`p-6 rounded-3xl border-3 transition-all flex flex-col items-center justify-between text-center gap-4 cursor-pointer active:scale-95 shadow-xl ${
                  medicalStream === "ayush"
                    ? "bg-gradient-to-br from-amber-600 to-orange-700 text-white border-white scale-105 shadow-amber-600/40 ring-4 ring-amber-400/30"
                    : "bg-white text-slate-900 border-slate-200 hover:border-amber-500"
                }`}
              >
                <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center text-3xl shadow-sm">
                  🌿
                </div>
                <div>
                  <h3 className="font-black text-lg sm:text-xl">AYUSH / Ayurveda</h3>
                  <p className={`text-xs mt-1 font-semibold ${medicalStream === "ayush" ? "text-amber-100" : "text-slate-500"}`}>
                    Prakriti, Agni, Herbal formulations & Lifestyle counseling
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${medicalStream === "ayush" ? "bg-white text-amber-800" : "bg-amber-50 text-amber-800 border border-amber-200"}`}>
                  AIIMS AYUSH OPD
                </span>
              </button>

              {/* Option 2: Allopathic */}
              <button
                type="button"
                onClick={() => {
                  setMedicalStream("allopathic");
                  speakPrompt("Allopathic Modern Medicine selected");
                  setStep(3);
                }}
                className={`p-6 rounded-3xl border-3 transition-all flex flex-col items-center justify-between text-center gap-4 cursor-pointer active:scale-95 shadow-xl ${
                  medicalStream === "allopathic"
                    ? "bg-gradient-to-br from-red-600 to-rose-700 text-white border-white scale-105 shadow-red-600/40 ring-4 ring-red-400/30"
                    : "bg-white text-slate-900 border-slate-200 hover:border-red-500"
                }`}
              >
                <div className="w-16 h-16 rounded-2xl bg-red-100 text-red-800 flex items-center justify-center text-3xl shadow-sm">
                  💊
                </div>
                <div>
                  <h3 className="font-black text-lg sm:text-xl">Allopathy</h3>
                  <p className={`text-xs mt-1 font-semibold ${medicalStream === "allopathic" ? "text-red-100" : "text-slate-500"}`}>
                    Modern clinical medicine, lab diagnostics & pharmacology
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${medicalStream === "allopathic" ? "bg-white text-red-800" : "bg-red-50 text-red-800 border border-red-200"}`}>
                  General OPD
                </span>
              </button>

              {/* Option 3: Integrative (Both) */}
              <button
                type="button"
                onClick={() => {
                  setMedicalStream("integrative");
                  speakPrompt("Integrative Medicine selected");
                  setStep(3);
                }}
                className={`p-6 rounded-3xl border-3 transition-all flex flex-col items-center justify-between text-center gap-4 cursor-pointer active:scale-95 shadow-xl ${
                  medicalStream === "integrative"
                    ? "bg-gradient-to-br from-emerald-600 to-teal-700 text-white border-white scale-105 shadow-emerald-600/40 ring-4 ring-emerald-400/30"
                    : "bg-white text-slate-900 border-slate-200 hover:border-emerald-500"
                }`}
              >
                <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-3xl shadow-sm">
                  🔄
                </div>
                <div>
                  <h3 className="font-black text-lg sm:text-xl">Integrative (Both)</h3>
                  <p className={`text-xs mt-1 font-semibold ${medicalStream === "integrative" ? "text-emerald-100" : "text-slate-500"}`}>
                    Holistic combination of Modern Medicine & AYUSH protocols
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${medicalStream === "integrative" ? "bg-white text-emerald-800" : "bg-emerald-50 text-emerald-800 border border-emerald-200"}`}>
                  Combined Care
                </span>
              </button>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-6 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold flex items-center gap-2 cursor-pointer text-sm"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>{t.backBtn}</span>
              </button>

              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black flex items-center gap-3 cursor-pointer text-base shadow-xl shadow-red-600/30 active:scale-95"
              >
                <span>{t.nextBtn}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: PATIENT NAME, PHOTO CAPTURE & DEMOGRAPHICS (AGE + GENDER) */}
        {/* ========================================================================= */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200 max-w-4xl mx-auto w-full">
            <div className="text-center space-y-1">
              <span className="inline-block px-4 py-1 rounded-full bg-red-600/20 border border-red-500/40 text-red-300 text-xs font-bold">
                Step 3 of 8 · Identification
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                {t.idPrompt}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
              
              {/* Camera Video Viewfinder or Captured Photo Card */}
              <div className="bg-slate-800/90 border-2 border-red-500/40 rounded-3xl p-4 flex flex-col items-center justify-center gap-3 shadow-xl relative overflow-hidden">
                <div className="relative w-full max-w-[320px] aspect-4/3 rounded-2xl overflow-hidden bg-slate-950 border-2 border-red-500/60 shadow-inner flex items-center justify-center">
                  {!patientPhoto ? (
                    <>
                      <video
                        ref={videoRef}
                        playsInline
                        muted
                        autoPlay
                        className="w-full h-full object-cover transform -scale-x-100"
                      />
                      {/* Face Alignment Oval Overlay */}
                      <div className="absolute inset-4 border-2 border-dashed border-red-400/70 rounded-[50%] pointer-events-none flex items-center justify-center">
                        <span className="text-[10px] font-bold bg-red-950/80 px-2 py-0.5 rounded text-red-300">
                          Align Face Here
                        </span>
                      </div>
                    </>
                  ) : (
                    <img
                      src={patientPhoto}
                      alt="Patient Face Photo"
                      className="w-full h-full object-cover rounded-2xl"
                    />
                  )}
                </div>

                {/* Camera Buttons */}
                <div className="flex items-center gap-3 w-full max-w-[320px]">
                  {!patientPhoto ? (
                    <button
                      type="button"
                      onClick={takePhotoSnapshot}
                      className="w-full py-3.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black rounded-2xl shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 cursor-pointer text-sm active:scale-95"
                    >
                      <Camera className="w-5 h-5" />
                      <span>{t.snapPhotoBtn}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={retakePhoto}
                      className="w-full py-3 bg-slate-700 hover:bg-slate-600 border border-slate-500 text-white font-bold rounded-2xl flex items-center justify-center gap-2 cursor-pointer text-xs"
                    >
                      <RefreshCw className="w-4 h-4 text-red-400" />
                      <span>{t.retakePhotoBtn}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Demographics: Patient Name, Age Group & Gender */}
              <div className="space-y-3.5 bg-white text-slate-900 border-2 border-slate-200 rounded-3xl p-5 shadow-xl">
                
                {/* 1. Patient Full Name Input */}
                <div>
                  <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-red-600" />
                      <span>1. {t.namePrompt}</span>
                    </span>
                    <span className="text-[10px] text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                      Required
                    </span>
                  </label>
                  <input
                    type="text"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder={t.namePlaceholder}
                    className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border-2 border-slate-300 focus:border-red-600 rounded-xl text-sm font-bold text-slate-900 placeholder:text-slate-400 outline-none transition shadow-inner"
                  />
                </div>

                {/* 2. Age Brackets */}
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                    2. {t.agePrompt}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { key: "child", label: t.ageChild, icon: "👶" },
                      { key: "youth", label: t.ageYouth, icon: "👦" },
                      { key: "adult", label: t.ageAdult, icon: "🧑" },
                      { key: "senior", label: t.ageSenior, icon: "🧓" },
                    ].map((item) => (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => setAgeGroup(item.key)}
                        className={`p-2 rounded-2xl border-2 transition-all flex items-center gap-2 cursor-pointer text-left ${
                          ageGroup === item.key
                            ? "bg-red-600 text-white border-red-600 shadow-md font-bold"
                            : "bg-slate-50 hover:bg-red-50/50 text-slate-800 border-slate-200"
                        }`}
                      >
                        <span className="text-lg">{item.icon}</span>
                        <span className="text-xs font-bold leading-tight">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Gender */}
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                    3. {t.genderPrompt}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { key: "male", label: t.genderMale, icon: "👨" },
                      { key: "female", label: t.genderFemale, icon: "👩" },
                      { key: "other", label: t.genderOther, icon: "⚧️" },
                    ].map((item) => (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => setGender(item.key)}
                        className={`p-2 rounded-2xl border-2 transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          gender === item.key
                            ? "bg-red-600 text-white border-red-600 shadow-md font-bold"
                            : "bg-slate-50 hover:bg-red-50/50 text-slate-800 border-slate-200"
                        }`}
                      >
                        <span className="text-base">{item.icon}</span>
                        <span className="text-xs font-bold">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Optional Phone / ABHA */}
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                    4. {t.phoneInputPrompt}
                  </label>
                  <input
                    type="tel"
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    placeholder="9876543210 (Optional)"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-red-500 rounded-xl text-xs sm:text-sm font-semibold outline-none transition"
                  />
                </div>

              </div>

            </div>

            {/* Bottom Nav Bar */}
            <div className="flex items-center justify-between max-w-4xl mx-auto pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-6 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold flex items-center gap-2 cursor-pointer text-sm"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>{t.backBtn}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!patientPhoto) {
                    takePhotoSnapshot();
                  }
                  setStep(4);
                }}
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black flex items-center gap-3 cursor-pointer text-base shadow-xl shadow-red-600/30 active:scale-95"
              >
                <span>{t.nextBtn}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 4: VISUAL BODY MAP (WHERE DOES IT HURT?) */}
        {/* ========================================================================= */}
        {step === 4 && (
          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="text-center space-y-1">
              <span className="inline-block px-4 py-1 rounded-full bg-red-600/20 border border-red-500/40 text-red-300 text-xs font-bold">
                Step 4 of 8 · Body Region
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                {t.bodyPrompt}
              </h2>
            </div>

            {/* 8 Big Illustrated Body Part Touch Tiles */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 max-w-4xl mx-auto">
              {bodyPartKeys.map((key) => {
                const part = t.bodyParts[key];
                const isSelected = selectedBodyPart === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setSelectedBodyPart(key);
                      setAdaptiveSymptoms([]); // reset adaptive symptoms when region changes
                      speakPrompt(part.label);
                    }}
                    className={`p-4 rounded-3xl border-3 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer active:scale-95 text-center shadow-lg ${
                      isSelected
                        ? "bg-gradient-to-br from-red-600 to-rose-700 text-white border-white scale-105 shadow-red-600/40 ring-4 ring-red-400/30"
                        : "bg-white hover:bg-red-50/50 text-slate-900 border-slate-200 hover:border-red-400"
                    }`}
                  >
                    <span className="text-4xl sm:text-5xl">{part.icon}</span>
                    <div className="leading-tight">
                      <div className={`font-black text-sm sm:text-base ${isSelected ? "text-white" : "text-slate-900"}`}>
                        {part.label}
                      </div>
                      <div className={`text-[11px] mt-0.5 font-semibold line-clamp-2 ${isSelected ? "text-red-100" : "text-slate-500"}`}>
                        {part.sub}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Bottom Nav Bar */}
            <div className="flex items-center justify-between max-w-4xl mx-auto pt-3">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-6 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold flex items-center gap-2 cursor-pointer text-sm"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>{t.backBtn}</span>
              </button>

              <button
                type="button"
                onClick={() => setStep(5)}
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black flex items-center gap-3 cursor-pointer text-base shadow-xl shadow-red-600/30 active:scale-95"
              >
                <span>{t.nextBtn}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 5: ADAPTIVE CLINICAL DECISION TREE (SPECIFIC SYMPTOMS) */}
        {/* ========================================================================= */}
        {step === 5 && (
          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200 max-w-4xl mx-auto w-full">
            <div className="text-center space-y-1">
              <span className="inline-block px-4 py-1 rounded-full bg-red-600/20 border border-red-500/40 text-red-300 text-xs font-bold">
                Step 5 of 8 · Adaptive Symptom Tree
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white flex items-center justify-center gap-2">
                <span>{activeTree.title}</span>
              </h2>
              <p className="text-xs text-red-200/80">
                {activeTree.prompt} (Tap all that apply)
              </p>
            </div>

            {/* Dynamic Adaptive Symptom Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-3xl mx-auto">
              {activeTree.options.map((opt) => {
                const isSelected = adaptiveSymptoms.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      toggleAdaptiveSymptom(opt.id);
                      speakPrompt(currentLanguage === "hi" ? opt.labelHi : opt.label);
                    }}
                    className={`p-4 rounded-2xl border-2 transition-all flex items-center justify-between gap-3 text-left cursor-pointer active:scale-95 shadow-md ${
                      isSelected
                        ? "bg-gradient-to-r from-red-600 to-rose-600 text-white border-white font-black scale-102 ring-2 ring-red-400/40"
                        : "bg-white hover:bg-red-50/60 text-slate-900 border-slate-200"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-2xl shrink-0">{opt.icon}</span>
                      <div className="leading-snug">
                        <div className={`text-xs sm:text-sm font-bold ${isSelected ? "text-white" : "text-slate-900"}`}>
                          {opt.label}
                        </div>
                        {currentLanguage !== "en" && (
                          <div className={`text-[11px] mt-0.5 ${isSelected ? "text-red-100" : "text-slate-500"}`}>
                            {opt.labelHi}
                          </div>
                        )}
                      </div>
                    </div>
                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-white text-red-600 flex items-center justify-center shrink-0">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Bottom Nav Bar */}
            <div className="flex items-center justify-between max-w-3xl mx-auto pt-3">
              <button
                type="button"
                onClick={() => setStep(4)}
                className="px-6 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold flex items-center gap-2 cursor-pointer text-sm"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>{t.backBtn}</span>
              </button>

              <button
                type="button"
                onClick={() => setStep(6)}
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black flex items-center gap-3 cursor-pointer text-base shadow-xl shadow-red-600/30 active:scale-95"
              >
                <span>{t.nextBtn}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 6: DURATION & PRE-EXISTING MEDICAL HISTORY */}
        {/* ========================================================================= */}
        {step === 6 && (
          <div className="space-y-5 animate-in fade-in zoom-in-95 duration-200 max-w-4xl mx-auto w-full">
            <div className="text-center space-y-1">
              <span className="inline-block px-4 py-1 rounded-full bg-red-600/20 border border-red-500/40 text-red-300 text-xs font-bold">
                Step 6 of 8 · Duration & History
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                {t.durationPrompt}
              </h2>
            </div>

            {/* Duration 4 Big Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { key: "today", label: t.durationToday, icon: "☀️" },
                { key: "fewDays", label: t.durationFewDays, icon: "📅" },
                { key: "weeks", label: t.durationWeeks, icon: "🗓️" },
                { key: "month", label: t.durationMonth, icon: "⏳" },
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    setDuration(item.key);
                    speakPrompt(item.label);
                  }}
                  className={`p-4 rounded-3xl border-3 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer active:scale-95 text-center shadow-lg ${
                    duration === item.key
                      ? "bg-gradient-to-br from-red-600 to-rose-700 text-white border-white scale-105 shadow-red-600/40"
                      : "bg-white hover:bg-red-50 text-slate-900 border-slate-200"
                  }`}
                >
                  <span className="text-3xl">{item.icon}</span>
                  <span className="text-xs sm:text-sm font-black">{item.label}</span>
                </button>
              ))}
            </div>

            {/* Pre-existing Conditions Selector */}
            <div className="bg-slate-800/80 border-2 border-red-500/30 rounded-3xl p-5 space-y-3">
              <div className="text-sm font-black text-red-300 flex items-center gap-2">
                <Clock className="w-4 h-4 text-red-400" />
                <span>{t.historyPrompt}</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { key: "none", label: t.condNone, icon: "✅" },
                  { key: "bp", label: t.condBp, icon: "🩸" },
                  { key: "diabetes", label: t.condDiabetes, icon: "🍬" },
                  { key: "heart", label: t.condHeart, icon: "🫀" },
                  { key: "asthma", label: t.condAsthma, icon: "🫁" },
                  { key: "thyroid", label: t.condThyroid, icon: "🦋" },
                  { key: "allergy", label: t.condAllergy, icon: "💊" },
                ].map((cond) => {
                  const isChecked = chronicConditions.includes(cond.key);
                  return (
                    <button
                      key={cond.key}
                      type="button"
                      onClick={() => toggleCondition(cond.key)}
                      className={`p-3 rounded-2xl border-2 transition-all flex items-center justify-between gap-2 cursor-pointer text-left ${
                        isChecked
                          ? "bg-red-600 text-white border-white shadow-md font-black"
                          : "bg-slate-900 text-slate-300 border-slate-700 hover:border-red-400"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span>{cond.icon}</span>
                        <span className="text-xs truncate">{cond.label}</span>
                      </div>
                      {isChecked && <Check className="w-4 h-4 text-white shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Nav Bar */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep(5)}
                className="px-6 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold flex items-center gap-2 cursor-pointer text-sm"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>{t.backBtn}</span>
              </button>

              <button
                type="button"
                onClick={() => setStep(7)}
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black flex items-center gap-3 cursor-pointer text-base shadow-xl shadow-red-600/30 active:scale-95"
              >
                <span>{t.nextBtn}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 7: 1-TOUCH MACHINE VITALS SCAN */}
        {/* ========================================================================= */}
        {step === 7 && (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200 max-w-2xl mx-auto w-full text-center">
            <div className="space-y-1">
              <span className="inline-block px-4 py-1 rounded-full bg-red-600/20 border border-red-500/40 text-red-300 text-xs font-bold">
                Step 7 of 8 · Sensor Calibration
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                {t.vitalsPrompt}
              </h2>
            </div>

            {/* Vitals Animation Card */}
            <div className="bg-white text-slate-900 border-2 border-red-200 rounded-3xl p-8 shadow-2xl space-y-6">
              <div className="w-24 h-24 rounded-full bg-red-50 border-2 border-red-200 text-red-600 flex items-center justify-center mx-auto shadow-md animate-pulse">
                <HeartPulse className="w-12 h-12" />
              </div>

              <div className="space-y-2">
                <div className="text-lg font-black text-slate-900">
                  {vitalsProgress < 100 ? t.vitalsCalibrating : t.vitalsComplete}
                </div>
                {/* Progress Bar */}
                <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden border border-slate-200">
                  <div
                    className="bg-gradient-to-r from-red-600 to-rose-600 h-4 rounded-full transition-all duration-500"
                    style={{ width: `${vitalsProgress}%` }}
                  />
                </div>
                <div className="text-xs font-bold text-red-700">
                  {vitalsProgress}% Complete
                </div>
              </div>

              {/* Vitals Readout Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="p-3 bg-red-50/60 rounded-2xl border border-red-100 text-center">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">{t.bpLabel}</span>
                  <span className="text-base font-black text-red-700">{vitalsProgress >= 45 ? "128/84" : "--/--"}</span>
                </div>
                <div className="p-3 bg-red-50/60 rounded-2xl border border-red-100 text-center">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">{t.pulseLabel}</span>
                  <span className="text-base font-black text-red-700">{vitalsProgress >= 60 ? "78 bpm" : "--"}</span>
                </div>
                <div className="p-3 bg-red-50/60 rounded-2xl border border-red-100 text-center">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">{t.spo2Label}</span>
                  <span className="text-base font-black text-red-700">{vitalsProgress >= 80 ? "98%" : "--"}</span>
                </div>
                <div className="p-3 bg-red-50/60 rounded-2xl border border-red-100 text-center">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">{t.tempLabel}</span>
                  <span className="text-base font-black text-red-700">{vitalsProgress >= 90 ? "98.4 °F" : "--"}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 8: PRINT OPD TOKEN TICKET WITH STREAM, PHOTO & ADAPTIVE DETAILS */}
        {/* ========================================================================= */}
        {step === 8 && generatedToken && (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200 max-w-xl mx-auto w-full">
            <div className="text-center space-y-1">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-red-600 to-rose-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-red-600/30">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                {t.tokenTitle}
              </h2>
              <p className="text-xs text-red-200/80">
                {t.tokenSubtitle}
              </p>
            </div>

            {/* Printable OPD Slip Paper Card with Photo & Patient Name */}
            <div className="bg-white text-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border-4 border-dashed border-red-300 space-y-4">
              {/* Slip Header with Red Cross */}
              <div className="text-center border-b border-slate-200 pb-3 space-y-1">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-red-600 text-white flex items-center justify-center">
                    <Plus className="w-4 h-4 stroke-[3]" />
                  </div>
                  <span className="font-black text-lg tracking-tight text-slate-900">{t.appName}</span>
                </div>
                <div className="text-xs font-semibold text-red-700">{generatedToken.department}</div>
                <div className="text-[11px] text-slate-400">Issued at: {generatedToken.time} · Station K-03</div>
              </div>

              {/* Patient Photo, Name & Token Banner */}
              <div className="flex items-center gap-4 bg-red-50 border-2 border-red-200 rounded-2xl p-4">
                {/* Captured Photo */}
                <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-red-500 shrink-0 shadow-sm">
                  <img
                    src={generatedToken.photo}
                    alt="Patient Photo"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Token & Patient Name Display */}
                <div className="flex-1 min-w-0">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block">
                    {t.tokenNumberLabel}
                  </span>
                  <div className="text-3xl sm:text-4xl font-black text-red-700 tracking-tight">
                    {generatedToken.number}
                  </div>
                  <div className="text-sm font-black text-slate-900 truncate mt-0.5">
                    {generatedToken.name}
                  </div>
                  <div className="text-xs font-bold text-slate-600 capitalize">
                    {generatedToken.gender} · {generatedToken.ageGroup} · {generatedToken.medicalStream.toUpperCase()}
                  </div>
                </div>
              </div>

              {/* Consultation Details */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500 font-semibold block">{t.roomLabel}:</span>
                  <strong className="text-sm font-black text-slate-900">{generatedToken.room}</strong>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500 font-semibold block">{t.doctorLabel}:</span>
                  <strong className="text-sm font-black text-slate-900">{generatedToken.doctor}</strong>
                </div>
              </div>

              {/* Chief Complaint & Specific Adaptive Symptoms */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-semibold">Chief Symptom:</span>
                  <strong className="text-slate-900 font-black">{generatedToken.complaint}</strong>
                </div>
                {generatedToken.specificSymptoms && generatedToken.specificSymptoms.length > 0 && (
                  <div>
                    <span className="text-[11px] text-slate-500 font-semibold block mb-0.5">Reported Specifics:</span>
                    <div className="flex flex-wrap gap-1">
                      {generatedToken.specificSymptoms.map((sym, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-md bg-red-100 text-red-800 text-[10px] font-bold">
                          {sym}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-between text-[11px] pt-0.5">
                  <span className="text-slate-500">Duration:</span>
                  <span className="text-slate-700 font-bold capitalize">{generatedToken.duration}</span>
                </div>
              </div>

              {/* Recorded Vitals Readout */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <span className="text-slate-500 font-semibold block mb-1">{t.vitalsSummaryLabel}:</span>
                <div className="grid grid-cols-4 gap-2 text-center font-bold text-slate-800 text-[11px]">
                  <div>BP: {generatedToken.vitals.bp}</div>
                  <div>Pulse: {generatedToken.vitals.pulse}</div>
                  <div>SpO2: {generatedToken.vitals.spo2}</div>
                  <div>Temp: {generatedToken.vitals.temp}</div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                <div className="flex items-center gap-1.5 text-red-700 font-bold">
                  <ShieldCheck className="w-4 h-4 text-red-600" />
                  <span>ABDM Synced · Realtime DB</span>
                </div>
                <div className="flex items-center gap-1 font-mono">
                  <QrCode className="w-4 h-4 text-slate-700" />
                  <span>SCAN-MK-03</span>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="flex-1 py-4 bg-white hover:bg-slate-100 border-2 border-red-600 text-red-700 font-black rounded-2xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer text-base active:scale-95"
              >
                <Printer className="w-5 h-5 text-red-600" />
                <span>{t.printSlipBtn}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setMedicalStream("ayush");
                  setPatientName("");
                  setPatientPhoto(null);
                  setPatientPhone("");
                  setSelectedBodyPart("chest");
                  setAdaptiveSymptoms([]);
                  setChronicConditions(["none"]);
                  setPainScore(4);
                  setVitalsProgress(0);
                }}
                className="flex-1 py-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black rounded-2xl shadow-xl shadow-red-600/30 transition flex items-center justify-center gap-2 cursor-pointer text-base active:scale-95"
              >
                <RotateCcw className="w-5 h-5" />
                <span>{t.nextPatientBtn}</span>
              </button>
            </div>
          </div>
        )}

      </main>

      {/* Persistent Bottom Bar */}
      <footer className="max-w-5xl w-full mx-auto py-2 flex items-center justify-between text-xs text-red-300/60 border-t border-red-900/40">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          <span>Self-Service Touch Station K-03 · Adaptive Clinical Decision Tree Active</span>
        </div>
        <button
          type="button"
          onClick={() => setPortalMode("login")}
          className="text-red-400 hover:text-red-200 text-xs font-semibold cursor-pointer"
        >
          {t.exitKiosk}
        </button>
      </footer>

    </div>
  );
}
