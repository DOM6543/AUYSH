/**
 * Conversational Speech Recognition (ASR), Text-to-Speech (TTS),
 * and Multilingual Clinical Speech Parsing Service for MediKiosk
 * 
 * Supports 5 AYUSH Treatment Systems: Ayurveda, Siddha, Unani, Homeopathy, Yoga & Naturopathy
 */

import { KIOSK_STRINGS } from "../../data/kioskTranslations";
import { extractClinicalEntities } from "../clinical/nlpClinicalExtractor";

export const SPEECH_LANG_MAP = {
  en: "en-IN",
  hi: "hi-IN",
  ta: "ta-IN",
  te: "te-IN",
  kn: "kn-IN",
  bn: "bn-IN",
  mr: "mr-IN",
  gu: "gu-IN"
};

/**
 * PatientNarrator Engine
 */
class PatientNarrator {
  constructor() {
    this.synth = typeof window !== "undefined" ? window.speechSynthesis : null;
    this.voices = [];
    this.isInitialized = false;
    this.activeUtterance = null;
    this.init();
  }

  init() {
    if (typeof window === "undefined" || !this.synth) {
      console.warn("[PatientNarrator] SpeechSynthesis API not supported in this environment.");
      return;
    }

    const loadVoices = () => {
      this.voices = this.synth.getVoices() || [];
      this.isInitialized = true;
    };

    loadVoices();
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = loadVoices;
    }
  }

  getBestVoice(lang = "en") {
    if (!this.synth) return null;
    if (this.voices.length === 0) {
      this.voices = this.synth.getVoices() || [];
    }

    const targetCode = (SPEECH_LANG_MAP[lang] || "en-IN").toLowerCase();
    const baseLang = lang.toLowerCase();

    // 1. Exact match (e.g. 'ta-in', 'hi-in')
    let matched = this.voices.find(
      (v) => v.lang && v.lang.toLowerCase().replace("_", "-") === targetCode
    );
    if (matched) return matched;

    // 2. Regional match
    matched = this.voices.find(
      (v) => v.lang && v.lang.toLowerCase().replace("_", "-").startsWith(baseLang + "-")
    );
    if (matched) return matched;

    // 3. Name or language includes target language string
    const langNames = {
      ta: "tamil",
      hi: "hindi",
      te: "telugu",
      kn: "kannada",
      bn: "bengali",
      mr: "marathi",
      gu: "gujarati",
      en: "english"
    };
    const langName = langNames[baseLang];
    if (langName) {
      matched = this.voices.find(
        (v) => (v.name && v.name.toLowerCase().includes(langName)) ||
               (v.lang && v.lang.toLowerCase().includes(baseLang))
      );
      if (matched) return matched;
    }

    // 4. Base language match
    matched = this.voices.find(
      (v) => v.lang && v.lang.toLowerCase().startsWith(baseLang)
    );
    if (matched) return matched;

    return this.voices.find((v) => v.default) || this.voices[0] || null;
  }

  speak(text, lang = "en", { onStart, onEnd, onError } = {}) {
    if (!this.synth || !text) return;

    try {
      this.synth.cancel();

      setTimeout(() => {
        if (!this.synth) return;

        if (this.synth.paused) {
          this.synth.resume();
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = SPEECH_LANG_MAP[lang] || "en-IN";
        utterance.rate = 0.92;
        utterance.pitch = 1.0;

        const bestVoice = this.getBestVoice(lang);
        if (bestVoice) {
          utterance.voice = bestVoice;
        }

        utterance.onstart = () => {
          if (onStart) onStart();
        };

        utterance.onend = () => {
          this.activeUtterance = null;
          if (onEnd) onEnd();
        };

        utterance.onerror = (e) => {
          this.activeUtterance = null;
          console.warn("[PatientNarrator] SpeechSynthesis utterance warning:", e);
          if (onError) onError(e);
        };

        this.activeUtterance = utterance;
        if (typeof window !== "undefined") {
          window._medikiosk_active_utterance = utterance;
        }

        this.synth.speak(utterance);
      }, 35);
    } catch (err) {
      console.warn("[PatientNarrator] Speak invocation error:", err);
      if (onError) onError(err);
    }
  }

  confirmLanguage(lang = "en") {
    const confirmationText =
      KIOSK_STRINGS[lang]?.langSelectedConfirm ||
      KIOSK_STRINGS.en.langSelectedConfirm ||
      "Your language is selected. I will guide you through each step.";
    this.speak(confirmationText, lang);
  }

  confirmTreatmentSystem(system = "AYURVEDA", lang = "en") {
    const s = KIOSK_STRINGS[lang] || KIOSK_STRINGS.en;
    let confirmationText = s.ayurvedaSelectedConfirm;
    if (system === "SIDDHA") confirmationText = s.siddhaSelectedConfirm;
    else if (system === "UNANI") confirmationText = s.unaniSelectedConfirm;
    else if (system === "HOMEOPATHY") confirmationText = s.homeopathySelectedConfirm;
    else if (system === "YOGA_NATUROPATHY") confirmationText = s.yogaSelectedConfirm;

    this.speak(confirmationText, lang);
  }

  cancel() {
    if (this.synth) {
      try {
        this.synth.cancel();
      } catch (e) {
        // Safe catch
      }
      this.activeUtterance = null;
    }
  }
}

export const patientNarrator = new PatientNarrator();

/**
 * Speech Recognition & Question-Aware Parser Service
 */
class SpeechService {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.narrator = patientNarrator;
    this.initRecognition();
  }

  initRecognition() {
    if (typeof window === "undefined") return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.maxAlternatives = 1;
    }
  }

  startListening({ lang = "en", onResult, onError, onEnd }) {
    if (!this.recognition) {
      this.initRecognition();
    }

    if (!this.recognition) {
      console.warn("[SpeechService] Web SpeechRecognition is not supported in this browser. Touch interaction remains 100% active.");
      if (onError) onError(new Error("Speech recognition is not supported in this browser. Please use touch fallback."));
      return;
    }

    try {
      this.recognition.lang = SPEECH_LANG_MAP[lang] || "en-IN";

      this.recognition.onresult = (event) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        const transcript = (finalTranscript || interimTranscript).trim();
        if (onResult && transcript) {
          onResult(transcript, Boolean(finalTranscript));
        }
      };

      this.recognition.onerror = (event) => {
        if (event.error !== "no-speech") {
          console.warn("[SpeechService] Speech recognition event warning:", event.error);
        }
        if (onError) onError(event);
      };

      this.recognition.onend = () => {
        this.isListening = false;
        if (onEnd) onEnd();
      };

      this.recognition.start();
      this.isListening = true;
    } catch (err) {
      console.warn("[SpeechService] Speech recognition start warning:", err);
      this.isListening = false;
      if (onError) onError(err);
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {
        // Safe catch
      }
      this.isListening = false;
    }
  }

  speakText(text, lang = "en") {
    this.narrator.speak(text, lang);
  }

  /**
   * Question-Aware Multilingual Speech Parser
   * Maps natural spoken patient input to answer IDs for the 5 AYUSH Treatment Systems
   */
  parseQuestionAnswer(rawTranscript = "", questionType = "chief_complaint") {
    const text = (rawTranscript || "").toLowerCase().trim();
    if (!text) return null;

    // 1. Treatment System Selection (5 Systems)
    if (questionType === "treatment_choice") {
      if (/yoga|naturopathy|naturo|nisarg|asan|pranayam|யோகா|இயற்கை|योग|प्राकृतिक|యోగా|యోగ|ಯೋಗ|যোগ|યોગ/i.test(text)) {
        return "YOGA_NATUROPATHY";
      }
      if (/ayurved|ayush|herb|jadibuti|prakriti|ஆயுர்வேத|आयुर्वेद|ఆయుర్వేద|ಆಯುರ್ವೇದ|আয়ুর্বেদ|આયુર્વેદ/i.test(text)) {
        return "AYURVEDA";
      }
      if (/siddha|sidha|maruthuvam|nattu|சித்தா|सिद्ध|సిద్ధ|ಸಿದ್ಧ|সিদ্ধ|સિદ્ધ/i.test(text)) {
        return "SIDDHA";
      }
      if (/unani|yunani|hikmat|mizaj|யுனானி|यूनानी|యునాని|ಯುನಾನಿ|ইউনানি|યુનાની/i.test(text)) {
        return "UNANI";
      }
      if (/homeo|homoeo|sweet pills|sabuj|ஹோமியோ|होम्योपैथी|హోమియో|ಹೋಮಿಯೋ|হোমিও|હોમિયો/i.test(text)) {
        return "HOMEOPATHY";
      }
      return null;
    }

    // 2. Chief Complaint (Body Map)
    if (questionType === "chief_complaint") {
      if (/chest|heart|chhati|nenju|edeyalli|buk|hrudaya|dil|dharkan|மார்பு|छाती|ఛాతీ|ಎದೆ|বুক|छातीत/i.test(text)) {
        return "chest";
      }
      if (/stomach|belly|pet|vayiru|hotte|pethe|pot|gas|acid|vomit|diarrhea|வயிறு|पेट|కడుపు|ಹೊಟ್ಟೆ|পেট|पोट/i.test(text)) {
        return "stomach";
      }
      if (/head|eyes|sir|thalai|thale|matha|dok|aankh|dizzy|migraine|தலை|सिर|తల|ತಲೆ|মাথা|डोके|માથું/i.test(text)) {
        return "head";
      }
      if (/knee|leg|joint|ghutna|kaal|mookkalu|paay|sandhi|கால்கள்|घुटने|కీళ్ళు|ಕೀಲು|হাঁটু|गुडघे|ઢીંચણ/i.test(text)) {
        return "legs";
      }
      if (/throat|fever|cough|cold|gala|thondai|gonthu|kasa|khansi|bukhar|சளி|காய்ச்சல்|बुखार|జ్వరం|ಜ್ವರ|জ্বর|ताप|તાવ/i.test(text)) {
        return "throat";
      }
      if (/back|spine|kamar|mudhugu|bennu|peeth|முதுகு|पीठ|వెన్ను|ಬೆನ್ನು|পিঠ|पाठ|કમર/i.test(text)) {
        return "back";
      }
      if (/skin|rash|itch|allergy|khujli|tholu|charm|தோல்|खुजली|చర్మం|ಚರ್ಮ|ত্বক|त्वचा|ચામડી/i.test(text)) {
        return "skin";
      }
      if (/body|whole|tired|exhaust|weakness|சோர்வு|कमजोरी|శరీరం|ದಣಿವು|ಕ್ಲಾಂথি|थकवा|થાક/i.test(text)) {
        return "wholeBody";
      }
      return null;
    }

    // 3. Sensation / Character
    if (questionType === "character") {
      if (/heavy|heaviness|crush|pressure|dabav|bhaari|பாரம்|அழுத்தம்|भारीपन|దబావ్|ಭಾರ|ভারী|जडपणा|ભારે/i.test(text)) {
        return "heaviness";
      }
      if (/burn|burning|acid|acidity|jalan|erichal|எரிச்சல்|जलन|మంట|ಉರಿ|জ্বালা|जळजळ|બળતરા/i.test(text)) {
        return "burning";
      }
      if (/sharp|stab|stabbing|catch|suji|kootal|குத்தல்|चुभन|పోటు|ಚುಚ್ಚುವ|তীব্র|टोचल्यासारखी|તીવ્ર/i.test(text)) {
        return "sharp";
      }
      if (/dull|ache|continuous|soreness|mitha|மந்தமான|हल्का|మందమైన|ಮಂದ|মৃদু|मंद|ધીમો/i.test(text)) {
        return "dull";
      }
      return null;
    }

    // 4. Radiation
    if (questionType === "radiation") {
      if (/arm|jaw|shoulder|left hand|kai|bhuja|கை|बाएं|భుజం|ತೋಳು|হাত|हात|હાથ/i.test(text)) {
        return "left_arm_jaw";
      }
      if (/back|blade|peeth|mudhugu|முதுகு|पीठ|వెనుక|ಬೆನ್ನು|পিঠ|पाठीकडे|પીઠ/i.test(text)) {
        return "back_blades";
      }
      if (/groin|abdomen|pet|stomach|vayiru|வயிறு|पेट|కడుపు|ಹೊಟ್ಟೆ|তলপেট|ओटीपोट|જાંઘ/i.test(text)) {
        return "groin";
      }
      if (/no|none|spot|stay|stays|illai|nahi|లేదు|ಇಲ್ಲ|না|नाही|ના|ஒரே/i.test(text)) {
        return "none";
      }
      return null;
    }

    // 5. Aggravating Factors
    if (questionType === "aggravating") {
      if (/walk|walking|stair|exertion|effort|mehnath|நடப்பது|चलने|నడక|ನಡಿಗೆ|হাঁটা|चालणे|ચાલવું/i.test(text)) {
        return "exertion";
      }
      if (/food|eat|eating|meal|spicy|lying|சாப்பிட்ட|खाना|తిన్న|ಊಟ|খাবার|जेवण|જમ્યા/i.test(text)) {
        return "food";
      }
      if (/move|movement|bend|bending|அசைவு|हिलाने|కదలిక|ಚಲನೆ|নড়াচড়া|हालचाल|હલનચલન/i.test(text)) {
        return "movement";
      }
      if (/rest|quiet|nothing|sitting|ஓய்வு|आराम|విశ్రాంతి|ವಿಶ್ರಾಂತಿ|বিশ্রাম|विश्रांती|આરામ/i.test(text)) {
        return "nothing";
      }
      return null;
    }

    // 6. Relieving Factors
    if (questionType === "relieving") {
      if (/rest|sit|sitting|resting|ஓய்வு|आराम|విశ్రాంతి|ವಿಶ್ರಾಂತಿ|বিশ্রাম|विश्रांती|આરામ/i.test(text)) {
        return "rest";
      }
      if (/water|warm|medicine|antacid|tablet|வெந்நீர்|पानी|दवाई|నీరు|ನೀರು|জল|औषध|પાણી/i.test(text)) {
        return "medicine";
      }
      if (/nothing|none|no relief|எதுவுமில்லை|कुछ नहीं|ఏమీ లేదు|ಏನೂ ಇಲ್ಲ|কিছু না|काही नाही|કંઈ નહીં/i.test(text)) {
        return "nothing";
      }
      return null;
    }

    // 7. Duration
    if (questionType === "duration") {
      if (/today|1 day|one day|started today|இன்று|आज|ఈరోజు|ಇಂದು|আজ|आज|આજે/i.test(text)) {
        return "today";
      }
      if (/2|3|few days|two days|three days|நாட்கள்|दो तीन|రోజులు|ದಿನಗಳು|দিন|दिवस|દિવસ/i.test(text)) {
        return "fewDays";
      }
      if (/week|weeks|1 week|2 weeks|வாரம்|हफ्ते|వారాలు|ವಾರ|সপ্তাহ|आठवडे|અઠવાડિયા/i.test(text)) {
        return "weeks";
      }
      if (/month|months|chronic|long time|மாதங்கள்|महीने|నెలలు|ತಿಂಗಳು|মাস|महिने|મહિના/i.test(text)) {
        return "months";
      }
      return null;
    }

    // 8. Pain Severity
    if (questionType === "pain") {
      if (/no pain|zero|0|வலி இல்லை|कोई दर्द नहीं|నొప్పి లేదు|ನೋವಿಲ್ಲ|ব্যথা নেই|वेदना नाही|દુખાવો નથી/i.test(text)) {
        return 0;
      }
      if (/mild|slight|little|2|லேசான|हल्का|తేలికపాటి|ಸೌಮ್ಯ|মৃদু|सौम्य|હળવો/i.test(text)) {
        return 2;
      }
      if (/medium|moderate|4|5|நடுத்தர|मध्यम|మధ్యస్థ|ಮಧ್ಯಮ|মাঝারি|मध्यम|મધ્યમ/i.test(text)) {
        return 4;
      }
      if (/severe|bad|high|6|7|தீவிர|तेज|తీవ్ర|ತೀವ್ರ|তীব্র|तीव्र|તીવ્ર/i.test(text)) {
        return 6;
      }
      if (/very severe|worst|unbearable|8|9|10|மிகத் தீவிர|असहनीय|భరించలేని|ಅಸಹನೀಯ|অসহ্য|असह्य|અસહ્ય/i.test(text)) {
        return 8;
      }
      return null;
    }

    // 9. Existing Conditions
    if (questionType === "illness") {
      if (/bp|blood pressure|hypertension|இரத்த அழுத்தம்|रक्तचाप|రక్తపోటు|ರಕ್ತದೊತ್ತಡ|রক্তচাপ|रक्तदाब|બ્લડ પ્રેશર/i.test(text)) {
        return "bp";
      }
      if (/sugar|diabetes|சர்க்கரை|मधुमेह|షుగర్|ಮಧುಮೇಹ|ডায়াবেটিস|मधुमेह|ડાયાબિટીસ/i.test(text)) {
        return "diabetes";
      }
      if (/heart|cardiac|stent|attack|இதயம்|हृदय|గుండె|ಹೃದಯ|হার্ট|हृदय|હૃદય/i.test(text)) {
        return "heart";
      }
      if (/asthma|breathing|wheezing|ஆஸ்துமா|दमा|ఉబ్బసం|ಅಸ್ತಮಾ|হাঁপানি|दमा|દમ/i.test(text)) {
        return "asthma";
      }
      if (/none|no|nothing|illai|nahi|లేదు|ಇಲ್ಲ|নেই|नाही|નથી/i.test(text)) {
        return "none";
      }
      return null;
    }

    // 10. Daily Medicines (Yes / No)
    if (questionType === "meds" || questionType === "yes_no") {
      if (/yes|taking|take|haan|aam|avunu|hoy|sari|ஆம்|हाँ|అవును|ಹೌದು|হ্যাঁ|होय|હા/i.test(text)) {
        return true;
      }
      if (/no|none|not|illai|nahi|ledu|illa|na|இல்லை|नहीं|లేదు|ಇಲ್ಲ|না|नाही|ના/i.test(text)) {
        return false;
      }
      return null;
    }

    // 11. Allergies (Yes / No)
    if (questionType === "allergies") {
      if (/no|none|no allergy|illai|nahi|ஒவ்வாமை இல்லை|कोई एलर्जी नहीं|అలెర్జీ లేదు|ಅಲರ್ಜಿ ಇಲ್ಲ|অ্যালার্জি নেই|अ‍ॅलर्जी नाही|એલર્જી નથી/i.test(text)) {
        return false;
      }
      if (/yes|allergic|allergy|ஆம்|हाँ|అవును|ಹೌದು|হ্যাঁ|होय|હા/i.test(text)) {
        return true;
      }
      return null;
    }

    // ==========================================
    // SYSTEM-SPECIFIC CLINICAL PARSING
    // ==========================================

    // 12. AYURVEDA Specific Questions
    if (questionType === "ayush_agni") {
      if (/fast|strong|hungry|quick|விரைவு|तेज|వేగంగా|ವೇಗವಾಗಿ|द्रुत|जलद|ઝડપી/i.test(text)) return "Tikshnagni (Fast)";
      if (/normal|balanced|comfortable|time|சீர்|सामान्य|సహజ|ಸಾಮಾನ್ಯ|স্বাভাবিক|सामान्य|સામાન્ય/i.test(text)) return "Samagni (Balanced)";
      if (/slow|heavy|long time|மெது|धीमा|నెమ్మదిగా|ನಿಧಾನ|ধীর|मंद|ધીમું/i.test(text)) return "Mandagni (Slow)";
      if (/change|often|irregular|மாறும்|बदलता|మారుతూ|ಬದಲಾಗುವ|অনিয়মিত|बदलणारे|બદલાતું/i.test(text)) return "Vishamagni (Irregular)";
      return null;
    }
    if (questionType === "ayush_koshtha") {
      if (/regular|smooth|once|daily|சீர்|साफ़|సహజ|ದಿನಕ್ಕೆ|স্বাভাবিক|सहज|સરળ/i.test(text)) return "Madhyama (Regular)";
      if (/soft|loose|frequent|மென்மை|पतला|వదులుగా|ಸಡಿಲ|নরম|पातळ|પાતળા/i.test(text)) return "Mridu (Soft/Loose)";
      if (/hard|constipat|difficult|கடினம்|कब्ज|మలబద్ధకం|ಮಲಬದ್ಧತೆ|কোষ্ঠকাঠিন্য|बद्धकोष्ठता|કબજિયાત/i.test(text)) return "Krura (Hard/Constipated)";
      return null;
    }
    if (questionType === "ayush_prakriti") {
      if (/hot|cool|summer|heat|சூடு|गर्मी|వేడి|ಸೆಕೆ|গরম|उष्णता|ગરમી/i.test(text)) return "Pitta Predominant";
      if (/cold|warm|winter|chill|குளிர்|ठंड|చలి|ಚಳಿ|ঠান্ডা|थंडी|ઠંડી/i.test(text)) return "Vata Predominant";
      if (/damp|heavy|rain|sluggish|ஈரப்பதம்|नमी|తేమ|ತೇವಾಂಶ|স্যাঁতসেঁতে|दमट|ભેજ/i.test(text)) return "Kapha Predominant";
      return null;
    }
    if (questionType === "ayush_stamina") {
      if (/high|lot|strong|heavy work|அதிக|ज्यादा|ఎక్కువ|ಹೆಚ್ಚು|প্রচুর|चांगली|સારી/i.test(text)) return "Pravara (High Stamina)";
      if (/moderate|medium|chores|walks|நடுத்தர|मध्यम|మధ్యస్థ|ಮಧ್ಯಮ|মাঝারি|मध्यम|મધ્યમ/i.test(text)) return "Madhyama (Moderate Stamina)";
      if (/low|tire|tired|little|குறைவு|कम|తక్కువ|ಕಡಿಮೆ|কম|कमी|ઓછી/i.test(text)) return "Avara (Low Stamina)";
      return null;
    }
    if (questionType === "ayush_sleep") {
      if (/deep|peace|peaceful|sound|ஆழ்ந்த|गहरी|గాఢమైన|ಗಾಢವಾದ|গভীর|गाढ|ગાઢ/i.test(text)) return "Prasanna (Deep Sleep)";
      if (/light|disturb|disturbed|wake|லேசான|हल्की|తేలికపాటి|ಹಗುರವಾದ|ಹಾಲಕಾ|हलकी|હળવી/i.test(text)) return "Madhyama (Light Sleep)";
      if (/anxious|active|restless|stress|அமைதியின்றி|बेचैन|ఆందోಳన|ಆತಂಕ|উদ্বেগ|अस्वस्थता|બેચેની/i.test(text)) return "Alpa (Anxious/Restless)";
      return null;
    }

    // 13. SIDDHA Specific Questions
    if (questionType === "siddha_theham") {
      if (/stiff|dry|joint|crack|vatham|வாதம்|वात|వాతం|ವಾತ|বাত|વાત/i.test(text)) return "Vatham (Joint Stiffness/Dryness)";
      if (/heat|pitham|burn|thirst|eyes|சூடு|பித்தம்|पित्त|పిత్తం|ಪಿತ್ತ|পিত্ত|પિત્ત/i.test(text)) return "Pitham (Excess Body Heat)";
      if (/phlegm|cold|kabam|kapham|heavy|சளி|கபம்|कफ|కఫం|ಕಫ|কফ|કફ/i.test(text)) return "Kabam (Heaviness/Phlegm)";
      return null;
    }
    if (questionType === "siddha_suvai") {
      if (/sweet|nourish|இனிப்பு|मीठा|తీపి|ಸಿಹಿ|মিষ্টি|ગળ્યો/i.test(text)) return "Inippu (Sweet / Nourishing)";
      if (/sour|salt|salty|புளிப்பு|खट्टा|పులుపు|ಹುಳಿ|টক|ખાટો/i.test(text)) return "Pulippu / Uppu (Sour & Salty)";
      if (/bitter|spicy|pungent|கசப்பு|कड़वा|చేదు|ಕಹಿ|তিতা|કડવો/i.test(text)) return "Karpu / Kaippu (Bitter & Pungent)";
      return null;
    }
    if (questionType === "siddha_valimai") {
      if (/high|vigor|strong|அதிக|उच्च|ఎక్కువ|ಉತ್ತಮ|চমৎকার|ઉત્તમ/i.test(text)) return "Uttama Valimai (High Vigor)";
      if (/moderate|steady|இயல்பான|सामान्य|మధ్యస్థ|ಸಾಮಾನ್ಯ|স্বাভাবিক|સાધારણ/i.test(text)) return "Madhyama Valimai (Moderate Vigor)";
      if (/low|fatigue|tired|குறைவு|जल्दी|త్వరగా|ಬೇಗ|দ্রুত|જલ્દી/i.test(text)) return "Heena Valimai (Low Vigor)";
      return null;
    }
    if (questionType === "siddha_amaidhi") {
      if (/calm|deep|peace|அமைதியான|शांत|ప్రశాంత|ಶಾಂತ|শান্ত/i.test(text)) return "Amaidhi (Deep Calm Sleep)";
      if (/irritable|light|broken|லேசான|चिडचिड|కోపం|ಸಿಡುಕು|রাগ|ચીડચીડા/i.test(text)) return "Salanam (Broken Light Sleep)";
      if (/heavy|excess|wake up|அதிக|जास्त|ఎక్కువ|ಹೆಚ್ಚು|অতিরিক্ত|વધુ/i.test(text)) return "Azhundha (Excess Heavy Sleep)";
      return null;
    }

    // 14. UNANI Specific Questions
    if (questionType === "unani_mizaj") {
      if (/warm|energetic|sanguine|damawi|दमवी|தமவி|దమవి|ಬೆಚ್ಚನೆಯ|উষ্ণ|ગરમ/i.test(text)) return "Damawi (Sanguine / Warm & Moist)";
      if (/cool|phlegmatic|balghami|बलगमी|பல்கமி|బల్ఘమి|ತಂಪಾದ|আর্দ্র|ઠંડુ/i.test(text)) return "Balghami (Phlegmatic / Cold & Moist)";
      if (/hot|dry|choleric|safrawi|सफरावी|சப்ரவி|సఫ్రావి|ಬಿಸಿಯಾದ|শুষ্ক|સૂકો/i.test(text)) return "Safrawi (Choleric / Hot & Dry)";
      if (/cold|melancholic|sawdawi|सौदवी|சவ்தாவி|సౌదావి|ತಣ್ಣನೆಯ|ঠান্ডা|ઠંડો/i.test(text)) return "Sawdawi (Melancholic / Cold & Dry)";
      return null;
    }
    if (questionType === "unani_hazm") {
      if (/high thirst|cold water|प्यास|தாகம்|దాహం|ಬಾಯಾರಿಕೆ|তৃষ্ণা|તરસ/i.test(text)) return "Atash Shadid (High Thirst)";
      if (/low thirst|warm drink|कम|குறைவு|తక్కువ|ಕಡಿಮೆ|কম|ઓછી/i.test(text)) return "Atash Qalil (Low Thirst)";
      if (/strong hunger|fast digest|பசி|भूख|ఆకలి|ಹಸಿವು|ক্ষুধা|ભૂખ/i.test(text)) return "Hazm Sari (Fast Digestion)";
      if (/variable|bloat|उப்புசம்|पेट फूलना|కడుపుబ్బరం|ಉಬ್ಬರ|પેટ ફૂલવું/i.test(text)) return "Hazm Bati (Variable Digestion)";
      return null;
    }
    if (questionType === "unani_quwa") {
      if (/robust|vital|strong|मजबूत|அதிக|బలమైన|ಬಲವಾದ|শক্তিশালী|મજબૂત/i.test(text)) return "Quwa Qawiyya (Robust Vital Strength)";
      if (/moderate|steady|समान्य|சீரான|సరిపడా|ಸಮತೋಲನ|স্বাভাবিক|સાધારણ/i.test(text)) return "Quwa Mutadila (Moderate Strength)";
      if (/fragile|drained|कमजोर|குறைந்த|తక్కువ|ಕಡಿಮೆ|দুর্বল|નબળી/i.test(text)) return "Quwa Dhaifa (Fragile / Low Vital Energy)";
      return null;
    }
    if (questionType === "unani_naum") {
      if (/sound|7|8|refresh|ஆழ்ந்த|गहरी|గాఢ|ಗಾಢ|ಗভীর|ગાઢ/i.test(text)) return "Naum Mutadil (Sound 7-8h Sleep)";
      if (/restless|wake|அமைதியின்றி|बेचैन|మెలకువ|ಎಚ್ಚರ|ভাঙা|તૂટતી/i.test(text)) return "Naum Qaliq (Restless Sleep)";
      if (/insomnia|thought|எண்ணங்கள்|विचार|ఆలోచనలు|ಚಿಂತೆ|চিন্তা|વિચારો/i.test(text)) return "Sahar (Difficulty Sleeping)";
      return null;
    }

    // 15. HOMEOPATHY Specific Questions
    if (questionType === "homeo_thermal") {
      if (/chilly|cold easily|need blanket|குளிர்|चिली|ठंड|చలి|ಚಳಿ|ঠান্ডা|ઠંડી/i.test(text)) return "Chilly Patient";
      if (/hot|heat easily|craves fan|சூடு|हॉट|गर्मी|వేడి|ಶಾಖ|গরম|ગરમી/i.test(text)) return "Hot Patient";
      if (/balanced|normal|சமநிலை|संतुलित|సాధారణ|ಸಮತೋಲನ|স্বাভাবিক|સંતુલિત/i.test(text)) return "Thermal Balanced";
      return null;
    }
    if (questionType === "homeo_thirst") {
      if (/large quantity|long interval|நிறைய|ज्यादा|ఎక్కువ|ಹೆಚ್ಚು|বেশি|વધુ/i.test(text)) return "Thirst for Large Quantities";
      if (/small sip|sip|frequently|அடிக்கடி|घूंट|కొద్దికొద్దిగా|ಸ್ವಲ್ಪ|অল্প|થોડું/i.test(text)) return "Thirst for Small Sips Frequently";
      if (/thirstless|no thirst|rarely drink|தாகமே இல்லை|प्यास नहीं|దాహం లేదు|ಬಾಯಾರಿಕೆ ಇಲ್ಲ|তৃষ্ণাহীনতা|તરસ નથી/i.test(text)) return "Complete Thirstlessness";
      return null;
    }
    if (questionType === "homeo_weather") {
      if (/damp|rain|winter|cold|மழை|ஈரப்பதம்|नमी|बारिश|వర్షం|ಮಳೆ|বৃষ্টি|વરસાદ/i.test(text)) return "Aggravated by Damp / Cold Weather";
      if (/sun|heat|stuffy|closed room|வெயில்|धूप|गर्मी|ఎండ|ಬಿಸಿಲು|রোদ|તડકો/i.test(text)) return "Aggravated by Heat / Stuffy Room";
      if (/morning|wake|காலை|सुबह|ఉదయం|ಬೆಳಿಗ್ಗೆ|সকাল|સવાર/i.test(text)) return "Aggravated in Morning on Waking";
      if (/evening|night|late|மாலை|இரவு|शाम|रात|సాయంత్రం|ರಾತ್ರಿ|সন্ধ্যা|સાંજ/i.test(text)) return "Aggravated in Evening / Night";
      return null;
    }
    if (questionType === "homeo_mind") {
      if (/anxious|restless|fast|hurry|கவலை|बेचैन|ఆందోళన|ಆತಂಕ|উদ্বেগ|ચિંતા/i.test(text)) return "Anxious, Restless & Fast-Paced";
      if (/gentle|weepy|consolation|மென்மையான|भावुक|సున్నితమైన|ಮೃದು|নরম|નમ્ર/i.test(text)) return "Gentle, Mild & Yielding";
      if (/irritable|impatient|angry|கோபம்|गुस्सा|చిరాకు|ಕೋಪ|রাগ|ગુસ્સો/i.test(text)) return "Irritable, Hurried & Impatient";
      if (/calm|content|quiet|அமைதியான|शांत|ప్రశాంత|ಶಾಂತ|শান্ত|શાંત/i.test(text)) return "Calm, Quiet & Contented";
      return null;
    }

    // 16. YOGA & NATUROPATHY Specific Questions
    if (questionType === "yoga_activity") {
      if (/very active|frequent|movement|brisk|run|walk|சுறுசுறுப்பு|बहुत|నడక|ಹೆಚ್ಚು|সক্রিয়|खूप|સક્રિય/i.test(text)) {
        return "Very Active (Frequent Movement)";
      }
      if (/moderate|household|chores|நடுத்தர|मध्यम|మధ్యస్థ|ಸಾಮಾನ್ಯ|মাঝারি|सामान्य|સાધારણ/i.test(text)) {
        return "Moderate Activity (Daily Chores)";
      }
      if (/sitting|sedentary|desk|chair|उட்கார்ந்த|बैठे|కూర్చోవడం|ಕುಳಿತುಕೊಳ್ಳುವುದು|বসে|बसून|બેસી/i.test(text)) {
        return "Mostly Sitting (Sedentary)";
      }
      return null;
    }

    if (questionType === "yoga_practice") {
      if (/yes|regular|daily|yoga|exercise|ஆம்|हाँ|అవును|ಹೌದು|হ্যাঁ|होय|હા/i.test(text)) {
        return "Regular Practitioner";
      }
      if (/sometimes|occasional|when time|எப்போதாவது|कभी|అప్పుడప్పుడు|ಕೆಲವೊಮ್ಮೆ|মাঝে|अधूनमधून|ક્યારેક/i.test(text)) {
        return "Occasional / Sometimes";
      }
      if (/no|never|beginner|start|இல்லை|नहीं|లేదు|ಇಲ್ಲ|না|नाही|ના/i.test(text)) {
        return "Complete Beginner / No Practice";
      }
      return null;
    }

    if (questionType === "yoga_stress") {
      if (/calm|peaceful|relaxed|free|அமைதி|शांत|ప్రశాంత|ಶಾಂತ|শান্ত|शांत|શાંત/i.test(text)) {
        return "Calm & Relaxed";
      }
      if (/moderate|tightness|pressure|work|மிதமான|मध्यम|మధ్యస్థ|ಮಧ್ಯಮ|মাঝারি|मध्यम|મધ્યમ/i.test(text)) {
        return "Moderate Tension / Work Stress";
      }
      if (/high|exhaustion|anxiety|bad|அதிக|बहुत|అధిక|ಅತಿಯಾದ|অতিরিক্ত|खूप|વધારે/i.test(text)) {
        return "High Stress / Mental Exhaustion";
      }
      return null;
    }

    if (questionType === "yoga_goal") {
      if (/pain|joint|back|posture|relief|வலி|दर्द|నొప్పి|ನೋವು|ব্যথা|वेदना|દુખાવો/i.test(text)) {
        return "Pain Relief & Joint Mobility";
      }
      if (/stress|sleep|relax|mind|தூக்கம்|तनाव|నిద్ర|ನಿದ್ರೆ|ঘুম|झोप|ઊંઘ/i.test(text)) {
        return "Stress Reduction & Deep Sleep";
      }
      if (/diet|detox|digest|food|உணவு|आहार|ఆహారం|ಆಹಾರ|খাবার|आहार|આહાર/i.test(text)) {
        return "Natural Diet & Detox Therapy";
      }
      if (/weight|fitness|energy|lifestyle|எடை|वजन|బరువు|ತೂಕ|ওজন|वजन|વજન/i.test(text)) {
        return "Weight Management & Fitness";
      }
      return null;
    }

    return null;
  }

  /**
   * Adaptive Multimodal Input Parser
   * Integrates NLP Sentence Extraction with question option matching.
   */
  parseAdaptiveSpeech(rawTranscript = "", currentQuestion = null) {
    if (!rawTranscript) return null;
    const text = rawTranscript.trim();

    // 1. If open description or problem area, run NLP clinical entity extractor
    if (!currentQuestion || currentQuestion.type === "open_description" || currentQuestion.id === "q_patient_narrative") {
      const nlp = extractClinicalEntities(text);
      return {
        patientNarrative: text,
        extractedData: nlp.extracted,
        questionId: currentQuestion?.id || "q_patient_narrative"
      };
    }

    // 2. If problem area selection question
    if (currentQuestion.type === "problem_area" || currentQuestion.id === "q_problem_area") {
      const nlp = extractClinicalEntities(text);
      const parsedArea = this.parseQuestionAnswer(text, "chief_complaint");
      const matchedArea = parsedArea || nlp.extracted.bodyArea;

      if (matchedArea) {
        return {
          bodyArea: matchedArea,
          patientNarrative: text,
          extractedData: nlp.extracted,
          questionId: "q_problem_area"
        };
      }

      return {
        patientNarrative: text,
        extractedData: nlp.extracted,
        questionId: "q_problem_area"
      };
    }

    // 3. If standard multiple choice question, match against options or question type
    if (currentQuestion.options && currentQuestion.options.length > 0) {
      const lower = text.toLowerCase();
      
      // Match option text directly
      for (const opt of currentQuestion.options) {
        const optText = (opt.label || "").toLowerCase();
        if (optText && (lower.includes(optText) || optText.includes(lower))) {
          const payload = { questionId: currentQuestion.id };
          if (currentQuestion.field) payload[currentQuestion.field] = opt.id;
          else if (currentQuestion.type === "duration") payload.duration = opt.id;
          else if (currentQuestion.type === "severity") payload.severity = opt.score !== undefined ? opt.score : opt.id;
          else payload.answer = opt.id;
          return payload;
        }
      }

      // Fallback to question parser
      const parsed = this.parseQuestionAnswer(text, currentQuestion.field || currentQuestion.id);
      if (parsed !== null && parsed !== undefined) {
        const payload = { questionId: currentQuestion.id };
        if (currentQuestion.field) payload[currentQuestion.field] = parsed;
        else payload.answer = parsed;
        return payload;
      }
    }

    // 4. Fallback: extract entities from whatever patient said
    const nlp = extractClinicalEntities(text);
    return {
      patientNarrative: text,
      extractedData: nlp.extracted,
      questionId: currentQuestion?.id
    };
  }
}

export const speechService = new SpeechService();
