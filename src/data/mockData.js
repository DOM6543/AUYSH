export const initialPatientData = {
  id: "MK-2025-05-26-0001",
  name: "Arun Kumar",
  verified: true,
  age: 35,
  gender: "Male",
  abhaNumber: "91-XXXX-XXXX-1234",
  abhaAddress: "arun.kumar@abdm",
  opdId: "MK-2025-05-26-0001",
  isNewPatient: true,
  mobile: "+91 98765 43210",
  language: "Tamil",
  registrationType: "Walk-in",
  avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  doctor: {
    name: "Dr. Ramesh Kumar",
    role: "Physician",
    avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80",
    department: "AIIMS Ayurveda OPD"
  },
  stats: {
    chiefComplaint: {
      title: "Chief Complaint",
      value: "Chest pain",
      subtitle: "Since 2 days",
      icon: "Activity",
      color: "purple"
    },
    kioskSession: {
      title: "Kiosk Session",
      value: "May 26, 2025",
      subtitle: "10:15 AM",
      icon: "Calendar",
      color: "blue"
    },
    consultationType: {
      title: "Consultation Type",
      value: "General OPD",
      subtitle: "New Consultation",
      icon: "Briefcase",
      color: "cyan"
    },
    redFlags: {
      title: "Red Flags",
      value: "High Risk",
      subtitle: "2 Alerts",
      icon: "Flag",
      color: "red"
    },
    lastUpdated: {
      title: "Last Updated",
      value: "May 26, 2025",
      subtitle: "10:40 AM",
      icon: "Clock",
      color: "indigo"
    }
  },
  aiSummary: {
    chiefComplaint: "Chest pain since 2 days",
    hpi: [
      "Pain in center of chest, pressure like",
      "On and off, more on exertion",
      "No relief with rest",
      "Associated with breathlessness",
      "No palpitation",
      "No sweating"
    ],
    pastHistory: [
      "Hypertension since 5 years"
    ],
    medications: [
      { name: "Amlodipine", dosage: "5mg", frequency: "OD", duration: "Ongoing" }
    ],
    allergies: [
      "No known drug allergies"
    ],
    redFlagsList: [
      "Chest pain on exertion",
      "Breathlessness",
      "Elevated Blood Pressure (140/90 mmHg)"
    ],
    suggestions: [
      "Consider ECG",
      "Cardiac evaluation",
      "BP monitoring"
    ],
    systemicReview: "No fever, No cough, No headache, No nausea, No vomiting",
    familyHistory: [
      { relation: "Father", condition: "Diabetes Mellitus" },
      { relation: "Mother", condition: "Hypertension" }
    ]
  },
  vitals: {
    bp: { value: "140/90", unit: "mmHg", status: "high", label: "BP" },
    pulse: { value: "98", unit: "bpm", status: "normal", label: "Pulse" },
    spo2: { value: "98", unit: "%", status: "normal", label: "SpO₂" },
    temperature: { value: "98.6", unit: "°F", status: "normal", label: "Temperature" },
    history: [
      { time: "10:15 AM", bp: "140/90", pulse: 98, spo2: 98, temp: 98.6 },
      { time: "10:25 AM", bp: "138/88", pulse: 95, spo2: 98, temp: 98.6 }
    ]
  },
  timeline: [
    {
      time: "Today 10:15 AM",
      title: "Kiosk Intake",
      details: "Symptoms, History, Vitals",
      status: "completed"
    },
    {
      time: "Today 10:20 AM",
      title: "Documents Uploaded",
      details: "Prescription, Lab Report",
      status: "completed"
    },
    {
      time: "Today 10:35 AM",
      title: "AI Summary Generated",
      details: "Clinical ingestion & entity extraction",
      status: "completed"
    },
    {
      time: "Today 10:40 AM",
      title: "Ready for Physician Review",
      details: "Pending doctor verification & sign-off",
      status: "active"
    }
  ],
  documents: [
    {
      id: "doc-1",
      name: "Prescription_26052025.pdf",
      type: "pdf",
      size: "1.2 MB",
      uploadedAt: "May 26, 2025 10:20 AM",
      status: "Processed",
      category: "Prescription",
      previewContent: {
        hospital: "City Healthcare Clinic",
        doctor: "Dr. K. Sharma (MD, General Medicine)",
        date: "May 26, 2025",
        rx: ["Tab. Amlodipine 5mg - 1 Tab OD Morning after food (30 Days)", "Tab. Paracetamol 650mg - SOS for pain"],
        notes: "Patient reports intermittent chest heaviness. Advised baseline lipid profile and ECG if pain persists."
      }
    },
    {
      id: "doc-2",
      name: "Lab_Report_26052025.jpg",
      type: "image",
      size: "3.4 MB",
      uploadedAt: "May 26, 2025 10:22 AM",
      status: "Processed",
      category: "Lab Report",
      previewContent: {
        lab: "Apex Diagnostic Laboratories",
        test: "Lipid Profile & Serum Electrolytes",
        findings: [
          { test: "Total Cholesterol", result: "218 mg/dL", reference: "< 200 mg/dL", status: "Borderline High" },
          { test: "Triglycerides", result: "185 mg/dL", reference: "< 150 mg/dL", status: "Elevated" },
          { test: "HDL Cholesterol", result: "38 mg/dL", reference: "> 40 mg/dL", status: "Low" },
          { test: "LDL Cholesterol", result: "143 mg/dL", reference: "< 100 mg/dL", status: "High" },
          { test: "Serum Creatinine", result: "0.9 mg/dL", reference: "0.7 - 1.2 mg/dL", status: "Normal" }
        ]
      }
    },
    {
      id: "doc-3",
      name: "Discharge_Summary_2024.pdf",
      type: "pdf",
      size: "2.8 MB",
      uploadedAt: "May 26, 2025 10:25 AM",
      status: "Processed",
      category: "Discharge Summary",
      previewContent: {
        hospital: "Apollo Hospitals Emergency Care",
        admissionDate: "14 Nov 2024",
        dischargeDate: "16 Nov 2024",
        primaryDiagnosis: "Essential Hypertension Stage 1 (Hypertensive Urgency)",
        treatment: "Initiated on Calcium Channel Blockers. Lifestyle modifications advised."
      }
    }
  ],
  examination: {
    general: "Conscious, oriented, slightly anxious. No pallor, icterus, cyanosis, clubbing, or edema.",
    cvs: "S1 S2 heard. No murmurs. Heart rate 98 bpm regular. Peripheral pulses well felt.",
    rs: "Bilateral vesicular breath sounds heard. No added wheeze or crepitations.",
    cns: "Higher mental functions intact. Cranial nerves grossly normal. Motor power 5/5.",
    abdomen: "Soft, non-tender, no organomegaly. Normal bowel sounds."
  },
  lifestyle: {
    diet: "Mixed non-vegetarian, high sodium intake, frequent tea/coffee (4-5 cups/day)",
    sleep: "5-6 hours/night, broken sleep due to work stress",
    physicalActivity: "Sedentary desk job (>9 hours sitting/day), minimal exercise",
    substanceUse: "Non-smoker, occasional social alcohol (1-2 drinks/month)",
    stressLevel: "High occupational stress (IT Sector)"
  }
};

export const samplePatientsList = [
  {
    id: "MK-2025-05-26-0001",
    name: "Arun Kumar",
    age: 35,
    gender: "Male",
    complaint: "Chest pain",
    risk: "High Risk",
    time: "10:15 AM",
    status: "Ready for Review",
    abha: "91-XXXX-XXXX-1234"
  },
  {
    id: "MK-2025-05-26-0002",
    name: "Priya Sundaram",
    age: 42,
    gender: "Female",
    complaint: "Chronic migraine & cervical stiffness",
    risk: "Moderate",
    time: "10:30 AM",
    status: "In Intake",
    abha: "91-XXXX-XXXX-5678"
  },
  {
    id: "MK-2025-05-26-0003",
    name: "Rajesh Varma",
    age: 58,
    gender: "Male",
    complaint: "Knee joint swelling & osteo pain",
    risk: "Low Risk",
    time: "10:45 AM",
    status: "Reviewed",
    abha: "91-XXXX-XXXX-9012"
  },
  {
    id: "MK-2025-05-26-0004",
    name: "Deepa Narayanan",
    age: 29,
    gender: "Female",
    complaint: "Acid reflux, bloating & insomnia",
    risk: "Moderate",
    time: "11:00 AM",
    status: "Ready for Review",
    abha: "91-XXXX-XXXX-3456"
  }
];

export const notificationsList = [
  {
    id: 1,
    title: "High Risk Patient Flagged",
    message: "Arun Kumar (MK-0001) flagged with exertional chest pain and elevated BP.",
    time: "5 mins ago",
    unread: true,
    type: "alert"
  },
  {
    id: 2,
    title: "Document Ingestion Completed",
    message: "3 documents processed with OCR for OPD session MK-0001.",
    time: "12 mins ago",
    unread: true,
    type: "info"
  },
  {
    id: 3,
    title: "Kiosk K-03 Calibration",
    message: "BP cuff sensor auto-calibrated successfully.",
    time: "30 mins ago",
    unread: true,
    type: "system"
  }
];
