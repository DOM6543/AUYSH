/**
 * Conversational Speech Recognition (ASR), Text-to-Speech (TTS),
 * and Multilingual Clinical Speech Parsing Service
 * 
 * Provides:
 * - Browser Web Speech API ASR wrapper across 8 Indian languages
 * - SpeechSynthesis TTS voice prompt player
 * - Deterministic Multilingual Clinical Speech Intent & Entity Parser
 * - Fallback to 1-touch interaction
 */

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

class SpeechService {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.synth = typeof window !== "undefined" ? window.speechSynthesis : null;
    this.initRecognition();
  }

  initRecognition() {
    if (typeof window === "undefined") return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.maxAlternatives = 1;
    }
  }

  /**
   * Start listening to microphone input
   * @param {Object} options - { lang: string, onResult: (text, isFinal) => void, onError: (err) => void, onEnd: () => void }
   */
  startListening({ lang = "en", onResult, onError, onEnd }) {
    if (!this.recognition) {
      this.initRecognition();
    }

    if (!this.recognition) {
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

        const transcript = finalTranscript || interimTranscript;
        if (onResult) {
          onResult(transcript, Boolean(finalTranscript));
        }
      };

      this.recognition.onerror = (event) => {
        console.warn("Speech recognition event error:", event.error);
        this.isListening = false;
        if (onError) onError(event);
      };

      this.recognition.onend = () => {
        this.isListening = false;
        if (onEnd) onEnd();
      };

      this.recognition.start();
      this.isListening = true;
    } catch (err) {
      console.warn("Speech recognition start failed:", err);
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

  /**
   * Text-to-Speech voice prompt synthesis
   */
  speakText(text, lang = "en") {
    if (!this.synth || !text) return;
    try {
      this.synth.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = SPEECH_LANG_MAP[lang] || "en-IN";
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      this.synth.speak(utterance);
    } catch (e) {
      console.warn("TTS playback fallback:", e);
    }
  }

  /**
   * Deterministic Multilingual Clinical Speech Intent Parser
   * Extracts body region, duration, severity, and HPI character from speech in 8 languages
   */
  parseClinicalSpeechIntent(rawTranscript = "") {
    const text = rawTranscript.toLowerCase();
    const result = {
      detectedIntent: "UNKNOWN",
      bodyRegion: null,
      duration: null,
      painScore: null,
      stream: null,
      hpiCharacter: null,
      hpiRadiation: null
    };

    if (!text) return result;

    // 1. Medicine Stream
    if (/ayush|ayurved|herbal|dawa|prakriti/i.test(text)) result.stream = "ayush";
    else if (/allopath|modern|doctor|english/i.test(text)) result.stream = "allopathic";
    else if (/both|integrative|dono/i.test(text)) result.stream = "integrative";

    // 2. Multilingual Body Region Recognition (English, Hindi, Tamil, Telugu, Kannada, Bengali, Marathi, Gujarati)
    if (/chest|chhati|nenju|edeyalli|buk|hrudaya|heart|dil|dharkan/i.test(text)) {
      result.bodyRegion = "chest";
      result.detectedIntent = "CHIEF_COMPLAINT_SELECTION";
    } else if (/stomach|pet|vayiru|hotte|pethe|pot|acid|gas|vomit|regurgitation/i.test(text)) {
      result.bodyRegion = "stomach";
      result.detectedIntent = "CHIEF_COMPLAINT_SELECTION";
    } else if (/head|sir|thalai|thale|matha|dok|aankh|eye|dizzy|chakkar/i.test(text)) {
      result.bodyRegion = "head";
      result.detectedIntent = "CHIEF_COMPLAINT_SELECTION";
    } else if (/knee|leg|ghutna|kaal|mookkalu|paay|joint|sandhi/i.test(text)) {
      result.bodyRegion = "knees";
      result.detectedIntent = "CHIEF_COMPLAINT_SELECTION";
    } else if (/throat|gala|thondai|gonthu|kasa|cough|khansi|cold|sore/i.test(text)) {
      result.bodyRegion = "throat";
      result.detectedIntent = "CHIEF_COMPLAINT_SELECTION";
    } else if (/back|kamar|mudhugu|bennu|peeth|spine|lumbar/i.test(text)) {
      result.bodyRegion = "back";
      result.detectedIntent = "CHIEF_COMPLAINT_SELECTION";
    } else if (/skin|khujli|tholu|charm|rash|itch|allergy/i.test(text)) {
      result.bodyRegion = "skin";
      result.detectedIntent = "CHIEF_COMPLAINT_SELECTION";
    }

    // 3. Multilingual Duration Recognition
    if (/today|aaj|innikku|indu|ajke|1 day/i.test(text)) result.duration = "today";
    else if (/2 days|3 days|few days|do teen din|rendu naal/i.test(text)) result.duration = "fewDays";
    else if (/week|hafte|vaaram|sapthaha/i.test(text)) result.duration = "weeks";
    else if (/month|mahine|maasam|masam/i.test(text)) result.duration = "month";

    // 4. Multilingual Severity / Pain Score
    if (/severe|bahut zyada|romba adhigam|tivra|unbearable|10/i.test(text)) result.painScore = 8;
    else if (/moderate|theek|medium|4|5/i.test(text)) result.painScore = 4;
    else if (/mild|halka|thora|2|little/i.test(text)) result.painScore = 2;

    // 5. HPI Character & Radiation
    if (/crush|heavy|heaviness|dabav|bhaari/i.test(text)) result.hpiCharacter = "heaviness";
    if (/burn|burning|jalan|erichal/i.test(text)) result.hpiCharacter = "burning";
    if (/sharp|stabbing|suji/i.test(text)) result.hpiCharacter = "sharp";

    if (/arm|jaw|left hand|bhuja|kai/i.test(text)) result.hpiRadiation = "left_arm_jaw";
    if (/back|blade|peeth/i.test(text)) result.hpiRadiation = "back_blades";

    return result;
  }
}

export const speechService = new SpeechService();
