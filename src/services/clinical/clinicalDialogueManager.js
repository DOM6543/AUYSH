/**
 * Clinical Dialogue Manager & Adaptive History Engine
 * 
 * Provides an extensible clinical questioning framework across:
 * - Chief Complaint & Deep HPI (Character, Radiation, Aggravating & Relieving Factors, Associated Symptoms)
 * - Structured Past Medical & Surgical History
 * - Drug History with Dosages & Frequencies
 * - Allergy History with Reactions
 * - Family & Personal/Lifestyle History
 * - Extended AYUSH Dashavidha Pariksha Assessment
 */

export const HPI_DECISION_FRAMEWORK = {
  chest: {
    title: "Chest & Cardiovascular HPI",
    characterPrompt: "How would you describe the sensation in your chest?",
    characterOptions: [
      { id: "heaviness", label: "Crushing heaviness / Pressure", icon: "🫀", redFlag: true },
      { id: "burning", label: "Burning / Acidity sensation", icon: "🔥", redFlag: false },
      { id: "sharp", label: "Sharp stabbing catch on breath", icon: "⚡", redFlag: false },
      { id: "throbbing", label: "Pounding / Fluttering heartbeat", icon: "💓", redFlag: false }
    ],
    radiationPrompt: "Does the pain travel or radiate anywhere else?",
    radiationOptions: [
      { id: "left_arm_jaw", label: "Radiates to left arm, shoulder or jaw", icon: "⚠️", redFlag: true },
      { id: "back_blades", label: "Radiates straight through to upper back", icon: "🦴", redFlag: true },
      { id: "epigastric", label: "Moves down toward upper stomach", icon: "🫄", redFlag: false },
      { id: "none", label: "Localized in center/left with no spread", icon: "✅", redFlag: false }
    ],
    aggravatingPrompt: "What makes the pain or discomfort worse?",
    aggravatingOptions: [
      { id: "exertion", label: "Walking, stair climbing or physical effort", icon: "🚶", redFlag: true },
      { id: "post_food", label: "After meals or lying flat", icon: "🍽️", redFlag: false },
      { id: "deep_breath", label: "Taking a deep breath or coughing", icon: "🫁", redFlag: false },
      { id: "stress", label: "Mental stress or emotional anxiety", icon: "🧠", redFlag: false }
    ],
    relievingPrompt: "What brings relief or eases the sensation?",
    relievingOptions: [
      { id: "rest", label: "Complete resting / sitting down", icon: "🛋️" },
      { id: "antacid", label: "Antacids / drinking warm water", icon: "🥛" },
      { id: "medication", label: "Sublingual tablets / sorbitrate", icon: "💊" },
      { id: "nothing", label: "Nothing seems to relieve it", icon: "❌" }
    ],
    associatedPrompt: "Are you experiencing any of these associated symptoms?",
    associatedOptions: [
      { id: "cold_sweats", label: "Cold sweating / Diaphoresis", icon: "💦", redFlag: true },
      { id: "breathlessness", label: "Shortness of breath / Air hunger", icon: "🫁", redFlag: true },
      { id: "dizziness_syncope", label: "Dizziness, lightheadedness or fainting", icon: "😵", redFlag: true },
      { id: "nausea", label: "Nausea or vomiting sensation", icon: "🤢", redFlag: false }
    ]
  },
  stomach: {
    title: "Gastrointestinal & Abdominal HPI",
    characterPrompt: "What type of stomach discomfort do you feel?",
    characterOptions: [
      { id: "burning_acidity", label: "Severe burning & sour regurgitation", icon: "🔥", redFlag: false },
      { id: "spasmodic_cramps", label: "Twisting spasmodic cramps", icon: "⚡", redFlag: false },
      { id: "dull_constant", label: "Constant dull ache or swelling", icon: "🫄", redFlag: false },
      { id: "sharp_colic", label: "Severe sharp colicky waves", icon: "⚡", redFlag: true }
    ],
    radiationPrompt: "Where is the pain spreading?",
    radiationOptions: [
      { id: "groin", label: "Shooting down to lower groin / flank", icon: "🦵", redFlag: false },
      { id: "right_shoulder", label: "Up toward right shoulder blade", icon: "🦴", redFlag: false },
      { id: "lower_right", label: "Shifting to lower right abdomen (McBurney)", icon: "⚠️", redFlag: true },
      { id: "none", label: "Centered around navel/epigastric area", icon: "✅", redFlag: false }
    ],
    aggravatingPrompt: "What worsens your stomach issue?",
    aggravatingOptions: [
      { id: "spicy_food", label: "Spicy / oily foods or tea/coffee", icon: "🌶️", redFlag: false },
      { id: "empty_stomach", label: "Staying on an empty stomach", icon: "⏱️", redFlag: false },
      { id: "movement", label: "Any sudden abdominal movement", icon: "🚶", redFlag: false },
      { id: "milk", label: "Milk or dairy products", icon: "🥛", redFlag: false }
    ],
    relievingPrompt: "What helps relieve it?",
    relievingOptions: [
      { id: "eating", label: "Eating something light / milk", icon: "🥣" },
      { id: "bowel_move", label: "Passing gas or bowel movement", icon: "🚽" },
      { id: "hot_water", label: "Hot water fermentation", icon: "♨️" },
      { id: "vomiting", label: "After vomiting", icon: "🤢" }
    ],
    associatedPrompt: "Associated digestive symptoms:",
    associatedOptions: [
      { id: "blood_stool", label: "Black or bloody stools", icon: "🩸", redFlag: true },
      { id: "persistent_vomit", label: "Unable to keep fluids down (>24h)", icon: "⚠️", redFlag: true },
      { id: "high_fever_gi", label: "Fever with severe abdominal tenderness", icon: "🌡️", redFlag: true },
      { id: "bloating_constip", label: "Gas distension & constipation", icon: "🫄", redFlag: false }
    ]
  },
  head: {
    title: "Neurological & Headache HPI",
    characterPrompt: "Describe the nature of your headache:",
    characterOptions: [
      { id: "pulsating_unilateral", label: "Throbbing / pounding on one side", icon: "🧠", redFlag: false },
      { id: "band_tension", label: "Tight band-like squeezing across forehead", icon: "💆", redFlag: false },
      { id: "thunderclap", label: "Sudden worst headache of life (Thunderclap)", icon: "⚡", redFlag: true },
      { id: "sinus_heavy", label: "Heavy pressure behind eyes and cheeks", icon: "👃", redFlag: false }
    ],
    radiationPrompt: "Is there any spreading of pain or stiffness?",
    radiationOptions: [
      { id: "neck_stiffness", label: "Severe neck stiffness (unable to touch chin to chest)", icon: "⚠️", redFlag: true },
      { id: "eye_radiation", label: "Pain radiating behind eyeballs", icon: "👁️", redFlag: false },
      { id: "jaw_teeth", label: "Radiating to temples & jaw joint", icon: "🦷", redFlag: false },
      { id: "none", label: "Confined to forehead / crown", icon: "✅", redFlag: false }
    ],
    aggravatingPrompt: "What triggers or worsens the headache?",
    aggravatingOptions: [
      { id: "bright_light", label: "Bright sunlight, loud sound or screens", icon: "☀️", redFlag: false },
      { id: "bending_down", label: "Bending forward or coughing", icon: "😣", redFlag: false },
      { id: "lack_sleep", label: "Sleep deprivation or skipped meals", icon: "😴", redFlag: false },
      { id: "mental_strain", label: "Work stress and fatigue", icon: "💼", redFlag: false }
    ],
    relievingPrompt: "What helps reduce the pain?",
    relievingOptions: [
      { id: "dark_room", label: "Sleeping in a quiet, dark room", icon: "🌙" },
      { id: "cold_compress", label: "Cold pack on forehead", icon: "❄️" },
      { id: "painkillers", label: "Paracetamol / pain relief tablets", icon: "💊" },
      { id: "massage", label: "Scalp or temple massage", icon: "💆" }
    ],
    associatedPrompt: "Associated neurological signs:",
    associatedOptions: [
      { id: "focal_weakness", label: "Weakness or numbness in arm/leg/face", icon: "🚨", redFlag: true },
      { id: "speech_difficulty", label: "Slurred speech or confusion", icon: "🗣️", redFlag: true },
      { id: "vision_loss", label: "Double vision or sudden visual loss", icon: "👁️", redFlag: true },
      { id: "nausea_vomiting", label: "Nausea and sensitivity to smell", icon: "🤢", redFlag: false }
    ]
  },
  generic: {
    title: "General Clinical HPI",
    characterPrompt: "Describe the sensation or nature of your problem:",
    characterOptions: [
      { id: "sharp_pain", label: "Sharp stabbing discomfort", icon: "⚡", redFlag: false },
      { id: "dull_aching", label: "Continuous dull ache or soreness", icon: "🦴", redFlag: false },
      { id: "burning_heat", label: "Burning heat or itching sensation", icon: "🔥", redFlag: false },
      { id: "weakness_fatigue", label: "Severe generalized exhaustion & stiffness", icon: "🥱", redFlag: false }
    ],
    radiationPrompt: "Does the issue spread to other areas?",
    radiationOptions: [
      { id: "spreading", label: "Yes, spreading to adjacent joints/limbs", icon: "🦵", redFlag: false },
      { id: "localized", label: "No, strictly localized to one spot", icon: "📍", redFlag: false },
      { id: "shifting", label: "Shifting from one place to another", icon: "🔄", redFlag: false },
      { id: "whole_body", label: "Felt throughout whole body", icon: "⚡", redFlag: false }
    ],
    aggravatingPrompt: "What worsens the condition?",
    aggravatingOptions: [
      { id: "physical_effort", label: "Physical movement / exertion", icon: "🏃", redFlag: false },
      { id: "weather_cold", label: "Cold climate / nighttime", icon: "❄️", redFlag: false },
      { id: "eating_food", label: "Certain foods or medications", icon: "🍽️", redFlag: false },
      { id: "standing_long", label: "Prolonged standing or sitting", icon: "🧍", redFlag: false }
    ],
    relievingPrompt: "What provides relief?",
    relievingOptions: [
      { id: "resting", label: "Rest and warm fomentation", icon: "🛋️" },
      { id: "over_counter", label: "OTC medicines or balms", icon: "🧴" },
      { id: "warm_bath", label: "Hot water bath", icon: "♨️" },
      { id: "sleep", label: "Adequate night sleep", icon: "😴" }
    ],
    associatedPrompt: "Associated systemic symptoms:",
    associatedOptions: [
      { id: "high_fever", label: "High fever with chills (>101°F)", icon: "🌡️", redFlag: true },
      { id: "severe_dizzy", label: "Severe dizziness or fainting spells", icon: "😵", redFlag: true },
      { id: "swelling", label: "Visible joint/limb swelling & redness", icon: "🔴", redFlag: false },
      { id: "appetite_loss", label: "Loss of appetite & weight loss", icon: "🍽️", redFlag: false }
    ]
  }
};

/**
 * Standard Past Medical & Surgical History Models
 */
export const PAST_ILLNESS_OPTIONS = [
  { id: "htn", label: "Hypertension (High BP)", icd: "I10", category: "Cardiovascular" },
  { id: "t2dm", label: "Type 2 Diabetes Mellitus", icd: "E11", category: "Endocrine" },
  { id: "cad", label: "Coronary Artery Disease / Prior MI", icd: "I25", category: "Cardiovascular" },
  { id: "asthma", label: "Bronchial Asthma / COPD", icd: "J45", category: "Respiratory" },
  { id: "hypothyroid", label: "Hypothyroidism", icd: "E03", category: "Endocrine" },
  { id: "ckd", label: "Chronic Kidney Disease", icd: "N18", category: "Renal" },
  { id: "gerd", label: "GERD / Peptic Ulcer Disease", icd: "K21", category: "Gastrointestinal" },
  { id: "osteoarthritis", label: "Osteoarthritis / Joint Disease", icd: "M19", category: "Musculoskeletal" }
];

export const SURGERY_OPTIONS = [
  { id: "none", label: "No Prior Surgeries" },
  { id: "csection", label: "Cesarean Section (C-Section)" },
  { id: "appendectomy", label: "Appendectomy (Appendix)" },
  { id: "cholecystectomy", label: "Cholecystectomy (Gallbladder)" },
  { id: "hernia", label: "Hernia Repair" },
  { id: "cabg_stent", label: "Coronary Stent / Bypass (CABG)" },
  { id: "ortho_surgery", label: "Joint Replacement / Fracture Fixation" },
  { id: "cataract", label: "Cataract Eye Surgery" }
];

export const ALLERGY_CATEGORIES = [
  { id: "none", label: "No Known Drug Allergies (NKDA)" },
  { id: "penicillin", label: "Penicillin / Amoxicillin", reaction: "Skin rash / Anaphylaxis" },
  { id: "nsaids", label: "Aspirin / NSAIDs (Brufen/Combiflam)", reaction: "Bronchospasm / Gastritis" },
  { id: "sulfa", label: "Sulfa Antibiotics", reaction: "Severe hives" },
  { id: "food_peanuts", label: "Peanuts / Shellfish / Egg Allergy", reaction: "Swelling" },
  { id: "contrast_dye", label: "IV Contrast Dye", reaction: "Allergic reaction" }
];

export const LIFESTYLE_PARAMETERS = {
  diet: [
    { id: "veg", label: "Strict Vegetarian" },
    { id: "nonveg", label: "Non-Vegetarian" },
    { id: "egg", label: "Eggetarian / Lacto-Ovo" }
  ],
  smoking: [
    { id: "never", label: "Non-Smoker (Never)" },
    { id: "former", label: "Former Smoker (Quit)" },
    { id: "active", label: "Active Smoker (<10/day)" },
    { id: "heavy", label: "Heavy Smoker (>10/day)" }
  ],
  alcohol: [
    { id: "non_drinker", label: "Non-Drinker" },
    { id: "occasional", label: "Occasional / Social" },
    { id: "regular", label: "Regular / Daily" }
  ],
  activity: [
    { id: "sedentary", label: "Sedentary (Desk Job)" },
    { id: "moderate", label: "Moderate (Walking 30m/day)" },
    { id: "active", label: "Physically Active / Heavy Labor" }
  ]
};

/**
 * Extended AYUSH Dashavidha Pariksha Clinical Framework
 */
export const AYUSH_DASHAVIDHA_FRAMEWORK = {
  prakriti: {
    title: "1. Prakriti (Constitution)",
    desc: "Vata, Pitta, Kapha constitutional predominance"
  },
  vikriti: {
    title: "2. Vikriti (Current Dosha Imbalance)",
    desc: "Pathological deviation from baseline constitution"
  },
  sara: {
    title: "3. Sara (Tissue Essence Quality)",
    options: ["Rasa Sara (Lymphatic)", "Rakta Sara (Blood)", "Mamsa Sara (Muscle)", "Medo Sara (Fat)", "Asthi Sara (Bone)", "Majja Sara (Marrow)", "Shukra Sara (Reproductive)", "Sarva Sara (Excellent)"]
  },
  samhanana: {
    title: "4. Samhanana (Body Compactness)",
    options: ["Susambaddha (Well-compacted)", "Madhyama (Moderate compactness)", "Heena (Poor compactness/Fragile)"]
  },
  pramana: {
    title: "5. Pramana (Anthropometric Proportions)",
    options: ["Sama Pramana (Proportionate height-to-span)", "Visham Pramana (Disproportionate)"]
  },
  satmya: {
    title: "6. Satmya (Habituation & Suitability)",
    options: ["Sarva Rasa Satmya (All 6 tastes wholesome)", "Vyashrita Satmya (Specific foods suit)", "Eka Rasa Satmya (Monodiet habituated)"]
  },
  sattva: {
    title: "7. Sattva (Mental Strength & Resilience)",
    options: ["Pravara Sattva (High emotional resilience)", "Madhyama Sattva (Moderate tolerance)", "Avara Sattva (Low stress tolerance/Anxious)"]
  },
  aharaShakti: {
    title: "8. Ahara Shakti (Digestive & Ingestion Capacity)",
    options: ["Abhyavaharana Shakti Uttama (High intake)", "Jaranashakti Tikshna (Fast digestion)", "Manda Jaranashakti (Slow/Heavy digestion)"]
  },
  vyayamaShakti: {
    title: "9. Vyayama Shakti (Physical Endurance)",
    options: ["Pravara (High physical capacity)", "Madhyama (Moderate physical endurance)", "Avara (Tires very quickly)"]
  },
  vaya: {
    title: "10. Vaya (Age Period & Biological Stage)",
    options: ["Bala (Childhood / Growth)", "Madhyama (Adult / Maintenance)", "Vridha (Senior / Degenerative)"]
  }
};
