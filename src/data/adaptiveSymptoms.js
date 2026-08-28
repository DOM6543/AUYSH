// Adaptive Clinical Decision Tree Data for MediKiosk
export const ADAPTIVE_SYMPTOM_TREES = {
  chest: {
    title: "Chest & Breathing Symptoms",
    titleHi: "छाती व सांस से जुड़े लक्षण",
    prompt: "Which of these specific symptoms are you experiencing?",
    options: [
      { id: "radiating_pain", label: "Pain radiating to left arm or jaw", labelHi: "बाएं हाथ या जबड़े में दर्द", icon: "🫀", severe: true },
      { id: "breathless_walking", label: "Shortness of breath while walking/climbing", labelHi: "चलने या सीढ़ी चढ़ने में सांस फूलना", icon: "🫁", severe: true },
      { id: "palpitations", label: "Sudden racing heartbeat or skipped beats", labelHi: "दिल की धड़कन तेज होना / घबराहट", icon: "💓", severe: false },
      { id: "chest_burning", label: "Burning sensation / heaviness after meals", labelHi: "खाने के बाद छाती में जलन / भारीपन", icon: "🔥", severe: false },
      { id: "productive_cough", label: "Chest congestion with phlegm/mucus", labelHi: "छाती में जकड़न व बलगम वाली खांसी", icon: "💨", severe: false },
      { id: "dizziness_chest", label: "Lightheadedness or cold sweats", labelHi: "चक्कर आना या ठंडा पसीना आना", icon: "💦", severe: true }
    ]
  },
  stomach: {
    title: "Stomach & Digestion Symptoms",
    titleHi: "पेट व पाचन से जुड़े लक्षण",
    prompt: "What exact digestive discomfort do you have?",
    options: [
      { id: "acid_burning", label: "Severe burning acidity / sour burps", labelHi: "तेज एसिडिटी व खट्टी डकारें", icon: "🔥", severe: false },
      { id: "stomach_cramps", label: "Sharp twisting abdominal cramps", labelHi: "पेट में तेज मरोड़ या दर्द", icon: "⚡", severe: false },
      { id: "nausea_vomit", label: "Nausea, vomiting or food aversion", labelHi: "उल्टी या जी मिचलाना", icon: "🤢", severe: false },
      { id: "bloating_gas", label: "Excessive gas & heavy swollen abdomen", labelHi: "पेट फूलना व भारी गैस बनना", icon: "🫄", severe: false },
      { id: "bowel_irregularity", label: "Severe constipation or loose motions", labelHi: "कब्ज या दस्त की समस्या", icon: "🚽", severe: false },
      { id: "post_meal_pain", label: "Pain immediately 30 mins after eating", labelHi: "खाना खाने के 30 मिनट बाद तेज दर्द", icon: "🍽️", severe: false }
    ]
  },
  head: {
    title: "Head & Neurological Symptoms",
    titleHi: "सिर व आंखों से जुड़े लक्षण",
    prompt: "Select the specific head or sensory symptoms:",
    options: [
      { id: "one_sided_throbbing", label: "One-sided pulsating migraine pain", labelHi: "आधे सिर में तेज टीस वाला दर्द", icon: "🧠", severe: false },
      { id: "vertigo_dizzy", label: "Room spinning / loss of balance", labelHi: "सिर घूमना व संतुलन बिगड़ना", icon: "😵", severe: true },
      { id: "blurred_vision", label: "Blurry vision or eye strain/watering", labelHi: "आंखों में धुंधलापन या पानी आना", icon: "👁️", severe: false },
      { id: "neck_stiff_fever", label: "Neck stiffness with high fever", labelHi: "गर्दन में अकड़न व तेज बुखार", icon: "🌡️", severe: true },
      { id: "forehead_pressure", label: "Heavy sinus pressure over forehead/nose", labelHi: "माथे व नाक के पास भारी दबाव", icon: "👃", severe: false },
      { id: "sleep_deprived", label: "Insomnia or waking up with headache", labelHi: "नींद न आना व सिरदर्द से जागना", icon: "😴", severe: false }
    ]
  },
  knees: {
    title: "Joints & Mobility Symptoms",
    titleHi: "जोड़ों व पैरों से जुड़े लक्षण",
    prompt: "Which joint and leg issues are affecting you?",
    options: [
      { id: "morning_stiffness", label: "Morning joint stiffness lasting >30 mins", labelHi: "सुबह उठने पर जोड़ों में तेज जकड़न", icon: "🦵", severe: false },
      { id: "joint_swelling", label: "Visible knee swelling or heat/redness", labelHi: "घुटनों में सूजन व गर्माहट", icon: "🔴", severe: true },
      { id: "stair_difficulty", label: "Severe pain while climbing stairs or squatting", labelHi: "सीढ़ी चढ़ने या उकड़ू बैठने में दर्द", icon: "🚶", severe: false },
      { id: "sciatica_shooting", label: "Shooting nerve pain running down legs", labelHi: "कमर से पैरों तक झनझनाहट/दर्द", icon: "⚡", severe: false },
      { id: "clicking_joints", label: "Popping or grinding sound during movement", labelHi: "चलने पर जोड़ों से कट-कट आवाज", icon: "🔊", severe: false },
      { id: "ankle_edema", label: "Puffy feet or ankle water retention", labelHi: "पैरों के पंजों में सूजन", icon: "🦶", severe: false }
    ]
  },
  throat: {
    title: "Throat & Respiratory Symptoms",
    titleHi: "गले व सर्दी-जुकाम के लक्षण",
    prompt: "Select the specific throat and cold issues:",
    options: [
      { id: "painful_swallowing", label: "Sharp pain or scratching when swallowing", labelHi: "थूक या खाना निगलने में तेज दर्द", icon: "🗣️", severe: false },
      { id: "continuous_cough", label: "Incessant dry or phlegm-producing cough", labelHi: "लगातार सूखी या बलगम वाली खांसी", icon: "🤧", severe: false },
      { id: "fever_chills", label: "High fever accompanied by cold shivers", labelHi: "कंपकंपी के साथ तेज बुखार", icon: "🌡️", severe: true },
      { id: "blocked_sinuses", label: "Blocked nostrils & post-nasal drip", labelHi: "नाक बंद व सांस लेने में रुकावट", icon: "👃", severe: false },
      { id: "hoarse_voice", label: "Loss of voice or throat irritation", labelHi: "आवाज बैठना या गले में खराश", icon: "🎤", severe: false },
      { id: "wheezing_breath", label: "Whistling sound while breathing", labelHi: "सांस लेते समय सीटी जैसी आवाज", icon: "🫁", severe: true }
    ]
  },
  back: {
    title: "Spine & Lumbar Symptoms",
    titleHi: "कमर व रीढ़ की हड्डी के लक्षण",
    prompt: "Choose the specific back symptoms:",
    options: [
      { id: "lower_back_ache", label: "Constant dull ache in lower lumbar area", labelHi: "कमर के निचले हिस्से में लगातार दर्द", icon: "🦴", severe: false },
      { id: "bending_pain", label: "Sharp catch when bending forward or lifting", labelHi: "झुकने या वजन उठाने पर तेज लचक/दर्द", icon: "😣", severe: false },
      { id: "hip_radiation", label: "Pain radiating to buttock and thigh", labelHi: "कूल्हों व जांघों तक फैलने वाला दर्द", icon: "⚡", severe: false },
      { id: "sitting_numbness", label: "Numbness or pins & needles in toes", labelHi: "पैरों की उंगलियों में सुन्नपन", icon: "🛋️", severe: true },
      { id: "upper_back_spasm", label: "Muscle tightness between shoulder blades", labelHi: "कंधों के बीच मांसपेशियों में खिंचाव", icon: "💆", severe: false },
      { id: "posture_fatigue", label: "Inability to stand straight for >10 mins", labelHi: "10 मिनट से ज्यादा सीधा न खड़ा हो पाना", icon: "🧍", severe: false }
    ]
  },
  skin: {
    title: "Skin & Dermatological Symptoms",
    titleHi: "त्वचा व खुजली से जुड़े लक्षण",
    prompt: "What skin problems are currently present?",
    options: [
      { id: "itchy_rashes", label: "Intensely itchy red raised patches/hives", labelHi: "तेज खुजली वाले लाल चकत्ते", icon: "🧴", severe: false },
      { id: "dry_peeling", label: "Dry flaking, cracking or peeling skin", labelHi: "रूखी, फटी हुई या छिलने वाली त्वचा", icon: "🩹", severe: false },
      { id: "pus_blisters", label: "Fluid-filled blisters or pus eruptions", labelHi: "मवाद वाले दाने या पानी भरे छाले", icon: "🫧", severe: true },
      { id: "allergic_breakout", label: "Sudden allergic breakout after food/drug", labelHi: "दवा या खाने के बाद अचानक एलर्जी", icon: "🌿", severe: true },
      { id: "scalp_itching", label: "Severe dandruff or scalp irritation", labelHi: "सिर में तेज खुजली व रूसी", icon: "💆", severe: false },
      { id: "dark_patches", label: "Dark hyperpigmented patches or fungal ring", labelHi: "काले धब्बे या दाद-खाज", icon: "⭕", severe: false }
    ]
  },
  body: {
    title: "Generalized & Systemic Symptoms",
    titleHi: "पूरे शरीर की सामान्य तकलीफें",
    prompt: "Select whole-body systemic symptoms:",
    options: [
      { id: "high_fever_temp", label: "Continuous body heat / fever > 101°F", labelHi: "लगातार तेज बुखार (101°F से ऊपर)", icon: "🌡️", severe: true },
      { id: "severe_exhaustion", label: "Extreme weakness / unable to do daily work", labelHi: "अत्यधिक कमजोरी व थकान", icon: "🥱", severe: false },
      { id: "body_aches", label: "Generalized muscle soreness & bone aches", labelHi: "पूरे बदन व हड्डियों में दर्द", icon: "⚡", severe: false },
      { id: "loss_appetite", label: "Complete loss of hunger & weight drop", labelHi: "भूख बिल्कुल न लगना", icon: "🍽️", severe: false },
      { id: "chills_shivering", label: "Sudden body shivering and cold feeling", labelHi: "अचानक ठंड लगना व कंपकंपी", icon: "🥶", severe: false },
      { id: "dehydration_thirst", label: "Excessive dry mouth & extreme thirst", labelHi: "मुंह सूखना व अत्यधिक प्यास", icon: "💧", severe: false }
    ]
  }
};
