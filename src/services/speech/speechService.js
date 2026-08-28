/**
 * Speech Recognition (ASR) & Audio Voice Service
 * 
 * Provides an extensible abstraction for Indian-language Speech-to-Text (ASR).
 * Uses Web Speech API (webkitSpeechRecognition) natively in supported browsers
 * and defines a clean adapter interface for pluggable cloud ASR (Bhashini, Whisper, Google Cloud Speech).
 */

class SpeechService {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.currentLanguage = "en-IN";
    this.initRecognition();
  }

  /**
   * Language code mapping for Indian regional languages in Web Speech API
   */
  static LANGUAGE_MAP = {
    en: "en-IN",
    hi: "hi-IN",
    ta: "ta-IN",
    te: "te-IN",
    kn: "kn-IN",
    bn: "bn-IN",
    mr: "mr-IN",
    gu: "gu-IN"
  };

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
   * Checks if browser speech recognition (ASR) is supported
   */
  isSupported() {
    return typeof window !== "undefined" && Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  /**
   * Start listening for speech input
   * @param {Object} options
   * @param {string} options.lang - 2-letter language code ('en', 'hi', etc.)
   * @param {Function} options.onResult - callback with (transcript, isFinal)
   * @param {Function} options.onError - callback with (error)
   * @param {Function} options.onEnd - callback when listening terminates
   */
  startListening({ lang = "en", onResult, onError, onEnd }) {
    if (!this.recognition) {
      this.initRecognition();
    }

    if (!this.recognition) {
      if (onError) onError({ code: "not_supported", message: "Speech recognition not supported in this browser environment. Touch mode active." });
      return;
    }

    const locale = SpeechService.LANGUAGE_MAP[lang] || "en-IN";
    this.recognition.lang = locale;

    this.recognition.onstart = () => {
      this.isListening = true;
    };

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

      const text = finalTranscript || interimTranscript;
      if (onResult && text) {
        onResult(text.trim(), Boolean(finalTranscript));
      }
    };

    this.recognition.onerror = (event) => {
      this.isListening = false;
      if (onError) onError(event);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      if (onEnd) onEnd();
    };

    try {
      this.recognition.start();
    } catch (err) {
      console.warn("Speech recognition start warning:", err);
      if (onError) onError(err);
    }
  }

  /**
   * Stop active speech recognition
   */
  stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (err) {
        console.warn("Speech recognition stop warning:", err);
      }
      this.isListening = false;
    }
  }

  /**
   * Speaks prompt using browser Text-to-Speech (TTS)
   */
  speakText(text, lang = "en") {
    if (typeof window === "undefined" || !window.speechSynthesis || !text) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = SpeechService.LANGUAGE_MAP[lang] || "en-IN";
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn("TTS speech warning:", err);
    }
  }
}

export const speechService = new SpeechService();
