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
  AlertCircle,
  Cpu,
  Layers,
  Sparkle
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
import { documentStorageService } from "../../services/storage/storageService";

export default function AccessiblePatientKiosk() {
  const { submitKioskIntake, setPortalMode, currentLanguage, setCurrentLanguage, t } = usePatient();

  // Kiosk 12-Step Progression:
  // 1: Language Selection (8 Regional Languages)
  // 2: Identity / ABHA & Live Webcam Photo Capture
  // 3: Multimodal Patient Consent Screen
  // 4: Medicine System (AYUSH / Allopathy / Integrative)
  // 5: Chief Complaint & Visual Body Map
  // 6: Voice + Touch Adaptive HPI Interview
  // 7: Complete Medical & Surgical History + Meds + Allergies
  // 8: Conversational 1-Question-at-a-Time AYUSH Assessment (when AYUSH chosen)
  // 9: Real Tesseract.js OCR Document Scanner & Entity Preview
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

  // AYUSH Dashavidha State (Clinical Mappings - All Patient Reported)
  const [ayushStep, setAyushStep] = useState(0); // 0 = Intro, 1-12 = 1 Question per screen
  const [ayushPrakritiPrimary, setAyushPrakritiPrimary] = useState("Pitta");
  const [ayushVikriti, setAyushVikriti] = useState("Moderate Imbalance (Pachaka Pitta)");
  const [ayushSara, setAyushSara] = useState("Rakta Sara (Blood Essence)");
  const [ayushSamhanana, setAyushSamhanana] = useState("Susambaddha (Well-compacted / Strong build)");
  const [ayushAgni, setAyushAgni] = useState("Tikshnagni (Hyperactive / Acidic)");
  const [ayushKoshtha, setAyushKoshtha] = useState("Madhyama Koshtha (Regular)");
  const [ayushPramana, setAyushPramana] = useState("Sama Pramana (Proportionate height-to-span)");
  const [ayushSatmya, setAyushSatmya] = useState("Sarva Rasa Satmya (All 6 tastes wholesome)");
  const [ayushSattva, setAyushSattva] = useState("Pravara Sattva (High emotional resilience)");
  const [ayushAharaShakti, setAyushAharaShakti] = useState("Abhyavaharana Shakti Uttama (Good intake & digestion)");
  const [ayushVyayamaShakti, setAyushVyayamaShakti] = useState("Pravara (High physical capacity & stamina)");
  const [ayushVaya, setAyushVaya] = useState("Madhyama (Adult / Maintenance Stage)");

  // Real Tesseract OCR Extraction State
  const [uploadedDocuments, setUploadedDocuments] = useState([]);
  const [isOcrProcessing, setIsOcrProcessing] = useState(false);
  const [ocrStatusText, setOcrStatusText] = useState("");
  const [ocrProgressPercent, setOcrProgressPercent] = useState(0);
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

  // Deterministic Multilingual Clinical Speech Intent Handler
  const handleVoiceIntent = (transcript, isFinal) => {
    const parsed = speechService.parseClinicalSpeechIntent(transcript);

    // Step 2: Name extraction
    if (step === 2 && !patientName && isFinal) {
      const cleanName = transcript.replace(/my name is|mera naam|naam|i am|en peyar/gi, "").trim();
      if (cleanName) setPatientName(cleanName);
    }

    // Step 4: Stream selection
    if (step === 4 && parsed.stream) {
      setMedicalStream(parsed.stream);
    }

    // Step 5: Body parts
    if (step === 5 && parsed.bodyRegion) {
      setSelectedBodyPart(parsed.bodyRegion);
    }

    // Step 6: Duration & HPI
    if (step === 6) {
      if (parsed.duration) setDuration(parsed.duration);
      if (parsed.painScore !== null) setPainScore(parsed.painScore);
      if (parsed.hpiCharacter) setHpiCharacter(parsed.hpiCharacter);
      if (parsed.hpiRadiation) setHpiRadiation(parsed.hpiRadiation);
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

  // Real Tesseract OCR Document Upload Handler
  const handleDocumentUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsOcrProcessing(true);
    setOcrProgressPercent(10);
    setOcrStatusText("Preparing document for optical character recognition...");
    speakPrompt("Reading medical document with optical character recognition...");

    try {
      const ocrResult = await ocrService.extractTextFromDocument(file, {
        onProgress: (p) => {
          setOcrProgressPercent(Math.round((p.progress || 0) * 100));
          setOcrStatusText(p.message || "Extracting clinical characters...");
        }
      });

      const extractions = medicalExtractionService.extractMedicalEntities(ocrResult.rawText, {
        id: `doc-${Date.now()}`,
        name: file.name,
        uploadedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      });

      const newDocItem = {
        id: `kiosk-doc-${Date.now()}`,
        name: file.name,
        type: file.type?.includes("pdf") ? "pdf" : "image",
        size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        uploadedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        rawText: ocrResult.rawText,
        confidence: ocrResult.confidence,
        ocrEngine: ocrResult.engine || "Tesseract.js WASM",
        extractions,
        provenance: "DOCUMENT_EXTRACTED"
      };

      setUploadedDocuments((prev) => [...prev, newDocItem]);

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

      speakPrompt(`Document digitized. Extracted ${extractions.medications.length} medications and ${extractions.investigations.length} lab tests.`);
    } catch (err) {
      console.error("Document OCR extraction error:", err);
      setOcrStatusText("Unable to reliably extract text. Please review original document.");
    } finally {
      setIsOcrProcessing(false);
      setOcrProgressPercent(100);
    }
  };

  // 12 Conversational, Patient-Facing AYUSH Questions Definition
  const AYUSH_QUESTIONS = [
    {
      index: 1,
      title: "1. Body Nature & Energy",
      prompt: "Which one sounds most like you?",
      sub: "Choose what best describes your natural body type and personality",
      currentValue: ayushPrakritiPrimary,
      setter: setAyushPrakritiPrimary,
      options: [
        { id: "Vata", icon: "🌬️", label: "Light & Quick", desc: "Active, light frame, quick movements and thoughts", value: "Vata" },
        { id: "Pitta", icon: "🔥", label: "Warm & Active", desc: "Warm body temperature, sharp appetite, strong energy", value: "Pitta" },
        { id: "Kapha", icon: "🌿", label: "Strong & Steady", desc: "Calm nature, sturdy solid build, steady pace", value: "Kapha" }
      ]
    },
    {
      index: 2,
      title: "2. Current Discomfort",
      prompt: "How does your body feel right now?",
      sub: "Select what best describes your discomfort today",
      currentValue: ayushVikriti,
      setter: setAyushVikriti,
      options: [
        { id: "mild", icon: "🙂", label: "Mostly Normal", desc: "Feeling reasonably comfortable with only minor issues", value: "Mild Imbalance (Normal State)" },
        { id: "pitta", icon: "🔥", label: "Burning & Heat", desc: "Acidity, burning sensations in stomach, or feeling hot", value: "Moderate Imbalance (Pachaka Pitta)" },
        { id: "vata", icon: "💨", label: "Aches & Restlessness", desc: "Body stiffness, gas pain, dryness, or joint aches", value: "Severe Vata Imbalance (Vata Prakopa)" },
        { id: "kapha", icon: "😴", label: "Heavy & Sluggish", desc: "Congestion, heavy feeling in head/chest, or tiredness", value: "Kapha Stagnation (Manda)" }
      ]
    },
    {
      index: 3,
      title: "3. Body Strength & Vitality",
      prompt: "How is your overall body strength and vitality?",
      sub: "Your physical resilience and general vitality",
      currentValue: ayushSara,
      setter: setAyushSara,
      options: [
        { id: "mamsa", icon: "💪", label: "Strong Muscles", desc: "Good muscle firmness, strength and stamina", value: "Mamsa Sara (Muscle Essence)" },
        { id: "rakta", icon: "🩸", label: "Healthy Skin & Blood", desc: "Good circulation, bright eyes and clear skin", value: "Rakta Sara (Blood Essence)" },
        { id: "asthi", icon: "🦴", label: "Firm Bones & Joints", desc: "Strong bone structure and firm posture", value: "Asthi Sara (Bone Essence)" },
        { id: "sarva", icon: "✨", label: "Balanced Vitality", desc: "Overall strong immune health and good energy", value: "Sarva Sara (Excellent Essence)" }
      ]
    },
    {
      index: 4,
      title: "4. Body Build & Firmness",
      prompt: "How is your body build and firmness?",
      sub: "Your natural physical compactness",
      currentValue: ayushSamhanana,
      setter: setAyushSamhanana,
      options: [
        { id: "solid", icon: "🏋️", label: "Solid & Strong", desc: "Well-built, compact and sturdy frame", value: "Susambaddha (Well-compacted / Strong build)" },
        { id: "medium", icon: "🚶", label: "Medium Build", desc: "Average build and normal compactness", value: "Madhyama (Moderate compactness)" },
        { id: "slim", icon: "🌿", label: "Delicate & Slim", desc: "Light, slim or delicate body frame", value: "Heena (Light / Delicate build)" }
      ]
    },
    {
      index: 5,
      title: "5. Digestion & Appetite",
      prompt: "How is your digestion usually?",
      sub: "How comfortably your stomach digests meals",
      currentValue: ayushAgni,
      setter: setAyushAgni,
      options: [
        { id: "tikshna", icon: "🔥", label: "Very Strong / Fast", desc: "Get hungry quickly and digest food very fast", value: "Tikshnagni (Hyperactive / Acidic)" },
        { id: "sama", icon: "🙂", label: "Normal & Balanced", desc: "Digest food comfortably and on time", value: "Samagni (Balanced Digestion)" },
        { id: "manda", icon: "🐢", label: "Slow & Heavy", desc: "Takes a long time to digest, feels heavy", value: "Mandagni (Slow / Sluggish)" },
        { id: "vishama", icon: "🔄", label: "Changes Often", desc: "Sometimes fast, sometimes slow or irregular", value: "Vishamagni (Irregular / Variable)" }
      ]
    },
    {
      index: 6,
      title: "6. Bowel Movements",
      prompt: "How are your bowel movements usually?",
      sub: "Your daily morning bowel habit",
      currentValue: ayushKoshtha,
      setter: setAyushKoshtha,
      options: [
        { id: "regular", icon: "🙂", label: "Regular & Normal", desc: "Smooth and regular once daily", value: "Madhyama Koshtha (Regular)" },
        { id: "soft", icon: "💧", label: "Soft / Frequent", desc: "Loose or sensitive to certain foods", value: "Mridu Koshtha (Loose / Sensitive)" },
        { id: "hard", icon: "🚽", label: "Hard / Difficult", desc: "Dry stools, constipation prone", value: "Krura Koshtha (Constipated / Hard)" }
      ]
    },
    {
      index: 7,
      title: "7. Body Proportions",
      prompt: "How is your height and body proportions?",
      sub: "Symmetry of your height and limb span",
      currentValue: ayushPramana,
      setter: setAyushPramana,
      options: [
        { id: "sama", icon: "📏", label: "Well Proportioned", desc: "Balanced height and arm span", value: "Sama Pramana (Proportionate height-to-span)" },
        { id: "vishama", icon: "🚶", label: "Slightly Uneven", desc: "Very tall, slender or unequal proportions", value: "Visham Pramana (Disproportionate)" }
      ]
    },
    {
      index: 8,
      title: "8. Food Adaptability",
      prompt: "What kind of food suits your body best?",
      sub: "How your body handles different tastes and foods",
      currentValue: ayushSatmya,
      setter: setAyushSatmya,
      options: [
        { id: "all", icon: "🍽️", label: "All Kinds of Food", desc: "Can eat spicy, sour, sweet foods easily", value: "Sarva Rasa Satmya (All 6 tastes wholesome)" },
        { id: "regular", icon: "🍲", label: "Regular Home Food", desc: "Most normal home meals suit me well", value: "Vyashrita Satmya (Specific foods suit)" },
        { id: "simple", icon: "🥗", label: "Only Specific Foods", desc: "Need simple, light or specific diet", value: "Eka Rasa Satmya (Monodiet habituated)" }
      ]
    },
    {
      index: 9,
      title: "9. Mental Resilience",
      prompt: "How do you handle mental stress?",
      sub: "Your emotional calmness and patience",
      currentValue: ayushSattva,
      setter: setAyushSattva,
      options: [
        { id: "calm", icon: "🧠", label: "Calm & Strong", desc: "Stay patient, peaceful and positive during difficulty", value: "Pravara Sattva (High emotional resilience)" },
        { id: "moderate", icon: "🙂", label: "Moderate Tolerance", desc: "Handle everyday worries normally", value: "Madhyama Sattva (Moderate tolerance)" },
        { id: "anxious", icon: "😟", label: "Worry Easily", desc: "Feel anxious, restless or sensitive quickly", value: "Avara Sattva (Low stress tolerance/Anxious)" }
      ]
    },
    {
      index: 10,
      title: "10. Food Intake Capacity",
      prompt: "How is your daily food intake capacity?",
      sub: "How much food you can eat comfortably",
      currentValue: ayushAharaShakti,
      setter: setAyushAharaShakti,
      options: [
        { id: "good", icon: "🍽️", label: "Full / Good Meals", desc: "Good appetite, easily finish a full plate", value: "Abhyavaharana Shakti Uttama (Good intake & digestion)" },
        { id: "medium", icon: "🙂", label: "Moderate Portion", desc: "Eat medium portion comfortably", value: "Madhyama (Moderate intake)" },
        { id: "small", icon: "🥄", label: "Small Appetite", desc: "Get full very quickly, eat little food", value: "Avara (Low intake capacity)" }
      ]
    },
    {
      index: 11,
      title: "11. Physical Activity & Stamina",
      prompt: "How much physical activity can you usually do?",
      sub: "Your physical endurance and daily energy",
      currentValue: ayushVyayamaShakti,
      setter: setAyushVyayamaShakti,
      options: [
        { id: "high", icon: "💪", label: "A Lot / High Stamina", desc: "Can do hard physical work and long walks", value: "Pravara (High physical capacity & stamina)" },
        { id: "moderate", icon: "🚶", label: "Some Activity", desc: "Can do daily walks and routine chores", value: "Madhyama (Moderate physical endurance)" },
        { id: "low", icon: "😴", label: "A Little / Tire Easily", desc: "Feel tired quickly after short walking", value: "Avara (Low stamina / Tires quickly)" }
      ]
    },
    {
      index: 12,
      title: "12. Life Stage",
      prompt: "Which life stage best describes you?",
      sub: "Your current age period",
      currentValue: ayushVaya,
      setter: setAyushVaya,
      options: [
        { id: "young", icon: "🌱", label: "Youth / Young", desc: "Under 25 years old", value: "Bala / Taruna (Growth Stage)" },
        { id: "adult", icon: "🌳", label: "Adult", desc: "25 to 59 years old", value: "Madhyama (Adult / Maintenance Stage)" },
        { id: "senior", icon: "🍂", label: "Senior / Elder", desc: "60 years or older", value: "Vridha (Senior / Degenerative Stage)" }
      ]
    }
  ];

  // Helper to read current AYUSH question aloud
  const speakCurrentAyushQuestion = (idx) => {
    if (!audioEnabled) return;
    if (idx === 0) {
      speakPrompt("Ayurvedic health questions. Let us learn a little about your body and nature. Tap start to begin.");
      return;
    }
    const q = AYUSH_QUESTIONS[idx - 1];
    if (q) {
      const optionsText = q.options.map((o) => o.label).join(". ");
      speakPrompt(`${q.prompt}. Options are: ${optionsText}. Tap your answer on screen.`);
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
    else if (step === 8) speakCurrentAyushQuestion(ayushStep);
    else if (step === 9) speakPrompt(t.documentScanPrompt);
    else if (step === 10) speakPrompt(t.vitalsPrompt);
    else if (step === 11) speakPrompt(t.reviewStepTitle + ". Please verify your reported information.");
    else if (step === 12) speakPrompt(t.tokenTitle);
  }, [step, ayushStep, currentLanguage]);

  // Simulate Vitals Reading on Step 10
  useEffect(() => {
    if (step === 10) {
      setVitalsProgress(10);
      const timer1 = setTimeout(() => setVitalsProgress(45), 800);
      const timer2 = setTimeout(() => setVitalsProgress(80), 1600);
      const timer3 = setTimeout(() => {
        setVitalsProgress(100);
        setStep(11);
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
        prakriti: { primary: ayushPrakritiPrimary, provenance: "PATIENT_REPORTED" },
        vikriti: { imbalance: ayushVikriti, provenance: "PATIENT_REPORTED" },
        agniStatus: { type: ayushAgni, provenance: "PATIENT_REPORTED" },
        koshtha: { type: ayushKoshtha, provenance: "PATIENT_REPORTED" },
        sara: { type: ayushSara, provenance: "PATIENT_REPORTED" },
        samhanana: { type: ayushSamhanana, provenance: "PATIENT_REPORTED" },
        pramana: { type: ayushPramana, provenance: "PATIENT_REPORTED" },
        satmya: { type: ayushSatmya, provenance: "PATIENT_REPORTED" },
        sattva: { type: ayushSattva, provenance: "PATIENT_REPORTED" },
        aharaShakti: { type: ayushAharaShakti, provenance: "PATIENT_REPORTED" },
        vyayamaShakti: { type: ayushVyayamaShakti, provenance: "PATIENT_REPORTED" },
        vaya: { type: ayushVaya, provenance: "PATIENT_REPORTED" }
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
    setStep(12);
  };

  const activeHpiFramework = HPI_DECISION_FRAMEWORK[selectedBodyPart] || HPI_DECISION_FRAMEWORK.generic;
  const currentAyushQ = ayushStep > 0 && ayushStep <= 12 ? AYUSH_QUESTIONS[ayushStep - 1] : null;

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
            title="Deterministic Multilingual Speech Recognition"
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
              setAyushStep(0);
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
          <span className="text-[10px] bg-red-900/60 px-2 py-0.5 rounded text-red-300 font-mono">Multilingual NLU Active</span>
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
                  <h3 className="font-black text-sm sm:text-base text-slate-900">Digital Health Intake & Optical Character Recognition Authorization</h3>
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
                <span>Version: <strong>v1.2 (National Health Guidelines)</strong></span>
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
        {/* STEP 6: VOICE + TOUCH ADAPTIVE HPI */}
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
                  if (medicalStream === "ayush") {
                    setAyushStep(0);
                    setStep(8);
                  } else {
                    setStep(9);
                  }
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
        {/* STEP 8: NEW ACCESSIBLE 1-QUESTION-PER-SCREEN AYUSH CONVERSATIONAL FLOW */}
        {/* ========================================================================= */}
        {step === 8 && (
          <div className="space-y-5 animate-in fade-in zoom-in-95 duration-150 max-w-2xl mx-auto w-full">
            
            {/* AYUSH Sub-Step 0: Intro Welcome Screen */}
            {ayushStep === 0 && (
              <div className="bg-white text-slate-900 border-4 border-amber-400 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-center">
                <div className="w-20 h-20 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto text-4xl shadow-inner border-2 border-amber-300 animate-bounce">
                  🌿
                </div>

                <div className="space-y-2">
                  <span className="px-3.5 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-black uppercase tracking-wider border border-amber-300">
                    AYUSH Health Questions
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    Let's learn a little about you
                  </h2>
                  <p className="text-sm sm:text-base text-slate-600 max-w-md mx-auto leading-relaxed">
                    We will ask a few simple questions with pictures about your body and digestion.
                  </p>
                </div>

                <div className="p-4 bg-amber-50 rounded-2xl border-2 border-amber-200 flex items-center justify-center gap-3 text-xs sm:text-sm font-bold text-amber-900">
                  <Volume2 className="w-5 h-5 text-amber-700 shrink-0" />
                  <span>Tap the speaker icon on any screen to hear the question aloud.</span>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => speakCurrentAyushQuestion(0)}
                    className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 border-2 border-slate-300 text-slate-800 font-black text-sm flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                  >
                    <Volume2 className="w-5 h-5 text-amber-600" />
                    <span>🔊 Hear Introduction</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAyushStep(1)}
                    className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-black text-base flex items-center justify-center gap-2 shadow-xl shadow-amber-600/30 cursor-pointer active:scale-95"
                  >
                    <span>START QUESTIONS</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* AYUSH Questions 1 to 12: ONE SINGLE QUESTION PER SCREEN */}
            {ayushStep >= 1 && ayushStep <= 12 && currentAyushQ && (
              <div className="bg-white text-slate-900 border-4 border-amber-400 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5">
                
                {/* Visual Dot Progress Bar */}
                <div className="space-y-1.5 text-center">
                  <div className="flex items-center justify-between text-xs font-black text-amber-900">
                    <span className="flex items-center gap-1.5">
                      <Flower2 className="w-4 h-4 text-amber-600" />
                      <span>{currentAyushQ.title}</span>
                    </span>
                    <span className="bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300 text-amber-950 font-bold">
                      Question {currentAyushQ.index} of 12
                    </span>
                  </div>

                  {/* 12 Visual Progress Dots */}
                  <div className="flex justify-center items-center gap-1.5 py-1">
                    {AYUSH_QUESTIONS.map((q) => (
                      <div
                        key={q.index}
                        className={`h-2 rounded-full transition-all duration-300 ${
                          q.index === ayushStep
                            ? "w-6 bg-amber-600"
                            : q.index < ayushStep
                            ? "w-2.5 bg-amber-400"
                            : "w-2 bg-slate-200"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Big Question & Audio Button */}
                <div className="bg-amber-50/70 rounded-2xl p-4 border border-amber-200 text-center space-y-2">
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
                    {currentAyushQ.prompt}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 font-medium">
                    {currentAyushQ.sub}
                  </p>

                  <button
                    type="button"
                    onClick={() => speakCurrentAyushQuestion(ayushStep)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white hover:bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold transition shadow-xs cursor-pointer active:scale-95"
                  >
                    <Volume2 className="w-4 h-4 text-amber-700" />
                    <span>🔊 Hear Question</span>
                  </button>
                </div>

                {/* Large, Accessible Visual Answer Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {currentAyushQ.options.map((opt) => {
                    const isSelected = currentAyushQ.currentValue === opt.value;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          currentAyushQ.setter(opt.value);
                          speakPrompt(opt.label);
                        }}
                        className={`p-4 sm:p-5 rounded-2xl border-3 transition-all flex items-center gap-3.5 text-left cursor-pointer active:scale-95 shadow-md ${
                          isSelected
                            ? "bg-amber-50 border-amber-600 shadow-xl ring-4 ring-amber-400/30 scale-[1.02]"
                            : "bg-white hover:bg-slate-50 border-slate-200"
                        }`}
                      >
                        <span className="text-4xl shrink-0">{opt.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <strong className="text-base font-black text-slate-900 block truncate">
                              {opt.label}
                            </strong>
                            {isSelected && <Check className="w-5 h-5 text-amber-700 stroke-[3]" />}
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                            {opt.desc}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Bottom Navigation Buttons */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      if (ayushStep === 1) setAyushStep(0);
                      else setAyushStep(ayushStep - 1);
                    }}
                    className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>{t.backBtn}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (ayushStep === 12) {
                        setStep(9); // Advance to Step 9 (Document Scan)
                      } else {
                        setAyushStep(ayushStep + 1);
                      }
                    }}
                    className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-amber-600/30 cursor-pointer active:scale-95"
                  >
                    <span>{ayushStep === 12 ? "Complete AYUSH & Next" : "Next Question"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

              </div>
            )}

            {/* Back to Step 7 button if on intro */}
            {ayushStep === 0 && (
              <div className="flex justify-start">
                <button
                  type="button"
                  onClick={() => setStep(7)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs flex items-center gap-1.5"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back to Medical History</span>
                </button>
              </div>
            )}

          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 9: REAL TESSERACT OCR DOCUMENT SCANNER */}
        {/* ========================================================================= */}
        {step === 9 && (
          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-150 max-w-3xl mx-auto w-full">
            <div className="text-center space-y-0.5">
              <span className="px-3 py-0.5 rounded-full bg-red-600/20 border border-red-500/40 text-red-300 text-xs font-bold">
                Step 9 of 12 · Real OCR Optical Extraction (Tesseract.js WASM)
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
                  <span className="text-[10px] text-slate-400">Photograph prescription with camera</span>
                </button>

                <button
                  type="button"
                  disabled={isOcrProcessing}
                  onClick={() => docFileInputRef.current?.click()}
                  className="p-5 border-2 border-dashed border-slate-300 hover:bg-slate-50 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer transition text-center"
                >
                  <UploadCloud className="w-8 h-8 text-slate-600" />
                  <span className="font-black text-xs text-slate-900">{t.uploadDocBtn}</span>
                  <span className="text-[10px] text-slate-400">Upload JPG, PNG, PDF lab reports</span>
                </button>
              </div>

              {/* OCR Progress Indicator */}
              {isOcrProcessing && (
                <div className="p-4 bg-red-50 border-2 border-red-200 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between text-xs font-black text-red-900">
                    <div className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 text-red-600 animate-spin" />
                      <span>{ocrStatusText}</span>
                    </div>
                    <span>{ocrProgressPercent}%</span>
                  </div>
                  <div className="w-full bg-red-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-red-600 to-rose-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${ocrProgressPercent}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-red-700 font-semibold block text-center">
                    Executing Real Tesseract.js WASM Optical Pixel Reader on Document
                  </span>
                </div>
              )}

              {/* Uploaded Documents & Extracted Entities Preview */}
              {uploadedDocuments.length > 0 && (
                <div className="space-y-3 pt-2 border-t border-slate-100 text-xs">
                  <h4 className="font-black text-slate-800">Digitized Clinical Documents ({uploadedDocuments.length})</h4>
                  {uploadedDocuments.map((doc) => (
                    <div key={doc.id} className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
                      <div className="flex items-center justify-between">
                        <strong className="text-slate-900 font-bold">{doc.name}</strong>
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px] border border-emerald-300">
                          {doc.ocrEngine} · Confidence: {Math.round(doc.confidence * 100)}%
                        </span>
                      </div>

                      {/* Raw Extracted Text Preview */}
                      {doc.rawText && (
                        <div className="p-2 bg-white rounded-lg border border-slate-200 font-mono text-[10px] text-slate-700 max-h-24 overflow-y-auto whitespace-pre-wrap">
                          {doc.rawText}
                        </div>
                      )}

                      {/* Extracted Meds */}
                      {doc.extractions?.medications?.length > 0 && (
                        <div className="text-[11px] text-slate-700">
                          <strong>Extracted Medications:</strong> {doc.extractions.medications.map((m) => `${m.name} ${m.dosage} (${m.frequency})`).join(", ")}
                        </div>
                      )}

                      {/* Extracted Investigations */}
                      {doc.extractions?.investigations?.length > 0 && (
                        <div className="text-[11px] text-slate-700">
                          <strong>Extracted Lab Tests:</strong> {doc.extractions.investigations.map((i) => `${i.testName}: ${i.value}`).join("; ")}
                        </div>
                      )}

                      {/* Abnormal Findings */}
                      {doc.extractions?.abnormalFindings?.length > 0 && (
                        <div className="text-[11px] text-red-700 font-bold bg-red-50 p-2 rounded-lg border border-red-200">
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
                  if (medicalStream === "ayush") {
                    setAyushStep(12);
                    setStep(8);
                  } else {
                    setStep(7);
                  }
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
                  setAyushStep(0);
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
          <span>Self-Service Touch Station K-03 · Conversational 1-Question AYUSH Flow Active</span>
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
