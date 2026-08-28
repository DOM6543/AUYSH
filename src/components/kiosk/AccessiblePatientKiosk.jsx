import React, { useState, useEffect, useRef } from "react";
import {
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Camera,
  RefreshCw,
  Check,
  ChevronLeft,
  ArrowRight,
  Printer,
  HeartPulse,
  RotateCcw,
  ShieldCheck,
  User,
  Sparkles,
  HelpCircle,
  X
} from "lucide-react";
import { usePatient } from "../../context/PatientContext";
import { KIOSK_LANGUAGES, KIOSK_STRINGS } from "../../data/kioskTranslations";
import { speechService } from "../../services/speech/speechService";
import { ocrService } from "../../services/documents/ocrService";
import { medicalExtractionService } from "../../services/documents/medicalExtractionService";

export default function AccessiblePatientKiosk() {
  const { submitKioskIntake, setPortalMode, currentLanguage, setCurrentLanguage } = usePatient();

  // Selected language dictionary (Default English if not found, fallback to 'en')
  const str = KIOSK_STRINGS[currentLanguage] || KIOSK_STRINGS.en;

  // Screen Workflow State:
  // 1: Choose Language
  // 2: Face Photo Check-in
  // 3: Audio-Visual Consent
  // 4: Which Doctor to See (Regular Doctor vs Ayurveda Doctor)
  // 5: Pain Location (Body Map)
  // 6: Duration of Problem
  // 7: Pain Severity (FACES)
  // 8: Existing Illness History
  // 9: Medicines & Documents
  // 10: AYUSH Questions (1 by 1, activated ONLY when careSystem === "AYUSH")
  // 11: Machine Vitals Telemetry
  // 12: OPD Token Slip
  const [screen, setScreen] = useState(1);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Patient Intake State
  const [patientName, setPatientName] = useState("");
  const [patientPhoto, setPatientPhoto] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  // Care-System Selection: 'ALLOPATHY' or 'AYUSH'
  const [careSystem, setCareSystem] = useState("ALLOPATHY");
  const [medicalStream, setMedicalStream] = useState("ALLOPATHY");

  // Chief complaint & Clinical History
  const [selectedBodyPart, setSelectedBodyPart] = useState("chest");
  const [duration, setDuration] = useState("fewDays");
  const [painScore, setPainScore] = useState(4);
  const [selectedIllnesses, setSelectedIllnesses] = useState(["none"]);
  const [uploadedDocuments, setUploadedDocuments] = useState([]);
  const [isOcrProcessing, setIsOcrProcessing] = useState(false);

  // AYUSH Questions Linear Sub-step (1 to 4)
  const [ayushSubStep, setAyushSubStep] = useState(0); // 0 = Intro, 1 = Nature, 2 = Digestion, 3 = Bowels, 4 = Energy
  const [ayushPrakriti, setAyushPrakriti] = useState("Pitta");
  const [ayushAgni, setAyushAgni] = useState("Samagni (Balanced Digestion)");
  const [ayushKoshtha, setAyushKoshtha] = useState("Madhyama Koshtha (Regular)");
  const [ayushEnergy, setAyushEnergy] = useState("Pravara (High physical capacity & stamina)");

  // Vitals & Final Token
  const [vitalsProgress, setVitalsProgress] = useState(0);
  const [generatedToken, setGeneratedToken] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // References
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const docFileInputRef = useRef(null);

  // Voice narration helper
  const speakText = (text) => {
    if (!audioEnabled || !text) return;
    speechService.speakText(text, currentLanguage);
  };

  // Toggle Microphone
  const toggleListening = () => {
    if (isListening) {
      speechService.stopListening();
      setIsListening(false);
    } else {
      setIsListening(true);
      speechService.startListening({
        lang: currentLanguage,
        onResult: (transcript, isFinal) => {
          handleVoiceResponse(transcript, isFinal);
        },
        onError: () => setIsListening(false),
        onEnd: () => setIsListening(false)
      });
    }
  };

  // Conversational Intent Parser for spoken response
  const handleVoiceResponse = (transcript) => {
    const lower = transcript.toLowerCase();

    // Doctor Selection
    if (screen === 4) {
      if (/ayurveda|ayush|herb|jadi|nattu|maruthuvam|prakriti/i.test(lower)) {
        setCareSystem("AYUSH");
        setMedicalStream("AYUSH");
        setScreen(5);
      } else if (/regular|general|allopathy|doctor|english|hospital/i.test(lower)) {
        setCareSystem("ALLOPATHY");
        setMedicalStream("ALLOPATHY");
        setScreen(5);
      }
    }
    
    // Body parts
    if (screen === 5) {
      if (/chest|heart|chhati|nenju|edeyalli|buk|hrudaya|dil/i.test(lower)) setSelectedBodyPart("chest");
      else if (/stomach|pet|vayiru|hotte|pethe|pot|gas|acid/i.test(lower)) setSelectedBodyPart("stomach");
      else if (/head|sir|thalai|thale|matha|dok/i.test(lower)) setSelectedBodyPart("head");
      else if (/knee|leg|ghutna|kaal|mookkalu|paay/i.test(lower)) setSelectedBodyPart("legs");
      else if (/throat|cough|fever|gala|thondai|gonthu|kasa|khansi/i.test(lower)) setSelectedBodyPart("throat");
      else if (/back|kamar|mudhugu|bennu|peeth/i.test(lower)) setSelectedBodyPart("back");
    }

    // Duration
    if (screen === 6) {
      if (/today|aaj|innikku|indu|ajke|1/i.test(lower)) setDuration("today");
      else if (/2|3|few|do teen|rendu/i.test(lower)) setDuration("fewDays");
      else if (/week|hafte|vaaram|sapthaha/i.test(lower)) setDuration("weeks");
      else if (/month|long|mahine|maasam/i.test(lower)) setDuration("months");
    }

    // Consent
    if (screen === 3) {
      if (/yes|agree|haan|aam|sari|avunu|hoy/i.test(lower)) {
        setScreen(4);
      }
    }
  };

  // Camera Management on Screen 2
  useEffect(() => {
    if (screen === 2 && !patientPhoto) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [screen, patientPhoto]);

  const startCamera = async () => {
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
      }
    } catch {
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

  const snapPhoto = () => {
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
      speakText("Photo captured!");
    } else {
      setPatientPhoto("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80");
    }
  };

  // Automatic Voice Prompts on Screen Transitions
  useEffect(() => {
    if (screen === 1) speakText(str.chooseLanguage);
    else if (screen === 2) speakText(str.photoPrompt);
    else if (screen === 3) speakText(str.consentAudio);
    else if (screen === 4) speakText(str.doctorChoiceAudio);
    else if (screen === 5) speakText(str.bodyPrompt);
    else if (screen === 6) speakText(str.durationPrompt);
    else if (screen === 7) speakText(str.painPrompt);
    else if (screen === 8) speakText(str.illnessPrompt);
    else if (screen === 9) speakText(str.medDocPrompt);
    else if (screen === 10) {
      if (ayushSubStep === 0) speakText(str.ayushIntroSub);
      else if (ayushSubStep === 1) speakText(`${str.ayushQ1Prompt}. ${str.ayushQ1Opt1}. ${str.ayushQ1Opt2}. ${str.ayushQ1Opt3}`);
      else if (ayushSubStep === 2) speakText(`${str.ayushQ2Prompt}. ${str.ayushQ2Opt1}. ${str.ayushQ2Opt2}. ${str.ayushQ2Opt3}`);
      else if (ayushSubStep === 3) speakText(`${str.ayushQ3Prompt}. ${str.ayushQ3Opt1}. ${str.ayushQ3Opt2}. ${str.ayushQ3Opt3}`);
      else if (ayushSubStep === 4) speakText(`${str.ayushQ4Prompt}. ${str.ayushQ4Opt1}. ${str.ayushQ4Opt2}. ${str.ayushQ4Opt3}`);
    }
    else if (screen === 11) speakText(str.vitalsPrompt);
    else if (screen === 12) speakText(str.tokenTitle);
  }, [screen, ayushSubStep, currentLanguage]);

  // Document Upload & OCR in Screen 9
  const handleDocUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsOcrProcessing(true);
    speakText(str.docProcessing);

    try {
      const ocrResult = await ocrService.extractTextFromDocument(file);
      const extractions = medicalExtractionService.extractMedicalEntities(ocrResult.rawText, {
        id: `doc-${Date.now()}`,
        name: file.name,
        uploadedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      });

      const newDoc = {
        id: `kiosk-doc-${Date.now()}`,
        name: file.name,
        type: file.type?.includes("pdf") ? "pdf" : "image",
        uploadedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        rawText: ocrResult.rawText,
        confidence: ocrResult.confidence,
        extractions,
        provenance: "DOCUMENT_EXTRACTED"
      };

      setUploadedDocuments([newDoc]);
      speakText(str.docSuccess);
      setTimeout(() => {
        if (careSystem === "AYUSH") {
          setAyushSubStep(0);
          setScreen(10);
        } else {
          setScreen(11);
        }
      }, 1000);
    } catch {
      speakText("Error reading document. Please proceed to doctor.");
    } finally {
      setIsOcrProcessing(false);
    }
  };

  // Vitals Simulator on Screen 11
  useEffect(() => {
    if (screen === 11) {
      setVitalsProgress(15);
      const t1 = setTimeout(() => setVitalsProgress(60), 800);
      const t2 = setTimeout(() => {
        setVitalsProgress(100);
        submitFinalIntake();
      }, 1600);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [screen]);

  // Submit Final Intake to Firebase
  const submitFinalIntake = async () => {
    setIsSubmitting(true);
    const tokenNum = `A-${Math.floor(100 + Math.random() * 900)}`;
    const finalPatientName = patientName.trim() || "Walk-in Patient";

    const bodyNameMap = {
      chest: str.chest,
      stomach: str.stomach,
      head: str.head,
      legs: str.legs,
      throat: str.throat,
      back: str.back,
      skin: str.skin,
      wholeBody: str.wholeBody
    };

    const complaintLabel = bodyNameMap[selectedBodyPart] || str.chest;

    const intakePayload = {
      name: finalPatientName,
      phone: "Walk-in",
      language: currentLanguage,
      careSystem: careSystem,
      medicalStream: careSystem,
      photo: patientPhoto || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
      ageGroup: "adult",
      gender: "unspecified",
      consent: {
        accepted: true,
        timestamp: new Date().toISOString(),
        version: "v1.2"
      },
      chiefComplaint: complaintLabel,
      complaintCategory: selectedBodyPart,
      duration,
      hpi: {
        character: selectedBodyPart === "chest" ? "heaviness" : "pain",
        radiation: "none",
        aggravating: "exertion",
        relieving: "rest",
        associatedSymptoms: ["discomfort"]
      },
      pastHistory: selectedIllnesses.filter((i) => i !== "none"),
      surgicalHistory: ["none"],
      medications: uploadedDocuments[0]?.extractions?.medications || [],
      allergies: ["NKDA"],
      familyHistory: [{ relation: "Family", condition: "Non-contributory" }],
      lifestyle: { diet: "Vegetarian", smoking: "Never", alcohol: "Non-Drinker", activity: "Moderate" },
      ayush: {
        prakriti: { primary: ayushPrakriti, provenance: "PATIENT_REPORTED" },
        vikriti: { imbalance: "Mild Imbalance", provenance: "PATIENT_REPORTED" },
        agniStatus: { type: ayushAgni, provenance: "PATIENT_REPORTED" },
        koshtha: { type: ayushKoshtha, provenance: "PATIENT_REPORTED" },
        sara: { type: "Rakta Sara (Blood Essence)", provenance: "PATIENT_REPORTED" },
        samhanana: { type: "Susambaddha (Well-compacted / Strong build)", provenance: "PATIENT_REPORTED" },
        pramana: { type: "Sama Pramana (Proportionate height-to-span)", provenance: "PATIENT_REPORTED" },
        satmya: { type: "Sarva Rasa Satmya (All 6 tastes wholesome)", provenance: "PATIENT_REPORTED" },
        sattva: { type: "Pravara Sattva (High emotional resilience)", provenance: "PATIENT_REPORTED" },
        aharaShakti: { type: "Abhyavaharana Shakti Uttama (Good intake & digestion)", provenance: "PATIENT_REPORTED" },
        vyayamaShakti: { type: ayushEnergy, provenance: "PATIENT_REPORTED" },
        vaya: { type: "Madhyama (Adult / Maintenance Stage)", provenance: "PATIENT_REPORTED" }
      },
      painLevel: painScore,
      tokenNumber: tokenNum,
      assignedDoctor: careSystem === "AYUSH" ? "Dr. Ramesh Kumar (AYUSH Room 4)" : "Dr. Sharma (General Medicine Room 2)",
      department: careSystem === "AYUSH" ? "AIIMS AYUSH & Ayurvedic OPD" : "AIIMS General Medicine OPD",
      vitals: { bp: "128/84 mmHg", pulse: "78 bpm", spo2: "98%", temp: "98.4 °F" },
      documents: uploadedDocuments,
      intakeTimestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    try {
      if (submitKioskIntake) {
        await submitKioskIntake(intakePayload);
      }
    } catch (e) {
      console.warn("Kiosk submit notice:", e);
    }

    setGeneratedToken({
      number: tokenNum,
      name: finalPatientName,
      careSystem,
      medicalStream: careSystem,
      room: careSystem === "AYUSH" ? "AYUSH Room 4" : "OPD Room 2",
      doctor: careSystem === "AYUSH" ? "Dr. Ramesh Kumar" : "Dr. Sharma",
      department: intakePayload.department,
      complaint: complaintLabel,
      photo: intakePayload.photo,
      vitals: intakePayload.vitals,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    });

    setIsSubmitting(false);
    setScreen(12);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-3 sm:p-6 font-sans select-none">
      
      {/* Hidden Canvas & Upload Input */}
      <canvas ref={canvasRef} className="hidden" />
      <input
        type="file"
        ref={docFileInputRef}
        onChange={handleDocUpload}
        className="hidden"
        accept=".pdf,.jpg,.jpeg,.png"
      />

      {/* Top Header Bar: Clean, Minimal, Non-Intrusive */}
      <header className="max-w-4xl w-full mx-auto flex items-center justify-between py-2 border-b border-slate-800">
        
        {/* Language Quick Switcher */}
        <button
          type="button"
          onClick={() => setScreen(1)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-amber-300 cursor-pointer active:scale-95 shadow-sm"
        >
          <span>🌐</span>
          <span>{KIOSK_LANGUAGES.find((l) => l.code === currentLanguage)?.nativeName || "Language"}</span>
        </button>

        {/* Visual Progress Dots (Screens 2 to 11) */}
        {screen >= 2 && screen <= 11 && (
          <div className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1 rounded-full border border-slate-800">
            {[2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((s) => (
              <div
                key={s}
                className={`h-2 rounded-full transition-all duration-300 ${
                  screen === s
                    ? "w-5 bg-red-500"
                    : screen > s
                    ? "w-2 bg-emerald-500"
                    : "w-1.5 bg-slate-700"
                }`}
              />
            ))}
            <span className="text-[10px] text-slate-400 font-bold ml-1">{str.almostDone}</span>
          </div>
        )}

        {/* Right Controls: Audio Narration & Giant Help Button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setAudioEnabled(!audioEnabled)}
            className={`p-2 sm:px-3 sm:py-2 rounded-full border transition flex items-center gap-1 text-xs font-bold cursor-pointer ${
              audioEnabled ? "bg-red-600/30 text-red-300 border-red-500" : "bg-slate-800 text-slate-500 border-slate-700"
            }`}
            title="Audio Voice"
          >
            {audioEnabled ? <Volume2 className="w-4 h-4 text-red-400" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={() => {
              setShowHelpModal(true);
              speakText(str.helpMessage);
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs cursor-pointer shadow-md active:scale-95"
          >
            <span className="text-sm">🙋</span>
            <span>{str.helpBtn}</span>
          </button>
        </div>
      </header>

      {/* Main Interactive Stage: ONE SCREEN = ONE ACTION */}
      <main className="max-w-3xl w-full mx-auto flex-1 flex flex-col justify-center py-4">

        {/* ========================================================================= */}
        {/* SCREEN 1: CHOOSE YOUR LANGUAGE */}
        {/* ========================================================================= */}
        {screen === 1 && (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200 text-center">
            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl font-black text-white">{str.chooseLanguage}</h2>
              <p className="text-sm text-slate-400 font-medium">{str.chooseLanguageSub}</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 max-w-2xl mx-auto">
              {KIOSK_LANGUAGES.map((lang) => {
                const isSelected = currentLanguage === lang.code;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => {
                      setCurrentLanguage(lang.code);
                      setScreen(2);
                    }}
                    className={`p-5 rounded-3xl border-3 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer active:scale-95 shadow-xl ${
                      isSelected
                        ? "bg-gradient-to-br from-red-600 to-rose-700 text-white border-white scale-105 shadow-red-600/50 ring-4 ring-red-400/40"
                        : "bg-slate-900 hover:bg-slate-800 text-slate-100 border-slate-700"
                    }`}
                  >
                    <span className="text-4xl">{lang.flag}</span>
                    <span className="font-black text-lg sm:text-xl text-white">{lang.nativeName}</span>
                    <span className="text-xs text-slate-400 font-semibold">{lang.englishName}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SCREEN 2: PHOTO CHECK-IN */}
        {/* ========================================================================= */}
        {screen === 2 && (
          <div className="bg-white text-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border-4 border-slate-200 max-w-lg mx-auto w-full text-center space-y-5 animate-in fade-in duration-200">
            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">{str.photoTitle}</h2>
              <p className="text-sm text-slate-600 font-bold">{str.photoPrompt}</p>
            </div>

            {/* Viewfinder / Captured Photo */}
            <div className="relative w-full max-w-[300px] aspect-4/3 rounded-3xl overflow-hidden bg-slate-950 mx-auto border-4 border-red-500 shadow-inner flex items-center justify-center">
              {!patientPhoto ? (
                <>
                  <video ref={videoRef} playsInline muted autoPlay className="w-full h-full object-cover transform -scale-x-100" />
                  <div className="absolute inset-4 border-3 border-dashed border-red-400/80 rounded-[50%] pointer-events-none flex items-center justify-center">
                    <span className="text-xs font-black bg-red-950/90 text-white px-3 py-1 rounded-full">🙂 Smile</span>
                  </div>
                </>
              ) : (
                <img src={patientPhoto} alt="Patient Face" className="w-full h-full object-cover" />
              )}
            </div>

            {/* Photo Action Buttons */}
            <div className="flex flex-col gap-3 pt-2">
              {!patientPhoto ? (
                <button
                  type="button"
                  onClick={snapPhoto}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-black text-lg flex items-center justify-center gap-2 shadow-xl shadow-red-600/30 active:scale-95 cursor-pointer"
                >
                  <span>{str.snapPhoto}</span>
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPatientPhoto(null);
                      startCamera();
                    }}
                    className="flex-1 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>{str.retakePhoto}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setScreen(3)}
                    className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-black text-base flex items-center justify-center gap-2 shadow-lg cursor-pointer active:scale-95"
                  >
                    <span>{str.continueBtn}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Bottom Skip to Next button if camera not working */}
            {!patientPhoto && (
              <button
                type="button"
                onClick={() => {
                  setPatientPhoto("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80");
                  setScreen(3);
                }}
                className="text-xs font-bold text-slate-400 hover:text-slate-600 underline cursor-pointer"
              >
                Skip Photo Step
              </button>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* SCREEN 3: AUDIO-VISUAL CONSENT */}
        {/* ========================================================================= */}
        {screen === 3 && (
          <div className="bg-white text-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border-4 border-slate-200 max-w-lg mx-auto w-full text-center space-y-6 animate-in fade-in duration-200">
            <div className="w-20 h-20 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto text-4xl border-2 border-red-200 shadow-sm">
              🛡️
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">{str.consentTitle}</h2>
              <p className="text-sm sm:text-base text-slate-700 font-semibold leading-relaxed">
                {str.consentPrompt}
              </p>
            </div>

            <button
              type="button"
              onClick={() => speakText(str.consentAudio)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 text-xs font-black shadow-xs cursor-pointer active:scale-95"
            >
              <Volume2 className="w-4 h-4 text-red-600" />
              <span>{str.hearQuestion}</span>
            </button>

            <div className="flex flex-col gap-3 pt-2">
              <button
                type="button"
                onClick={() => setScreen(4)}
                className="w-full py-4.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-lg sm:text-xl flex items-center justify-center gap-2 shadow-xl shadow-emerald-600/30 cursor-pointer active:scale-95"
              >
                <span>{str.consentAgree}</span>
              </button>

              <button
                type="button"
                onClick={() => setPortalMode("login")}
                className="w-full py-3 rounded-xl bg-slate-100 text-slate-500 font-bold text-xs hover:bg-slate-200 cursor-pointer"
              >
                <span>{str.consentDecline}</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SCREEN 4: WHICH DOCTOR DO YOU WANT TO SEE? (EXACTLY 2 CHOICES) */}
        {/* ========================================================================= */}
        {screen === 4 && (
          <div className="space-y-6 max-w-xl mx-auto w-full text-center animate-in fade-in duration-200">
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-white">{str.doctorChoiceTitle}</h2>
              <p className="text-sm sm:text-base text-slate-300 font-semibold">{str.doctorChoicePrompt}</p>

              <button
                type="button"
                onClick={() => speakText(str.doctorChoiceAudio)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-600 text-amber-300 text-xs font-black shadow-md cursor-pointer active:scale-95 mt-1"
              >
                <Volume2 className="w-4 h-4 text-amber-400" />
                <span>{str.hearAgain}</span>
              </button>
            </div>

            {/* Exactly TWO Enormous Visual Choice Cards */}
            <div className="space-y-4 pt-1">
              
              {/* Choice 1: Regular / General Doctor */}
              <button
                type="button"
                onClick={() => {
                  setCareSystem("ALLOPATHY");
                  setMedicalStream("ALLOPATHY");
                  speakText(str.regularDoctor);
                  setTimeout(() => setScreen(5), 250);
                }}
                className={`w-full p-6 sm:p-7 rounded-3xl border-4 transition-all flex items-center gap-5 text-left cursor-pointer active:scale-95 shadow-2xl ${
                  careSystem === "ALLOPATHY"
                    ? "bg-gradient-to-r from-red-600 to-rose-700 text-white border-white scale-102 ring-4 ring-red-400/40"
                    : "bg-white text-slate-900 border-slate-200 hover:bg-slate-50"
                }`}
              >
                <span className="text-6xl shrink-0">🩺</span>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl sm:text-2xl font-black leading-tight">{str.regularDoctor}</h3>
                  <p className="text-xs sm:text-sm opacity-90 mt-1 leading-relaxed">{str.regularDoctorSub}</p>
                </div>
                {careSystem === "ALLOPATHY" && <Check className="w-8 h-8 text-white stroke-[3] shrink-0" />}
              </button>

              {/* Choice 2: Ayurveda Doctor */}
              <button
                type="button"
                onClick={() => {
                  setCareSystem("AYUSH");
                  setMedicalStream("AYUSH");
                  speakText(str.ayurvedaDoctor);
                  setTimeout(() => setScreen(5), 250);
                }}
                className={`w-full p-6 sm:p-7 rounded-3xl border-4 transition-all flex items-center gap-5 text-left cursor-pointer active:scale-95 shadow-2xl ${
                  careSystem === "AYUSH"
                    ? "bg-gradient-to-r from-amber-600 to-orange-700 text-white border-white scale-102 ring-4 ring-amber-400/40"
                    : "bg-white text-slate-900 border-slate-200 hover:bg-slate-50"
                }`}
              >
                <span className="text-6xl shrink-0">🌿</span>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl sm:text-2xl font-black leading-tight">{str.ayurvedaDoctor}</h3>
                  <p className="text-xs sm:text-sm opacity-90 mt-1 leading-relaxed">{str.ayurvedaDoctorSub}</p>
                </div>
                {careSystem === "AYUSH" && <Check className="w-8 h-8 text-white stroke-[3] shrink-0" />}
              </button>

            </div>

            <div className="flex justify-start pt-2">
              <button
                type="button"
                onClick={() => setScreen(3)}
                className="px-5 py-3 rounded-2xl bg-slate-800 text-slate-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <span>{str.backBtn}</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SCREEN 5: WHERE IS YOUR PAIN / DISCOMFORT? */}
        {/* ========================================================================= */}
        {screen === 5 && (
          <div className="space-y-5 max-w-2xl mx-auto w-full text-center animate-in fade-in duration-200">
            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl font-black text-white">{str.bodyTitle}</h2>
              <p className="text-sm text-slate-400 font-medium">{str.bodyPrompt}</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: "chest", icon: "❤️", title: str.chest, sub: str.chestSub },
                { id: "stomach", icon: "🫃", title: str.stomach, sub: str.stomachSub },
                { id: "head", icon: "🧠", title: str.head, sub: str.headSub },
                { id: "legs", icon: "🦵", title: str.legs, sub: str.legsSub },
                { id: "throat", icon: "🗣️", title: str.throat, sub: str.throatSub },
                { id: "back", icon: "🦴", title: str.back, sub: str.backSub },
                { id: "skin", icon: "🧴", title: str.skin, sub: str.skinSub },
                { id: "wholeBody", icon: "⚡", title: str.wholeBody, sub: str.wholeBodySub }
              ].map((item) => {
                const isSelected = selectedBodyPart === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setSelectedBodyPart(item.id);
                      speakText(item.title);
                      setTimeout(() => setScreen(6), 250);
                    }}
                    className={`p-4 rounded-3xl border-3 transition-all flex flex-col items-center justify-center gap-1.5 text-center cursor-pointer active:scale-95 shadow-lg ${
                      isSelected
                        ? "bg-gradient-to-br from-red-600 to-rose-700 text-white border-white scale-105 shadow-red-600/40 ring-4 ring-red-400/40"
                        : "bg-white text-slate-900 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <span className="text-4xl">{item.icon}</span>
                    <strong className="text-sm sm:text-base font-black leading-tight block">{item.title}</strong>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-start pt-2">
              <button
                type="button"
                onClick={() => setScreen(4)}
                className="px-5 py-3 rounded-2xl bg-slate-800 text-slate-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <span>{str.backBtn}</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SCREEN 6: HOW LONG HAVE YOU HAD THIS PROBLEM? */}
        {/* ========================================================================= */}
        {screen === 6 && (
          <div className="space-y-6 max-w-xl mx-auto w-full text-center animate-in fade-in duration-200">
            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl font-black text-white">{str.durationTitle}</h2>
              <p className="text-sm text-slate-400 font-medium">{str.durationPrompt}</p>
            </div>

            <div className="space-y-3">
              {[
                { id: "today", label: str.today },
                { id: "fewDays", label: str.fewDays },
                { id: "weeks", label: str.weeks },
                { id: "months", label: str.months }
              ].map((item) => {
                const isSelected = duration === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setDuration(item.id);
                      speakText(item.label);
                      setTimeout(() => setScreen(7), 250);
                    }}
                    className={`w-full p-5 rounded-3xl border-3 transition-all flex items-center justify-between text-left cursor-pointer active:scale-95 shadow-md ${
                      isSelected
                        ? "bg-gradient-to-r from-red-600 to-rose-700 text-white border-white scale-102 ring-4 ring-red-400/40 shadow-xl"
                        : "bg-white text-slate-900 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <span className="text-lg sm:text-xl font-black">{item.label}</span>
                    {isSelected && <Check className="w-6 h-6 text-white stroke-[3]" />}
                  </button>
                );
              })}
            </div>

            <div className="flex justify-start pt-2">
              <button
                type="button"
                onClick={() => setScreen(5)}
                className="px-5 py-3 rounded-2xl bg-slate-800 text-slate-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <span>{str.backBtn}</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SCREEN 7: HOW BAD IS THE PAIN? (FACES METER) */}
        {/* ========================================================================= */}
        {screen === 7 && (
          <div className="space-y-6 max-w-xl mx-auto w-full text-center animate-in fade-in duration-200">
            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl font-black text-white">{str.painTitle}</h2>
              <p className="text-sm text-slate-400 font-medium">{str.painPrompt}</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[
                { score: 0, face: "😊", label: str.noPain },
                { score: 2, face: "🙂", label: str.mildPain },
                { score: 4, face: "😐", label: str.moderatePain },
                { score: 8, face: "😣", label: str.severePain },
                { score: 10, face: "😭", label: str.worstPain }
              ].map((item) => {
                const isSelected = painScore === item.score;
                return (
                  <button
                    key={item.score}
                    type="button"
                    onClick={() => {
                      setPainScore(item.score);
                      speakText(item.label);
                      setTimeout(() => setScreen(8), 250);
                    }}
                    className={`p-4 sm:p-5 rounded-3xl border-3 transition-all flex flex-col items-center justify-center gap-1 cursor-pointer active:scale-95 shadow-md ${
                      isSelected
                        ? "bg-gradient-to-br from-red-600 to-rose-700 text-white border-white scale-105 shadow-red-600/40 ring-4 ring-red-400/40"
                        : "bg-white text-slate-900 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <span className="text-4xl sm:text-5xl">{item.face}</span>
                    <span className="text-xs sm:text-sm font-black mt-1 block">{item.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-start pt-2">
              <button
                type="button"
                onClick={() => setScreen(6)}
                className="px-5 py-3 rounded-2xl bg-slate-800 text-slate-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <span>{str.backBtn}</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SCREEN 8: EXISTING MEDICAL ILLNESSES */}
        {/* ========================================================================= */}
        {screen === 8 && (
          <div className="space-y-5 max-w-xl mx-auto w-full text-center animate-in fade-in duration-200">
            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl font-black text-white">{str.illnessTitle}</h2>
              <p className="text-sm text-slate-400 font-medium">{str.illnessPrompt}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { id: "sugar", label: str.diabetes },
                { id: "bp", label: str.bp },
                { id: "asthma", label: str.asthma },
                { id: "heart", label: str.heart },
                { id: "none", label: str.noIllness }
              ].map((item) => {
                const isSelected = selectedIllnesses.includes(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      if (item.id === "none") {
                        setSelectedIllnesses(["none"]);
                      } else {
                        setSelectedIllnesses((prev) => {
                          const withoutNone = prev.filter((x) => x !== "none");
                          return withoutNone.includes(item.id)
                            ? withoutNone.filter((x) => x !== item.id)
                            : [...withoutNone, item.id];
                        });
                      }
                      speakText(item.label);
                    }}
                    className={`p-4 sm:p-5 rounded-3xl border-3 transition-all flex items-center justify-between text-left cursor-pointer active:scale-95 shadow-md ${
                      isSelected
                        ? "bg-red-600 text-white border-white shadow-lg ring-4 ring-red-400/40"
                        : "bg-white text-slate-900 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <span className="text-base sm:text-lg font-black">{item.label}</span>
                    {isSelected && <Check className="w-5 h-5 text-white stroke-[3]" />}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-3">
              <button
                type="button"
                onClick={() => setScreen(7)}
                className="px-5 py-3 rounded-2xl bg-slate-800 text-slate-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <span>{str.backBtn}</span>
              </button>

              <button
                type="button"
                onClick={() => setScreen(9)}
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-black text-base shadow-xl cursor-pointer active:scale-95"
              >
                <span>{str.continueBtn}</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SCREEN 9: MEDICINES & PRESCRIPTION PAPERS */}
        {/* ========================================================================= */}
        {screen === 9 && (
          <div className="space-y-6 max-w-xl mx-auto w-full text-center animate-in fade-in duration-200">
            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl font-black text-white">{str.medDocTitle}</h2>
              <p className="text-sm text-slate-400 font-medium">{str.medDocPrompt}</p>
            </div>

            {isOcrProcessing ? (
              <div className="bg-white text-slate-900 rounded-3xl p-8 shadow-2xl border-4 border-red-500 space-y-4 animate-pulse">
                <RefreshCw className="w-12 h-12 text-red-600 animate-spin mx-auto" />
                <h3 className="text-xl font-black text-slate-900">{str.docProcessing}</h3>
              </div>
            ) : (
              <div className="space-y-3.5">
                <button
                  type="button"
                  onClick={() => docFileInputRef.current?.click()}
                  className="w-full p-6 rounded-3xl bg-white hover:bg-slate-50 text-slate-900 border-4 border-red-500 flex items-center gap-4 text-left cursor-pointer active:scale-95 shadow-xl"
                >
                  <span className="text-5xl shrink-0">📷</span>
                  <div>
                    <h3 className="text-xl font-black text-slate-900">{str.takeDocPhoto}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{str.takeDocPhotoSub}</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => docFileInputRef.current?.click()}
                  className="w-full p-5 rounded-3xl bg-white hover:bg-slate-50 text-slate-900 border-2 border-slate-300 flex items-center gap-4 text-left cursor-pointer active:scale-95 shadow-md"
                >
                  <span className="text-4xl shrink-0">🖼️</span>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">{str.uploadDoc}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{str.uploadDocSub}</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (careSystem === "AYUSH") {
                      setAyushSubStep(0);
                      setScreen(10);
                    } else {
                      setScreen(11);
                    }
                  }}
                  className="w-full p-4.5 rounded-3xl bg-slate-800 hover:bg-slate-700 text-slate-300 border-2 border-slate-700 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <span className="text-base font-bold">{str.noDoc}</span>
                </button>
              </div>
            )}

            <div className="flex justify-start pt-2">
              <button
                type="button"
                onClick={() => setScreen(8)}
                className="px-5 py-3 rounded-2xl bg-slate-800 text-slate-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <span>{str.backBtn}</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SCREEN 10: SIMPLIFIED AYUSH QUESTIONS (ACTIVATED ONLY FOR CARE-SYSTEM AYUSH) */}
        {/* ========================================================================= */}
        {screen === 10 && careSystem === "AYUSH" && (
          <div className="space-y-6 max-w-xl mx-auto w-full text-center animate-in fade-in duration-200">
            
            {/* AYUSH Intro */}
            {ayushSubStep === 0 && (
              <div className="bg-white text-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border-4 border-amber-400 space-y-6">
                <div className="w-20 h-20 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center mx-auto text-4xl shadow-inner border-2 border-amber-300">
                  🌿
                </div>

                <div className="space-y-2">
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900">{str.ayushIntroTitle}</h2>
                  <p className="text-sm sm:text-base text-slate-600 font-semibold">{str.ayushIntroSub}</p>
                </div>

                <button
                  type="button"
                  onClick={() => setAyushSubStep(1)}
                  className="w-full py-4.5 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-black text-lg sm:text-xl flex items-center justify-center gap-2 shadow-xl shadow-amber-600/30 cursor-pointer active:scale-95"
                >
                  <span>{str.ayushIntroAction}</span>
                </button>
              </div>
            )}

            {/* Question 1: Nature / Constitution */}
            {ayushSubStep === 1 && (
              <div className="bg-white text-slate-900 rounded-3xl p-6 sm:p-7 shadow-2xl border-4 border-amber-400 space-y-5 text-center">
                <div className="space-y-1">
                  <span className="text-xs font-black text-amber-800 bg-amber-100 px-3 py-0.5 rounded-full uppercase">{str.ayushQ1Title}</span>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">{str.ayushQ1Prompt}</h3>
                </div>

                <div className="space-y-3">
                  {[
                    { id: "Vata", label: str.ayushQ1Opt1, sub: str.ayushQ1Opt1Sub },
                    { id: "Pitta", label: str.ayushQ1Opt2, sub: str.ayushQ1Opt2Sub },
                    { id: "Kapha", label: str.ayushQ1Opt3, sub: str.ayushQ1Opt3Sub }
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setAyushPrakriti(opt.id);
                        speakText(opt.label);
                        setTimeout(() => setAyushSubStep(2), 250);
                      }}
                      className={`w-full p-4.5 rounded-2xl border-3 transition-all flex items-center justify-between text-left cursor-pointer active:scale-95 shadow-md ${
                        ayushPrakriti === opt.id
                          ? "bg-amber-50 border-amber-600 ring-4 ring-amber-400/30 scale-102 shadow-lg"
                          : "bg-white border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <div>
                        <strong className="text-base sm:text-lg font-black text-slate-900 block">{opt.label}</strong>
                        <span className="text-xs text-slate-500">{opt.sub}</span>
                      </div>
                      {ayushPrakriti === opt.id && <Check className="w-6 h-6 text-amber-700 stroke-[3]" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Question 2: Digestion */}
            {ayushSubStep === 2 && (
              <div className="bg-white text-slate-900 rounded-3xl p-6 sm:p-7 shadow-2xl border-4 border-amber-400 space-y-5 text-center">
                <div className="space-y-1">
                  <span className="text-xs font-black text-amber-800 bg-amber-100 px-3 py-0.5 rounded-full uppercase">{str.ayushQ2Title}</span>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">{str.ayushQ2Prompt}</h3>
                </div>

                <div className="space-y-3">
                  {[
                    { id: "Tikshnagni (Hyperactive / Acidic)", label: str.ayushQ2Opt1, sub: str.ayushQ2Opt1Sub },
                    { id: "Samagni (Balanced Digestion)", label: str.ayushQ2Opt2, sub: str.ayushQ2Opt2Sub },
                    { id: "Mandagni (Slow / Sluggish)", label: str.ayushQ2Opt3, sub: str.ayushQ2Opt3Sub },
                    { id: "Vishamagni (Irregular / Variable)", label: str.ayushQ2Opt4, sub: str.ayushQ2Opt4Sub }
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setAyushAgni(opt.id);
                        speakText(opt.label);
                        setTimeout(() => setAyushSubStep(3), 250);
                      }}
                      className={`w-full p-4 rounded-2xl border-3 transition-all flex items-center justify-between text-left cursor-pointer active:scale-95 shadow-md ${
                        ayushAgni === opt.id
                          ? "bg-amber-50 border-amber-600 ring-4 ring-amber-400/30 scale-102 shadow-lg"
                          : "bg-white border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <div>
                        <strong className="text-base font-black text-slate-900 block">{opt.label}</strong>
                        <span className="text-xs text-slate-500">{opt.sub}</span>
                      </div>
                      {ayushAgni === opt.id && <Check className="w-5 h-5 text-amber-700 stroke-[3]" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Question 3: Bowels */}
            {ayushSubStep === 3 && (
              <div className="bg-white text-slate-900 rounded-3xl p-6 sm:p-7 shadow-2xl border-4 border-amber-400 space-y-5 text-center">
                <div className="space-y-1">
                  <span className="text-xs font-black text-amber-800 bg-amber-100 px-3 py-0.5 rounded-full uppercase">{str.ayushQ3Title}</span>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">{str.ayushQ3Prompt}</h3>
                </div>

                <div className="space-y-3">
                  {[
                    { id: "Madhyama Koshtha (Regular)", label: str.ayushQ3Opt1, sub: str.ayushQ3Opt1Sub },
                    { id: "Mridu Koshtha (Soft / Sensitive)", label: str.ayushQ3Opt2, sub: str.ayushQ3Opt2Sub },
                    { id: "Krura Koshtha (Constipated / Hard)", label: str.ayushQ3Opt3, sub: str.ayushQ3Opt3Sub }
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setAyushKoshtha(opt.id);
                        speakText(opt.label);
                        setTimeout(() => setAyushSubStep(4), 250);
                      }}
                      className={`w-full p-4.5 rounded-2xl border-3 transition-all flex items-center justify-between text-left cursor-pointer active:scale-95 shadow-md ${
                        ayushKoshtha === opt.id
                          ? "bg-amber-50 border-amber-600 ring-4 ring-amber-400/30 scale-102 shadow-lg"
                          : "bg-white border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <div>
                        <strong className="text-base sm:text-lg font-black text-slate-900 block">{opt.label}</strong>
                        <span className="text-xs text-slate-500">{opt.sub}</span>
                      </div>
                      {ayushKoshtha === opt.id && <Check className="w-5 h-5 text-amber-700 stroke-[3]" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Question 4: Physical Energy */}
            {ayushSubStep === 4 && (
              <div className="bg-white text-slate-900 rounded-3xl p-6 sm:p-7 shadow-2xl border-4 border-amber-400 space-y-5 text-center">
                <div className="space-y-1">
                  <span className="text-xs font-black text-amber-800 bg-amber-100 px-3 py-0.5 rounded-full uppercase">{str.ayushQ4Title}</span>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">{str.ayushQ4Prompt}</h3>
                </div>

                <div className="space-y-3">
                  {[
                    { id: "Pravara (High physical capacity & stamina)", label: str.ayushQ4Opt1, sub: str.ayushQ4Opt1Sub },
                    { id: "Madhyama (Moderate physical endurance)", label: str.ayushQ4Opt2, sub: str.ayushQ4Opt2Sub },
                    { id: "Avara (Low stamina / Tires quickly)", label: str.ayushQ4Opt3, sub: str.ayushQ4Opt3Sub }
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setAyushEnergy(opt.id);
                        speakText(opt.label);
                        setTimeout(() => setScreen(11), 250);
                      }}
                      className={`w-full p-4.5 rounded-2xl border-3 transition-all flex items-center justify-between text-left cursor-pointer active:scale-95 shadow-md ${
                        ayushEnergy === opt.id
                          ? "bg-amber-50 border-amber-600 ring-4 ring-amber-400/30 scale-102 shadow-lg"
                          : "bg-white border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <div>
                        <strong className="text-base sm:text-lg font-black text-slate-900 block">{opt.label}</strong>
                        <span className="text-xs text-slate-500">{opt.sub}</span>
                      </div>
                      {ayushEnergy === opt.id && <Check className="w-5 h-5 text-amber-700 stroke-[3]" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

        {/* ========================================================================= */}
        {/* SCREEN 11: VITALS SENSOR TELEMETRY */}
        {/* ========================================================================= */}
        {screen === 11 && (
          <div className="bg-white text-slate-900 rounded-3xl p-8 shadow-2xl border-4 border-red-500 max-w-lg mx-auto w-full text-center space-y-6 animate-in fade-in duration-200">
            <div className="w-24 h-24 rounded-full bg-red-50 border-4 border-red-200 text-red-600 flex items-center justify-center mx-auto text-5xl shadow-md animate-pulse">
              ❤️
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">{str.vitalsTitle}</h2>
              <p className="text-sm sm:text-base text-slate-600 font-semibold leading-relaxed">
                {str.vitalsPrompt}
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden border border-slate-200">
                <div
                  className="bg-gradient-to-r from-red-600 to-rose-600 h-4 rounded-full transition-all duration-500"
                  style={{ width: `${vitalsProgress}%` }}
                />
              </div>
              <span className="text-xs font-black text-red-700 block">
                {vitalsProgress < 100 ? str.vitalsMeasuring : str.vitalsDone}
              </span>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SCREEN 12: YOUR OPD TOKEN SLIP IS READY! */}
        {/* ========================================================================= */}
        {screen === 12 && generatedToken && (
          <div className="space-y-6 max-w-md mx-auto w-full text-center animate-in fade-in duration-200">
            <div className="bg-white text-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border-4 border-dashed border-red-500 space-y-4">
              <div className="text-5xl">✅</div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">{str.tokenTitle}</h2>
              <p className="text-xs text-slate-500">{str.tokenSub}</p>

              {/* Giant Token Badge */}
              <div className="bg-red-50 border-3 border-red-500 rounded-3xl p-4 space-y-1">
                <span className="text-xs font-black text-slate-500 uppercase">{str.tokenNumberLabel}</span>
                <div className="text-5xl font-black text-red-700">{generatedToken.number}</div>
                <div className="text-sm font-bold text-slate-800">{generatedToken.name}</div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-left">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-slate-500 block">{str.roomLabel}:</span>
                  <strong className="text-sm font-black text-slate-900">{generatedToken.room}</strong>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-slate-500 block">{str.doctorLabel}:</span>
                  <strong className="text-sm font-black text-slate-900">{generatedToken.doctor}</strong>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-4.5 rounded-2xl bg-white hover:bg-slate-100 border-3 border-red-600 text-red-700 font-black text-base flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-95"
              >
                <span>{str.printSlipBtn}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setScreen(1);
                  setPatientName("");
                  setPatientPhoto(null);
                  setUploadedDocuments([]);
                }}
                className="flex-1 py-4.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-black text-base flex items-center justify-center gap-2 cursor-pointer shadow-xl active:scale-95"
              >
                <span>{str.nextPatientBtn}</span>
              </button>
            </div>
          </div>
        )}

      </main>

      {/* Hospital Staff Assistance Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center space-y-4 shadow-2xl border-4 border-amber-400 animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center mx-auto text-3xl">
              🙋
            </div>
            <h3 className="text-2xl font-black text-slate-900">{str.helpTitle}</h3>
            <p className="text-sm text-slate-600 font-semibold leading-relaxed">
              {str.helpMessage}
            </p>
            <button
              type="button"
              onClick={() => setShowHelpModal(false)}
              className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-2xl text-base cursor-pointer active:scale-95 shadow-md"
            >
              {str.closeHelp}
            </button>
          </div>
        </div>
      )}

      {/* Minimal Footer */}
      <footer className="max-w-4xl w-full mx-auto py-1 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-800">
        <span>Station K-03</span>
        <button
          type="button"
          onClick={() => setPortalMode("login")}
          className="text-slate-400 hover:text-white cursor-pointer font-bold"
        >
          {str.exitBtn}
        </button>
      </footer>

    </div>
  );
}
