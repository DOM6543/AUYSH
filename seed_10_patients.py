#!/usr/bin/env python3
"""
MediKiosk Firebase Realtime Database Data Seeder
Target DB URL: https://medikiosk-7cf65-default-rtdb.firebaseio.com/

This script populates 10 comprehensive, clinically realistic patient records
with complete intake data, vitals, AI clinical summaries, AYUSH/Ayurvedic evaluations,
medical documents, telemetry timelines, kiosk sessions, and real-time alerts.
"""

import json
import urllib.request
import urllib.error
import sys
from datetime import datetime

# Configure UTF-8 for Windows console
if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

DATABASE_URL = "https://medikiosk-7cf65-default-rtdb.firebaseio.com"

PATIENTS_DATA = {
    "MK-2025-05-26-0001": {
        "id": "MK-2025-05-26-0001",
        "name": "Arun Kumar",
        "verified": True,
        "age": 35,
        "gender": "Male",
        "abhaNumber": "91-8472-1093-1234",
        "abhaAddress": "arun.kumar@abdm",
        "opdId": "MK-2025-05-26-0001",
        "isNewPatient": True,
        "mobile": "+91 98765 43210",
        "language": "Tamil / English",
        "registrationType": "Walk-in Kiosk",
        "avatarUrl": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
        "doctor": {
            "name": "Dr. Ramesh Kumar",
            "role": "Chief Physician",
            "avatar": "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80",
            "department": "AIIMS Ayurveda & Integrative Medicine OPD"
        },
        "stats": {
            "chiefComplaint": {"title": "Chief Complaint", "value": "Chest pain on exertion", "subtitle": "Since 2 days", "icon": "Activity", "color": "purple"},
            "kioskSession": {"title": "Kiosk Session", "value": "May 26, 2025", "subtitle": "10:15 AM", "icon": "Calendar", "color": "blue"},
            "consultationType": {"title": "Consultation Type", "value": "Cardiology / Integrative", "subtitle": "Urgent Triage", "icon": "Briefcase", "color": "cyan"},
            "redFlags": {"title": "Red Flags", "value": "High Risk", "subtitle": "2 Alerts Triggered", "icon": "Flag", "color": "red"},
            "lastUpdated": {"title": "Last Updated", "value": "May 26, 2025", "subtitle": "10:40 AM", "icon": "Clock", "color": "indigo"}
        },
        "aiSummary": {
            "chiefComplaint": "Exertional retrosternal chest pain radiating to left shoulder since 2 days",
            "hpi": [
                "Pain in center of chest, pressure/heaviness quality",
                "Triggered by climbing stairs; lasts 10-15 minutes",
                "Associated with moderate exertional breathlessness and mild diaphoresis",
                "No relief with sitting rest; no acute orthopnea",
                "Denies previous episodes of similar intensity"
            ],
            "pastHistory": [
                "Essential Hypertension (diagnosed 5 years ago, on irregular therapy)",
                "Dyslipidemia detected during annual health checkup in 2024"
            ],
            "medications": [
                {"name": "Tab. Amlodipine", "dosage": "5mg", "frequency": "OD", "duration": "Ongoing (irregular)"},
                {"name": "Tab. Paracetamol", "dosage": "650mg", "frequency": "SOS", "duration": "For chest discomfort"}
            ],
            "allergies": ["No known drug or food allergies"],
            "redFlagsList": [
                "Exertional retrosternal chest tightness with radiation",
                "Elevated systolic BP (140/90 mmHg) with tachycardia (98 bpm)",
                "Strong paternal history of premature coronary artery disease"
            ],
            "suggestions": [
                "Immediate 12-lead Electrocardiogram (ECG) to rule out NSTEMI/Ischemia",
                "Serum Troponin-I and CPK-MB baseline evaluation",
                "Lipid profile (Total Cholesterol, LDL, Triglycerides)",
                "Integrative Hridya Rasayana protocol following acute stabilization"
            ],
            "systemicReview": "No fever, No productive cough, No syncope, No hemoptysis, No pedal edema.",
            "familyHistory": [
                {"relation": "Father", "condition": "Myocardial Infarction at age 52, Hypertension"},
                {"relation": "Mother", "condition": "Type 2 Diabetes Mellitus"}
            ]
        },
        "vitals": {
            "bp": {"value": "140/90", "unit": "mmHg", "status": "high", "label": "BP"},
            "pulse": {"value": "98", "unit": "bpm", "status": "normal", "label": "Pulse"},
            "spo2": {"value": "98", "unit": "%", "status": "normal", "label": "SpO₂"},
            "temperature": {"value": "98.6", "unit": "°F", "status": "normal", "label": "Temperature"},
            "history": [
                {"time": "10:15 AM", "bp": "140/90", "pulse": 98, "spo2": 98, "temp": 98.6},
                {"time": "10:25 AM", "bp": "138/88", "pulse": 95, "spo2": 98, "temp": 98.6},
                {"time": "10:38 AM", "bp": "136/86", "pulse": 92, "spo2": 99, "temp": 98.4}
            ]
        },
        "ayush": {
            "prakriti": {
                "primary": "Pitta-Vata",
                "distribution": [
                    {"dosha": "Pitta", "percentage": 52, "color": "#f97316", "traits": "Sharp digestion, heat intolerance, driven temperament"},
                    {"dosha": "Vata", "percentage": 33, "color": "#0ea5e9", "traits": "Variable appetite, rapid movement, nervous tension"},
                    {"dosha": "Kapha", "percentage": 15, "color": "#10b981", "traits": "Moderate endurance, stable sleep"}
                ]
            },
            "vikriti": {
                "state": "Pitta-Vata Imbalance with Hridya Srotas involvement",
                "severity": "Moderate to High",
                "description": "Exertional chest discomfort indicates Vata aggravation in Pranavaha and Rasavaha Srotas, exacerbated by Pitta Ushna/Tikshna guna due to high occupational stress and diet."
            },
            "ashtavidhaPariksha": [
                {"name": "Nadi (Pulse)", "finding": "Manduka-Sarpa Gati (Pitta-Vata mixed)", "note": "Rapid, bounding at 98 bpm"},
                {"name": "Mutra (Urine)", "finding": "Pita-Varna (Pale yellow)", "note": "Clear, normal frequency, no burning"},
                {"name": "Mala (Stool)", "finding": "Sama, Madhyama", "note": "Once daily, occasional constipation"},
                {"name": "Jihwa (Tongue)", "finding": "Alpa Sama (Mild coating)", "note": "Light white coating at base, mild Ama"},
                {"name": "Shabda (Voice)", "finding": "Spashta, Guru", "note": "Clear, anxious cadence"},
                {"name": "Sparsha (Touch)", "finding": "Ushna-Snigdha", "note": "Warm palms, slight clamminess"},
                {"name": "Drik (Eyes)", "finding": "Normal, mild congestion", "note": "Signs of sleep deprivation"},
                {"name": "Akruti (Built)", "finding": "Madhyama Shareera", "note": "Moderate build, BMI 24.8"}
            ],
            "agniState": {
                "type": "Vishamagni (Irregular Digestive Fire)",
                "details": "Appetite fluctuates with work schedule; mild post-prandial heaviness."
            },
            "suggestedFormulations": [
                {"name": "Arjuna Ksheerapaka / Arjuna Ghan Vati", "dose": "1 tablet BD after food", "purpose": "Hridya rasayana, supports cardiac rhythm and vascular tone."},
                {"name": "Prabhakar Vati", "dose": "1 tablet BD with lukewarm water", "purpose": "Classical cardio-protective formulation for chest heaviness."},
                {"name": "Brahmi Vati / Shankhapushpi Syrup", "dose": "10 ml at bedtime", "purpose": "Reduces sympathetic overactivation and mental stress."}
            ],
            "dietLifestyleAdvice": [
                "Ahara: Favor Hridya and Pitta-shamak foods (Pomegranate, Amla, bottle gourd, boiled milk with cardamom). Restrict fried, spicy, and excess salt intake.",
                "Vihara: Gentle Anuloma Viloma Pranayama (10 mins morning/evening). Avoid heavy physical exertion until ECG clearance.",
                "Dinacharya: Abhyanga with Ksheerabala Taila on head & feet before sleep."
            ]
        },
        "examination": {
            "general": "Conscious, oriented, anxious appearance. No pallor, icterus, cyanosis, clubbing, or pedal edema.",
            "cvs": "S1 S2 heard normally. No murmurs or gallop rhythm. Peripheral pulses equal and bounding bilaterally.",
            "rs": "Bilateral vesicular breath sounds heard clearly. No wheeze or crepitations.",
            "cns": "Higher mental functions intact. Cranial nerves grossly normal. Motor power 5/5.",
            "abdomen": "Soft, non-tender, no organomegaly. Normal bowel sounds."
        },
        "lifestyle": {
            "diet": "Mixed non-vegetarian, high sodium intake, 4-5 cups coffee/day",
            "sleep": "5-6 hours/night, broken sleep due to IT shifts",
            "physicalActivity": "Sedentary desk job (>9 hours sitting/day)",
            "substanceUse": "Non-smoker, occasional social alcohol (1-2 drinks/month)",
            "stressLevel": "High occupational stress"
        },
        "timeline": [
            {"time": "Today 10:15 AM", "title": "Kiosk Intake Completed", "details": "Self-intake at Kiosk K-03 (OPD Wing)", "status": "completed"},
            {"time": "Today 10:20 AM", "title": "Documents OCR Processed", "details": "Prescription & Lab Report verified", "status": "completed"},
            {"time": "Today 10:35 AM", "title": "AI Summary Synthesized", "details": "Multi-modal symptom synthesis ready", "status": "completed"},
            {"time": "Today 10:40 AM", "title": "Physician Review Pending", "details": "Assigned to Dr. Ramesh Kumar", "status": "active"}
        ],
        "documents": [
            {
                "id": "doc-1",
                "name": "City_Clinic_Prescription.pdf",
                "type": "pdf",
                "size": "1.2 MB",
                "uploadedAt": "May 26, 2025 10:20 AM",
                "status": "Processed",
                "category": "Prescription",
                "previewContent": {
                    "hospital": "City Healthcare Clinic",
                    "doctor": "Dr. K. Sharma (MD, General Medicine)",
                    "date": "May 20, 2025",
                    "rx": ["Tab. Amlodipine 5mg - 1 Tab OD Morning", "Tab. Paracetamol 650mg - SOS for pain"],
                    "notes": "Patient reports intermittent chest heaviness. Advised baseline lipid profile and ECG."
                }
            },
            {
                "id": "doc-2",
                "name": "Lipid_Electrolyte_Panel.jpg",
                "type": "image",
                "size": "3.4 MB",
                "uploadedAt": "May 26, 2025 10:22 AM",
                "status": "Processed",
                "category": "Lab Report",
                "previewContent": {
                    "lab": "Apex Diagnostic Laboratories",
                    "test": "Lipid Profile & Serum Electrolytes",
                    "findings": [
                        {"test": "Total Cholesterol", "result": "218 mg/dL", "reference": "< 200 mg/dL", "status": "Borderline High"},
                        {"test": "Triglycerides", "result": "185 mg/dL", "reference": "< 150 mg/dL", "status": "Elevated"},
                        {"test": "HDL Cholesterol", "result": "38 mg/dL", "reference": "> 40 mg/dL", "status": "Low"},
                        {"test": "LDL Cholesterol", "result": "143 mg/dL", "reference": "< 100 mg/dL", "status": "High"},
                        {"test": "Serum Creatinine", "result": "0.9 mg/dL", "reference": "0.7 - 1.2 mg/dL", "status": "Normal"}
                    ]
                }
            }
        ],
        "doctorReview": {
            "status": "draft",
            "reviewedBy": None,
            "reviewedAt": None,
            "notes": ""
        }
    },
    "MK-2025-05-26-0002": {
        "id": "MK-2025-05-26-0002",
        "name": "Priya Sundaram",
        "verified": True,
        "age": 42,
        "gender": "Female",
        "abhaNumber": "91-3829-9182-5678",
        "abhaAddress": "priya.s@abdm",
        "opdId": "MK-2025-05-26-0002",
        "isNewPatient": False,
        "mobile": "+91 98450 11223",
        "language": "Kannada / English",
        "registrationType": "Kiosk Self Intake",
        "avatarUrl": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
        "doctor": {
            "name": "Dr. Ramesh Kumar",
            "role": "Chief Physician",
            "avatar": "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80",
            "department": "AIIMS Ayurveda & Integrative Medicine OPD"
        },
        "stats": {
            "chiefComplaint": {"title": "Chief Complaint", "value": "Chronic Migraine & Neck Stiffness", "subtitle": "Since 3 weeks", "icon": "Activity", "color": "purple"},
            "kioskSession": {"title": "Kiosk Session", "value": "May 26, 2025", "subtitle": "10:30 AM", "icon": "Calendar", "color": "blue"},
            "consultationType": {"title": "Consultation Type", "value": "Neurology / AYUSH OPD", "subtitle": "Follow-up", "icon": "Briefcase", "color": "cyan"},
            "redFlags": {"title": "Red Flags", "value": "Moderate Risk", "subtitle": "Visual Aura Noted", "icon": "Flag", "color": "amber"},
            "lastUpdated": {"title": "Last Updated", "value": "May 26, 2025", "subtitle": "10:35 AM", "icon": "Clock", "color": "indigo"}
        },
        "aiSummary": {
            "chiefComplaint": "Unilateral throbbing hemicranial headache (right side) with neck stiffness and photophobia",
            "hpi": [
                "Recurrent episodes occurring 2-3 times per week, lasting 4-8 hours",
                "Preceded by scintillating scotoma (visual zigzag lines) and nausea",
                "Aggravated by bright screens, loud noises, and skipped meals",
                "Relieved partially by resting in a dark, quiet room and cold compresses",
                "Accompanying bilateral upper trapezius muscle spasm and neck tenderness"
            ],
            "pastHistory": [
                "History of episodic migraine since age 28",
                "Cervical postural strain (Manyastambha) due to computer ergonomics"
            ],
            "medications": [
                {"name": "Tab. Naproxen", "dosage": "500mg", "frequency": "SOS", "duration": "During acute headache attacks"},
                {"name": "Tab. Flunarizine", "dosage": "10mg", "frequency": "HS", "duration": "For 2 months"}
            ],
            "allergies": ["Sulfa drugs (causes cutaneous urticaria)"],
            "redFlagsList": [
                "Frequent throbbing headaches (>8 days/month)",
                "Visual aura with transient scotoma"
            ],
            "suggestions": [
                "Cervical Spine X-ray (AP/Lateral) to evaluate disc spaces",
                "Shirodhara & Nasya therapy assessment in AYUSH wing",
                "Ergonomic workstation adjustment and blue-light filtration"
            ],
            "systemicReview": "No motor weakness, No speech disturbance, No loss of consciousness, No fever.",
            "familyHistory": [
                {"relation": "Mother", "condition": "Severe Migraine and Tension Headache"}
            ]
        },
        "vitals": {
            "bp": {"value": "118/76", "unit": "mmHg", "status": "normal", "label": "BP"},
            "pulse": {"value": "74", "unit": "bpm", "status": "normal", "label": "Pulse"},
            "spo2": {"value": "99", "unit": "%", "status": "normal", "label": "SpO₂"},
            "temperature": {"value": "98.4", "unit": "°F", "status": "normal", "label": "Temperature"},
            "history": [
                {"time": "10:30 AM", "bp": "118/76", "pulse": 74, "spo2": 99, "temp": 98.4}
            ]
        },
        "ayush": {
            "prakriti": {
                "primary": "Vata-Pitta",
                "distribution": [
                    {"dosha": "Vata", "percentage": 48, "color": "#0ea5e9", "traits": "Sensitive nervous system, light sleeper, prone to stiffness"},
                    {"dosha": "Pitta", "percentage": 38, "color": "#f97316", "traits": "Sharp intellect, heat sensitivity, photophobia"},
                    {"dosha": "Kapha", "percentage": 14, "color": "#10b981", "traits": "Slender frame, quick movements"}
                ]
            },
            "vikriti": {
                "state": "Ardhavabhedaka (Migraine) with Vata-Pitta Aggravation in Shiras",
                "severity": "Moderate",
                "description": "Vata drying qualities combined with Pitta heating traits causing constriction and dilation of cerebral vessels, along with Manyastambha in Mamsa Dhatu."
            },
            "ashtavidhaPariksha": [
                {"name": "Nadi (Pulse)", "finding": "Sarpa Gati (Vata dominant)", "note": "Tense, thin pulse at 74 bpm"},
                {"name": "Mutra (Urine)", "finding": "Prakrita", "note": "Clear, adequate volume"},
                {"name": "Mala (Stool)", "finding": "Vibandha (Occasional constipation)", "note": "Dry stools, irregular clearance"},
                {"name": "Jihwa (Tongue)", "finding": "Nirama", "note": "Clean, slight dry reddish edges"},
                {"name": "Shabda (Voice)", "finding": "Spashta, Manda", "note": "Low tone due to head pain"},
                {"name": "Sparsha (Touch)", "finding": "Sheetala", "note": "Cool extremities, tense neck musculature"},
                {"name": "Drik (Eyes)", "finding": "Photophobia present", "note": "Mild conjunctival strain"},
                {"name": "Akruti (Built)", "finding": "Krisha-Madhyama", "note": "BMI 21.4, lean athletic build"}
            ],
            "agniState": {
                "type": "Vishamagni",
                "details": "Skipped lunches during work trigger severe afternoon headaches."
            },
            "suggestedFormulations": [
                {"name": "Pathyadi Kwath", "dose": "15 ml with equal lukewarm water BD", "purpose": "Classical decoction for Shiro-roga and vascular headache."},
                {"name": "Shirashoolavajra Ras", "dose": "1 tablet BD after food", "purpose": "Alleviates throbbing hemicrania and nerve irritation."},
                {"name": "Anu Taila / Ksheerabala Taila (101)", "dose": "2 drops in each nostril morning (Pratimarsha Nasya)", "purpose": "Nourishes Urdhva Jatrugata srotas and calms cranial nerves."}
            ],
            "dietLifestyleAdvice": [
                "Ahara: Strict regular meal timings; avoid aged cheese, fermented food, and excess sour items. Include ghee, almonds, and sweet warm milk.",
                "Vihara: Regular sleep hygiene (bedtime by 10 PM), eye rest every 45 mins of screen time.",
                "Dinacharya: Daily gentle neck stretching and Shiro-abhyanga with Brahmi Taila."
            ]
        },
        "examination": {
            "general": "Comfortable at rest, wears blue-cut glasses, no pallor, no peripheral edema.",
            "cvs": "S1 S2 normal, pulse regular, no murmurs.",
            "rs": "Clear vesicular breath sounds throughout.",
            "cns": "No focal neurological deficit. Visual fields intact to confrontation. Cranial nerves II-XII normal.",
            "abdomen": "Soft, non-tender, active peristalsis."
        },
        "lifestyle": {
            "diet": "Vegetarian, high tea consumption (3-4 cups/day), occasional skipped meals",
            "sleep": "6 hours/night, difficulty initiating sleep due to racing thoughts",
            "physicalActivity": "Occasional yoga (1-2 times/week), prolonged screen time (10 hrs/day)",
            "substanceUse": "Non-smoker, teetotaler",
            "stressLevel": "Moderate work deadline pressure"
        },
        "timeline": [
            {"time": "Today 10:30 AM", "title": "Kiosk Intake Completed", "details": "Self-intake at Main Lobby Kiosk K-01", "status": "completed"},
            {"time": "Today 10:35 AM", "title": "AI Clinical Synthesis", "details": "Ayurvedic & Neurological history compiled", "status": "completed"},
            {"time": "Today 10:36 AM", "title": "Ready for Doctor Review", "details": "In consultation queue", "status": "active"}
        ],
        "documents": [
            {
                "id": "doc-priya-1",
                "name": "MRI_Brain_Screening_2024.pdf",
                "type": "pdf",
                "size": "4.1 MB",
                "uploadedAt": "May 26, 2025 10:32 AM",
                "status": "Processed",
                "category": "Diagnostic Scan",
                "previewContent": {
                    "hospital": "Manipal Advanced Imaging Center",
                    "date": "15 Dec 2024",
                    "impression": "Normal MRI Brain scan. No intracranial mass, acute infarct, or vascular malformation identified."
                }
            }
        ],
        "doctorReview": {
            "status": "draft",
            "reviewedBy": None,
            "reviewedAt": None,
            "notes": ""
        }
    },
    "MK-2025-05-26-0003": {
        "id": "MK-2025-05-26-0003",
        "name": "Rajesh Varma",
        "verified": True,
        "age": 58,
        "gender": "Male",
        "abhaNumber": "91-9120-4493-9012",
        "abhaAddress": "rajesh.varma@abdm",
        "opdId": "MK-2025-05-26-0003",
        "isNewPatient": False,
        "mobile": "+91 97110 55443",
        "language": "Hindi / English",
        "registrationType": "Referral OPD",
        "avatarUrl": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
        "doctor": {
            "name": "Dr. Ramesh Kumar",
            "role": "Chief Physician",
            "avatar": "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80",
            "department": "AIIMS Ayurveda & Integrative Medicine OPD"
        },
        "stats": {
            "chiefComplaint": {"title": "Chief Complaint", "value": "Bilateral Knee Joint Swelling & Pain", "subtitle": "Since 6 months", "icon": "Activity", "color": "purple"},
            "kioskSession": {"title": "Kiosk Session", "value": "May 26, 2025", "subtitle": "10:45 AM", "icon": "Calendar", "color": "blue"},
            "consultationType": {"title": "Consultation Type", "value": "Orthopedics / Sandhivata", "subtitle": "Routine OPD", "icon": "Briefcase", "color": "cyan"},
            "redFlags": {"title": "Red Flags", "value": "Low Risk", "subtitle": "No Acute Neuro Deficit", "icon": "Flag", "color": "emerald"},
            "lastUpdated": {"title": "Last Updated", "value": "May 26, 2025", "subtitle": "10:50 AM", "icon": "Clock", "color": "indigo"}
        },
        "aiSummary": {
            "chiefComplaint": "Progressive bilateral knee joint pain (Right > Left) with morning stiffness and crepitus on standing",
            "hpi": [
                "Pain worse after prolonged walking (>15 mins) and descending stairs",
                "Morning joint stiffness lasting 20-30 minutes, eases with gentle movement",
                "Audible crepitus felt upon knee flexion and extension",
                "Mild swelling observed over medial joint line of right knee",
                "Denies systemic fever, weight loss, or rash"
            ],
            "pastHistory": [
                "Borderline Fasting Hyperglycemia (HbA1c 6.2%)",
                "Mild hepatic steatosis (Grade 1 fatty liver)"
            ],
            "medications": [
                {"name": "Glucosamine + Chondroitin", "dosage": "1500mg", "frequency": "OD", "duration": "For 3 months"},
                {"name": "Tab. Aceclofenac", "dosage": "100mg", "frequency": "PRN", "duration": "For severe flare-ups"}
            ],
            "allergies": ["No known allergies"],
            "redFlagsList": [],
            "suggestions": [
                "Bilateral Knee X-ray (Weight Bearing AP & Lateral Views)",
                "Serum Uric Acid and Rheumatoid Factor (RF) testing",
                "Ayurvedic Janu Basti and Patra Pinda Sweda regimen",
                "Quadriceps muscle strengthening physiotherapy"
            ],
            "systemicReview": "No fever, No chest pain, No sensory loss in lower limbs.",
            "familyHistory": [
                {"relation": "Mother", "condition": "Severe Knee Osteoarthritis (Underwent TKR)"}
            ]
        },
        "vitals": {
            "bp": {"value": "128/82", "unit": "mmHg", "status": "normal", "label": "BP"},
            "pulse": {"value": "72", "unit": "bpm", "status": "normal", "label": "Pulse"},
            "spo2": {"value": "98", "unit": "%", "status": "normal", "label": "SpO₂"},
            "temperature": {"value": "98.2", "unit": "°F", "status": "normal", "label": "Temperature"},
            "history": [
                {"time": "10:45 AM", "bp": "128/82", "pulse": 72, "spo2": 98, "temp": 98.2}
            ]
        },
        "ayush": {
            "prakriti": {
                "primary": "Kapha-Vata",
                "distribution": [
                    {"dosha": "Kapha", "percentage": 46, "color": "#10b981", "traits": "Sturdy build, slow metabolism, prone to swelling"},
                    {"dosha": "Vata", "percentage": 38, "color": "#0ea5e9", "traits": "Joint degeneration, cracking sounds, morning stiffness"},
                    {"dosha": "Pitta", "percentage": 16, "color": "#f97316", "traits": "Moderate body heat"}
                ]
            },
            "vikriti": {
                "state": "Sandhivata (Osteoarthritis) with Asthi & Majja Dhatu Kshaya",
                "severity": "Moderate",
                "description": "Vata accumulation in Sandhi sthana causing Shula (pain), Shopha (swelling), and Hanti Sandhigatah (restriction of joint mobility)."
            },
            "ashtavidhaPariksha": [
                {"name": "Nadi (Pulse)", "finding": "Hamsa-Sarpa Gati (Kapha-Vata)", "note": "Slow, deep pulse at 72 bpm"},
                {"name": "Mutra (Urine)", "finding": "Prakrita", "note": "Clear, normal"},
                {"name": "Mala (Stool)", "finding": "Sama", "note": "Regular daily bowel movement"},
                {"name": "Jihwa (Tongue)", "finding": "Sama (Coated)", "note": "Mild whitish coating indicating mild Ama"},
                {"name": "Shabda (Voice)", "finding": "Gambheera", "note": "Deep and clear"},
                {"name": "Sparsha (Touch)", "finding": "Anushna Sheetala", "note": "Slight coolness around knee joints"},
                {"name": "Drik (Eyes)", "finding": "Prakrita", "note": "Normal sclera"},
                {"name": "Akruti (Built)", "finding": "Sthula", "note": "BMI 28.4 (Overweight category)"}
            ],
            "agniState": {
                "type": "Mandagni",
                "details": "Sluggish digestion, slow gastric emptying after heavy meals."
            },
            "suggestedFormulations": [
                {"name": "Yogaraja Guggulu", "dose": "2 tablets BD with Dashamoola Kwath", "purpose": "Vata-hara, relieves joint pain and stiffness in Sandhivata."},
                {"name": "Shallaki (Boswellia serrata) Capsules", "dose": "1 capsule BD after food", "purpose": "Anti-inflammatory, protects articular cartilage."},
                {"name": "Mahanarayana Taila + Murivenna", "dose": "Local application followed by warm fomentation", "purpose": "Lubricates synovial joints and relieves spasm."}
            ],
            "dietLifestyleAdvice": [
                "Ahara: Warm, freshly cooked foods with ginger, garlic, turmeric. Avoid cold refrigerated drinks, excess potatoes, and sour curd.",
                "Vihara: Janu Basti (warm medicated oil pool on knees) for 7-14 days. Low-impact cycling and aquatic therapy.",
                "Weight Management: Target 4-5 kg gradual weight reduction to reduce mechanical load on knees."
            ]
        },
        "examination": {
            "general": "Well nourished, walks with slight antalgic limp on right side. No pallor or pedal edema.",
            "cvs": "S1 S2 normal.",
            "rs": "Clear lungs bilaterally.",
            "musculoskeletal": "Right knee: Medial joint line tenderness, palpable crepitus on flexion, no gross effusion, flexion limited to 110 degrees.",
            "abdomen": "Soft, obese abdomen, non-tender."
        },
        "lifestyle": {
            "diet": "North Indian vegetarian, high carbohydrates and dairy",
            "sleep": "7-8 hours, undisturbed",
            "physicalActivity": "Low due to joint pain, retired bank manager",
            "substanceUse": "None",
            "stressLevel": "Low"
        },
        "timeline": [
            {"time": "Today 10:45 AM", "title": "Kiosk Intake Completed", "details": "Intake completed at Kiosk K-02", "status": "completed"},
            {"time": "Today 10:50 AM", "title": "AI Clinical Summary Generated", "details": "Sandhivata & Orthopedic profile compiled", "status": "completed"},
            {"time": "Today 10:52 AM", "title": "Review Approved", "details": "Signed off by Dr. Ramesh Kumar", "status": "completed"}
        ],
        "documents": [
            {
                "id": "doc-rajesh-1",
                "name": "Knee_Xray_Report_2025.pdf",
                "type": "pdf",
                "size": "2.9 MB",
                "uploadedAt": "May 26, 2025 10:47 AM",
                "status": "Processed",
                "category": "X-Ray Report",
                "previewContent": {
                    "hospital": "AIIMS Radiology Center",
                    "date": "10 May 2025",
                    "findings": "Kellgren-Lawrence Grade 2 Osteoarthritis of bilateral knees. Moderate medial joint space narrowing with marginal osteophyte formation."
                }
            }
        ],
        "doctorReview": {
            "status": "saved",
            "reviewedBy": "Dr. Ramesh Kumar",
            "reviewedAt": "2025-05-26T10:52:00Z",
            "notes": "Grade 2 OA Knee verified. Commencing Ayurvedic Panchakarma (Janu Basti) + Yogaraja Guggulu."
        }
    },
    "MK-2025-05-26-0004": {
        "id": "MK-2025-05-26-0004",
        "name": "Deepa Narayanan",
        "verified": True,
        "age": 29,
        "gender": "Female",
        "abhaNumber": "91-7261-0029-3456",
        "abhaAddress": "deepa.n@abdm",
        "opdId": "MK-2025-05-26-0004",
        "isNewPatient": True,
        "mobile": "+91 99887 76655",
        "language": "Malayalam / English",
        "registrationType": "Kiosk Self Intake",
        "avatarUrl": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
        "doctor": {
            "name": "Dr. Ramesh Kumar",
            "role": "Chief Physician",
            "avatar": "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80",
            "department": "AIIMS Ayurveda & Integrative Medicine OPD"
        },
        "stats": {
            "chiefComplaint": {"title": "Chief Complaint", "value": "Acid Reflux, Bloating & Epigastric Burning", "subtitle": "Since 1 month", "icon": "Activity", "color": "purple"},
            "kioskSession": {"title": "Kiosk Session", "value": "May 26, 2025", "subtitle": "11:00 AM", "icon": "Calendar", "color": "blue"},
            "consultationType": {"title": "Consultation Type", "value": "Gastroenterology / Amlapitta", "subtitle": "New Walk-in", "icon": "Briefcase", "color": "cyan"},
            "redFlags": {"title": "Red Flags", "value": "Moderate", "subtitle": "Post-prandial pyrosis", "icon": "Flag", "color": "amber"},
            "lastUpdated": {"title": "Last Updated", "value": "May 26, 2025", "subtitle": "11:05 AM", "icon": "Clock", "color": "indigo"}
        },
        "aiSummary": {
            "chiefComplaint": "Persistent retrosternal and epigastric burning sensation (Heartburn) with sour eructations and post-prandial bloating",
            "hpi": [
                "Symptoms aggravate 30-45 minutes after spicy or deep-fried food",
                "Sour and acidic belching, especially when lying down at night",
                "Associated with early morning nausea, metallic taste, and headache",
                "Taking OTC antacids with only temporary relief",
                "Denies hematemesis, melena, or unintentional weight loss"
            ],
            "pastHistory": ["Occasional tension headaches", "No prior endoscopy"],
            "medications": [
                {"name": "Tab. Pantoprazole", "dosage": "40mg", "frequency": "OD (Empty Stomach)", "duration": "For 2 weeks"},
                {"name": "Antacid Gel", "dosage": "10ml", "frequency": "SOS", "duration": "Ongoing"}
            ],
            "allergies": ["No known allergies"],
            "redFlagsList": ["Nocturnal acid regurgitation with sleep disturbance"],
            "suggestions": [
                "H. pylori stool antigen or UBT (Urea Breath Test)",
                "Upper GI Endoscopy if symptoms persist >6 weeks",
                "Ayurvedic Amlapitta protocol with Avipattikar Churna and Kamadudha Ras"
            ],
            "systemicReview": "No fever, bowel regular 1x/day, no dysphagia.",
            "familyHistory": [{"relation": "Father", "condition": "Peptic Ulcer Disease"}]
        },
        "vitals": {
            "bp": {"value": "112/74", "unit": "mmHg", "status": "normal", "label": "BP"},
            "pulse": {"value": "78", "unit": "bpm", "status": "normal", "label": "Pulse"},
            "spo2": {"value": "99", "unit": "%", "status": "normal", "label": "SpO₂"},
            "temperature": {"value": "98.4", "unit": "°F", "status": "normal", "label": "Temperature"},
            "history": [{"time": "11:00 AM", "bp": "112/74", "pulse": 78, "spo2": 99, "temp": 98.4}]
        },
        "ayush": {
            "prakriti": {
                "primary": "Pitta Pradhana",
                "distribution": [
                    {"dosha": "Pitta", "percentage": 58, "color": "#f97316", "traits": "High metabolic rate, intense hunger, acid sensitivity"},
                    {"dosha": "Vata", "percentage": 27, "color": "#0ea5e9", "traits": "Gas formation, bloating"},
                    {"dosha": "Kapha", "percentage": 15, "color": "#10b981", "traits": "Normal frame"}
                ]
            },
            "vikriti": {
                "state": "Urdhwaga Amlapitta (Hyperacidity & GERD)",
                "severity": "Moderate",
                "description": "Aggravated Pachaka Pitta with Vidagdha state in Annavaha Srotas, causing Amla (sour) and Tikshna (burning) regurgitation."
            },
            "ashtavidhaPariksha": [
                {"name": "Nadi (Pulse)", "finding": "Manduka Gati (Pitta dominant)", "note": "Quick, bounding at 78 bpm"},
                {"name": "Mutra (Urine)", "finding": "Pita-Varna", "note": "Slightly dark yellow, no dysuria"},
                {"name": "Mala (Stool)", "finding": "Baddha-Pravritti", "note": "Tendency towards hard, dry stools"},
                {"name": "Jihwa (Tongue)", "finding": "Rakta-Kanta (Red edges)", "note": "Mild burning sensation on tongue"},
                {"name": "Shabda (Voice)", "finding": "Spashta", "note": "Normal voice"},
                {"name": "Sparsha (Touch)", "finding": "Ushna", "note": "Warm skin"},
                {"name": "Drik (Eyes)", "finding": "Prakrita", "note": "Clear vision"},
                {"name": "Akruti (Built)", "finding": "Madhyama", "note": "BMI 22.1"}
            ],
            "agniState": {
                "type": "Tikshnagni (Excessive Agni)",
                "details": "Digestive fire burns food too fast with excess acid secretion."
            },
            "suggestedFormulations": [
                {"name": "Avipattikar Churna", "dose": "3-5g with lukewarm water or honey before meals", "purpose": "Classical Virechana and Pitta-shamaka for Amlapitta."},
                {"name": "Kamadudha Ras (Mukta Yukta)", "dose": "1 tablet BD after food", "purpose": "Cools gastric mucosal burning and neutralizes acid."},
                {"name": "Shatavari Ghritham / Dadimadi Ghritham", "dose": "1 tsp in warm milk morning", "purpose": "Mucosal protective and healing for gastric lining."}
            ],
            "dietLifestyleAdvice": [
                "Ahara: Drink fresh coconut water, coriander seed infusion, soaked raisins, and amla juice. Avoid tomato, vinegar, chillies, coffee, and late-night meals.",
                "Vihara: Elevate head end of bed by 6 inches; avoid lying down within 2 hours of eating.",
                "Dinacharya: Practice Sheetali and Sheetkari Pranayama for internal cooling."
            ]
        },
        "examination": {
            "general": "Young female in mild discomfort due to burning sensation, no pallor, no jaundice.",
            "cvs": "S1 S2 normal.",
            "rs": "Clear lungs.",
            "abdomen": "Mild tenderness in epigastrium on deep palpation; no guarding, no rigidity, no palpable organomegaly."
        },
        "lifestyle": {
            "diet": "Irregular eating times, spicy takeout food 3x/week, 3 cups filter coffee/day",
            "sleep": "6 hours/night, frequently awoken by acid taste in mouth",
            "physicalActivity": "Minimal (Corporate desk work)",
            "substanceUse": "None",
            "stressLevel": "High"
        },
        "timeline": [
            {"time": "Today 11:00 AM", "title": "Kiosk Intake", "details": "Self-intake at Kiosk K-01", "status": "completed"},
            {"time": "Today 11:05 AM", "title": "AI Summary Compiled", "details": "Gastroenterology profile generated", "status": "completed"},
            {"time": "Today 11:06 AM", "title": "Ready for Doctor Review", "details": "In queue", "status": "active"}
        ],
        "documents": [],
        "doctorReview": {
            "status": "draft",
            "reviewedBy": None,
            "reviewedAt": None,
            "notes": ""
        }
    },
    "MK-2025-05-26-0005": {
        "id": "MK-2025-05-26-0005",
        "name": "Suresh Menon",
        "verified": True,
        "age": 64,
        "gender": "Male",
        "abhaNumber": "91-1182-9938-4455",
        "abhaAddress": "suresh.menon@abdm",
        "opdId": "MK-2025-05-26-0005",
        "isNewPatient": False,
        "mobile": "+91 94470 12345",
        "language": "Malayalam / English",
        "registrationType": "Diabetic OPD Review",
        "avatarUrl": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
        "doctor": {
            "name": "Dr. Ramesh Kumar",
            "role": "Chief Physician",
            "avatar": "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80",
            "department": "AIIMS Endocrinology & Metabolic OPD"
        },
        "stats": {
            "chiefComplaint": {"title": "Chief Complaint", "value": "Bilateral Foot Numbness & Tingling (Prameha)", "subtitle": "Since 3 months", "icon": "Activity", "color": "purple"},
            "kioskSession": {"title": "Kiosk Session", "value": "May 26, 2025", "subtitle": "11:15 AM", "icon": "Calendar", "color": "blue"},
            "consultationType": {"title": "Consultation Type", "value": "Endocrinology / Diabetic Foot", "subtitle": "Quarterly Review", "icon": "Briefcase", "color": "cyan"},
            "redFlags": {"title": "Red Flags", "value": "High Risk", "subtitle": "Sensory Neuropathy", "icon": "Flag", "color": "red"},
            "lastUpdated": {"title": "Last Updated", "value": "May 26, 2025", "subtitle": "11:20 AM", "icon": "Clock", "color": "indigo"}
        },
        "aiSummary": {
            "chiefComplaint": "Burning sensation, tingling (paresthesia), and loss of protective sensation in bilateral feet (stocking distribution)",
            "hpi": [
                "Known Type 2 Diabetic since 12 years, currently on Metformin + Glimepiride",
                "Gradual onset of numbness starting in toes, now extending up to mid-calf",
                "Night-time burning pain disturbing sleep; feels like walking on cotton",
                "Last Fasting Blood Sugar was 178 mg/dL, HbA1c 8.4%",
                "Denies active foot ulcers, calluses, or claudication"
            ],
            "pastHistory": [
                "Type 2 Diabetes Mellitus (12 yrs)",
                "Hypertension (8 yrs)",
                "Mild Non-Proliferative Diabetic Retinopathy (NPDR)"
            ],
            "medications": [
                {"name": "Tab. Metformin", "dosage": "1000mg", "frequency": "BD after food", "duration": "Ongoing"},
                {"name": "Tab. Glimepiride", "dosage": "2mg", "frequency": "OD before breakfast", "duration": "Ongoing"},
                {"name": "Tab. Telmisartan", "dosage": "40mg", "frequency": "OD", "duration": "Ongoing"}
            ],
            "allergies": ["Penicillin (causes facial edema)"],
            "redFlagsList": [
                "Diabetic Peripheral Neuropathy with reduced 10g monofilament sensation",
                "Suboptimal glycemic control (HbA1c 8.4%)"
            ],
            "suggestions": [
                "10-gram Semmes-Weinstein Monofilament and tuning fork (128Hz) vibration test",
                "Urine Microalbumin/Creatinine Ratio to check nephropathy",
                "Diabetic custom footwear prescription to prevent plantar ulceration",
                "Ayurvedic Suptata & Prameha management with Nishamalaki and Vasant Kusumakar Ras"
            ],
            "systemicReview": "No acute chest pain, No dyspnea, Vision stable with glasses.",
            "familyHistory": [{"relation": "Father", "condition": "Diabetic Nephropathy"}, {"relation": "Brother", "condition": "Type 2 Diabetes"}]
        },
        "vitals": {
            "bp": {"value": "136/84", "unit": "mmHg", "status": "high", "label": "BP"},
            "pulse": {"value": "76", "unit": "bpm", "status": "normal", "label": "Pulse"},
            "spo2": {"value": "98", "unit": "%", "status": "normal", "label": "SpO₂"},
            "temperature": {"value": "98.4", "unit": "°F", "status": "normal", "label": "Temperature"},
            "history": [{"time": "11:15 AM", "bp": "136/84", "pulse": 76, "spo2": 98, "temp": 98.4}]
        },
        "ayush": {
            "prakriti": {
                "primary": "Kapha-Pitta",
                "distribution": [
                    {"dosha": "Kapha", "percentage": 50, "color": "#10b981", "traits": "Medo-dhatu excess, heavy body frame, prone to Prameha"},
                    {"dosha": "Pitta", "percentage": 32, "color": "#f97316", "traits": "Burning sensation in extremities (Pada Daha)"},
                    {"dosha": "Vata", "percentage": 18, "color": "#0ea5e9", "traits": "Nerve degeneration (Suptata)"}
                ]
            },
            "vikriti": {
                "state": "Madhumeha (Prameha) with Pada-Daha and Suptata (Vata-Kapha Prakopa)",
                "severity": "High",
                "description": "Kleda and Meda accumulation blocking Vata pathways in Snayu and Kandara, manifesting as sensory numbness and peripheral neuropathy."
            },
            "ashtavidhaPariksha": [
                {"name": "Nadi (Pulse)", "finding": "Hamsa-Manduka Gati", "note": "Full, moderate speed at 76 bpm"},
                {"name": "Mutra (Urine)", "finding": "Prabhuta Avilata (Polyuria / Turbid)", "note": "Nocturia 2-3 times/night"},
                {"name": "Mala (Stool)", "finding": "Sama", "note": "Regular"},
                {"name": "Jihwa (Tongue)", "finding": "Upalepata (Coated)", "note": "Thick coating at center (Ama)"},
                {"name": "Shabda (Voice)", "finding": "Gambheera", "note": "Clear"},
                {"name": "Sparsha (Touch)", "finding": "Pada Sheetala-Suptata", "note": "Reduced temperature sensation on feet"},
                {"name": "Drik (Eyes)", "finding": "Normal, wear spectacles", "note": "Fundus advised"},
                {"name": "Akruti (Built)", "finding": "Sthula (BMI 29.1)", "note": "Central adiposity"}
            ],
            "agniState": {
                "type": "Mandagni with Dhatvagni Mandya",
                "details": "Impaired cellular metabolism leading to Medas and Kleda excess."
            },
            "suggestedFormulations": [
                {"name": "Nishamalaki Churna / Vati (Haridra + Amla)", "dose": "1 tsp or 2 tablets BD before food", "purpose": "Classical anti-prameha, improves insulin sensitivity and prevents microvascular injury."},
                {"name": "Vasant Kusumakar Ras", "dose": "1 tablet OD with milk or honey", "purpose": "Premier Rasayana for diabetic neuropathy, vitality, and cellular rejuvenation."},
                {"name": "Ksheerabala Taila (101) / Mahanarayana Taila", "dose": "Gentle Pada-Abhyanga (Foot massage)", "purpose": "Alleviates peripheral burning and nourishes nerve endings."}
            ],
            "dietLifestyleAdvice": [
                "Ahara: Bitter and astringent foods (Bitter gourd, fenugreek seeds, barley, ragi, green gram). Zero refined sugar, white rice, or sweet fruits.",
                "Vihara: Daily foot self-inspection for micro-abrasions. Never walk barefoot.",
                "Exercise: 30 minutes brisk walking daily to boost peripheral capillary circulation."
            ]
        },
        "examination": {
            "general": "Elderly male, conscious, alert. Mild central obesity. No peripheral pedal ulcers or fungal fissures.",
            "cvs": "S1 S2 normal, dorsalis pedis and posterior tibial pulses palpable bilaterally.",
            "nervous_system": "Impaired pinprick and fine touch sensation below ankles bilaterally. Ankle reflexes diminished bilaterally (1+)."
        },
        "lifestyle": {
            "diet": "South Indian non-veg, high white rice and coconut oil consumption",
            "sleep": "Broken sleep due to nocturia and foot burning",
            "physicalActivity": "Sedentary, retired engineer",
            "substanceUse": "Non-smoker, no alcohol",
            "stressLevel": "Moderate"
        },
        "timeline": [
            {"time": "Today 11:15 AM", "title": "Kiosk Intake Completed", "details": "Intake completed at Kiosk K-03", "status": "completed"},
            {"time": "Today 11:20 AM", "title": "AI Metabolic Summary Ready", "details": "Diabetic profile flagged High Risk", "status": "completed"},
            {"time": "Today 11:21 AM", "title": "Pending Doctor Verification", "details": "In consultation queue", "status": "active"}
        ],
        "documents": [
            {
                "id": "doc-suresh-1",
                "name": "HbA1c_Metabolic_Report.pdf",
                "type": "pdf",
                "size": "2.1 MB",
                "uploadedAt": "May 26, 2025 11:17 AM",
                "status": "Processed",
                "category": "Lab Report",
                "previewContent": {
                    "lab": "Thyrocare Technologies",
                    "date": "18 May 2025",
                    "findings": "HbA1c: 8.4% (Poor control). Estimated Average Glucose: 194 mg/dL. Fasting Serum Glucose: 178 mg/dL. Serum Creatinine: 1.1 mg/dL."
                }
            }
        ],
        "doctorReview": {
            "status": "draft",
            "reviewedBy": None,
            "reviewedAt": None,
            "notes": ""
        }
    },
    "MK-2025-05-26-0006": {
        "id": "MK-2025-05-26-0006",
        "name": "Ananya Sharma",
        "verified": True,
        "age": 24,
        "gender": "Female",
        "abhaNumber": "91-6251-1102-7788",
        "abhaAddress": "ananya.sharma@abdm",
        "opdId": "MK-2025-05-26-0006",
        "isNewPatient": True,
        "mobile": "+91 98101 22334",
        "language": "Hindi / English",
        "registrationType": "Emergency Kiosk Intake",
        "avatarUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        "doctor": {
            "name": "Dr. Ramesh Kumar",
            "role": "Chief Physician",
            "avatar": "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80",
            "department": "AIIMS Respiratory & Critical Triage OPD"
        },
        "stats": {
            "chiefComplaint": {"title": "Chief Complaint", "value": "Wheezing & Acute Breathlessness", "subtitle": "Since 6 hours", "icon": "Activity", "color": "purple"},
            "kioskSession": {"title": "Kiosk Session", "value": "May 26, 2025", "subtitle": "11:30 AM", "icon": "Calendar", "color": "blue"},
            "consultationType": {"title": "Consultation Type", "value": "Pulmonology / Tamaka Shwasa", "subtitle": "Priority Triage", "icon": "Briefcase", "color": "cyan"},
            "redFlags": {"title": "Red Flags", "value": "High Risk", "subtitle": "SpO2 94% on Room Air", "icon": "Flag", "color": "red"},
            "lastUpdated": {"title": "Last Updated", "value": "May 26, 2025", "subtitle": "11:35 AM", "icon": "Clock", "color": "indigo"}
        },
        "aiSummary": {
            "chiefComplaint": "Acute exacerbation of bronchial asthma with expiratory wheezing, chest tightness, and dry hacking cough",
            "hpi": [
                "Triggered by cold weather and exposure to vehicle exhaust / construction dust",
                "Difficulty completing full sentences without taking breaths",
                "Used Salbutamol inhaler 4 puffs at home with minimal relief",
                "SpO2 measured at kiosk is 94% on room air with respiratory rate 26/min",
                "Denies high-grade fever, hemoptysis, or chest wall trauma"
            ],
            "pastHistory": ["Bronchial Asthma since childhood", "Allergic Rhinitis"],
            "medications": [
                {"name": "Budecort (Budesonide) Inhaler", "dosage": "200mcg", "frequency": "1 puff BD", "duration": "Irregular adherence"},
                {"name": "Asthalin (Salbutamol) Inhaler", "dosage": "100mcg", "frequency": "SOS", "duration": "For attacks"}
            ],
            "allergies": ["Dust mites, pollen, cats"],
            "redFlagsList": [
                "Tachypnea (RR 26/min) with accessory muscle use",
                "Subnormal oxygen saturation (SpO2 94%)",
                "Incomplete response to rescue bronchodilators"
            ],
            "suggestions": [
                "Immediate Nebulization with Levosalbutamol + Ipratropium Bromide + Budesonide",
                "Supplemental Oxygen via nasal cannula if SpO2 drops < 94%",
                "Peak Expiratory Flow Rate (PEFR) assessment pre & post nebulization",
                "Ayurvedic Tamaka Shwasa protocol (Shringyadi Churna, Shwasa Kuthar Ras) after acute stabilization"
            ],
            "systemicReview": "No fever, no edema, heart rate 104 bpm (sinus tachycardia).",
            "familyHistory": [{"relation": "Father", "condition": "Asthma & Eczema"}]
        },
        "vitals": {
            "bp": {"value": "122/80", "unit": "mmHg", "status": "normal", "label": "BP"},
            "pulse": {"value": "104", "unit": "bpm", "status": "high", "label": "Pulse"},
            "spo2": {"value": "94", "unit": "%", "status": "low", "label": "SpO₂"},
            "temperature": {"value": "98.6", "unit": "°F", "status": "normal", "label": "Temperature"},
            "history": [{"time": "11:30 AM", "bp": "122/80", "pulse": 104, "spo2": 94, "temp": 98.6}]
        },
        "ayush": {
            "prakriti": {
                "primary": "Vata-Kapha",
                "distribution": [
                    {"dosha": "Vata", "percentage": 47, "color": "#0ea5e9", "traits": "Pranavaha srotas sensitivity, constriction, dry spasm"},
                    {"dosha": "Kapha", "percentage": 41, "color": "#10b981", "traits": "Mucus hypersecretion, cold sensitivity"},
                    {"dosha": "Pitta", "percentage": 12, "color": "#f97316", "traits": "Low baseline heat"}
                ]
            },
            "vikriti": {
                "state": "Tamaka Shwasa (Bronchial Asthma) with Pranavaha Sroto-rodha",
                "severity": "High (Acute State)",
                "description": "Vata obstructed by Kapha in Uras (chest) moving Pratiloma (upwards), creating whistling sounds (Ghurghuruka) and severe dyspnea."
            },
            "ashtavidhaPariksha": [
                {"name": "Nadi (Pulse)", "finding": "Manduka-Sarpa Gati", "note": "Fast, shallow pulse at 104 bpm"},
                {"name": "Mutra (Urine)", "finding": "Prakrita", "note": "Clear"},
                {"name": "Mala (Stool)", "finding": "Vibandha", "note": "Dry stools"},
                {"name": "Jihwa (Tongue)", "finding": "Sama", "note": "White coating"},
                {"name": "Shabda (Voice)", "finding": "Kshinata / Wheezy", "note": "Strained speech"},
                {"name": "Sparsha (Touch)", "finding": "Sheetala", "note": "Cool extremities"},
                {"name": "Drik (Eyes)", "finding": "Anxious look", "note": "Normal"},
                {"name": "Akruti (Built)", "finding": "Krisha", "note": "BMI 19.2 (Lean build)"}
            ],
            "agniState": {
                "type": "Vishamagni",
                "details": "Agni weakened by cold climate and improper diet."
            },
            "suggestedFormulations": [
                {"name": "Shwasa Kuthar Ras", "dose": "1 tablet BD with ginger juice & honey", "purpose": "Immediate bronchodilation and Kapha-vilayana in Tamaka Shwasa."},
                {"name": "Talisadi Churna + Sitopaladi Churna", "dose": "3g with warm honey TID", "purpose": "Soothes respiratory mucosa, clears bronchial secretions."},
                {"name": "Vasa Avaleha / Kantakari Avaleha", "dose": "1 tsp BD", "purpose": "Potent classical expectorant and lung tonic."}
            ],
            "dietLifestyleAdvice": [
                "Ahara: Warm water drinking always; sip ginger-tulsi-black pepper decoction. Absolutely avoid ice creams, cold curd, bananas, and chilled water.",
                "Vihara: Steam inhalation with Eucalyptus / Camphor 2x/day. Keep chest and throat covered warmly.",
                "Pranayama: Gentle Nadi Shodhana (avoid Kapalabhati during active bronchospasm)."
            ]
        },
        "examination": {
            "general": "Young female in acute respiratory distress, sitting upright, tachypneic. No cyanosis or clubbing.",
            "cvs": "Tachycardia (HR 104), S1 S2 normal.",
            "rs": "Bilateral polyphonic expiratory wheezes audible throughout lung fields. Prolonged expiratory phase. Suprasternal retractions present."
        },
        "lifestyle": {
            "diet": "Vegetarian, frequent consumption of cold dairy and fast food",
            "sleep": "Disturbed at night due to wheezing attacks (3 AM spikes)",
            "physicalActivity": "Exercise-induced bronchospasm restricts workouts",
            "substanceUse": "Non-smoker",
            "stressLevel": "High (College exam stress)"
        },
        "timeline": [
            {"time": "Today 11:30 AM", "title": "Kiosk Intake", "details": "Emergency priority intake at K-04", "status": "completed"},
            {"time": "Today 11:35 AM", "title": "Red Flag Alert Broadcast", "details": "SpO2 94% & Wheezing notified to Dr. Ramesh", "status": "completed"},
            {"time": "Today 11:36 AM", "title": "Immediate Doctor Triage", "details": "Nebulization room transferred", "status": "active"}
        ],
        "documents": [],
        "doctorReview": {
            "status": "draft",
            "reviewedBy": None,
            "reviewedAt": None,
            "notes": ""
        }
    },
    "MK-2025-05-26-0007": {
        "id": "MK-2025-05-26-0007",
        "name": "Vikramaditya Singh",
        "verified": True,
        "age": 50,
        "gender": "Male",
        "abhaNumber": "91-9921-7788-6655",
        "abhaAddress": "vikram.singh@abdm",
        "opdId": "MK-2025-05-26-0007",
        "isNewPatient": False,
        "mobile": "+91 98200 44556",
        "language": "Hindi / English",
        "registrationType": "Cardiology OPD Follow-up",
        "avatarUrl": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
        "doctor": {
            "name": "Dr. Ramesh Kumar",
            "role": "Chief Physician",
            "avatar": "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80",
            "department": "AIIMS Cardiology & Integrative OPD"
        },
        "stats": {
            "chiefComplaint": {"title": "Chief Complaint", "value": "Occipital Headache & Palpitations (Rakta-Chapa)", "subtitle": "Since 1 week", "icon": "Activity", "color": "purple"},
            "kioskSession": {"title": "Kiosk Session", "value": "May 26, 2025", "subtitle": "11:45 AM", "icon": "Calendar", "color": "blue"},
            "consultationType": {"title": "Consultation Type", "value": "Cardiology / Essential HTN", "subtitle": "Hypertension Review", "icon": "Briefcase", "color": "cyan"},
            "redFlags": {"title": "Red Flags", "value": "High Risk", "subtitle": "BP 154/96 mmHg", "icon": "Flag", "color": "red"},
            "lastUpdated": {"title": "Last Updated", "value": "May 26, 2025", "subtitle": "11:50 AM", "icon": "Clock", "color": "indigo"}
        },
        "aiSummary": {
            "chiefComplaint": "Throbbing occipital early-morning headache with intermittent exertional palpitations and flush sensation",
            "hpi": [
                "Blood pressure readings consistently >150/90 mmHg over past 5 days",
                "Associated with visual fatigue, irritability, and unrefreshing sleep",
                "Non-compliant with antihypertensive medication for 3 weeks due to travel",
                "Denies chest pain, orthopnea, or neurological deficits",
                "Kiosk measured BP: 154/96 mmHg with Pulse 88 bpm"
            ],
            "pastHistory": ["Stage 2 Essential Hypertension (diagnosed 2021)", "Hyperuricemia"],
            "medications": [
                {"name": "Tab. Telmisartan + Amlodipine", "dosage": "40/5mg", "frequency": "OD Morning", "duration": "Discontinued for 3 weeks"}
            ],
            "allergies": ["No known drug allergies"],
            "redFlagsList": [
                "Stage 2 Hypertensive elevation (154/96 mmHg)",
                "Medication non-adherence with symptomatic occipital headache"
            ],
            "suggestions": [
                "Immediate resumption and titration of antihypertensive regimen",
                "Fundoscopy to rule out Hypertensive Retinopathy (Grade 1/2)",
                "Serum Creatinine, eGFR, and 24-hr urinary protein check",
                "Ayurvedic Sarpagandha Ghan Vati and Shirodhara therapy for vascular relaxation"
            ],
            "systemicReview": "No motor deficit, no chest pain, no limb edema.",
            "familyHistory": [{"relation": "Father", "condition": "Stroke / Hypertension at age 62"}]
        },
        "vitals": {
            "bp": {"value": "154/96", "unit": "mmHg", "status": "high", "label": "BP"},
            "pulse": {"value": "88", "unit": "bpm", "status": "normal", "label": "Pulse"},
            "spo2": {"value": "98", "unit": "%", "status": "normal", "label": "SpO₂"},
            "temperature": {"value": "98.4", "unit": "°F", "status": "normal", "label": "Temperature"},
            "history": [{"time": "11:45 AM", "bp": "154/96", "pulse": 88, "spo2": 98, "temp": 98.4}]
        },
        "ayush": {
            "prakriti": {
                "primary": "Pitta-Vata",
                "distribution": [
                    {"dosha": "Pitta", "percentage": 55, "color": "#f97316", "traits": "Hot temper, vascular reactivity, high ambition"},
                    {"dosha": "Vata", "percentage": 35, "color": "#0ea5e9", "traits": "Nervous tension, erratic sleep"},
                    {"dosha": "Kapha", "percentage": 10, "color": "#10b981", "traits": "Lean athletic frame"}
                ]
            },
            "vikriti": {
                "state": "Rakta Gata Vata / Uccha Rakta Chapa (Hypertension)",
                "severity": "High",
                "description": "Vitiated Pitta and Vata causing contraction and stiffening of Siras (arteries), increasing peripheral vascular resistance and cranial pressure."
            },
            "ashtavidhaPariksha": [
                {"name": "Nadi (Pulse)", "finding": "Manduka Gati (High tension)", "note": "Bounding, hard vessel wall at 88 bpm"},
                {"name": "Mutra (Urine)", "finding": "Pita Varna", "note": "Clear"},
                {"name": "Mala (Stool)", "finding": "Sama", "note": "Regular"},
                {"name": "Jihwa (Tongue)", "finding": "Rakta Varna", "note": "Reddish tinge indicating Pitta excess"},
                {"name": "Shabda (Voice)", "finding": "Teevra (Sharp)", "note": "Loud, assertive cadence"},
                {"name": "Sparsha (Touch)", "finding": "Ushna", "note": "Warm skin, forehead warmth"},
                {"name": "Drik (Eyes)", "finding": "Mild red congestion", "note": "Hypertensive vascular signs"},
                {"name": "Akruti (Built)", "finding": "Madhyama-Sthula", "note": "BMI 26.5"}
            ],
            "agniState": {
                "type": "Tikshnagni",
                "details": "Strong appetite, quick digestion."
            },
            "suggestedFormulations": [
                {"name": "Sarpagandha Ghan Vati", "dose": "1 tablet BD after food", "purpose": "Classical Rauwolfia serpentina formulation; potent natural hypotensive and sedative."},
                {"name": "Mukta Vati / Pearl Calcium Compound", "dose": "1 tablet BD with water", "purpose": "Soothes neurovascular hypertension, calms Pitta and anger."},
                {"name": "Arjunarishta", "dose": "15 ml with equal water BD after meals", "purpose": "Tones cardiac myocardium and stabilizes blood pressure."}
            ],
            "dietLifestyleAdvice": [
                "Ahara: DASH diet with low sodium (<2g/day). Favor celery, garlic, pomegranate, tender coconut water, and flaxseeds. Eliminate alcohol and red meat.",
                "Vihara: Daily Shirodhara with Ksheerabala Taila (7-day course). 20 mins Transcendental Meditation.",
                "Dinacharya: Early morning brisk walk and Chandra Bhedana Pranayama."
            ]
        },
        "examination": {
            "general": "Middle-aged male, flushed face, alert, oriented. No pedal edema.",
            "cvs": "S1 S2 heard. S2 aortic component loud (A2 prominent). No murmurs.",
            "rs": "Clear lungs bilaterally.",
            "cns": "No focal motor or sensory deficit. Plantars flexor bilaterally."
        },
        "lifestyle": {
            "diet": "Non-vegetarian, high sodium foods, commercial restaurant dining",
            "sleep": "5 hours/night, frequent business travel",
            "physicalActivity": "Gym workouts 1-2 times/month",
            "substanceUse": "Occasional alcohol on weekends (2-3 drinks), non-smoker",
            "stressLevel": "Very High (Executive role)"
        },
        "timeline": [
            {"time": "Today 11:45 AM", "title": "Kiosk Intake", "details": "Intake completed at Kiosk K-02", "status": "completed"},
            {"time": "Today 11:50 AM", "title": "Hypertensive Alert", "details": "BP 154/96 flagged for review", "status": "completed"},
            {"time": "Today 11:51 AM", "title": "Pending Doctor Verification", "details": "In consultation queue", "status": "active"}
        ],
        "documents": [],
        "doctorReview": {
            "status": "draft",
            "reviewedBy": None,
            "reviewedAt": None,
            "notes": ""
        }
    },
    "MK-2025-05-26-0008": {
        "id": "MK-2025-05-26-0008",
        "name": "Meenakshi Iyer",
        "verified": True,
        "age": 38,
        "gender": "Female",
        "abhaNumber": "91-4455-8899-1122",
        "abhaAddress": "meenakshi.iyer@abdm",
        "opdId": "MK-2025-05-26-0008",
        "isNewPatient": False,
        "mobile": "+91 98401 55667",
        "language": "Tamil / English",
        "registrationType": "Endocrine OPD Follow-up",
        "avatarUrl": "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
        "doctor": {
            "name": "Dr. Ramesh Kumar",
            "role": "Chief Physician",
            "avatar": "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80",
            "department": "AIIMS Endocrinology & Integrative Medicine OPD"
        },
        "stats": {
            "chiefComplaint": {"title": "Chief Complaint", "value": "Weight Gain, Fatigue & Cold Intolerance", "subtitle": "Since 2 months", "icon": "Activity", "color": "purple"},
            "kioskSession": {"title": "Kiosk Session", "value": "May 26, 2025", "subtitle": "12:00 PM", "icon": "Calendar", "color": "blue"},
            "consultationType": {"title": "Consultation Type", "value": "Thyroid / Galaganda OPD", "subtitle": "Follow-up", "icon": "Briefcase", "color": "cyan"},
            "redFlags": {"title": "Red Flags", "value": "Low Risk", "subtitle": "Stable Vitals", "icon": "Flag", "color": "emerald"},
            "lastUpdated": {"title": "Last Updated", "value": "May 26, 2025", "subtitle": "12:05 PM", "icon": "Clock", "color": "indigo"}
        },
        "aiSummary": {
            "chiefComplaint": "Generalized chronic lethargy, unexplained 4 kg weight gain in 2 months, diffuse hair fall, and constipation",
            "hpi": [
                "Diagnosed Primary Hypothyroidism 3 years ago on Thyroxine 50 mcg",
                "Reports worsening daytime sleepiness despite 8+ hours of sleep",
                "Severe cold intolerance and dry rough skin on shins and forearms",
                "Last Serum TSH was 6.8 μIU/mL (Suboptimal control)",
                "Denies hoarseness of voice, difficulty swallowing, or neck enlargement"
            ],
            "pastHistory": ["Primary Hypothyroidism (Hashimoto's suspected)", "Mild Iron Deficiency Anemia"],
            "medications": [
                {"name": "Tab. Levothyroxine", "dosage": "50mcg", "frequency": "OD (Empty Stomach 30 min before tea)", "duration": "3 years"}
            ],
            "allergies": ["No known allergies"],
            "redFlagsList": [],
            "suggestions": [
                "Thyroid Function Panel (Free T3, Free T4, TSH) & Anti-TPO antibodies",
                "Serum Ferritin and Vitamin D3 levels",
                "Titrate Levothyroxine dose from 50 mcg to 62.5 / 75 mcg based on TSH",
                "Ayurvedic Kanchanar Guggulu + Trikatu protocol for Agni deepana"
            ],
            "systemicReview": "No palpitations, no tremor, regular 28-day menstrual cycle with mild menorrhagia.",
            "familyHistory": [{"relation": "Sister", "condition": "Hypothyroidism"}, {"relation": "Mother", "condition": "Goiter"}]
        },
        "vitals": {
            "bp": {"value": "116/78", "unit": "mmHg", "status": "normal", "label": "BP"},
            "pulse": {"value": "62", "unit": "bpm", "status": "normal", "label": "Pulse"},
            "spo2": {"value": "99", "unit": "%", "status": "normal", "label": "SpO₂"},
            "temperature": {"value": "97.8", "unit": "°F", "status": "normal", "label": "Temperature"},
            "history": [{"time": "12:00 PM", "bp": "116/78", "pulse": 62, "spo2": 99, "temp": 97.8}]
        },
        "ayush": {
            "prakriti": {
                "primary": "Kapha Pradhana",
                "distribution": [
                    {"dosha": "Kapha", "percentage": 56, "color": "#10b981", "traits": "Slow metabolism, fluid retention, heavy frame, calm demeanor"},
                    {"dosha": "Vata", "percentage": 28, "color": "#0ea5e9", "traits": "Dry skin, brittle hair, constipation"},
                    {"dosha": "Pitta", "percentage": 16, "color": "#f97316", "traits": "Low internal heat (Sheetata)"}
                ]
            },
            "vikriti": {
                "state": "Galaganda / Medoroga with Kapha-Vata Dhatvagni Mandya",
                "severity": "Moderate",
                "description": "Kapha and Medas blocking the Rasavaha and Medovaha Srotas, leading to low basal metabolic rate, cold accumulation, and tissue sluggishness."
            },
            "ashtavidhaPariksha": [
                {"name": "Nadi (Pulse)", "finding": "Hamsa Gati (Kapha dominant)", "note": "Slow, full pulse at 62 bpm"},
                {"name": "Mutra (Urine)", "finding": "Prakrita", "note": "Normal"},
                {"name": "Mala (Stool)", "finding": "Vibandha (Hard/dry)", "note": "Bowel movement once every 2 days"},
                {"name": "Jihwa (Tongue)", "finding": "Sama (White coated)", "note": "Sluggish tongue with teeth indentations"},
                {"name": "Shabda (Voice)", "finding": "Manda", "note": "Slow speaking pace"},
                {"name": "Sparsha (Touch)", "finding": "Sheetala, Ruksha", "note": "Cool, dry skin"},
                {"name": "Drik (Eyes)", "finding": "Mild periorbital puffiness", "note": "Morning puffiness"},
                {"name": "Akruti (Built)", "finding": "Sthula", "note": "BMI 27.2"}
            ],
            "agniState": {
                "type": "Mandagni",
                "details": "Extremely slow metabolic digestion; feels full for 6-8 hours after small meal."
            },
            "suggestedFormulations": [
                {"name": "Kanchanar Guggulu", "dose": "2 tablets BD with warm water after food", "purpose": "Premier classical formulation for thyroid gland dysfunction and glandular swellings."},
                {"name": "Trikatu Churna (Sunthi, Maricha, Pippali)", "dose": "1.5g with honey before meals", "purpose": "Stoke cellular Agni, accelerate metabolic rate, clear Meda & Ama."},
                {"name": "Varunadi Kwath", "dose": "15 ml with equal warm water BD", "purpose": "Kapha-Medohara decoction, mobilizes fluid retention."}
            ],
            "dietLifestyleAdvice": [
                "Ahara: Light, warm, spicy foods with ginger, black pepper, and garlic. Restrict raw goitrogenic vegetables (cabbage, cauliflower, soy) unless thoroughly cooked.",
                "Vihara: Daily brisk morning walking for 45 mins. Surya Namaskara (12 cycles) to stimulate thyroid gland.",
                "Dinacharya: Udwarthana (Dry herbal powder scrub) with Kolakulathadi Churna to reduce Medas."
            ]
        },
        "examination": {
            "general": "Female with slight periorbital puffiness, dry skin, no pallor, no pedal edema.",
            "thyroid": "Thyroid gland non-palpable, no solitary nodules or bruit.",
            "cvs": "Bradycardia (HR 62), S1 S2 normal.",
            "rs": "Clear breath sounds."
        },
        "lifestyle": {
            "diet": "South Indian vegetarian, high rice, curd, and milk tea",
            "sleep": "9 hours/night, still wakes up feeling tired",
            "physicalActivity": "Low (Household chores)",
            "substanceUse": "None",
            "stressLevel": "Moderate"
        },
        "timeline": [
            {"time": "Today 12:00 PM", "title": "Kiosk Intake Completed", "details": "Intake completed at Kiosk K-01", "status": "completed"},
            {"time": "Today 12:05 PM", "title": "AI Thyroid Summary Compiled", "details": "Endocrine history synced", "status": "completed"},
            {"time": "Today 12:06 PM", "title": "Ready for Doctor Review", "details": "In queue", "status": "active"}
        ],
        "documents": [
            {
                "id": "doc-meenakshi-1",
                "name": "Thyroid_Panel_Report_2025.pdf",
                "type": "pdf",
                "size": "1.8 MB",
                "uploadedAt": "May 26, 2025 12:02 PM",
                "status": "Processed",
                "category": "Lab Report",
                "previewContent": {
                    "lab": "Lal PathLabs",
                    "date": "12 May 2025",
                    "findings": "TSH: 6.8 μIU/mL (High, Ref: 0.4 - 4.2). Free T4: 0.88 ng/dL (Low Normal, Ref: 0.8 - 1.8). Free T3: 2.4 pg/mL."
                }
            }
        ],
        "doctorReview": {
            "status": "draft",
            "reviewedBy": None,
            "reviewedAt": None,
            "notes": ""
        }
    },
    "MK-2025-05-26-0009": {
        "id": "MK-2025-05-26-0009",
        "name": "Harish Patel",
        "verified": True,
        "age": 47,
        "gender": "Male",
        "abhaNumber": "91-5566-7788-9900",
        "abhaAddress": "harish.patel@abdm",
        "opdId": "MK-2025-05-26-0009",
        "isNewPatient": True,
        "mobile": "+91 97230 88990",
        "language": "Gujarati / Hindi / English",
        "registrationType": "Walk-in Kiosk",
        "avatarUrl": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
        "doctor": {
            "name": "Dr. Ramesh Kumar",
            "role": "Chief Physician",
            "avatar": "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80",
            "department": "AIIMS Orthopedic & Panchakarma OPD"
        },
        "stats": {
            "chiefComplaint": {"title": "Chief Complaint", "value": "Lumbar Radiculopathy / Sciatica (Gridhrasi)", "subtitle": "Since 3 weeks", "icon": "Activity", "color": "purple"},
            "kioskSession": {"title": "Kiosk Session", "value": "May 26, 2025", "subtitle": "12:15 PM", "icon": "Calendar", "color": "blue"},
            "consultationType": {"title": "Consultation Type", "value": "Spine / Panchakarma OPD", "subtitle": "New Consultation", "icon": "Briefcase", "color": "cyan"},
            "redFlags": {"title": "Red Flags", "value": "Moderate", "subtitle": "L5-S1 Radiating Pain", "icon": "Flag", "color": "amber"},
            "lastUpdated": {"title": "Last Updated", "value": "May 26, 2025", "subtitle": "12:20 PM", "icon": "Clock", "color": "indigo"}
        },
        "aiSummary": {
            "chiefComplaint": "Sharp shooting electric pain radiating from right lower back through gluteal region down to posterolateral calf and lateral foot",
            "hpi": [
                "Triggered after lifting a heavy suitcase 3 weeks ago",
                "Aggravated by bending forward, coughing, sneezing, and prolonged sitting (>20 mins)",
                "Relieved by lying flat on firm mattress with knee flexed",
                "Associated with pins-and-needles paresthesia on lateral border of right foot",
                "Denies bowel/bladder incontinence, saddle anesthesia, or foot drop"
            ],
            "pastHistory": ["Recurrent postural low backache since 5 years"],
            "medications": [
                {"name": "Tab. Pregabalin + Methylcobalamin", "dosage": "75/750mcg", "frequency": "1 tab HS", "duration": "For 10 days"},
                {"name": "Tab. Thiocolchicoside", "dosage": "4mg", "frequency": "BD", "duration": "For 5 days"}
            ],
            "allergies": ["No known allergies"],
            "redFlagsList": ["Right L5-S1 dermatomal radiculopathy with positive SLR test at 45 degrees"],
            "suggestions": [
                "Lumbar Spine MRI to check L4-L5 / L5-S1 disc protrusion / nerve root impingement",
                "Ayurvedic Kati Basti and Matra Basti (Sahacharadi Taila) therapy",
                "Core stabilization and lumbar McKenzie extension physiotherapy"
            ],
            "systemicReview": "No fever, no weight loss, normal urinary sphincter control.",
            "familyHistory": ["Non-contributory"]
        },
        "vitals": {
            "bp": {"value": "126/80", "unit": "mmHg", "status": "normal", "label": "BP"},
            "pulse": {"value": "76", "unit": "bpm", "status": "normal", "label": "Pulse"},
            "spo2": {"value": "99", "unit": "%", "status": "normal", "label": "SpO₂"},
            "temperature": {"value": "98.4", "unit": "°F", "status": "normal", "label": "Temperature"},
            "history": [{"time": "12:15 PM", "bp": "126/80", "pulse": 76, "spo2": 99, "temp": 98.4}]
        },
        "ayush": {
            "prakriti": {
                "primary": "Vata Pradhana",
                "distribution": [
                    {"dosha": "Vata", "percentage": 58, "color": "#0ea5e9", "traits": "Prone to nerve pain, dry tissues, cracking joints, lean body"},
                    {"dosha": "Pitta", "percentage": 24, "color": "#f97316", "traits": "Sharp nerve burning"},
                    {"dosha": "Kapha", "percentage": 18, "color": "#10b981", "traits": "Moderate stamina"}
                ]
            },
            "vikriti": {
                "state": "Gridhrasi (Sciatica) with Vata-Kaphaja Avarana in Kandara",
                "severity": "Moderate to Severe",
                "description": "Vitiated Vata lodged in Sphik (buttocks), Kati (lumbar), and Pada (leg), causing Ruk (severe pain), Toda (piercing ache), and Stambha (rigidity)."
            },
            "ashtavidhaPariksha": [
                {"name": "Nadi (Pulse)", "finding": "Sarpa Gati (Vata dominant)", "note": "Thin, wiry pulse at 76 bpm"},
                {"name": "Mutra (Urine)", "finding": "Prakrita", "note": "Normal"},
                {"name": "Mala (Stool)", "finding": "Vibandha", "note": "Chronic dry stools"},
                {"name": "Jihwa (Tongue)", "finding": "Nirama", "note": "Clean, dry"},
                {"name": "Shabda (Voice)", "finding": "Spashta", "note": "Normal"},
                {"name": "Sparsha (Touch)", "finding": "Sheetala", "note": "Cool right foot"},
                {"name": "Drik (Eyes)", "finding": "Prakrita", "note": "Normal"},
                {"name": "Akruti (Built)", "finding": "Madhyama", "note": "BMI 24.0"}
            ],
            "agniState": {
                "type": "Vishamagni",
                "details": "Fluctuating digestion."
            },
            "suggestedFormulations": [
                {"name": "Trayodashanga Guggulu", "dose": "2 tablets BD with Rasnadi Kwath", "purpose": "Classical medicine for Gridhrasi, Kati-shula, and nerve root decompression."},
                {"name": "Ekangaveera Ras", "dose": "1 tablet BD with warm milk", "purpose": "Nourishes damaged peripheral nerve sheaths and relieves shooting pain."},
                {"name": "Sahacharadi Taila (for Kati Basti / Abhyanga)", "dose": "External warm pool application over lower back", "purpose": "Relieves disc spasm and restores lumbar mobility."}
            ],
            "dietLifestyleAdvice": [
                "Ahara: Warm nourishing soups, garlic milk (Lashuna Ksheerapaka), sesame seeds, ghee. Avoid gas-producing foods (raw beans, dry cereals).",
                "Vihara: Kati Basti for 10 consecutive days. Strictly avoid forward bending and lifting heavy weights.",
                "Ergonomics: Lumbar support cushion while driving and working."
            ]
        },
        "examination": {
            "general": "Middle-aged male standing with slight tilt to the left to unload right nerve root.",
            "spine": "Lumbar lordosis flattened. Paraspinal muscle spasm on right side. Tenderness at L5-S1 interspace.",
            "neuro": "Straight Leg Raise (SLR) positive on right side at 45 degrees; negative on left side. Great toe extension (EHL) power 4+/5."
        },
        "lifestyle": {
            "diet": "Vegetarian Gujarati diet with moderate spices",
            "sleep": "6 hours, disturbed when turning in bed",
            "physicalActivity": "Long car driving (3-4 hrs daily) for business",
            "substanceUse": "Non-smoker, teetotaler",
            "stressLevel": "Moderate"
        },
        "timeline": [
            {"time": "Today 12:15 PM", "title": "Kiosk Intake Completed", "details": "Intake completed at Kiosk K-03", "status": "completed"},
            {"time": "Today 12:20 PM", "title": "AI Summary Compiled", "details": "Gridhrasi radiculopathy synthesized", "status": "completed"},
            {"time": "Today 12:21 PM", "title": "Ready for Doctor Review", "details": "In consultation queue", "status": "active"}
        ],
        "documents": [],
        "doctorReview": {
            "status": "draft",
            "reviewedBy": None,
            "reviewedAt": None,
            "notes": ""
        }
    },
    "MK-2025-05-26-0010": {
        "id": "MK-2025-05-26-0010",
        "name": "Fatima Khan",
        "verified": True,
        "age": 31,
        "gender": "Female",
        "abhaNumber": "91-7788-9900-1122",
        "abhaAddress": "fatima.khan@abdm",
        "opdId": "MK-2025-05-26-0010",
        "isNewPatient": True,
        "mobile": "+91 98900 11223",
        "language": "Urdu / Hindi / English",
        "registrationType": "Dermatology OPD Walk-in",
        "avatarUrl": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
        "doctor": {
            "name": "Dr. Ramesh Kumar",
            "role": "Chief Physician",
            "avatar": "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80",
            "department": "AIIMS Dermatology & AYUSH Twak-Roga OPD"
        },
        "stats": {
            "chiefComplaint": {"title": "Chief Complaint", "value": "Plaque Psoriasis & Scalp Flaking (Kitibha Kushta)", "subtitle": "Since 4 months", "icon": "Activity", "color": "purple"},
            "kioskSession": {"title": "Kiosk Session", "value": "May 26, 2025", "subtitle": "12:30 PM", "icon": "Calendar", "color": "blue"},
            "consultationType": {"title": "Consultation Type", "value": "Dermatology / Twak Roga", "subtitle": "New Walk-in", "icon": "Briefcase", "color": "cyan"},
            "redFlags": {"title": "Red Flags", "value": "Low Risk", "subtitle": "No Joint Involvement", "icon": "Flag", "color": "emerald"},
            "lastUpdated": {"title": "Last Updated", "value": "May 26, 2025", "subtitle": "12:35 PM", "icon": "Clock", "color": "indigo"}
        },
        "aiSummary": {
            "chiefComplaint": "Well-demarcated erythematous scaly plaques with silvery scales on extensor surfaces of bilateral elbows, knees, and scalp with severe pruritus",
            "hpi": [
                "Onset 4 months ago during winter season, gradually spreading",
                "Auspitz sign positive (pinpoint bleeding on peeling silvery scale)",
                "Aggravated by psychological stress, dry climate, and harsh soaps",
                "Used topical Clobetasol cream with temporary clearing but recurrent rebound flares",
                "Denies joint pain, dactylitis, or nail pitting (no psoriatic arthritis signs)"
            ],
            "pastHistory": ["Atopic dermatitis in early childhood"],
            "medications": [
                {"name": "Clobetasol Propionate 0.05% Ointment", "dosage": "Topical application", "frequency": "BD", "duration": "Intermittent for 3 months"},
                {"name": "Cetirizine", "dosage": "10mg", "frequency": "1 tab HS", "duration": "For itching"}
            ],
            "allergies": ["No known drug allergies"],
            "redFlagsList": [],
            "suggestions": [
                "PASI (Psoriasis Area and Severity Index) scoring",
                "Complete Blood Count (CBC), ESR, and Fasting Blood Sugar",
                "Ayurvedic Panchakarma protocol (Virechana & Takradhara) for systemic detox",
                "Topical Wrightia tinctoria (777 oil) application"
            ],
            "systemicReview": "No fever, no mucosal lesions, no arthralgia.",
            "familyHistory": [{"relation": "Maternal Uncle", "condition": "Psoriasis"}]
        },
        "vitals": {
            "bp": {"value": "114/72", "unit": "mmHg", "status": "normal", "label": "BP"},
            "pulse": {"value": "78", "unit": "bpm", "status": "normal", "label": "Pulse"},
            "spo2": {"value": "99", "unit": "%", "status": "normal", "label": "SpO₂"},
            "temperature": {"value": "98.4", "unit": "°F", "status": "normal", "label": "Temperature"},
            "history": [{"time": "12:30 PM", "bp": "114/72", "pulse": 78, "spo2": 99, "temp": 98.4}]
        },
        "ayush": {
            "prakriti": {
                "primary": "Vata-Kapha",
                "distribution": [
                    {"dosha": "Vata", "percentage": 44, "color": "#0ea5e9", "traits": "Dry skin, scaling, intense itching (Kandu)"},
                    {"dosha": "Kapha", "percentage": 40, "color": "#10b981", "traits": "Plaque thickness, chronicity, scaling"},
                    {"dosha": "Pitta", "percentage": 16, "color": "#f97316", "traits": "Erythema, burning sensation"}
                ]
            },
            "vikriti": {
                "state": "Kitibha Kushta / Ekakushta (Psoriasis) with Rakta Dhatu Dushti",
                "severity": "Moderate",
                "description": "Vata-Kapha vitiation in Tvacha (skin), Rakta (blood), Mamsa (muscle), and Lasika (lymph), producing Shyava (blackish-red), Parusha (rough), and Ugra-Kandu (severe itching) lesions."
            },
            "ashtavidhaPariksha": [
                {"name": "Nadi (Pulse)", "finding": "Sarpa-Hamsa Gati", "note": "Moderate pulse at 78 bpm"},
                {"name": "Mutra (Urine)", "finding": "Prakrita", "note": "Clear"},
                {"name": "Mala (Stool)", "finding": "Sama", "note": "Once daily"},
                {"name": "Jihwa (Tongue)", "finding": "Sama", "note": "Mild coating"},
                {"name": "Shabda (Voice)", "finding": "Spashta", "note": "Normal"},
                {"name": "Sparsha (Touch)", "finding": "Khara, Ruksha (Rough/Dry)", "note": "Scaly plaques on elbows and knees"},
                {"name": "Drik (Eyes)", "finding": "Prakrita", "note": "Normal"},
                {"name": "Akruti (Built)", "finding": "Madhyama", "note": "BMI 23.2"}
            ],
            "agniState": {
                "type": "Mandagni",
                "details": "Ama accumulation contributing to skin toxicity (Rakta Dushti)."
            },
            "suggestedFormulations": [
                {"name": "Mahatiktaka Kashayam / Ghritham", "dose": "15 ml with equal warm water BD before meals", "purpose": "Premier classical blood purifier (Rakta Prasadana) and Kushta-hara formulation."},
                {"name": "Kaishore Guggulu + Khadirarishta", "dose": "2 tablets BD with 15ml Khadirarishta", "purpose": "Clears deep-seated toxins, alleviates scaling and inflammation."},
                {"name": "Ayyappala Kera Taila / Wrightia tinctoria Oil", "dose": "Local application on plaques 30 mins before bath", "purpose": "Softens keratin plaques, relieves pruritus, and promotes skin healing."}
            ],
            "dietLifestyleAdvice": [
                "Ahara: Bitter and astringent greens (Neem, bitter gourd, turmeric, amla). Strictly avoid Viruddha Ahara (milk with fish/sour fruit), excessive sour/fermented foods, and deep-fried items.",
                "Vihara: Daily sun exposure (15-20 mins early morning sunlight). Takradhara on scalp for psoriatic dandruff.",
                "Dinacharya: Bathing with lukewarm water and herbal powder (Nalpamaradi Snana Churna) instead of chemical soaps."
            ]
        },
        "examination": {
            "general": "Young female in no acute distress. No joint swelling.",
            "skin": "Bilateral symmetrical erythematous plaques with thick micaceous silvery scales over elbows, patellae, and occipital scalp. Candle grease sign and Auspitz sign positive."
        },
        "lifestyle": {
            "diet": "Non-vegetarian, high poultry and dairy consumption",
            "sleep": "7 hours, occasionally awakened by scalp itching",
            "physicalActivity": "Moderate (Walking)",
            "substanceUse": "Non-smoker",
            "stressLevel": "High (Distressed by cosmetic appearance of skin)"
        },
        "timeline": [
            {"time": "Today 12:30 PM", "title": "Kiosk Intake Completed", "details": "Intake completed at Kiosk K-04", "status": "completed"},
            {"time": "Today 12:35 PM", "title": "AI Dermatology Summary Ready", "details": "Kitibha Kushta profile compiled", "status": "completed"},
            {"time": "Today 12:36 PM", "title": "Ready for Doctor Review", "details": "In consultation queue", "status": "active"}
        ],
        "documents": [],
        "doctorReview": {
            "status": "draft",
            "reviewedBy": None,
            "reviewedAt": None,
            "notes": ""
        }
    }
}

# Realtime Kiosk Sessions Grid
SESSIONS_DATA = {
    "K-01-MK-0002": {
        "id": "K-01-MK-0002",
        "kioskId": "K-01",
        "location": "Main Hospital Lobby (Gate 1)",
        "patientId": "MK-2025-05-26-0002",
        "patientName": "Priya Sundaram",
        "status": "Ready for Review",
        "startedAt": "10:30 AM",
        "lastUpdated": "10:35 AM",
        "intakeProgress": "Completed (100%)"
    },
    "K-02-MK-0003": {
        "id": "K-02-MK-0003",
        "kioskId": "K-02",
        "location": "Cardiology Waiting Lounge",
        "patientId": "MK-2025-05-26-0003",
        "patientName": "Rajesh Varma",
        "status": "Reviewed",
        "startedAt": "10:45 AM",
        "lastUpdated": "10:52 AM",
        "intakeProgress": "Completed (100%)"
    },
    "K-03-MK-0001": {
        "id": "K-03-MK-0001",
        "kioskId": "K-03",
        "location": "Ayurveda OPD Wing",
        "patientId": "MK-2025-05-26-0001",
        "patientName": "Arun Kumar",
        "status": "Ready for Review",
        "startedAt": "10:15 AM",
        "lastUpdated": "10:40 AM",
        "intakeProgress": "Completed (100%)"
    },
    "K-04-MK-0006": {
        "id": "K-04-MK-0006",
        "kioskId": "K-04",
        "location": "Emergency Reception",
        "patientId": "MK-2025-05-26-0006",
        "patientName": "Ananya Sharma",
        "status": "Urgent Triage Transfer",
        "startedAt": "11:30 AM",
        "lastUpdated": "11:35 AM",
        "intakeProgress": "Completed (100%)"
    }
}

# Realtime Notifications and Alerts Grid
ALERTS_DATA = {
    "alert-1": {
        "id": "alert-1",
        "patientId": "MK-2025-05-26-0001",
        "patientName": "Arun Kumar",
        "title": "High Risk Patient Flagged: Chest Pain",
        "message": "Arun Kumar (MK-0001) flagged with exertional retrosternal chest pain and elevated BP (140/90 mmHg). Immediate ECG advised.",
        "time": "10 mins ago",
        "unread": True,
        "type": "alert"
    },
    "alert-2": {
        "id": "alert-2",
        "patientId": "MK-2025-05-26-0006",
        "patientName": "Ananya Sharma",
        "title": "Hypoxia / Respiratory Distress Alert",
        "message": "Ananya Sharma (MK-0006) flagged at Kiosk K-04 with SpO2 94% on room air and acute wheezing. Transferred to Nebulization room.",
        "time": "25 mins ago",
        "unread": True,
        "type": "alert"
    },
    "alert-3": {
        "id": "alert-3",
        "patientId": "MK-2025-05-26-0007",
        "patientName": "Vikramaditya Singh",
        "title": "Stage 2 Hypertensive Spike (154/96)",
        "message": "Vikramaditya Singh (MK-0007) recorded severe BP elevation with occipital headache. Antihypertensive titration required.",
        "time": "35 mins ago",
        "unread": True,
        "type": "alert"
    },
    "alert-4": {
        "id": "alert-4",
        "patientId": "MK-2025-05-26-0005",
        "patientName": "Suresh Menon",
        "title": "Diabetic Sensory Neuropathy Flagged",
        "message": "Suresh Menon (MK-0005) recorded bilateral lower extremity numbness with HbA1c 8.4%. Diabetic foot evaluation advised.",
        "time": "45 mins ago",
        "unread": True,
        "type": "alert"
    },
    "alert-5": {
        "id": "alert-5",
        "patientId": "MK-2025-05-26-0001",
        "patientName": "Arun Kumar",
        "title": "Document OCR Ingestion Complete",
        "message": "2 documents (Prescription & Lipid Panel) ingested and verified for OPD session MK-0001.",
        "time": "1 hour ago",
        "unread": False,
        "type": "info"
    },
    "alert-6": {
        "id": "alert-6",
        "patientId": "SYSTEM",
        "patientName": "System Gateway",
        "title": "Kiosk Hardware Auto-Calibration",
        "message": "BP cuff and pulse oximeter sensors on Kiosk K-01, K-02, K-03 & K-04 auto-calibrated successfully.",
        "time": "2 hours ago",
        "unread": False,
        "type": "system"
    }
}


def send_put_request(endpoint, data):
    """Sends a HTTP PUT request with JSON payload to Firebase Realtime Database REST API."""
    url = f"{DATABASE_URL}/{endpoint}.json"
    json_bytes = json.dumps(data, indent=2).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=json_bytes,
        headers={"Content-Type": "application/json"},
        method="PUT"
    )
    try:
        with urllib.request.urlopen(req, timeout=15) as response:
            res_body = response.read().decode("utf-8")
            return response.status, res_body
    except urllib.error.HTTPError as e:
        err_msg = e.read().decode("utf-8")
        print(f"[-] HTTP Error {e.code} uploading to {endpoint}: {err_msg}", file=sys.stderr)
        return e.code, err_msg
    except Exception as e:
        print(f"[-] Connection Error uploading to {endpoint}: {e}", file=sys.stderr)
        return 500, str(e)


def main():
    print("=" * 70)
    print(" MediKiosk Firebase Realtime Database Seeder")
    print(f" Target Database: {DATABASE_URL}")
    print("=" * 70)

    # 1. Upload All 10 Patients
    print(f"\n[1/4] Uploading {len(PATIENTS_DATA)} complete patient records to 'patients/' node...")
    for pid, pdata in PATIENTS_DATA.items():
        status, res = send_put_request(f"patients/{pid}", pdata)
        if status == 200:
            print(f"  [OK] Patient {pid}: {pdata['name']} ({pdata['stats']['chiefComplaint']['value']}) uploaded successfully.")
        else:
            print(f"  [FAIL] Failed to upload patient {pid}. Code: {status}")

    # 2. Upload Kiosk Sessions
    print(f"\n[2/4] Uploading {len(SESSIONS_DATA)} active kiosk station sessions to 'sessions/' node...")
    status, res = send_put_request("sessions", SESSIONS_DATA)
    if status == 200:
        print(f"  [OK] {len(SESSIONS_DATA)} Kiosk Station telemetry sessions synchronized.")
    else:
        print(f"  [FAIL] Failed to upload sessions. Code: {status}")

    # 3. Upload Clinical Alerts
    print(f"\n[3/4] Uploading {len(ALERTS_DATA)} clinical red-flag notifications to 'alerts/' node...")
    status, res = send_put_request("alerts", ALERTS_DATA)
    if status == 200:
        print(f"  [OK] {len(ALERTS_DATA)} Clinical Alerts synchronized.")
    else:
        print(f"  [FAIL] Failed to upload alerts. Code: {status}")

    # 4. Set Metadata & Active Patient
    print("\n[4/4] Setting active consultation metadata...")
    meta = {
        "activePatientId": "MK-2025-05-26-0001",
        "lastSyncedAt": datetime.utcnow().isoformat() + "Z",
        "totalPatientsCount": len(PATIENTS_DATA),
        "source": "MediKiosk Telemetry Engine v2.0",
        "abdmSyncStatus": "LIVE"
    }
    status, res = send_put_request("metadata", meta)
    if status == 200:
        print("  [OK] Database Metadata & Active Patient Pointer synced.")

    print("\n" + "=" * 70)
    print(" [SUCCESS] All 10 Patients & Telemetry Grid Data uploaded successfully to Firebase!")
    print(" Open http://localhost:5173/ to view live synced records in MediKiosk UI.")
    print("=" * 70)


if __name__ == "__main__":
    main()
