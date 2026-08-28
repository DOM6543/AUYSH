/**
 * Adaptive Clinical Interview Engine for MediKiosk
 * 
 * Dynamically determines the next most clinically relevant question based on:
 * 1. Patient's selected language
 * 2. Patient's selected treatment system (Ayurveda, Siddha, Unani, Homeopathy, Yoga & Naturopathy)
 * 3. Patient's selected problem/body area (Chest, Head, Stomach, Joint/Knee, Breathing, Skin, Urinary, Fever, Pain somewhere else)
 * 4. Patient's spoken description & NLP extracted entities (Skips questions whose answers are already known!)
 * 5. Previous answers & safety triage rules
 * 
 * NEVER asks fixed questionnaires or unrelated questions.
 * Early Exit / Completion when sufficient clinical information is collected.
 */

import { PROBLEM_AREAS, DURATION_OPTIONS, PAIN_SEVERITY_OPTIONS, PAST_CONDITION_OPTIONS } from "./interviewDefinitions/commonQuestions";
import { COMPLAINT_TREES } from "./interviewDefinitions/complaintTrees";
import { TREATMENT_SYSTEM_TREES } from "./interviewDefinitions/treatmentSystemTrees";
import { extractClinicalEntities } from "./nlpClinicalExtractor";

export function createInitialInterviewState(treatmentSystem = "AYURVEDA", initialLang = "en") {
  return {
    language: initialLang,
    treatmentSystem: treatmentSystem || "AYURVEDA",
    bodyArea: null,            // "chest", "head", "stomach", "joint", "breathing", "skin", "urinary", "fever", "pain_other"
    specificSite: null,        // "knee", "shoulder", "back_spine", etc.
    side: null,                // "Right", "Left", "Bilateral"
    patientNarrative: "",      // Patient's verbatim description
    extractedData: {},         // Structured data extracted from narrative
    character: null,           // Character/quality of discomfort
    radiation: null,           // Radiation path
    duration: null,            // Duration code
    durationText: "",          // Formatted duration
    severity: null,            // Pain score (0 to 10)
    aggravatingFactors: null,
    relievingFactors: null,
    associatedSymptoms: [],
    pastConditions: [],
    dailyMeds: null,
    allergies: null,
    systemSpecific: {},        // Tailored answers for the chosen treatment system
    isSafetyTriggered: false,
    safetyAlert: null,
    isComplete: false,
    answeredQuestionIds: []
  };
}

/**
 * Updates interview state with a new answer (From either Voice or Touch)
 */
export function updateInterviewState(currentState, answerPayload = {}) {
  const updated = { ...currentState };

  // 1. Spoken narrative ingestion & automatic NLP entity extraction
  if (answerPayload.patientNarrative !== undefined) {
    updated.patientNarrative = answerPayload.patientNarrative;
    const { extracted } = extractClinicalEntities(answerPayload.patientNarrative);
    updated.extractedData = { ...updated.extractedData, ...extracted };

    // Auto-populate state fields if discovered from sentence
    if (extracted.bodyArea && !updated.bodyArea) updated.bodyArea = extracted.bodyArea;
    if (extracted.specificSite && !updated.specificSite) updated.specificSite = extracted.specificSite;
    if (extracted.side && !updated.side) updated.side = extracted.side;
    if (extracted.duration && !updated.duration) {
      updated.duration = extracted.duration;
      updated.durationText = extracted.durationText;
    }
    if (extracted.character && !updated.character) updated.character = extracted.character;
    if (extracted.aggravatingFactors && !updated.aggravatingFactors) updated.aggravatingFactors = extracted.aggravatingFactors;
    if (extracted.severity !== undefined && updated.severity === null) updated.severity = extracted.severity;
  }

  // 2. Direct field updates (from touch cards or targeted speech responses)
  if (answerPayload.bodyArea !== undefined) updated.bodyArea = answerPayload.bodyArea;
  if (answerPayload.specificSite !== undefined) updated.specificSite = answerPayload.specificSite;
  if (answerPayload.side !== undefined) updated.side = answerPayload.side;
  if (answerPayload.character !== undefined) updated.character = answerPayload.character;
  if (answerPayload.radiation !== undefined) updated.radiation = answerPayload.radiation;
  if (answerPayload.duration !== undefined) {
    updated.duration = answerPayload.duration;
    const opt = DURATION_OPTIONS.find((d) => d.id === answerPayload.duration);
    if (opt) updated.durationText = opt.label.en;
  }
  if (answerPayload.severity !== undefined) updated.severity = Number(answerPayload.severity);
  if (answerPayload.aggravatingFactors !== undefined) updated.aggravatingFactors = answerPayload.aggravatingFactors;
  if (answerPayload.relievingFactors !== undefined) updated.relievingFactors = answerPayload.relievingFactors;
  if (answerPayload.associatedSymptoms !== undefined) {
    updated.associatedSymptoms = Array.isArray(answerPayload.associatedSymptoms)
      ? answerPayload.associatedSymptoms
      : [answerPayload.associatedSymptoms];
  }
  if (answerPayload.pastConditions !== undefined) {
    updated.pastConditions = Array.isArray(answerPayload.pastConditions)
      ? answerPayload.pastConditions
      : [answerPayload.pastConditions];
  }
  if (answerPayload.dailyMeds !== undefined) updated.dailyMeds = Boolean(answerPayload.dailyMeds);
  if (answerPayload.allergies !== undefined) updated.allergies = Boolean(answerPayload.allergies);

  // System-specific fields (e.g. agni, prakriti, theham, valimai, mizaj, thermal, activity, stress, etc.)
  if (answerPayload.systemSpecific !== undefined) {
    updated.systemSpecific = { ...updated.systemSpecific, ...answerPayload.systemSpecific };
  }

  if (answerPayload.questionId) {
    if (!updated.answeredQuestionIds.includes(answerPayload.questionId)) {
      updated.answeredQuestionIds = [...updated.answeredQuestionIds, answerPayload.questionId];
    }
  }

  // 3. Safety Override Evaluation
  evaluateSafetyFlags(updated);

  return updated;
}

/**
 * Safety & Red-Flag Rule Evaluator
 */
function evaluateSafetyFlags(state) {
  // Dangerous cardiac signs
  if (
    state.bodyArea === "chest" &&
    (state.radiation === "left_arm_jaw" || state.radiation === "back_blades" || state.extractedData?.associatedSweat)
  ) {
    state.isSafetyTriggered = true;
    state.safetyAlert = "Suspected Acute Coronary Syndrome (ACS) with radiation or cold sweat";
  }

  // Severe air hunger / stroke / acute abdomen
  if (state.character === "thunderclap" || state.associatedSymptoms?.includes("weakness_speech")) {
    state.isSafetyTriggered = true;
    state.safetyAlert = "Acute Neurological Deficit / Stroke protocol priority";
  }

  if (state.associatedSymptoms?.includes("blood_present") || state.character === "blood_in_urine") {
    state.isSafetyTriggered = true;
    state.safetyAlert = "Acute bleeding sign reported";
  }
}

/**
 * Dynamic Next-Question Resolver
 * Returns the single next most clinically relevant question object, or null if interview is complete.
 */
export function getNextDynamicQuestion(state) {
  const lang = state.language || "en";

  // STEP 1: If Problem Area is not selected -> Ask "What is troubling you?"
  if (!state.bodyArea) {
    return {
      id: "q_problem_area",
      type: "problem_area",
      title: getLocalizedPrompt("What is troubling you?", lang, {
        en: "What is troubling you?",
        ta: "உங்களுக்கு என்ன பிரச்சனை அல்லது வலி உள்ளது?",
        hi: "आपको क्या परेशानी या तकलीफ है?",
        te: "మీకు ఎలాంటి సమస్య లేదా బాధ ఉంది?",
        kn: "ನಿಮಗೆ ಯಾವ ತೊಂದರೆ ಅಥವಾ ನೋವು ಇದೆ?",
        bn: "আপনার কী সমস্যা বা কষ্ট হচ্ছে?",
        mr: "आपणास काय त्रास किंवा वेदना आहे?",
        gu: "આપને શું તકલીફ અથવા દુખાવો છે?"
      }),
      audioText: getLocalizedPrompt("What is troubling you? Touch your problem area below or speak into the microphone.", lang, {
        en: "What is troubling you? Touch your problem area below or speak.",
        ta: "உங்களுக்கு என்ன பிரச்சனை உள்ளது? கீழே உள்ள படத்தை தொடவும் அல்லது பேசவும்.",
        hi: "आपको क्या परेशानी है? नीचे दिए गए चित्र को स्पर्श करें या बोलकर बताएं।",
        te: "మీకు ఎలాంటి సమస్య ఉంది? చిత్రాన్ని తాకండి లేదా మాట్లాడండి.",
        kn: "ನಿಮಗೆ ಏನು ತೊಂದರೆ ಇದೆ? ಚಿತ್ರವನ್ನು ಸ್ಪರ್ಶಿಸಿ ಅಥವಾ ಮಾತನಾಡಿ.",
        bn: "আপনার কী সমস্যা হচ্ছে? ছবিতে স্পর্শ করুন বা কথা বলুন।",
        mr: "आपणास काय त्रास आहे? चित्राला स्पर्श करा किंवा बोला.",
        gu: "આપને શું તકલીફ છે? ચિત્ર પર સ્પર્શ કરો અથવા બોલો."
      }),
      options: PROBLEM_AREAS.map((item) => ({
        id: item.id,
        icon: item.icon,
        label: item.label[lang] || item.label.en
      }))
    };
  }

  // STEP 2: Capture the patient's own natural description if not captured yet
  if (!state.patientNarrative && !state.answeredQuestionIds.includes("q_patient_narrative")) {
    const areaName = PROBLEM_AREAS.find((a) => a.id === state.bodyArea)?.label[lang] || state.bodyArea;
    return {
      id: "q_patient_narrative",
      type: "open_description",
      title: getLocalizedPrompt(`Please describe your ${areaName}`, lang, {
        en: `Please tell me what is troubling your ${areaName}`,
        ta: `உங்கள் ${areaName} பற்றி விவரமாக சொல்லுங்கள்`,
        hi: `कृपया अपने ${areaName} की परेशानी के बारे में बताएं`,
        te: `దయచేసి మీ ${areaName} సమస్య గురించి చెప్పండి`,
        kn: `ದಯವಿಟ್ಟು ನಿಮ್ಮ ${areaName} ತೊಂದರೆಯ ಬಗ್ಗೆ ತಿಳಿಸಿ`,
        bn: `অনুগ্রহ করে আপনার ${areaName} সম্পর্কে বলুন`,
        mr: `कृपया आपल्या ${areaName} च्या त्रासाबद्दल सांगा`,
        gu: `કૃપા કરીને આપના ${areaName} ની તકલીફ વિશે જણાવો`
      }),
      audioText: getLocalizedPrompt(`Please tell me what is troubling you. Speak naturally into the microphone or touch the cards.`, lang, {
        en: "Please tell me what is troubling you. Speak naturally into the microphone or touch the cards.",
        ta: "உங்களுக்கு என்ன பிரச்சனை என்று மைக்ரோஃபோனில் பேசுங்கள் அல்லது கீழே தொடவும்.",
        hi: "कृपया बताएं कि आपको क्या तकलीफ है। माइक में बोलकर बताएं या नीचे स्पर्श करें।",
        te: "మీకు ఎలాంటి సమస్య ఉందో మైక్‌లో మాట్లాడండి లేదా కింద తాకండి.",
        kn: "ನಿಮಗೆ ಏನು ತೊಂದರೆ ಇದೆ ಎಂದು ಮೈಕ್‌ನಲ್ಲಿ ಮಾತನಾಡಿ ಅಥವಾ ಕೆಳಗೆ ಸ್ಪರ್ಶಿಸಿ.",
        bn: "কী সমস্যা হচ্ছে মাইকে কথা বলুন অথবা নিচে স্পর্শ করুন।",
        mr: "आपणास काय त्रास होत आहे ते माइकवर बोला किंवा खाली स्पर्श करा.",
        gu: "આપને શું તકલીફ છે તે માઇકમાં બોલો અથવા નીચે સ્પર્શ કરો."
      }),
      options: [
        {
          id: "speak_now",
          icon: "🎤",
          label: {
            en: "Speak Your Complaint Naturally",
            ta: "இயல்பாக உங்கள் பிரச்சனையை பேசுங்கள்",
            hi: "बोलकर अपनी तकलीफ बताएं",
            te: "సహజంగా మాట్లాడండి",
            kn: "ಸ್ವಾಭಾವಿಕವಾಗಿ ಮಾತನಾಡಿ",
            bn: "স্বাভাবিকভাবে কথা বলুন",
            mr: "सहजपणे बोलून सांगा",
            gu: "સરળતાથી બોલીને કહો"
          }[lang]
        }
      ]
    };
  }

  // STEP 3: Body-Specific Tree Questions (Filtered dynamically!)
  const complaintTree = COMPLAINT_TREES[state.bodyArea] || COMPLAINT_TREES.pain_other;
  if (complaintTree && complaintTree.questions) {
    for (const q of complaintTree.questions) {
      // If this question's field is already known (e.g. extracted via NLP), SKIP IT!
      const isFieldAnswered = state[q.field] !== null && state[q.field] !== undefined && state[q.field] !== "";
      const isQuestionLogged = state.answeredQuestionIds.includes(q.id);

      if (!isFieldAnswered && !isQuestionLogged) {
        return {
          id: q.id,
          type: "body_specific",
          field: q.field,
          title: q.prompt[lang] || q.prompt.en,
          audioText: q.prompt[lang] || q.prompt.en,
          options: q.options.map((opt) => ({
            id: opt.id,
            icon: opt.icon,
            redFlag: opt.redFlag || false,
            label: opt.label[lang] || opt.label.en
          }))
        };
      }
    }
  }

  // STEP 4: Duration (If not already known)
  if (!state.duration && !state.answeredQuestionIds.includes("q_duration")) {
    return {
      id: "q_duration",
      type: "duration",
      field: "duration",
      title: getLocalizedPrompt("How long have you had this problem?", lang, {
        en: "How long have you had this problem?",
        ta: "எவ்வளவு காலமாக இந்த பிரச்சனை உள்ளது?",
        hi: "यह समस्या कितने समय से है?",
        te: "ఈ సమస్య ఎంతకాలంగా ఉంది?",
        kn: "ಈ ಸಮಸ್ಯೆ ಎಷ್ಟು ಸಮಯದಿಂದ ಇದೆ?",
        bn: "কতদিন ধরে এই समस्या?",
        mr: "हा त्रास किती दिवसांपासून आहे?",
        gu: "આ સમસ્યા કેટલા સમયથી છે?"
      }),
      audioText: getLocalizedPrompt("How long have you had this problem?", lang, {
        en: "How long have you had this problem?",
        ta: "எவ்வளவு காலமாக இந்த பிரச்சனை உள்ளது?",
        hi: "यह समस्या कितने समय से है?",
        te: "ఈ సమస్య ఎంతకాలంగా ఉంది?",
        kn: "ಈ ಸಮಸ್ಯೆ ಎಷ್ಟು ಸಮಯದಿಂದ ಇದೆ?",
        bn: "কতদিন ধরে এই समस्या?",
        mr: "हा त्रास किती दिवसांपासून आहे?",
        gu: "આ સમસ્યા કેટલા સમયથી છે?"
      }),
      options: DURATION_OPTIONS.map((opt) => ({
        id: opt.id,
        icon: opt.icon,
        label: opt.label[lang] || opt.label.en
      }))
    };
  }

  // STEP 5: Pain Severity Level (If not already known)
  if (state.severity === null && !state.answeredQuestionIds.includes("q_severity")) {
    return {
      id: "q_severity",
      type: "severity",
      field: "severity",
      title: getLocalizedPrompt("Is the pain mild, medium or severe?", lang, {
        en: "Is the pain mild, medium or severe?",
        ta: "வலி லேசானதா, நடுத்தரமானதா அல்லது தீவிரமானதா?",
        hi: "दर्द हल्का, मध्यम या तेज है?",
        te: "నొప్పి తేలికపాటిదా, మధ్యస్థమా లేదా తీవ్రమైనదా?",
        kn: "ನೋವು ಸೌಮ್ಯವೇ, ಮಧ್ಯಮವೇ ಅಥವಾ ತೀವ್ರವೇ?",
        bn: "ব্যথা হালকা, মাঝারি নাকি তীব্র?",
        mr: "वेदना सौम्य, मध्यम की तीव्र आहे?",
        gu: "દુખાવો હળવો, મધ્યમ કે તીવ્ર છે?"
      }),
      audioText: getLocalizedPrompt("Is the pain mild, medium or severe? Touch the face that best shows your pain.", lang, {
        en: "Is the pain mild, medium or severe? Touch the face that shows your pain.",
        ta: "வலி லேசானதா, நடுத்தரமானதா அல்லது தீவிரமானதா? முகக்குறியைத் தொடவும்.",
        hi: "दर्द हल्का, मध्यम या तेज है? चेहरे को स्पर्श करें।",
        te: "నొప్పి తీవ్రతను ఎంచుకోండి.",
        kn: "ನೋವಿನ ತೀವ್ರತೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ.",
        bn: "ব্যথার মাত্রা নির্বাচন করুন।",
        mr: "वेदनेची तीव्रता निवडा.",
        gu: "દુખાવાનું સ્તર પસંદ કરો."
      }),
      options: PAIN_SEVERITY_OPTIONS.map((opt) => ({
        id: opt.id,
        score: opt.score,
        icon: opt.icon,
        label: opt.label[lang] || opt.label.en
      }))
    };
  }

  // STEP 6: Pre-existing Conditions (If not asked yet)
  if ((!state.pastConditions || state.pastConditions.length === 0) && !state.answeredQuestionIds.includes("q_past_conditions")) {
    return {
      id: "q_past_conditions",
      type: "past_conditions",
      field: "pastConditions",
      title: getLocalizedPrompt("Do you have any existing health conditions?", lang, {
        en: "Do you have any existing health conditions?",
        ta: "முந்தைய உடல்நல பிரச்சனைகள் ஏதேனும் உள்ளதா?",
        hi: "क्या आपको पहले से कोई बीमारी है?",
        te: "మీకు మునుపటి సమస్యలు ఏమైనా ఉన్నాయా?",
        kn: "ಹಿಂದಿನ ಕಾಯಿಲೆಗಳಿವೆಯೇ?",
        bn: "আগের কোনো রোগ আছে কি?",
        mr: "मागील काही आजार आहेत का?",
        gu: "અગાઉની કોઈ બીમારી છે?"
      }),
      audioText: getLocalizedPrompt("Do you have any existing health conditions like BP or sugar?", lang, {
        en: "Do you have any existing health conditions like blood pressure or diabetes?",
        ta: "உங்களுக்கு இரத்த அழுத்தம் அல்லது சர்க்கரை போன்ற பிரச்சனைகள் உள்ளதா?",
        hi: "क्या आपको बीपी या शुगर जैसी कोई पुरानी बीमारी है?",
        te: "మీకు బీపీ లేదా షుగర్ వంటి సమస్యలు ఉన్నాయా?",
        kn: "ನಿಮಗೆ ಬಿಪಿ ಅಥವಾ ಶುಗರ್ ನಂತಹ ತೊಂದರೆಗಳು ಇವೆಯೇ?",
        bn: "আপনার কি প্রেসার বা সুগারের মতো রোগ আছে?",
        mr: "आपणास बीपी किंवा शुगरसारखा आजार आहे का?",
        gu: "શું આપને બીપી કે ડાયાબિટીસ જેવી બીમારી છે?"
      }),
      options: PAST_CONDITION_OPTIONS.map((opt) => ({
        id: opt.id,
        icon: opt.icon,
        label: opt.label[lang] || opt.label.en
      }))
    };
  }

  // STEP 7: Treatment-System Tailored Questions (Only 1-2 relevant dimensions!)
  const systemTree = TREATMENT_SYSTEM_TREES[state.treatmentSystem];
  if (systemTree && systemTree.questions) {
    for (const q of systemTree.questions) {
      const isFieldAnswered = state.systemSpecific && state.systemSpecific[q.field] !== undefined;
      const isQuestionLogged = state.answeredQuestionIds.includes(q.id);

      if (!isFieldAnswered && !isQuestionLogged) {
        return {
          id: q.id,
          type: "treatment_system_specific",
          system: state.treatmentSystem,
          field: q.field,
          title: q.prompt[lang] || q.prompt.en,
          audioText: q.prompt[lang] || q.prompt.en,
          options: q.options.map((opt) => ({
            id: opt.id,
            icon: opt.icon,
            label: opt.label[lang] || opt.label.en
          }))
        };
      }
    }
  }

  // STEP 8: Interview is Complete! Sufficient relevant information has been collected.
  return null;
}

/**
 * Helper to get localized prompt string
 */
function getLocalizedPrompt(defaultEn, lang, dict = {}) {
  return dict[lang] || dict.en || defaultEn;
}
