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
  MicOff,
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
  HelpCircle,
  FileText,
  UploadCloud,
  FileCheck,
  CheckSquare,
  Square,
  AlertCircle
} from "lucide-react";
import { usePatient } from "../../context/PatientContext";
import LanguageSelector from "../common/LanguageSelector";
import { SUPPORTED_LANGUAGES } from "../../data/translations";
import { ADAPTIVE_SYMPTOM_TREES } from "../../data/adaptiveSymptoms";
import {
  HPI_DECISION_FRAMEWORK,
  PAST_ILLNESS_OPTIONS,
  SURGERY_OPTIONS,
  ALLERGY_CATEGORIES,
  LIFESTYLE_PARAMETERS,
  AYUSH_DASHAVIDHA_FRAMEWORK
} from "../../services/clinical/clinicalDialogueManager";
import { speechService } from "../../services/speech/speechService";
import { ocrService } from "../../services/documents/ocrService";
import { medicalExtractionService } from "../../services/documents/medicalExtractionService";

export default function AccessiblePatientKiosk() {
  const { submitKioskIntake, setPortalMode, currentLanguage, setCurrentLanguage, t } = usePatient();

  // Kiosk 12-Step Progression:
  // 1: Language Selection (8 Languages)
  // 2: Identity / ABHA & Live Webcam Photo Capture
  // 3: Multimodal Patient Consent Screen
  // 4: Medicine Stream (AYUSH / Allopathy / Integrative)
  // 5: Chief Complaint & Body Problem Map
  // 6: Voice + Touch Adaptive HPI (Onset, Radiation, Factors, Associated)
  // 7: Complete Medical & Surgical History + Meds + Allergies
  // 8: AYUSH Dashavidha Pariksha (when AYUSH chosen)
  // 9: Medical Document Scanner & OCR Extraction Preview
  // 10: 1-Touch Machine Vitals Calibration
  // 11: Pre-Submission Review & Verification Screen
  // 12: OPD Token Slip & Thermal Receipt Print
  const [step, setStep] = useState(1);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [speechTranscript, setSpeechTranscript] = useState("");

  // Patient Intake State
  const [patientName, setPatientName] = useState("");
  const [abhaNumber, setAbhaNumber] = useState("");
  const [patientPhoto, setPatientPhoto] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const [ageGroup, setAgeGroup] = useState("adult");
  const [gender, setGender] = useState("male");
  const [patientPhone, setPatientPhone] = useState("");

  // Consent
  const [consentAccepted, setConsentAccepted] = useState(true);

  // Medicine Stream
  const [medicalStream, setMedicalStream] = useState("ayush"); // 'ayush' | 'allopathic' | 'integrative'

  // Chief Complaint & Body Map
  const [selectedBodyPart, setSelectedBodyPart] = useState("chest");

  // Deep HPI State
  const [hpiCharacter, setHpiCharacter] = useState("heaviness");
  const [hpiRadiation, setHpiRadiation] = useState("left_arm_jaw");
  const [hpiAggravating, setHpiAggravating] = useState("exertion");
  const [hpiRelieving, setHpiRelieving] = useState("rest");
  const [hpiAssociated, setHpiAssociated] = useState(["cold_sweats", "breathlessness"]);
  const [duration, setDuration] = useState("fewDays");
  const [painScore, setPainScore] = useState(6);

  // Complete Medical History
  const [selectedPastIllnesses, setSelectedPastIllnesses] = useState(["htn"]);
  const [selectedSurgeries, setSelectedSurgeries] = useState(["none"]);
  const [activeMedicationsList, setActiveMedicationsList] = useState([
    { name: "Amlodipine", dosage: "5mg", frequency: "OD", source: "Patient Reported", provenance: "PATIENT_REPORTED" }
  ]);
  const [selectedAllergies, setSelectedAllergies] = useState(["none"]);
  const [lifestyleData, setLifestyleData] = useState({
    diet: "Vegetarian",
    smoking: "Never",
    alcohol: "Non-Drinker",
    activity: "Moderate"
  });

  // Extended AYUSH Dashavidha Pariksha State
  const [ayushPrakritiPrimary, setAyushPrakritiPrimary] = useState("Pitta");
  const [ayushAgni, setAyushAgni] = useState("Tikshnagni");
  const [ayushKoshtha, setAyushKoshtha] = useState("Madhyama");
  const [ayushSara, setAyushSara] = useState("Rakta Sara (Blood)");
  const [ayushSattva, setAyushSattva] = useState("Pravara Sattva");

  // Documents & OCR Extraction State
  const [uploadedDocuments, setUploadedDocuments] = useState([]);
  const [isOcrProcessing, setIsOcrProcessing] = useState(false);
  const docFileInputRef = useRef(null);

  // Machine Vitals State
  const [vitalsProgress, setVitalsProgress] = useState(0);
  const [generatedToken, setGeneratedToken] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Camera references
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // Voice speech synthesis helper
  const speakPrompt = (text) => {
    if (!audioEnabled) return;
    speechService.speakText(text, currentLanguage);
  };

  // Toggle Live Microphone Speech Recognition
  const toggleSpeechRecognition = () => {
    if (isListening) {
      speechService.stopListening();
      setIsListening(false);
    } else {
      setSpeechTranscript("");
      setIsListening(true);
      speechService.startListening({
        lang: currentLanguage,
        onResult: (transcript, isFinal) => {
          setSpeechTranscript(transcript);
          handleVoiceIntent(transcript, isFinal);
        },
        onError: (err) => {
          console.warn("ASR speech notice:", err);
          setIsListening(false);
        },
        onEnd: () => {
          setIsListening(false);
        }
      });
    }
  };

  // Conversational Intent Handler
  const handleVoiceIntent = (transcript, isFinal) => {
    const lower = transcript.toLowerCase();

    // Step 2: Name extraction if speaking in step 2
    if (step === 2 && !patientName && isFinal) {
      const cleanName = transcript.replace(/my name is|mera naam|naam|i am/gi, "").trim();
      if (cleanName) setPatientName(cleanName);
    }

    // Step 4: Stream selection
    if (step === 4) {
      if (lower.includes("ayush") || lower.includes("ayurved") || lower.includes("herbal")) setMedicalStream("ayush");
      if (lower.includes("allopath") || lower.includes("modern") || lower.includes("general")) setMedicalStream("allopathic");
      if (lower.includes("both") || lower.includes("integrative")) setMedicalStream("integrative");
    }

    // Step 5: Body parts
    if (step === 5) {
      if (lower.includes("chest") || lower.includes("chhati") || lower.includes("heart") || lower.includes("dil")) setSelectedBodyPart("chest");
      if (lower.includes("stomach") || lower.includes("pet") || lower.includes("gas") || lower.includes("acid")) setSelectedBodyPart("stomach");
      if (lower.includes("head") || lower.includes("sir") || lower.includes("aankh") || lower.includes("eye")) setSelectedBodyPart("head");
      if (lower.includes("knee") || lower.includes("ghutna") || lower.includes("leg") || lower.includes("pair")) setSelectedBodyPart("knees");
      if (lower.includes("throat") || lower.includes("gala") || lower.includes("cough") || lower.includes("khansi")) setSelectedBodyPart("throat");
      if (lower.includes("back") || lower.includes("kamar") || lower.includes("spine")) setSelectedBodyPart("back");
      if (lower.includes("skin") || lower.includes("khujli") || lower.includes("rash")) setSelectedBodyPart("skin");
    }

    // Step 6: Duration
    if (step === 6) {
      if (lower.includes("today") || lower.includes("aaj")) setDuration("today");
      if (lower.includes("2") || lower.includes("3") || lower.includes("few days")) setDuration("fewDays");
      if (lower.includes("week") || lower.includes("hafte")) setDuration("weeks");
      if (lower.includes("month") || lower.includes("mahine")) setDuration("month");
    }
  };

  // Webcam stream management on Step 2
  useEffect(() => {
    if (step === 2 && !patientPhoto) {
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
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
      setPatientPhoto(dataUrl);
      stopCamera();
      speakPrompt(t.photoCapturedNotice || "Photo Captured!");
    } else {
      setPatientPhoto("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80");
      speakPrompt(t.photoCapturedNotice || "Photo Captured!");
    }
  };

  const retakePhoto = () => {
    setPatientPhoto(null);
    startCamera();
  };

  // Document Upload & OCR Ingestion in Kiosk
  const handleDocumentUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsOcrProcessing(true);
    speakPrompt("Scanning and digitizing medical document with OCR...");

    try {
      const ocrResult = await ocrService.extractTextFromDocument(file);
      const extractions = medicalExtractionService.extractMedicalEntities(ocrResult.rawText, {
        name: file.name,
        uploadedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      });

      const newDocItem = {
        id: `kiosk-doc-${Date.now()}`,
        name: file.name,
        type: file.type?.includes("pdf") ? "pdf" : "image",
        uploadedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        rawText: ocrResult.rawText,
        extractions
      };

      setUploadedDocuments((prev) => [...prev, newDocItem]);

      // If document contains medications, add to active medication list with document provenance
      if (extractions.medications?.length > 0) {
        setActiveMedicationsList((prev) => {
          const combined = [...prev];
          extractions.medications.forEach((m) => {
            if (!combined.some((exist) => exist.name.toLowerCase() === m.name.toLowerCase())) {
              combined.push(m);
            }
          });
          return combined;
        });
      }

      speakPrompt(`Document digitized. Extracted ${extractions.medications.length} medications.`);
    } catch (err) {
      console.warn("Document OCR extraction notice:", err);
    } finally {
      setIsOcrProcessing(false);
    }
  };

  // Voice Guidance on Step Changes
  useEffect(() => {
    if (step === 1) speakPrompt(t.langPrompt);
    else if (step === 2) speakPrompt(`${t.namePrompt}. ${t.takePhotoPrompt}`);
    else if (step === 3) speakPrompt(t.consentPrompt + ". " + t.consentExplanation);
    else if (step === 4) speakPrompt("Select your preferred system of medicine: AYUSH or Allopathy.");
    else if (step === 5) speakPrompt(t.bodyPrompt);
    else if (step === 6) speakPrompt("Describe the nature and radiation of your symptoms. Speak or tap below.");
    else if (step === 7) speakPrompt("Select your past medical conditions, prior surgeries, and medications.");
    else if (step === 8) speakPrompt("AYUSH Dashavidha Pariksha constitutional evaluation.");
    else if (step === 9) speakPrompt(t.documentScanPrompt);
    else if (step === 10) speakPrompt(t.vitalsPrompt);
    else if (step === 11) speakPrompt(t.reviewStepTitle + ". Please verify your reported information.");
    else if (step === 12) speakPrompt(t.tokenTitle);
  }, [step, currentLanguage]);

  // Simulate Vitals Reading on Step 10
  useEffect(() => {
    if (step === 10) {
      setVitalsProgress(10);
      const timer1 = setTimeout(() => setVitalsProgress(45), 800);
      const timer2 = setTimeout(() => setVitalsProgress(80), 1600);
      const timer3 = setTimeout(() => {
        setVitalsProgress(100);
        setStep(11); // Move to Pre-submission Review screen!
      }, 2400);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }
  }, [step]);

  // Final Submission to Firebase
  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    const bodyInfo = t.bodyParts[selectedBodyPart] || t.bodyParts.chest;
    const tokenNum = `A-${Math.floor(100 + Math.random() * 900)}`;
    const finalPatientName = patientName.trim() || (patientPhone ? `Patient (${patientPhone.slice(-4)})` : "Walk-in OPD Patient");

    const documentExtractions = uploadedDocuments.map((doc) => doc.extractions);

    const intakePayload = {
      name: finalPatientName,
      phone: patientPhone || "N/A",
      language: currentLanguage,
      medicalStream,
      photo: patientPhoto || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
      ageGroup,
      gender,
      consent: {
        accepted: consentAccepted,
        timestamp: new Date().toISOString(),
        version: "v1.2",
        purpose: "Clinical OPD Consultation & Medical Document Digitization"
      },
      chiefComplaint: bodyInfo.label,
      complaintCategory: selectedBodyPart,
      duration,
      hpi: {
        character: hpiCharacter,
        radiation: hpiRadiation,
        aggravating: hpiAggravating,
        relieving: hpiRelieving,
        associatedSymptoms: hpiAssociated
      },
      pastHistory: selectedPastIllnesses.map((id) => PAST_ILLNESS_OPTIONS.find((p) => p.id === id)?.label || id),
      surgicalHistory: selectedSurgeries.map((id) => SURGERY_OPTIONS.find((s) => s.id === id)?.label || id),
      medications: activeMedicationsList,
      allergies: selectedAllergies.map((id) => ALLERGY_CATEGORIES.find((a) => a.id === id)?.label || id),
      familyHistory: [{ relation: "Family", condition: "Non-contributory" }],
      lifestyle: lifestyleData,
      ayush: {
        prakriti: { primary: ayushPrakritiPrimary },
        vikriti: { imbalanceSeverity: "Moderate", subdosha: "Samana Vata & Pachaka Pitta" },
        agniStatus: { type: ayushAgni },
        koshtha: { type: ayushKoshtha },
        sara: { type: ayushSara },
        sattva: { type: ayushSattva }
      },
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
      documents: uploadedDocuments,
      documentExtractions,
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
      hpi: intakePayload.hpi,
      photo: intakePayload.photo,
      ageGroup,
      gender,
      duration,
      vitals: intakePayload.vitals,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    });

    setIsSubmitting(false);
    setStep(12); // Token Slip Screen
  };

  const activeHpiFramework = HPI_DECISION_FRAMEWORK[selectedBodyPart] || HPI_DECISION_FRAMEWORK.generic;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-[#180808] to-slate-950 text-white flex flex-col justify-between p-3 sm:p-5 font-sans select-none">
      
      {/* Hidden Canvas for Camera Snapshots */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Top Header Bar */}
      <header className="max-w-5xl w-full mx-auto flex items-center justify-between py-2.5 border-b border-red-900/40">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-red-600 to-rose-600 text-white flex items-center justify-center font-black shadow-lg shadow-red-600/30">
            <Plus className="w-7 h-7 stroke-[3.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-black text-lg sm:text-xl tracking-tight text-white">{t.kioskTitle}</h1>
              <span className="px-2 py-0.5 rounded-full bg-red-500/20 border border-red-400/40 text-[10px] font-extrabold text-red-300">
                K-03 · Voice + Touch Dual Mode
              </span>
            </div>
            <p className="text-xs text-red-200/80 hidden sm:block">
              {t.kioskSubtitle}
            </p>
          </div>
        </div>

        {/* Right Action Bar: Microphone ASR, Audio TTS & Language Switcher */}
        <div className="flex items-center gap-2">
          {/* Live Microphone Voice Input Button */}
          <button
            type="button"
            onClick={toggleSpeechRecognition}
            className={`p-2 sm:px-3 sm:py-2 rounded-xl border transition flex items-center gap-1.5 text-xs font-bold cursor-pointer active:scale-95 ${
              isListening
                ? "bg-red-600 text-white border-white animate-pulse shadow-lg shadow-red-600/50"
                : "bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700"
            }`}
            title="Speech Recognition (ASR)"
          >
            {isListening ? <Mic className="w-4 h-4 text-white" /> : <MicOff className="w-4 h-4 text-slate-400" />}
            <span className="hidden sm:inline">{isListening ? "Listening..." : "Speak"}</span>
          </button>

          {/* Voice Prompt Toggle */}
          <button
            type="button"
            onClick={() => setAudioEnabled(!audioEnabled)}
            className={`p-2 sm:px-3 sm:py-2 rounded-xl border transition flex items-center gap-1.5 text-xs font-bold cursor-pointer ${
              audioEnabled ? "bg-red-600/30 text-red-300 border-red-500" : "bg-slate-800 text-slate-500 border-slate-700"
            }`}
            title="Text-to-Speech Voice"
          >
            {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Language Selector */}
          <LanguageSelector variant="dark" />

          {/* Reset */}
          <button
            type="button"
            onClick={() => {
              setStep(1);
              setPatientName("");
              setPatientPhoto(null);
              setUploadedDocuments([]);
            }}
            className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-300"
            title="Restart Intake"
          >
            <RotateCcw className="w-4 h-4 text-red-400" />
          </button>
        </div>
      </header>

      {/* Real-time Voice Transcript Floating Banner */}
      {isListening && (
        <div className="max-w-5xl w-full mx-auto my-1.5 bg-gradient-to-r from-red-950 to-slate-900 border border-red-500/60 rounded-xl p-2.5 flex items-center justify-between text-xs text-red-200 shadow-md">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span><strong>Voice Recognized:</strong> {speechTranscript || "Listening... Speak your symptoms now"}</span>
          </div>
          <span className="text-[10px] bg-red-900/60 px-2 py-0.5 rounded text-red-300 font-mono">ASR Live</span>
        </div>
      )}

      {/* Step Progress Visual Bar (12 Steps) */}
      <div className="max-w-5xl w-full mx-auto py-1.5">
        <div className="grid grid-cols-6 sm:grid-cols-12 gap-1 text-center text-[9px] font-bold">
          {[
            { s: 1, label: "1. Lang" },
            { s: 2, label: "2. ID" },
            { s: 3, label: "3. Consent" },
            { s: 4, label: "4. Stream" },
            { s: 5, label: "5. Body" },
            { s: 6, label: "6. HPI" },
            { s: 7, label: "7. History" },
            { s: 8, label: "8. AYUSH" },
            { s: 9, label: "9. OCR" },
            { s: 10, label: "10. Vitals" },
            { s: 11, label: "11. Review" },
            { s: 12, label: "12. Slip" }
          ].map((item) => (
            <div
              key={item.s}
              onClick={() => {
                if (item.s < step) setStep(item.s);
              }}
              className={`py-1.5 px-0.5 rounded-lg border transition-all truncate ${
                step === item.s
                  ? "bg-red-600 text-white border-red-400 font-black shadow-sm scale-102"
                  : step > item.s
                  ? "bg-slate-800/80 text-red-300 border-red-900/50 cursor-pointer"
                  : "bg-slate-900/40 text-slate-600 border-slate-800"
              }`}
            >
              {item.label}
            </div>
          ))}
        </div>
      </div>

      {/* Main Interactive Stage */}
      <main className="max-w-5xl w-full mx-auto flex-1 flex flex-col justify-center py-2 sm:py-3">
        
        {/* ========================================================================= */}
        {/* STEP 1: CHOOSE REGIONAL LANGUAGE */}
        {/* ========================================================================= */}
        {step === 1 && (
          <div className="space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="text-center space-y-1">
              <span className="px-3 py-0.5 rounded-full bg-red-600/20 border border-red-500/40 text-red-300 text-xs font-bold">
                Step 1 of 12 · Language
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">{t.langPrompt}</h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 max-w-3xl mx-auto">
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
                    className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer active:scale-95 shadow-md ${
                      isSelected
                        ? "bg-gradient-to-br from-red-600 to-rose-700 text-white border-white scale-105 shadow-red-600/40"
                        : "bg-slate-800/90 hover:bg-slate-800 text-slate-200 border-slate-700"
                    }`}
                  >
                    <span className="text-3xl">{lang.flag}</span>
                    <span className="font-black text-base">{lang.nativeName}</span>
                    <span className="text-xs text-red-200">{lang.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: IDENTITY / ABHA + PHOTO CAPTURE */}
        {/* ========================================================================= */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-150 max-w-4xl mx-auto w-full">
            <div className="text-center space-y-0.5">
              <span className="px-3 py-0.5 rounded-full bg-red-600/20 border border-red-500/40 text-red-300 text-xs font-bold">
                Step 2 of 12 · Patient Identification
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white">{t.idPrompt}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              {/* Webcam Video Viewfinder */}
              <div className="bg-slate-800/90 border-2 border-red-500/40 rounded-3xl p-3.5 flex flex-col items-center justify-center gap-2.5 shadow-xl">
                <div className="relative w-full max-w-[280px] aspect-4/3 rounded-2xl overflow-hidden bg-slate-950 border-2 border-red-500/60 shadow-inner flex items-center justify-center">
                  {!patientPhoto ? (
                    <>
                      <video ref={videoRef} playsInline muted autoPlay className="w-full h-full object-cover transform -scale-x-100" />
                      <div className="absolute inset-3 border-2 border-dashed border-red-400/70 rounded-[50%] pointer-events-none flex items-center justify-center">
                        <span className="text-[9px] font-bold bg-red-950/80 px-2 py-0.5 rounded text-red-300">Align Face</span>
                      </div>
                    </>
                  ) : (
                    <img src={patientPhoto} alt="Patient Face" className="w-full h-full object-cover rounded-2xl" />
                  )}
                </div>

                {!patientPhoto ? (
                  <button
                    type="button"
                    onClick={takePhotoSnapshot}
                    className="w-full max-w-[280px] py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white font-black rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer text-xs active:scale-95"
                  >
                    <Camera className="w-4 h-4" />
                    <span>{t.snapPhotoBtn}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={retakePhoto}
                    className="w-full max-w-[280px] py-2.5 bg-slate-700 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer text-xs"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-red-400" />
                    <span>{t.retakePhotoBtn}</span>
                  </button>
                )}
              </div>

              {/* Demographics & ABHA */}
              <div className="space-y-3 bg-white text-slate-900 border border-slate-200 rounded-3xl p-4 shadow-xl">
                <div>
                  <label className="block text-xs font-black text-slate-800 uppercase mb-1">1. Patient Full Name</label>
                  <input
                    type="text"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="Enter patient full name"
                    className="w-full px-3 py-2 bg-slate-50 border-2 border-slate-300 focus:border-red-600 rounded-xl text-xs font-bold text-slate-900 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-800 uppercase mb-1">2. ABHA Health ID (Optional)</label>
                  <input
                    type="text"
                    value={abhaNumber}
                    onChange={(e) => setAbhaNumber(e.target.value)}
                    placeholder="91-XXXX-XXXX-1234 or name@abdm"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 focus:border-red-600 rounded-xl text-xs font-bold text-slate-900 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-black text-slate-700 uppercase mb-1">Age Group</label>
                    <select
                      value={ageGroup}
                      onChange={(e) => setAgeGroup(e.target.value)}
                      className="w-full px-2 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold"
                    >
                      <option value="child">Child (0-12)</option>
                      <option value="youth">Youth (13-25)</option>
                      <option value="adult">Adult (26-59)</option>
                      <option value="senior">Senior (60+)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-700 uppercase mb-1">Gender</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full px-2 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button type="button" onClick={() => setStep(1)} className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs flex items-center gap-1.5">
                <ChevronLeft className="w-4 h-4" />
                <span>{t.backBtn}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!patientPhoto) takePhotoSnapshot();
                  setStep(3);
                }}
                className="px-7 py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-black text-sm flex items-center gap-2 shadow-lg"
              >
                <span>{t.nextBtn}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: MULTIMODAL PATIENT CONSENT SCREEN */}
        {/* ========================================================================= */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-150 max-w-3xl mx-auto w-full">
            <div className="text-center space-y-1">
              <span className="px-3 py-0.5 rounded-full bg-red-600/20 border border-red-500/40 text-red-300 text-xs font-bold">
                Step 3 of 12 · Patient Consent
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white">{t.consentPrompt}</h2>
            </div>

            <div className="bg-white text-slate-900 border-2 border-red-200 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-8 h-8 text-red-600 shrink-0" />
                <div>
                  <h3 className="font-black text-sm sm:text-base text-slate-900">Digital Health Intake & OCR Processing Authorization</h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{t.consentExplanation}</p>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-700 font-semibold">
                {(t.consentPoints || [
                  "Information is strictly used for clinical care during this hospital visit",
                  "Prior prescriptions & lab reports will be digitized via OCR for physician review",
                  "You may speak in your regional language or tap the screen at any time"
                ]).map((pt, i) => (
                  <div key={i} className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{pt}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400">
                <span>Version: <strong>v1.2 (National Health Standards)</strong></span>
                <span>Timestamp: <strong>{new Date().toLocaleDateString()}</strong></span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setPortalMode("login")}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 font-bold text-xs"
              >
                {t.consentDecline}
              </button>

              <button
                type="button"
                onClick={() => {
                  setConsentAccepted(true);
                  setStep(4);
                }}
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-black text-sm flex items-center gap-2 shadow-xl shadow-red-600/30 active:scale-95 cursor-pointer"
              >
                <Check className="w-5 h-5 stroke-[3]" />
                <span>{t.consentAccept}</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 4: MEDICINE STREAM (AYUSH / ALLOPATHY / INTEGRATIVE) */}
        {/* ========================================================================= */}
        {step === 4 && (
          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-150 max-w-4xl mx-auto w-full">
            <div className="text-center space-y-0.5">
              <span className="px-3 py-0.5 rounded-full bg-red-600/20 border border-red-500/40 text-red-300 text-xs font-bold">
                Step 4 of 12 · Medicine System
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white">Choose System of Medicine</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <button
                type="button"
                onClick={() => {
                  setMedicalStream("ayush");
                  setStep(5);
                }}
                className={`p-5 rounded-3xl border-3 transition-all flex flex-col items-center justify-between text-center gap-3 cursor-pointer ${
                  medicalStream === "ayush"
                    ? "bg-gradient-to-br from-amber-600 to-orange-700 text-white border-white scale-105 shadow-xl ring-4 ring-amber-400/30"
                    : "bg-white text-slate-900 border-slate-200"
                }`}
              >
                <span className="text-4xl">🌿</span>
                <div>
                  <h3 className="font-black text-base">AYUSH / Ayurveda</h3>
                  <p className="text-[11px] mt-1 opacity-90">Prakriti, Agni & Herbal Formulations</p>
                </div>
                <span className="px-3 py-0.5 rounded-full text-[10px] font-bold bg-white/20">AIIMS Room 4</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMedicalStream("allopathic");
                  setStep(5);
                }}
                className={`p-5 rounded-3xl border-3 transition-all flex flex-col items-center justify-between text-center gap-3 cursor-pointer ${
                  medicalStream === "allopathic"
                    ? "bg-gradient-to-br from-red-600 to-rose-700 text-white border-white scale-105 shadow-xl ring-4 ring-red-400/30"
                    : "bg-white text-slate-900 border-slate-200"
                }`}
              >
                <span className="text-4xl">💊</span>
                <div>
                  <h3 className="font-black text-base">Allopathy</h3>
                  <p className="text-[11px] mt-1 opacity-90">Modern clinical medicine & diagnostics</p>
                </div>
                <span className="px-3 py-0.5 rounded-full text-[10px] font-bold bg-white/20">General OPD Room 2</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMedicalStream("integrative");
                  setStep(5);
                }}
                className={`p-5 rounded-3xl border-3 transition-all flex flex-col items-center justify-between text-center gap-3 cursor-pointer ${
                  medicalStream === "integrative"
                    ? "bg-gradient-to-br from-emerald-600 to-teal-700 text-white border-white scale-105 shadow-xl ring-4 ring-emerald-400/30"
                    : "bg-white text-slate-900 border-slate-200"
                }`}
              >
                <span className="text-4xl">🔄</span>
                <div>
                  <h3 className="font-black text-base">Integrative (Both)</h3>
                  <p className="text-[11px] mt-1 opacity-90">Combined Modern Medicine & AYUSH</p>
                </div>
                <span className="px-3 py-0.5 rounded-full text-[10px] font-bold bg-white/20">Combined Care</span>
              </button>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button type="button" onClick={() => setStep(3)} className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs flex items-center gap-1.5">
                <ChevronLeft className="w-4 h-4" />
                <span>{t.backBtn}</span>
              </button>
              <button type="button" onClick={() => setStep(5)} className="px-7 py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-black text-sm flex items-center gap-2">
                <span>{t.nextBtn}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 5: VISUAL BODY MAP (CHIEF COMPLAINT LOCATION) */}
        {/* ========================================================================= */}
        {step === 5 && (
          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-150 max-w-4xl mx-auto w-full">
            <div className="text-center space-y-0.5">
              <span className="px-3 py-0.5 rounded-full bg-red-600/20 border border-red-500/40 text-red-300 text-xs font-bold">
                Step 5 of 12 · Primary Complaint
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white">{t.bodyPrompt}</h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto">
              {Object.keys(t.bodyParts || {}).map((key) => {
                const part = t.bodyParts[key];
                const isSelected = selectedBodyPart === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setSelectedBodyPart(key);
                      speakPrompt(part.label);
                    }}
                    className={`p-3.5 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-1 text-center cursor-pointer active:scale-95 shadow-md ${
                      isSelected
                        ? "bg-gradient-to-br from-red-600 to-rose-700 text-white border-white scale-105 shadow-red-600/40 ring-4 ring-red-400/30"
                        : "bg-white text-slate-900 border-slate-200"
                    }`}
                  >
                    <span className="text-3xl">{part.icon}</span>
                    <div className="font-black text-xs sm:text-sm">{part.label}</div>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-2">
              <button type="button" onClick={() => setStep(4)} className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs flex items-center gap-1.5">
                <ChevronLeft className="w-4 h-4" />
                <span>{t.backBtn}</span>
              </button>
              <button type="button" onClick={() => setStep(6)} className="px-7 py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-black text-sm flex items-center gap-2 shadow-lg">
                <span>{t.nextBtn}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 6: VOICE + TOUCH ADAPTIVE HPI (CHARACTER, RADIATION, FACTORS) */}
        {/* ========================================================================= */}
        {step === 6 && (
          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-150 max-w-4xl mx-auto w-full">
            <div className="text-center space-y-0.5">
              <span className="px-3 py-0.5 rounded-full bg-red-600/20 border border-red-500/40 text-red-300 text-xs font-bold">
                Step 6 of 12 · Adaptive Clinical HPI
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white">{activeHpiFramework.title}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 bg-white text-slate-900 border-2 border-red-200 rounded-3xl p-5 shadow-xl text-xs">
              {/* Character of Sensation */}
              <div>
                <label className="block font-black text-slate-800 uppercase mb-1.5">1. Sensation / Character</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {activeHpiFramework.characterOptions.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setHpiCharacter(opt.id)}
                      className={`p-2.5 rounded-xl border-2 font-bold text-left flex items-center gap-2 cursor-pointer ${
                        hpiCharacter === opt.id ? "bg-red-600 text-white border-red-600 shadow-xs" : "bg-slate-50 border-slate-200 text-slate-800"
                      }`}
                    >
                      <span>{opt.icon}</span>
                      <span className="truncate">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Radiation */}
              <div>
                <label className="block font-black text-slate-800 uppercase mb-1.5">2. Radiation / Spread</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {activeHpiFramework.radiationOptions.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setHpiRadiation(opt.id)}
                      className={`p-2.5 rounded-xl border-2 font-bold text-left flex items-center gap-2 cursor-pointer ${
                        hpiRadiation === opt.id ? "bg-red-600 text-white border-red-600 shadow-xs" : "bg-slate-50 border-slate-200 text-slate-800"
                      }`}
                    >
                      <span>{opt.icon}</span>
                      <span className="truncate">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Aggravating & Relieving Factors */}
              <div>
                <label className="block font-black text-slate-800 uppercase mb-1.5">3. Worsened By</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {activeHpiFramework.aggravatingOptions.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setHpiAggravating(opt.id)}
                      className={`p-2.5 rounded-xl border-2 font-bold text-left flex items-center gap-2 cursor-pointer ${
                        hpiAggravating === opt.id ? "bg-red-600 text-white border-red-600 shadow-xs" : "bg-slate-50 border-slate-200 text-slate-800"
                      }`}
                    >
                      <span>{opt.icon}</span>
                      <span className="truncate">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration & Pain Score */}
              <div className="space-y-2">
                <div>
                  <label className="block font-black text-slate-800 uppercase mb-1">4. Duration</label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  >
                    <option value="today">Today (1 Day)</option>
                    <option value="fewDays">2 - 3 Days</option>
                    <option value="weeks">1 - 2 Weeks</option>
                    <option value="month">More than 1 Month</option>
                  </select>
                </div>

                <div>
                  <label className="block font-black text-slate-800 uppercase mb-1">5. Pain Severity (FACES Score: {painScore}/10)</label>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="2"
                    value={painScore}
                    onChange={(e) => setPainScore(parseInt(e.target.value, 10))}
                    className="w-full accent-red-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-bold">
                    <span>😊 0 (None)</span>
                    <span>😐 4 (Moderate)</span>
                    <span>😣 8 (Severe)</span>
                    <span>😭 10 (Worst)</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button type="button" onClick={() => setStep(5)} className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs flex items-center gap-1.5">
                <ChevronLeft className="w-4 h-4" />
                <span>{t.backBtn}</span>
              </button>
              <button type="button" onClick={() => setStep(7)} className="px-7 py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-black text-sm flex items-center gap-2 shadow-lg">
                <span>{t.nextBtn}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 7: COMPLETE MEDICAL & SURGICAL HISTORY + MEDS + ALLERGIES */}
        {/* ========================================================================= */}
        {step === 7 && (
          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-150 max-w-4xl mx-auto w-full">
            <div className="text-center space-y-0.5">
              <span className="px-3 py-0.5 rounded-full bg-red-600/20 border border-red-500/40 text-red-300 text-xs font-bold">
                Step 7 of 12 · Complete Medical History
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white">Past Illnesses, Surgeries & Medications</h2>
            </div>

            <div className="bg-white text-slate-900 border-2 border-red-200 rounded-3xl p-5 shadow-xl space-y-4 text-xs">
              {/* Past Medical Illnesses */}
              <div>
                <label className="block font-black text-slate-800 uppercase mb-1.5">1. Pre-existing Conditions (Tap to select)</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {PAST_ILLNESS_OPTIONS.map((ill) => {
                    const isChecked = selectedPastIllnesses.includes(ill.id);
                    return (
                      <button
                        key={ill.id}
                        type="button"
                        onClick={() => {
                          setSelectedPastIllnesses((prev) =>
                            prev.includes(ill.id) ? prev.filter((i) => i !== ill.id) : [...prev, ill.id]
                          );
                        }}
                        className={`p-2 rounded-xl border-2 font-bold text-left flex items-center justify-between gap-1.5 cursor-pointer ${
                          isChecked ? "bg-red-600 text-white border-red-600" : "bg-slate-50 border-slate-200 text-slate-800"
                        }`}
                      >
                        <span className="truncate">{ill.label}</span>
                        {isChecked && <Check className="w-3.5 h-3.5 shrink-0 text-white" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Surgical History & Drug Allergies */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div>
                  <label className="block font-black text-slate-800 uppercase mb-1">2. Prior Surgeries</label>
                  <select
                    onChange={(e) => setSelectedSurgeries([e.target.value])}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  >
                    {SURGERY_OPTIONS.map((surg) => (
                      <option key={surg.id} value={surg.id}>{surg.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-black text-slate-800 uppercase mb-1">3. Drug Allergies</label>
                  <select
                    onChange={(e) => setSelectedAllergies([e.target.value])}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  >
                    {ALLERGY_CATEGORIES.map((allg) => (
                      <option key={allg.id} value={allg.id}>{allg.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Active Medications Display with Provenance */}
              <div className="pt-2 border-t border-slate-100">
                <label className="block font-black text-slate-800 uppercase mb-1 flex items-center justify-between">
                  <span>4. Active Medications</span>
                  <span className="text-[10px] text-red-600 font-bold">Data Provenance Tracked</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {activeMedicationsList.map((m, idx) => (
                    <div key={idx} className="px-3 py-1.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs">
                      <Pill className="w-3.5 h-3.5 text-red-600" />
                      <strong className="text-slate-900">{m.name} ({m.dosage})</strong>
                      <span className="text-[10px] text-slate-500 font-normal">· {m.source}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button type="button" onClick={() => setStep(6)} className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs flex items-center gap-1.5">
                <ChevronLeft className="w-4 h-4" />
                <span>{t.backBtn}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (medicalStream === "ayush") setStep(8);
                  else setStep(9); // Skip AYUSH step if Allopathic
                }}
                className="px-7 py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-black text-sm flex items-center gap-2 shadow-lg"
              >
                <span>{t.nextBtn}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 8: EXTENDED AYUSH DASHAVIDHA PARIKSHA (WHEN AYUSH CHOSEN) */}
        {/* ========================================================================= */}
        {step === 8 && (
          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-150 max-w-4xl mx-auto w-full">
            <div className="text-center space-y-0.5">
              <span className="px-3 py-0.5 rounded-full bg-amber-600/20 border border-amber-500/40 text-amber-300 text-xs font-bold">
                Step 8 of 12 · AYUSH Dashavidha Pariksha
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white">Ayurvedic Assessment (दशविध परीक्षा)</h2>
            </div>

            <div className="bg-white text-slate-900 border-2 border-amber-200 rounded-3xl p-5 shadow-xl space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. Prakriti Primary */}
                <div>
                  <label className="block font-black text-amber-900 uppercase mb-1">1. Prakriti (Primary Dosha)</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {["Vata (Air)", "Pitta (Fire)", "Kapha (Water)"].map((p) => {
                      const val = p.split(" ")[0];
                      const isSel = ayushPrakritiPrimary === val;
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setAyushPrakritiPrimary(val)}
                          className={`p-2 rounded-xl border-2 font-bold text-xs cursor-pointer ${
                            isSel ? "bg-amber-600 text-white border-amber-600" : "bg-slate-50 border-slate-200 text-slate-800"
                          }`}
                        >
                          {p}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Agni Status */}
                <div>
                  <label className="block font-black text-amber-900 uppercase mb-1">2. Agni Status (Digestive Fire)</label>
                  <select
                    value={ayushAgni}
                    onChange={(e) => setAyushAgni(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  >
                    <option value="Samagni">Samagni (Balanced Digestion)</option>
                    <option value="Tikshnagni">Tikshnagni (Hyperactive / Acidic)</option>
                    <option value="Mandagni">Mandagni (Slow / Sluggish)</option>
                    <option value="Vishamagni">Vishamagni (Irregular / Variable)</option>
                  </select>
                </div>

                {/* 3. Koshtha & Bowel Habit */}
                <div>
                  <label className="block font-black text-amber-900 uppercase mb-1">3. Koshtha (Bowel Pattern)</label>
                  <select
                    value={ayushKoshtha}
                    onChange={(e) => setAyushKoshtha(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  >
                    <option value="Madhyama">Madhyama Koshtha (Regular)</option>
                    <option value="Krura">Krura Koshtha (Constipated / Hard)</option>
                    <option value="Mridu">Mridu Koshtha (Loose / Sensitive)</option>
                  </select>
                </div>

                {/* 4. Sara (Tissue Essence) */}
                <div>
                  <label className="block font-black text-amber-900 uppercase mb-1">4. Sara (Tissue Essence)</label>
                  <select
                    value={ayushSara}
                    onChange={(e) => setAyushSara(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  >
                    {AYUSH_DASHAVIDHA_FRAMEWORK.sara.options.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button type="button" onClick={() => setStep(7)} className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs flex items-center gap-1.5">
                <ChevronLeft className="w-4 h-4" />
                <span>{t.backBtn}</span>
              </button>
              <button type="button" onClick={() => setStep(9)} className="px-7 py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-black text-sm flex items-center gap-2 shadow-lg">
                <span>{t.nextBtn}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 9: MEDICAL DOCUMENT SCANNER & OCR EXTRACTION */}
        {/* ========================================================================= */}
        {step === 9 && (
          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-150 max-w-3xl mx-auto w-full">
            <div className="text-center space-y-0.5">
              <span className="px-3 py-0.5 rounded-full bg-red-600/20 border border-red-500/40 text-red-300 text-xs font-bold">
                Step 9 of 12 · Document OCR Digitization
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white">{t.documentScanPrompt}</h2>
              <p className="text-xs text-slate-400">{t.documentScanSub}</p>
            </div>

            <div className="bg-white text-slate-900 border-2 border-red-200 rounded-3xl p-5 shadow-xl space-y-4">
              <input
                type="file"
                ref={docFileInputRef}
                onChange={handleDocumentUpload}
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png"
              />

              {/* Upload Dropzone Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled={isOcrProcessing}
                  onClick={() => docFileInputRef.current?.click()}
                  className="p-5 border-2 border-dashed border-red-400 hover:bg-red-50/50 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer transition text-center"
                >
                  <Camera className="w-8 h-8 text-red-600" />
                  <span className="font-black text-xs text-slate-900">{t.takeDocPhotoBtn}</span>
                  <span className="text-[10px] text-slate-400">Capture prescription with camera</span>
                </button>

                <button
                  type="button"
                  disabled={isOcrProcessing}
                  onClick={() => docFileInputRef.current?.click()}
                  className="p-5 border-2 border-dashed border-slate-300 hover:bg-slate-50 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer transition text-center"
                >
                  <UploadCloud className="w-8 h-8 text-slate-600" />
                  <span className="font-black text-xs text-slate-900">{t.uploadDocBtn}</span>
                  <span className="text-[10px] text-slate-400">PDF, JPG, PNG lab reports</span>
                </button>
              </div>

              {/* OCR Processing Status */}
              {isOcrProcessing && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center justify-center gap-3 text-xs text-red-700 font-bold animate-pulse">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processing Document via OCR & Extracting Medical Entities...</span>
                </div>
              )}

              {/* Uploaded Documents & Extracted Entities Preview */}
              {uploadedDocuments.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                  <h4 className="font-black text-slate-800">Digitized Documents ({uploadedDocuments.length})</h4>
                  {uploadedDocuments.map((doc) => (
                    <div key={doc.id} className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <strong className="text-slate-900 font-bold">{doc.name}</strong>
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">
                          OCR Success
                        </span>
                      </div>
                      {doc.extractions?.medications?.length > 0 && (
                        <div className="text-[11px] text-slate-600">
                          <strong>Extracted Meds:</strong> {doc.extractions.medications.map((m) => `${m.name} ${m.dosage}`).join(", ")}
                        </div>
                      )}
                      {doc.extractions?.abnormalFindings?.length > 0 && (
                        <div className="text-[11px] text-red-700 font-bold">
                          ⚠️ Potential Abnormality: {doc.extractions.abnormalFindings.map((a) => `${a.testName} (${a.value})`).join(", ")}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => {
                  if (medicalStream === "ayush") setStep(8);
                  else setStep(7);
                }}
                className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs flex items-center gap-1.5"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>{t.backBtn}</span>
              </button>

              <button
                type="button"
                onClick={() => setStep(10)}
                className="px-7 py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-black text-sm flex items-center gap-2 shadow-lg"
              >
                <span>{uploadedDocuments.length === 0 ? t.skipDocBtn : t.nextBtn}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 10: 1-TOUCH MACHINE VITALS SCAN */}
        {/* ========================================================================= */}
        {step === 10 && (
          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-150 max-w-2xl mx-auto w-full text-center">
            <div className="space-y-0.5">
              <span className="px-3 py-0.5 rounded-full bg-red-600/20 border border-red-500/40 text-red-300 text-xs font-bold">
                Step 10 of 12 · Sensor Calibration
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white">{t.vitalsPrompt}</h2>
            </div>

            <div className="bg-white text-slate-900 border-2 border-red-200 rounded-3xl p-6 shadow-2xl space-y-5">
              <div className="w-20 h-20 rounded-full bg-red-50 border-2 border-red-200 text-red-600 flex items-center justify-center mx-auto shadow-md animate-pulse">
                <HeartPulse className="w-10 h-10" />
              </div>

              <div className="space-y-1.5">
                <div className="text-base font-black text-slate-900">
                  {vitalsProgress < 100 ? t.vitalsCalibrating : t.vitalsComplete}
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden border border-slate-200">
                  <div
                    className="bg-gradient-to-r from-red-600 to-rose-600 h-3.5 rounded-full transition-all duration-500"
                    style={{ width: `${vitalsProgress}%` }}
                  />
                </div>
                <div className="text-xs font-bold text-red-700">{vitalsProgress}% Complete</div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                <div className="p-2.5 bg-red-50/60 rounded-xl border border-red-100 text-center">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">{t.bpLabel}</span>
                  <span className="text-sm font-black text-red-700">{vitalsProgress >= 45 ? "128/84" : "--/--"}</span>
                </div>
                <div className="p-2.5 bg-red-50/60 rounded-xl border border-red-100 text-center">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">{t.pulseLabel}</span>
                  <span className="text-sm font-black text-red-700">{vitalsProgress >= 60 ? "78 bpm" : "--"}</span>
                </div>
                <div className="p-2.5 bg-red-50/60 rounded-xl border border-red-100 text-center">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">{t.spo2Label}</span>
                  <span className="text-sm font-black text-red-700">{vitalsProgress >= 80 ? "98%" : "--"}</span>
                </div>
                <div className="p-2.5 bg-red-50/60 rounded-xl border border-red-100 text-center">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">{t.tempLabel}</span>
                  <span className="text-sm font-black text-red-700">{vitalsProgress >= 90 ? "98.4 °F" : "--"}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 11: PRE-SUBMISSION REVIEW & CONFIRMATION SCREEN */}
        {/* ========================================================================= */}
        {step === 11 && (
          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-150 max-w-3xl mx-auto w-full">
            <div className="text-center space-y-0.5">
              <span className="px-3 py-0.5 rounded-full bg-red-600/20 border border-red-500/40 text-red-300 text-xs font-bold">
                Step 11 of 12 · Patient Verification
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white">{t.reviewStepTitle}</h2>
              <p className="text-xs text-slate-400">{t.reviewStepSub}</p>
            </div>

            <div className="bg-white text-slate-900 border-2 border-red-200 rounded-3xl p-5 shadow-2xl space-y-3.5 text-xs">
              {/* Patient Banner */}
              <div className="flex items-center gap-3 bg-red-50 p-3 rounded-2xl border border-red-200">
                <img
                  src={patientPhoto || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"}
                  alt="Patient"
                  className="w-12 h-12 rounded-xl object-cover border-2 border-red-500"
                />
                <div>
                  <strong className="text-sm font-black text-slate-900 block">{patientName || "Walk-in Patient"}</strong>
                  <span className="text-[11px] text-slate-600">{gender} · {ageGroup} · {medicalStream.toUpperCase()} OPD</span>
                </div>
              </div>

              {/* Summary Items */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500 font-semibold block text-[10px]">Chief Complaint:</span>
                  <strong className="text-slate-900">{t.bodyParts[selectedBodyPart]?.label} ({duration})</strong>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500 font-semibold block text-[10px]">Pain Severity:</span>
                  <strong className="text-red-700">{painScore}/10 (Wong-Baker Scale)</strong>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500 font-semibold block text-[10px]">Active Medications:</span>
                  <strong className="text-slate-900">{activeMedicationsList.map((m) => m.name).join(", ") || "None"}</strong>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500 font-semibold block text-[10px]">Calibrated Vitals:</span>
                  <strong className="text-slate-900">BP: 128/84 | SpO2: 98%</strong>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep(6)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
              >
                {t.editInfoBtn}
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleFinalSubmit}
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-black text-sm flex items-center gap-2 shadow-xl shadow-red-600/30 active:scale-95 cursor-pointer"
              >
                <Check className="w-5 h-5 stroke-[3]" />
                <span>{isSubmitting ? "Submitting..." : t.confirmSubmitBtn}</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 12: PRINT OPD TOKEN TICKET */}
        {/* ========================================================================= */}
        {step === 12 && generatedToken && (
          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-150 max-w-lg mx-auto w-full">
            <div className="text-center space-y-0.5">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-600 to-rose-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-red-600/30">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-black text-white">{t.tokenTitle}</h2>
              <p className="text-xs text-red-200/80">{t.tokenSubtitle}</p>
            </div>

            {/* Printable OPD Slip Paper Card */}
            <div className="bg-white text-slate-900 rounded-3xl p-6 shadow-2xl border-4 border-dashed border-red-300 space-y-3.5">
              <div className="text-center border-b border-slate-200 pb-2.5 space-y-0.5">
                <span className="font-black text-lg tracking-tight text-slate-900">{t.appName}</span>
                <div className="text-xs font-semibold text-red-700">{generatedToken.department}</div>
                <div className="text-[10px] text-slate-400">Issued at: {generatedToken.time} · Station K-03</div>
              </div>

              <div className="flex items-center gap-3 bg-red-50 border-2 border-red-200 rounded-2xl p-3">
                <img src={generatedToken.photo} alt="Patient" className="w-16 h-16 rounded-xl object-cover border-2 border-red-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">{t.tokenNumberLabel}</span>
                  <div className="text-3xl font-black text-red-700">{generatedToken.number}</div>
                  <div className="text-xs font-black text-slate-900 truncate">{generatedToken.name}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500 font-semibold block text-[10px]">{t.roomLabel}:</span>
                  <strong className="text-xs font-black text-slate-900">{generatedToken.room}</strong>
                </div>
                <div className="p-2 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500 font-semibold block text-[10px]">{t.doctorLabel}:</span>
                  <strong className="text-xs font-black text-slate-900">{generatedToken.doctor}</strong>
                </div>
              </div>

              <div className="p-2 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <span className="text-slate-500 font-semibold block mb-0.5 text-[10px]">Vitals Telemetry:</span>
                <div className="grid grid-cols-4 gap-1 text-center font-bold text-slate-800 text-[10px]">
                  <div>BP: {generatedToken.vitals.bp}</div>
                  <div>Pulse: {generatedToken.vitals.pulse}</div>
                  <div>SpO2: {generatedToken.vitals.spo2}</div>
                  <div>Temp: {generatedToken.vitals.temp}</div>
                </div>
              </div>
            </div>

            <div className="flex gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-3.5 bg-white hover:bg-slate-100 border-2 border-red-600 text-red-700 font-black rounded-xl transition flex items-center justify-center gap-2 cursor-pointer text-sm"
              >
                <Printer className="w-4 h-4 text-red-600" />
                <span>{t.printSlipBtn}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setPatientName("");
                  setPatientPhoto(null);
                  setUploadedDocuments([]);
                }}
                className="flex-1 py-3.5 bg-gradient-to-r from-red-600 to-rose-600 text-white font-black rounded-xl transition flex items-center justify-center gap-2 cursor-pointer text-sm"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{t.nextPatientBtn}</span>
              </button>
            </div>
          </div>
        )}

      </main>

      {/* Persistent Bottom Bar */}
      <footer className="max-w-5xl w-full mx-auto py-1 flex items-center justify-between text-[11px] text-red-300/60 border-t border-red-900/40">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          <span>Self-Service Touch Station K-03 · Multimodal Clinical History Intake Active</span>
        </div>
        <button
          type="button"
          onClick={() => setPortalMode("login")}
          className="text-red-400 hover:text-red-200 cursor-pointer font-semibold"
        >
          {t.exitKiosk}
        </button>
      </footer>

    </div>
  );
}
