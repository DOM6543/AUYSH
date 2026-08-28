import React, { useState, useEffect, useRef } from "react";
import {
  Volume2,
  Mic,
  Camera,
  ArrowRight,
  ChevronLeft,
  Printer,
  RotateCcw,
  CheckCircle2,
  FileText,
  AlertCircle,
  Plus,
  Send,
  AlertTriangle
} from "lucide-react";
import { usePatient } from "../../context/PatientContext";
import { KIOSK_LANGUAGES, KIOSK_STRINGS } from "../../data/kioskTranslations";
import { speechService, patientNarrator } from "../../services/speech/speechService";
import { ocrService } from "../../services/documents/ocrService";
import { medicalExtractionService } from "../../services/documents/medicalExtractionService";
import {
  createInitialInterviewState,
  updateInterviewState,
  getNextDynamicQuestion
} from "../../services/clinical/adaptiveInterviewEngine";

export default function PatientKioskApp() {
  const { submitKioskIntake, currentLanguage, setCurrentLanguage } = usePatient();

  // Selected language dictionary
  const str = KIOSK_STRINGS[currentLanguage] || KIOSK_STRINGS.en;

  /**
   * KIOSK SCREENS:
   * 1: Language Selection & Welcome Screen
   * 2: ABHA ID Screen (Numeric Touch Keypad + Direct Walk-in)
   * 3: Treatment System Selection (5 AYUSH Systems: Ayurveda, Siddha, Unani, Homeopathy, Yoga & Naturopathy)
   * 4: Dynamic Adaptive Conversational Interview (ONE QUESTION PER SCREEN)
   * 5: Interview Completion Confirmation Screen
   * 6: Document Scan / Upload & OCR Screen (STRICTLY AFTER INTERVIEW)
   * 7: Final Hospital OPD Token Slip Screen
   */
  const [screen, setScreen] = useState(1);

  // Audio / Speech Recognition State
  const [isListening, setIsListening] = useState(false);
  const [speechInterim, setSpeechInterim] = useState("");
  const [spokenHistory, setSpokenHistory] = useState([]);

  // Patient Demographics & Session State
  const [abhaId, setAbhaId] = useState("");
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [treatmentSystem, setTreatmentSystem] = useState("AYURVEDA");

  // Dynamic Adaptive Interview Engine State
  const [interviewState, setInterviewState] = useState(() =>
    createInitialInterviewState("AYURVEDA", currentLanguage)
  );
  const [typedDescription, setTypedDescription] = useState("");

  // History stack for Back button navigation in dynamic interview
  const [interviewHistory, setInterviewHistory] = useState([]);

  // Document Upload & OCR State (Strictly after interview)
  const [uploadedDocuments, setUploadedDocuments] = useState([]);
  const [isOcrProcessing, setIsOcrProcessing] = useState(false);
  const [ocrStatusMessage, setOcrStatusMessage] = useState("");
  const docFileInputRef = useRef(null);

  // Final Token State
  const [generatedToken, setGeneratedToken] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Active dynamic question resolved from current state
  const currentQuestion = screen === 4 ? getNextDynamicQuestion(interviewState) : null;

  // Auto-advance if interview is complete
  useEffect(() => {
    if (screen === 4 && !currentQuestion) {
      setScreen(5); // Interview Completion Confirmation
    }
  }, [screen, currentQuestion]);

  // Sync language with interview state
  useEffect(() => {
    setInterviewState((prev) => ({ ...prev, language: currentLanguage }));
  }, [currentLanguage]);

  // Automatic Voice Narration Helper
  const speakQuestion = (text) => {
    if (!text) return;
    patientNarrator.speak(text, currentLanguage);
  };

  /**
   * Automatic Voice Narration on Every Screen & Dynamic Question Change
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      if (screen === 1) {
        speakQuestion(str.welcomeAudio || str.chooseLanguage);
      } else if (screen === 2) {
        speakQuestion(str.abhaAudio || str.abhaPrompt);
      } else if (screen === 3) {
        speakQuestion(str.treatmentChoiceAudio || str.treatmentChoiceTitle);
      } else if (screen === 4 && currentQuestion) {
        speakQuestion(currentQuestion.audioText || currentQuestion.title);
      } else if (screen === 5) {
        speakQuestion(str.interviewCompleteAudio || str.interviewCompleteTitle);
      } else if (screen === 6) {
        speakQuestion(str.medDocAudio || str.medDocPrompt);
      } else if (screen === 7) {
        speakQuestion(str.tokenAudio || str.tokenTitle);
      }
    }, 60);

    return () => clearTimeout(timer);
  }, [screen, currentQuestion?.id, currentLanguage]);

  /**
   * Simultaneous Multimodal Speech Recognition (Voice + Touch available together)
   */
  const toggleListening = () => {
    if (isListening) {
      speechService.stopListening();
      setIsListening(false);
      setSpeechInterim("");
    } else {
      setIsListening(true);
      setSpeechInterim(str.listening);

      speechService.startListening({
        lang: currentLanguage,
        onResult: (transcript, isFinal) => {
          setSpeechInterim(transcript);

          if (screen === 3) {
            // Treatment choice speech parsing
            const parsedSystem = speechService.parseQuestionAnswer(transcript, "treatment_choice");
            if (parsedSystem) {
              handleTreatmentChoice(parsedSystem);
              setSpeechInterim("");
            }
          } else if (screen === 4 && currentQuestion) {
            // Adaptive speech parsing with NLP entity extraction
            const parsedPayload = speechService.parseAdaptiveSpeech(transcript, currentQuestion);
            if (parsedPayload) {
              handleAnswer(parsedPayload);
              if (isFinal) {
                setSpokenHistory((prev) => [...prev, transcript]);
                setSpeechInterim("");
              }
            }
          }
        },
        onError: () => {
          setIsListening(false);
          setSpeechInterim("");
        },
        onEnd: () => {
          setIsListening(false);
        }
      });
    }
  };

  /**
   * Unified Answer Handler (Called by BOTH Voice & Touch)
   */
  const handleAnswer = (answerPayload) => {
    // Save current state in history stack for Back navigation
    setInterviewHistory((prev) => [...prev, interviewState]);

    setInterviewState((prevState) => {
      const updated = updateInterviewState(prevState, {
        ...answerPayload,
        questionId: currentQuestion?.id || answerPayload.questionId
      });
      return updated;
    });

    setTypedDescription("");
  };

  /**
   * Handle Treatment System Selection
   */
  const handleTreatmentChoice = (system) => {
    setTreatmentSystem(system);
    patientNarrator.confirmTreatmentSystem(system, currentLanguage);
    const freshState = createInitialInterviewState(system, currentLanguage);
    setInterviewState(freshState);
    setInterviewHistory([]);
    setScreen(4); // Launch dynamic interview
  };

  /**
   * Back Button Navigation in Dynamic Adaptive Interview
   */
  const handleBackQuestion = () => {
    if (interviewHistory.length > 0) {
      const previousState = interviewHistory[interviewHistory.length - 1];
      setInterviewHistory((prev) => prev.slice(0, -1));
      setInterviewState(previousState);
    } else {
      setScreen(3); // Back to Treatment System Selection
    }
  };

  /**
   * Keypad Handlers for ABHA ID Entry
   */
  const handleKeypadPress = (num) => {
    if (abhaId.length < 17) {
      let clean = abhaId.replace(/\D/g, "") + num;
      if (clean.length > 14) clean = clean.slice(0, 14);

      let formatted = "";
      for (let i = 0; i < clean.length; i++) {
        if (i === 2 || i === 6 || i === 10) formatted += "-";
        formatted += clean[i];
      }
      setAbhaId(formatted);
    }
  };

  const handleKeypadDelete = () => {
    let clean = abhaId.replace(/\D/g, "");
    if (clean.length > 0) {
      clean = clean.slice(0, -1);
      let formatted = "";
      for (let i = 0; i < clean.length; i++) {
        if (i === 2 || i === 6 || i === 10) formatted += "-";
        formatted += clean[i];
      }
      setAbhaId(formatted);
    }
  };

  const handleKeypadClear = () => {
    setAbhaId("");
  };

  /**
   * Document OCR Processing (Strictly after interview completion)
   */
  const handleDocFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsOcrProcessing(true);
    setOcrStatusMessage(str.docReading);

    try {
      const ocrResult = await ocrService.processImage(file);
      const extracted = medicalExtractionService.extractAll(ocrResult.rawText || "");

      const newDoc = {
        id: `doc_${Date.now()}`,
        name: file.name,
        type: file.type.includes("pdf") ? "PDF Prescription" : "Lab Report / RX",
        date: new Date().toLocaleDateString(),
        extracted: extracted,
        previewUrl: URL.createObjectURL(file)
      };

      setUploadedDocuments((prev) => [...prev, newDoc]);
      setOcrStatusMessage(str.docSuccess);
      speakQuestion(str.docSuccess);
    } catch (err) {
      console.warn("OCR processing warning:", err);
      setOcrStatusMessage(str.docError);
      const fallbackDoc = {
        id: `doc_${Date.now()}`,
        name: file.name,
        type: "Physical Document",
        date: new Date().toLocaleDateString(),
        previewUrl: URL.createObjectURL(file)
      };
      setUploadedDocuments((prev) => [...prev, fallbackDoc]);
    } finally {
      setIsOcrProcessing(false);
    }
  };

  /**
   * Final Submission & OPD Token Generation
   */
  const handleFinalSubmission = async () => {
    setIsSubmitting(true);

    const tokenNum = `MK-${Math.floor(10 + Math.random() * 90)}`;

    let roomNum = "104";
    let doctorName = "Dr. Ramesh Kumar (Ayurveda OPD)";
    if (treatmentSystem === "SIDDHA") {
      roomNum = "202";
      doctorName = "Dr. S. Kabilan (Siddha OPD)";
    } else if (treatmentSystem === "UNANI") {
      roomNum = "203";
      doctorName = "Dr. Hakim Zafar Khan (Unani OPD)";
    } else if (treatmentSystem === "HOMEOPATHY") {
      roomNum = "204";
      doctorName = "Dr. Ananya Banerjee (Homeopathy OPD)";
    } else if (treatmentSystem === "YOGA_NATUROPATHY") {
      roomNum = "205";
      doctorName = "Dr. Priyamvada Joshi (Yoga & Naturopathy OPD)";
    }

    // Build synthesized chief complaint label
    const siteLabel = interviewState.specificSite || interviewState.bodyArea || "General Consultation";
    const sidePrefix = interviewState.side ? `${interviewState.side} ` : "";
    const durationSuffix = interviewState.durationText ? ` — ${interviewState.durationText}` : "";
    const chiefComplaintSynthesized = `${sidePrefix}${siteLabel} discomfort${durationSuffix}`;

    const payload = {
      abhaId: isGuestMode || !abhaId ? "GUEST-WALKIN" : abhaId,
      name: isGuestMode || !abhaId ? "Walk-in Patient" : `Patient (${abhaId})`,
      age: 42,
      gender: "Male",
      language: currentLanguage,
      treatmentSystem: treatmentSystem,
      careSystem: treatmentSystem,
      medicalStream: "ayush",
      chiefComplaint: chiefComplaintSynthesized,
      patientNarrative: interviewState.patientNarrative || (spokenHistory.length > 0 ? spokenHistory.join(". ") : ""),
      extractedData: interviewState.extractedData || {},
      hpi: {
        bodyArea: interviewState.bodyArea,
        specificSite: interviewState.specificSite,
        side: interviewState.side,
        character: interviewState.character,
        radiation: interviewState.radiation,
        aggravating: interviewState.aggravatingFactors,
        relieving: interviewState.relievingFactors,
        associated: interviewState.associatedSymptoms,
        duration: interviewState.durationText || interviewState.duration,
        painScore: interviewState.severity !== null ? interviewState.severity : 4
      },
      systemSpecific: interviewState.systemSpecific || {},
      ayurveda: treatmentSystem === "AYURVEDA" ? interviewState.systemSpecific : null,
      siddha: treatmentSystem === "SIDDHA" ? interviewState.systemSpecific : null,
      unani: treatmentSystem === "UNANI" ? interviewState.systemSpecific : null,
      homeopathy: treatmentSystem === "HOMEOPATHY" ? interviewState.systemSpecific : null,
      yogaNaturopathy: treatmentSystem === "YOGA_NATUROPATHY" ? interviewState.systemSpecific : null,
      medicalHistory: {
        pastIllnesses: interviewState.pastConditions || [],
        takesDailyMeds: interviewState.dailyMeds,
        hasAllergies: interviewState.allergies
      },
      documents: uploadedDocuments,
      tokenNumber: tokenNum,
      consultationRoom: roomNum,
      doctorName: doctorName,
      timestamp: new Date().toISOString()
    };

    try {
      if (submitKioskIntake) {
        await submitKioskIntake(payload);
      }
    } catch (err) {
      console.warn("Intake submit warning:", err);
    }

    setGeneratedToken({
      tokenNumber: tokenNum,
      roomNumber: roomNum,
      doctorName: doctorName,
      treatmentSystem: treatmentSystem,
      chiefComplaint: chiefComplaintSynthesized,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    });

    setIsSubmitting(false);
    setScreen(7);
  };

  /**
   * Reset Kiosk for Next Patient
   */
  const handleResetKiosk = () => {
    patientNarrator.cancel();
    speechService.stopListening();
    setScreen(1);
    setAbhaId("");
    setIsGuestMode(false);
    setTreatmentSystem("AYURVEDA");
    setInterviewState(createInitialInterviewState("AYURVEDA", currentLanguage));
    setInterviewHistory([]);
    setSpokenHistory([]);
    setUploadedDocuments([]);
    setGeneratedToken(null);
  };

  const getTreatmentDisplayName = (system) => {
    if (system === "AYURVEDA") return str.ayurveda;
    if (system === "SIDDHA") return str.siddha;
    if (system === "UNANI") return str.unani;
    if (system === "HOMEOPATHY") return str.homeopathy;
    if (system === "YOGA_NATUROPATHY") return str.yogaNaturopathy;
    return system;
  };

  return (
    <div className="min-h-screen bg-[#0a1118] text-slate-100 font-sans select-none flex flex-col justify-between overflow-x-hidden">
      {/* Top Kiosk Header */}
      <header className="bg-[#0f172a] border-b border-slate-800 px-6 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-red-950/60">
            <Plus className="w-6 h-6 stroke-[3.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-wider text-white">
                {str.stationTitle}
              </span>
              <span className="bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                {str.patientStationBadge}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              AIIMS National Healthcare Kiosk System · Conversational Intake
            </p>
          </div>
        </div>

        {/* Top Right Controls: Active Language & Re-speak */}
        <div className="flex items-center gap-3">
          {screen > 1 && (
            <button
              onClick={() => {
                if (screen === 2) speakQuestion(str.abhaAudio || str.abhaPrompt);
                else if (screen === 3) speakQuestion(str.treatmentChoiceAudio || str.treatmentChoiceTitle);
                else if (screen === 4 && currentQuestion) {
                  speakQuestion(currentQuestion.audioText || currentQuestion.title);
                } else if (screen === 5) speakQuestion(str.interviewCompleteAudio);
                else if (screen === 6) speakQuestion(str.medDocAudio);
                else if (screen === 7) speakQuestion(str.tokenAudio);
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs flex items-center gap-2 shadow-xs transition active:scale-95 cursor-pointer"
              title="Repeat spoken question"
            >
              <Volume2 className="w-4 h-4 text-red-400" />
              <span>{str.hearAgain}</span>
            </button>
          )}

          {screen > 1 && (
            <button
              onClick={() => setScreen(1)}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 shadow-xs transition active:scale-95 cursor-pointer"
              title="Change Language"
            >
              <span>🌐</span>
              <span>{KIOSK_LANGUAGES.find((l) => l.code === currentLanguage)?.nativeName || "English"}</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Kiosk View Area */}
      <main className="flex-1 flex flex-col justify-center items-center p-4 sm:p-8 max-w-6xl mx-auto w-full">
        {/* ========================================================================= */}
        {/* SCREEN 1: LANGUAGE SELECTION & WELCOME                                    */}
        {/* ========================================================================= */}
        {screen === 1 && (
          <div className="w-full text-center space-y-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="space-y-3">
              <span className="text-4xl sm:text-5xl block">नमस्ते / வணக்கம் / Hello</span>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {str.chooseLanguage}
              </h1>
              <p className="text-sm sm:text-base text-slate-400 font-medium">
                {str.chooseLanguageSub}
              </p>
            </div>

            {/* 8 Regional Language Touch Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
              {KIOSK_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setCurrentLanguage(lang.code);
                    patientNarrator.confirmLanguage(lang.code);
                    setScreen(2);
                  }}
                  className={`p-5 rounded-2xl border-2 text-center transition-all duration-150 active:scale-95 flex flex-col items-center justify-center gap-2 cursor-pointer shadow-lg ${
                    currentLanguage === lang.code
                      ? "bg-red-600/20 border-red-500 text-white shadow-red-950/60 ring-2 ring-red-500"
                      : "bg-slate-900/90 border-slate-800 text-slate-200 hover:border-red-500/60 hover:bg-slate-800"
                  }`}
                >
                  <span className="text-2xl">{lang.flag}</span>
                  <span className="text-xl sm:text-2xl font-black text-white block">
                    {lang.nativeName}
                  </span>
                  <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                    {lang.englishName}
                  </span>
                </button>
              ))}
            </div>

            <div className="pt-4">
              <button
                onClick={() => {
                  patientNarrator.confirmLanguage(currentLanguage);
                  setScreen(2);
                }}
                className="w-full max-w-md mx-auto py-4 px-8 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-lg shadow-xl shadow-red-950/60 transition active:scale-95 flex items-center justify-center gap-3 cursor-pointer"
              >
                <span>{str.touchToBegin}</span>
                <ArrowRight className="w-5 h-5 stroke-[3]" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SCREEN 2: ABHA ID ENTRY (Numeric Keypad + Direct Walk-in)                */}
        {/* ========================================================================= */}
        {screen === 2 && (
          <div className="w-full max-w-xl space-y-6 text-center animate-in fade-in duration-200">
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                {str.abhaTitle}
              </h2>
              <p className="text-sm text-slate-400">
                {str.abhaPrompt}
              </p>
            </div>

            {/* ABHA Display Input */}
            <div className="bg-slate-900 border-2 border-red-500/50 rounded-2xl p-4 shadow-inner">
              <div className="text-3xl sm:text-4xl font-mono font-black tracking-widest text-white min-h-[48px] flex items-center justify-center">
                {abhaId || <span className="text-slate-600 font-sans text-xl font-medium">{str.abhaPlaceholder}</span>}
              </div>
            </div>

            {/* Large Numeric Touch Keypad */}
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  onClick={() => handleKeypadPress(num.toString())}
                  className="py-4 rounded-2xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-white text-2xl sm:text-3xl font-black transition active:scale-95 shadow-md cursor-pointer"
                >
                  {num}
                </button>
              ))}
              <button
                onClick={handleKeypadClear}
                className="py-4 rounded-2xl bg-slate-900/60 hover:bg-slate-800 border border-slate-800 text-red-400 text-base sm:text-lg font-bold transition active:scale-95 cursor-pointer"
              >
                {str.abhaClear}
              </button>
              <button
                onClick={() => handleKeypadPress("0")}
                className="py-4 rounded-2xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-white text-2xl sm:text-3xl font-black transition active:scale-95 cursor-pointer"
              >
                0
              </button>
              <button
                onClick={handleKeypadDelete}
                className="py-4 rounded-2xl bg-slate-900/60 hover:bg-slate-800 border border-slate-800 text-red-400 text-xl font-black transition active:scale-95 cursor-pointer"
              >
                {str.abhaDelete}
              </button>
            </div>

            {/* Actions: Continue or Direct Walk-in */}
            <div className="space-y-3 pt-2">
              <button
                disabled={abhaId.length < 14}
                onClick={() => {
                  setIsGuestMode(false);
                  setScreen(3);
                }}
                className={`w-full py-4 rounded-2xl font-black text-lg transition active:scale-95 shadow-lg flex items-center justify-center gap-2 ${
                  abhaId.length >= 14
                    ? "bg-red-600 hover:bg-red-500 text-white cursor-pointer shadow-red-950/60"
                    : "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
                }`}
              >
                <span>{str.continueBtn}</span>
              </button>

              <button
                onClick={() => {
                  setIsGuestMode(true);
                  setAbhaId("");
                  setScreen(3);
                }}
                className="w-full py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-sm font-bold transition active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>🏥</span>
                <span>{str.abhaWalkinBtn}</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SCREEN 3: TREATMENT SYSTEM SELECTION (5 ENORMOUS CARDS)                   */}
        {/* ========================================================================= */}
        {screen === 3 && (
          <div className="w-full max-w-5xl space-y-6 text-center animate-in fade-in duration-200">
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                {str.treatmentChoiceTitle}
              </h2>
            </div>

            {/* Multimodal Mic Bar */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3 flex items-center justify-center gap-3">
              <button
                onClick={toggleListening}
                className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                  isListening
                    ? "bg-red-600 text-white animate-pulse"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                <Mic className={`w-4 h-4 ${isListening ? "text-white animate-spin" : "text-red-400"}`} />
                <span>{isListening ? str.listening : str.speakBtn}</span>
              </button>
              <span className="text-xs text-slate-400">
                {str.touchOrSpeak}
              </span>
            </div>

            {/* 5 Enormous Treatment Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 pt-2">
              {[
                { id: "AYURVEDA", icon: "🌿", label: str.ayurveda, border: "hover:border-emerald-500", bg: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40", textHover: "group-hover:text-emerald-400" },
                { id: "SIDDHA", icon: "🌿", label: str.siddha, border: "hover:border-teal-500", bg: "bg-teal-500/20 text-teal-400 border-teal-500/40", textHover: "group-hover:text-teal-400" },
                { id: "UNANI", icon: "🏺", label: str.unani, border: "hover:border-amber-500", bg: "bg-amber-500/20 text-amber-400 border-amber-500/40", textHover: "group-hover:text-amber-400" },
                { id: "HOMEOPATHY", icon: "💊", label: str.homeopathy, border: "hover:border-blue-500", bg: "bg-blue-500/20 text-blue-400 border-blue-500/40", textHover: "group-hover:text-blue-400" },
                { id: "YOGA_NATUROPATHY", icon: "🧘", label: str.yogaNaturopathy, border: "hover:border-indigo-500", bg: "bg-indigo-500/20 text-indigo-400 border-indigo-500/40", textHover: "group-hover:text-indigo-400", span: "col-span-2 sm:col-span-1" }
              ].map((card) => (
                <button
                  key={card.id}
                  onClick={() => handleTreatmentChoice(card.id)}
                  className={`p-5 sm:p-7 rounded-3xl bg-slate-900 hover:bg-slate-850 border-3 border-slate-800 ${card.border} transition-all duration-150 active:scale-95 text-center flex flex-col items-center justify-center space-y-3.5 shadow-xl cursor-pointer group ${card.span || ""}`}
                >
                  <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl ${card.bg} border-2 flex items-center justify-center text-3xl sm:text-4xl group-hover:scale-105 transition-transform shadow-inner`}>
                    {card.icon}
                  </div>
                  <div>
                    <h3 className={`text-lg sm:text-xl font-black text-white ${card.textHover} transition-colors uppercase tracking-wide`}>
                      {card.label}
                    </h3>
                  </div>
                </button>
              ))}
            </div>

            <div className="pt-4">
              <button
                onClick={() => setScreen(2)}
                className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 font-bold text-xs transition cursor-pointer"
              >
                {str.backBtn}
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SCREEN 4: DYNAMIC ADAPTIVE CONVERSATIONAL INTERVIEW (1 QUESTION / SCREEN) */}
        {/* ========================================================================= */}
        {screen === 4 && currentQuestion && (
          <div className="w-full max-w-3xl space-y-6 animate-in fade-in duration-200">
            {/* Safety Red-Flag Alert Banner if Triggered */}
            {interviewState.isSafetyTriggered && (
              <div className="bg-red-950/80 border-2 border-red-600 rounded-2xl p-4 flex items-center gap-3 animate-pulse shadow-xl shadow-red-950/70">
                <AlertTriangle className="w-6 h-6 text-red-400 shrink-0" />
                <div className="text-left text-xs font-bold text-red-200">
                  <span className="uppercase text-red-400 font-black block">Safety Triage Escalation:</span>
                  {interviewState.safetyAlert || "High risk clinical indicators detected. Prioritizing expedited doctor review."}
                </div>
              </div>
            )}

            {/* Top Indicator */}
            <div className="flex items-center justify-between text-xs text-slate-400 font-bold pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-slate-200 font-black">
                  {getTreatmentDisplayName(treatmentSystem)} · Conversational Clinical Intake
                </span>
              </div>
              <span className="text-slate-400 text-[11px]">
                {interviewState.bodyArea ? `Area: ${interviewState.bodyArea.toUpperCase()}` : "Step 1 of Adaptive Intake"}
              </span>
            </div>

            {/* Multimodal Microphone Bar (Available on every question) */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between flex-wrap gap-3 shadow-md">
              <div className="flex items-center gap-2.5">
                <button
                  onClick={toggleListening}
                  className={`p-2.5 rounded-xl font-black text-xs flex items-center gap-2 transition-all active:scale-95 cursor-pointer ${
                    isListening
                      ? "bg-red-600 text-white animate-pulse shadow-lg shadow-red-950/50"
                      : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                  }`}
                >
                  <Mic className={`w-4 h-4 ${isListening ? "text-white animate-spin" : "text-red-400"}`} />
                  <span>{isListening ? str.listening : str.speakBtn}</span>
                </button>
                <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                  {str.touchOrSpeak}
                </span>
              </div>

              {speechInterim && (
                <div className="text-xs font-semibold text-red-300 bg-red-950/40 border border-red-900/60 px-3 py-1 rounded-xl">
                  "{speechInterim}"
                </div>
              )}
            </div>

            {/* CURRENT DYNAMIC QUESTION */}
            <div className="space-y-4 text-center">
              <div className="space-y-1">
                <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                  {currentQuestion.title}
                </h2>
              </div>

              {/* Open Natural Description Input (If question is open description) */}
              {currentQuestion.type === "open_description" && (
                <div className="space-y-4 pt-2">
                  <div className="bg-slate-900 border-2 border-red-500/40 rounded-2xl p-4 shadow-inner">
                    <textarea
                      value={typedDescription}
                      onChange={(e) => setTypedDescription(e.target.value)}
                      placeholder="e.g. My right knee has been hurting for three months. It gets worse when I climb stairs."
                      className="w-full bg-transparent border-none text-white text-base sm:text-lg focus:outline-hidden resize-none min-h-[100px] placeholder:text-slate-600"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={toggleListening}
                      className={`flex-1 py-4 rounded-2xl font-black text-base flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer ${
                        isListening
                          ? "bg-red-600 text-white animate-pulse"
                          : "bg-slate-850 hover:bg-slate-800 border border-slate-700 text-slate-200"
                      }`}
                    >
                      <Mic className="w-5 h-5 text-red-400" />
                      <span>{isListening ? str.listening : "Speak into Microphone"}</span>
                    </button>

                    <button
                      onClick={() => {
                        if (typedDescription.trim()) {
                          handleAnswer({ patientNarrative: typedDescription.trim() });
                        } else {
                          handleAnswer({ patientNarrative: "General consultation" });
                        }
                      }}
                      className="py-4 px-8 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-base shadow-lg shadow-red-950/50 transition active:scale-95 flex items-center gap-2 cursor-pointer"
                    >
                      <span>{str.continueBtn}</span>
                      <ArrowRight className="w-5 h-5 stroke-[3]" />
                    </button>
                  </div>
                </div>
              )}

              {/* Dynamic Multiple Choice Options Cards (Touch + Voice) */}
              {currentQuestion.options && currentQuestion.options.length > 0 && currentQuestion.type !== "open_description" && (
                <div className={`grid gap-3 pt-2 ${
                  currentQuestion.options.length <= 3
                    ? "grid-cols-1 sm:grid-cols-3"
                    : currentQuestion.options.length <= 4
                    ? "grid-cols-1 sm:grid-cols-2"
                    : "grid-cols-2 sm:grid-cols-4"
                }`}>
                  {currentQuestion.options.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => {
                        const payload = {};
                        if (currentQuestion.type === "problem_area") {
                          payload.bodyArea = opt.id;
                        } else if (currentQuestion.type === "duration") {
                          payload.duration = opt.id;
                        } else if (currentQuestion.type === "severity") {
                          payload.severity = opt.score !== undefined ? opt.score : opt.id;
                        } else if (currentQuestion.type === "past_conditions") {
                          payload.pastConditions = [opt.id];
                        } else if (currentQuestion.type === "treatment_system_specific") {
                          payload.systemSpecific = { [currentQuestion.field]: opt.id };
                        } else if (currentQuestion.field) {
                          payload[currentQuestion.field] = opt.id;
                        } else {
                          payload.answer = opt.id;
                        }
                        handleAnswer(payload);
                      }}
                      className="p-5 rounded-2xl bg-slate-900 hover:bg-slate-850 border-2 border-slate-800 hover:border-red-500 transition-all duration-150 active:scale-95 text-left flex flex-col justify-between space-y-2 cursor-pointer shadow-lg group"
                    >
                      {opt.icon && <span className="text-3xl">{opt.icon}</span>}
                      <span className="font-bold text-sm sm:text-base text-white group-hover:text-red-400 transition-colors">
                        {opt.label}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Navigation Bottom Controls */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <button
                onClick={handleBackQuestion}
                className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 font-bold text-sm transition active:scale-95 cursor-pointer flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>{str.backBtn}</span>
              </button>

              {/* Skip or Next button for open descriptions */}
              {currentQuestion.type === "open_description" && (
                <button
                  onClick={() => handleAnswer({ patientNarrative: "General consultation" })}
                  className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold text-sm transition active:scale-95 cursor-pointer"
                >
                  <span>Skip Description ➡️</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SCREEN 5: INTERVIEW COMPLETION CONFIRMATION                               */}
        {/* ========================================================================= */}
        {screen === 5 && (
          <div className="w-full max-w-xl text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto text-4xl shadow-xl shadow-emerald-950/50">
              <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                {str.interviewCompleteTitle}
              </h2>
              <p className="text-sm text-slate-400">
                {str.interviewCompletePrompt}
              </p>
            </div>

            {/* Summary Highlights */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-left space-y-2 text-xs text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Selected Treatment:</span>
                <span className="font-bold text-emerald-400">{getTreatmentDisplayName(treatmentSystem)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Primary Area:</span>
                <span className="font-bold text-white uppercase">{interviewState.specificSite || interviewState.bodyArea || "General"}</span>
              </div>
              {interviewState.side && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Side / Laterality:</span>
                  <span className="font-bold text-white">{interviewState.side}</span>
                </div>
              )}
              {interviewState.durationText && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Duration:</span>
                  <span className="font-bold text-white">{interviewState.durationText}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-2">
              <button
                onClick={() => setScreen(6)}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-lg shadow-xl shadow-red-950/60 transition active:scale-95 flex items-center justify-center gap-3 cursor-pointer"
              >
                <span>{str.continueToDocs}</span>
              </button>

              <button
                onClick={() => {
                  setInterviewState(createInitialInterviewState(treatmentSystem, currentLanguage));
                  setInterviewHistory([]);
                  setScreen(4);
                }}
                className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 text-xs font-bold transition active:scale-95 cursor-pointer"
              >
                {str.goBackReview}
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SCREEN 6: DOCUMENT SCAN / UPLOAD & OCR (STRICTLY AFTER INTERVIEW)         */}
        {/* ========================================================================= */}
        {screen === 6 && (
          <div className="w-full max-w-2xl space-y-6 text-center animate-in fade-in duration-200">
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                {str.medDocTitle}
              </h2>
              <p className="text-sm text-slate-400">
                {str.medDocPrompt}
              </p>
            </div>

            {/* Document Action Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <button
                onClick={() => docFileInputRef.current?.click()}
                disabled={isOcrProcessing}
                className="p-6 rounded-3xl bg-slate-900 hover:bg-slate-850 border-2 border-slate-800 hover:border-red-500 transition-all duration-150 active:scale-95 text-center flex flex-col items-center justify-center space-y-3 cursor-pointer shadow-lg group"
              >
                <div className="w-14 h-14 rounded-2xl bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center text-2xl group-hover:scale-105 transition-transform">
                  <Camera className="w-7 h-7" />
                </div>
                <span className="text-lg font-black text-white">
                  {str.takeDocPhoto}
                </span>
                <span className="text-xs text-slate-400">
                  {str.uploadDoc}
                </span>
              </button>

              <button
                onClick={handleFinalSubmission}
                disabled={isSubmitting}
                className="p-6 rounded-3xl bg-slate-900 hover:bg-slate-850 border-2 border-slate-800 hover:border-emerald-500 transition-all duration-150 active:scale-95 text-center flex flex-col items-center justify-center space-y-3 cursor-pointer shadow-lg group"
              >
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-2xl group-hover:scale-105 transition-transform">
                  <ArrowRight className="w-7 h-7" />
                </div>
                <span className="text-lg font-black text-white">
                  {str.skipDoc}
                </span>
                <span className="text-xs text-slate-400">
                  Proceed directly to OPD Token
                </span>
              </button>
            </div>

            <input
              type="file"
              ref={docFileInputRef}
              onChange={handleDocFileUpload}
              accept="image/*,application/pdf"
              className="hidden"
            />

            {isOcrProcessing && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-center gap-3 animate-pulse">
                <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm font-bold text-slate-200">{ocrStatusMessage || str.docReading}</span>
              </div>
            )}

            {uploadedDocuments.length > 0 && (
              <div className="space-y-3 text-left">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-400 block">
                  Uploaded Documents ({uploadedDocuments.length})
                </span>
                {uploadedDocuments.map((doc) => (
                  <div key={doc.id} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-red-400" />
                      <div>
                        <span className="font-bold text-sm text-white block">{doc.name}</span>
                        <span className="text-xs text-slate-400">{doc.type} · Saved ✅</span>
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  onClick={handleFinalSubmission}
                  disabled={isSubmitting}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-lg shadow-xl shadow-red-950/60 transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer mt-4"
                >
                  {isSubmitting ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>{str.submitAndTokenBtn}</span>
                      <ArrowRight className="w-5 h-5 stroke-[3]" />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* SCREEN 7: FINAL OPD TOKEN SLIP                                           */}
        {/* ========================================================================= */}
        {screen === 7 && generatedToken && (
          <div className="w-full max-w-lg space-y-6 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="space-y-2">
              <span className="text-emerald-400 text-4xl block">✅</span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                {str.tokenTitle}
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                {str.tokenSub}
              </p>
            </div>

            {/* Hospital-Grade OPD Token Card */}
            <div className="bg-white text-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border-4 border-red-600 space-y-6 text-left relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-red-600 text-white text-[10px] font-black px-4 py-1 rounded-bl-xl uppercase tracking-wider">
                CONFIRMED OPD
              </div>

              <div className="border-b border-slate-200 pb-4">
                <h3 className="text-lg font-black text-slate-900">AIIMS NEW DELHI</h3>
                <p className="text-xs text-slate-500 font-semibold">National AYUSH & Integrative OPD Services</p>
              </div>

              {/* Token Number Hero Display */}
              <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 text-center">
                <span className="text-xs font-black text-red-700 uppercase tracking-widest block">
                  {str.tokenNumberLabel}
                </span>
                <span className="text-5xl sm:text-6xl font-black text-red-600 tracking-tight font-mono block mt-1">
                  {generatedToken.tokenNumber}
                </span>
              </div>

              {/* Treatment System Badge */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center">
                <span className="text-[10px] font-black text-emerald-800 uppercase tracking-wider block">
                  {str.tokenTreatmentLabel || "Treatment System"}
                </span>
                <span className="text-base font-black text-emerald-900 block mt-0.5">
                  {generatedToken.treatmentSystem === "YOGA_NATUROPATHY" ? "🧘 " : "🌿 "}
                  {getTreatmentDisplayName(generatedToken.treatmentSystem)}
                </span>
              </div>

              {/* Room & Doctor Grid */}
              <div className="grid grid-cols-2 gap-4 pt-1 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500 font-semibold block">{str.tokenRoomLabel}</span>
                  <span className="text-xl font-black text-slate-900 block mt-0.5">
                    Room {generatedToken.roomNumber}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500 font-semibold block">{str.tokenDoctorLabel}</span>
                  <span className="text-sm font-black text-slate-900 block mt-0.5 leading-snug">
                    {generatedToken.doctorName}
                  </span>
                </div>
              </div>

              {/* Notice */}
              <p className="text-[11px] text-slate-600 font-medium bg-amber-50 border border-amber-200 p-3 rounded-xl leading-relaxed">
                ℹ️ {str.tokenWaitNotice}
              </p>
            </div>

            {/* Print Slip & Finish / Next Patient */}
            <div className="space-y-3 pt-2">
              <button
                onClick={() => window.print()}
                className="w-full py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border-2 border-slate-700 text-white font-bold text-base shadow-lg transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Printer className="w-5 h-5 text-red-400" />
                <span>{str.printSlipBtn}</span>
              </button>

              <button
                onClick={handleResetKiosk}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-base shadow-xl shadow-red-950/60 transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 stroke-[3]" />
                <span>{str.nextPatientBtn}</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer Status */}
      <footer className="bg-[#0f172a] border-t border-slate-800/80 px-6 py-2.5 flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Patient Station Active · ABDM Verified</span>
        </div>
        <div>
          <span>Adaptive Conversational Clinical Engine · 5 AYUSH Systems</span>
        </div>
      </footer>
    </div>
  );
}
