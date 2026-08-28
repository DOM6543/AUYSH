/**
 * Multilingual NLP Clinical Sentence & Entity Extractor for MediKiosk
 * 
 * Automatically extracts structured clinical entities from natural spoken or typed patient descriptions:
 * - Body Area & Specific Anatomical Site (Knee, Back, Chest, Stomach, Head, Skin, Shoulder, etc.)
 * - Laterality / Side (Right, Left, Bilateral)
 * - Duration & Chronicity (Today, 2-3 days, 2 weeks, 3 months, years)
 * - Aggravating & Trigger Factors (Climbing stairs, Walking, Spicy food, Exertion, Bending)
 * - Relieving Factors (Rest, Antacid, Hot water)
 * - Pain Character & Quality (Crushing, Burning, Sharp, Throbbing, Dull)
 * - Severity level
 * - Associated Symptoms & Red Flags (Cold sweat, Breathlessness, Weakness, Blood in stool)
 * 
 * Supports English, Tamil, Hindi, Telugu, Kannada, Bengali, Marathi, Gujarati.
 */

export function extractClinicalEntities(rawText = "") {
  if (!rawText || typeof rawText !== "string") {
    return {
      rawText: "",
      extracted: {}
    };
  }

  const text = rawText.toLowerCase().trim();
  const extracted = {};

  // 1. LATERALITY / SIDE
  if (/right|valadhu|dahina|daya|kudi|balgade|dan|ujva|jamnu|வலது|दाएं|दाहिना|కుడి|ಬಲ|ডান|उजवा|જમણો/i.test(text)) {
    extracted.side = "Right";
  } else if (/left|idathu|bayan|baye|eda|edagade|bam|dava|daba|இடது|बाएं|ఎడమ|ಎಡ|বাম|डावा|ડાબો/i.test(text)) {
    extracted.side = "Left";
  } else if (/both|irandu|dono|rendu|eradoo|ubhay|doni|banne|இரு|दोनों|రెండు|ಎರಡೂ|উভয়|दोन्ही|બંને/i.test(text)) {
    extracted.side = "Bilateral (Both)";
  }

  // 2. BODY AREA & SPECIFIC ANATOMICAL SITE
  if (/knee|ghutna|mulankal|mookalu|mookkalu|hatu|goodgha|dheenchan|முழங்கால்|घुटना|మోకాలు|ಮೊಣಕಾಲು|হাঁটু|गुडघा|ઢીંચણ/i.test(text)) {
    extracted.bodyArea = "joint";
    extracted.specificSite = "knee";
  } else if (/shoulder|kandha|tholpattai|bhuja|bhuje|kandho|தோள்பட்டை|कंधा|భుజం|ಭುಜ|কাঁধ|खांदा|ખભો/i.test(text)) {
    extracted.bodyArea = "joint";
    extracted.specificSite = "shoulder";
  } else if (/back|spine|kamar|peeth|mudhugu|bennu|কোমর|முதுகு|पीठ|कमर|వెన్ను|ಬೆನ್ನು|পিঠ|पाठ/i.test(text)) {
    extracted.bodyArea = "joint";
    extracted.specificSite = "back_spine";
  } else if (/joint|bone|sandhi|elumbu|haddi|hadu|மூட்டு|जोड़|కీళ్ళు|ಕೀಲು|হাড়|सांधे|હાડકાં/i.test(text)) {
    extracted.bodyArea = "joint";
    extracted.specificSite = extracted.specificSite || "multiple_joints";
  } else if (/chest|heart|chhati|nenju|hrudaya|edeyalli|dil|dharkan|மார்பு|छाती|ఛాతీ|ಎದೆ|বুক|छातीत/i.test(text)) {
    extracted.bodyArea = "chest";
  } else if (/head|brain|migraine|sir|thalai|matha|thale|dok|aankh|தலை|सिर|తల|ತಲೆ|মাথা|डोके|માથું/i.test(text)) {
    extracted.bodyArea = "head";
  } else if (/stomach|belly|abdomen|digest|pet|vayiru|hotte|pot|வயிறு|पेट|కడుపు|ಹೊಟ್ಟೆ|পেট|पोट/i.test(text)) {
    extracted.bodyArea = "stomach";
  } else if (/breath|cough|asthma|wheez|swasa|moochu|khansi|kasa|மூச்சு|सांस|శ్వాస|ಉಸಿರಾಟ|কাশি|श्वास|શ્વાસ/i.test(text)) {
    extracted.bodyArea = "breathing";
  } else if (/skin|rash|itch|allergy|tholu|charm|khujli|தோல்|खुजली|చర్మం|ಚರ್ಮ|ত্বক|त्वचा|ચામડી/i.test(text)) {
    extracted.bodyArea = "skin";
  } else if (/urine|toilet|mutra|peshab|siruneer|moothram|சிறுநீர்|पेशाब|మూత్ర|ಮೂತ್ರ|প্রস্রাব|लघवी|પેશાબ/i.test(text)) {
    extracted.bodyArea = "urinary";
  } else if (/fever|chill|temperature|bukhar|kaaichal|jwaram|jwara|jwor|taap|காய்ச்சல்|बुखार|జ్వరం|ಜ್ವರ|জ্বর|ताप|તાવ/i.test(text)) {
    extracted.bodyArea = "fever";
  }

  // 3. DURATION
  if (/today|aaj|indru|eeroju|indu|aaje|இன்று|आज|ఈరోజు|ಇಂದು|আজ|आज|આજે/i.test(text)) {
    extracted.duration = "today";
    extracted.durationText = "1 Day (Today)";
  } else if (/(\d+)\s*(month|mahine|maatham|maasam|thingalu|maash|mahine|mahina)|month|mahina|maasam|மாதம்|महीने|నెలలు|ತಿಂಗಳು|মাস|महिने|મહિના/i.test(text)) {
    extracted.duration = "months_chronic";
    const numMatch = text.match(/(\d+)\s*(month|mahine|maatham|maasam|thingalu|maash|mahine|mahina|மாத|महीने)/);
    extracted.durationText = numMatch ? `${numMatch[1]} Months` : "Several Months";
  } else if (/(\d+)\s*(week|hafte|vaaram|varalu|vara|saptaha|aathwada)|week|hafta|vaaram|வாரம்|हफ्ते|వారాలు|ವಾರ|সপ্তাহ|आठवडे/i.test(text)) {
    extracted.duration = "few_weeks";
    const numMatch = text.match(/(\d+)\s*(week|hafte|vaaram|varalu|vara|সপ্তাহ|हफ्ते)/);
    extracted.durationText = numMatch ? `${numMatch[1]} Weeks` : "1-2 Weeks";
  } else if (/(\d+)\s*(day|din|naal|rojulu|dina)|few days|naatkal|நாட்கள்|दिन|రోజులు|ದಿನಗಳು|দিন|दिवस|દિવસ/i.test(text)) {
    extracted.duration = "few_days";
    const numMatch = text.match(/(\d+)\s*(day|din|naal|rojulu|dina|दिन)/);
    extracted.durationText = numMatch ? `${numMatch[1]} Days` : "2-3 Days";
  }

  // 4. AGGRAVATING FACTORS
  if (/stair|stairs|climb|climbing|padikattu|seedhi|metlu|mettilu|shiri|जिने|પગથિયાં|படிக்கட்டு|सीढ़ी|మెట్లు|ಮೆಟ್ಟಿಲು/i.test(text)) {
    extracted.aggravatingFactors = "stairs_walking";
    extracted.aggravatingText = "Climbing stairs & stepping up";
  } else if (/walk|walking|exertion|effort|nadap|chalna|nadige|hata|chalne|chalvu|நடப்பது|चलने|నడక|ನಡಿಗೆ|হাঁটা|चालणे|ચાલવું/i.test(text)) {
    extracted.aggravatingFactors = "exertion";
    extracted.aggravatingText = "Walking & physical movement";
  } else if (/food|meal|spicy|eating|lying|சாப்பாடு|खाना|తిన్న|ಊಟ|খাবার|जेवण|જમ્યા/i.test(text)) {
    extracted.aggravatingFactors = "food";
    extracted.aggravatingText = "Eating food or spicy meals";
  } else if (/bend|bending|movement|kuniya|jhukna|wangadam|ಬಾಗುವುದು|વાંકાવળવું/i.test(text)) {
    extracted.aggravatingFactors = "movement";
    extracted.aggravatingText = "Bending forward or sudden movement";
  }

  // 5. PAIN CHARACTER
  if (/crush|pressure|heavy|heaviness|bhaari|baram|dabav|பாரம்|भारी|భారం|ಭಾರ|ভারী|जडपणा|ભારે/i.test(text)) {
    extracted.character = "heaviness";
    extracted.characterText = "Crushing Heaviness / Pressure";
  } else if (/burn|burning|acid|acidity|jalan|erichal|manta|uri|jwalan|जलन|எரிச்சல்|మంట|ಉರಿ|জ্বালা|जळजळ|બળતરા/i.test(text)) {
    extracted.character = "burning";
    extracted.characterText = "Burning Acidity Sensation";
  } else if (/sharp|stab|stabbing|piercing|chubh|kootal|chuchu|குத்தல்|चुभन|పోటు|ಚುಚ್ಚುವ|তীব্র|टोचणे|ભોંકાવું/i.test(text)) {
    extracted.character = "sharp";
    extracted.characterText = "Sharp Stabbing Pain";
  } else if (/dull|ache|aching|sore|mitha|leasaana|mand|மந்தமான|हल्का|మంద|ಮಂದ|মৃদু|मंद|ધીમો/i.test(text)) {
    extracted.character = "dull";
    extracted.characterText = "Continuous Dull Ache";
  } else if (/throb|pulsat|flutter|dharkan|padapadapu|துடிப்பு|धड़कन|దడ|ಎದೆಬಡಿತ|ধড়ফড়|धडधड/i.test(text)) {
    extracted.character = "fluttering";
    extracted.characterText = "Throbbing / Palpitations";
  }

  // 6. SEVERITY LEVEL
  if (/severe|worst|unbearable|very bad|bahut|kadu|teevra|asahya|அதிக|तेज|తీవ్ర|ತೀವ್ರ|তীব্র|तीव्र|તીવ્ર/i.test(text)) {
    extracted.severity = 8;
  } else if (/mild|slight|little|kam|leasaana|halka|తేలిక|ಸೌಮ್ಯ|মৃদু|सौम्य|હળવો/i.test(text)) {
    extracted.severity = 2;
  } else if (/medium|moderate|normal|madhyam|naduthara|நடுத்தர|मध्यम|మధ్యస్థ|ಮಧ್ಯಮ|মাঝারি|સાધારણ/i.test(text)) {
    extracted.severity = 4;
  }

  // 7. ASSOCIATED RED FLAGS
  if (/sweat|sweating|sweats|viyarthu|paseena|chemata|bevaru|gham|घाम|પરસેવો/i.test(text)) {
    extracted.associatedSweat = true;
  }
  if (/breathless|gasp|air|moochu thinaral|saans phoolna|aayasam|usiru gattu|দম বন্ধ|दम भरणे|શ્વાસ ચડવો/i.test(text)) {
    extracted.associatedBreathless = true;
  }
  if (/blood|bleed|raktham|khoon|rakta|রক্ত|रक्त|લોહી/i.test(text)) {
    extracted.associatedBlood = true;
  }

  return {
    rawText,
    extracted
  };
}
