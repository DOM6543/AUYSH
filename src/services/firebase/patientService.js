import {
  db,
  ref,
  onValue,
  set,
  update,
  push,
  get,
  child,
  off
} from "./firebaseConfig";
import { initialPatientData, samplePatientsList, notificationsList } from "../../data/mockData";
import { ayushData } from "../../data/ayushData";
import { generateStructuredClinicalSummary } from "../clinical/aiSummaryService";
import { evaluateClinicalTriage } from "../clinical/triageService";
import { medicalExtractionService } from "../documents/medicalExtractionService";

/**
 * Normalizes raw patient data from Firebase Realtime Database
 */
export function normalizePatient(raw, id) {
  if (!raw) return null;
  const patientId = raw.id || id || "MK-2025-05-26-0001";
  
  // Ensure array structures are properly array-typed even if stored as object in RTDB
  const documents = raw.documents
    ? (Array.isArray(raw.documents) ? raw.documents : Object.values(raw.documents))
    : [];

  const timeline = raw.timeline
    ? (Array.isArray(raw.timeline) ? raw.timeline : Object.values(raw.timeline))
    : [];

  const hpi = raw.aiSummary?.hpi
    ? (Array.isArray(raw.aiSummary.hpi) ? raw.aiSummary.hpi : Object.values(raw.aiSummary.hpi))
    : (raw.hpi ? (Array.isArray(raw.hpi) ? raw.hpi : Object.values(raw.hpi)) : []);

  const pastHistory = raw.aiSummary?.pastHistory
    ? (Array.isArray(raw.aiSummary.pastHistory) ? raw.aiSummary.pastHistory : Object.values(raw.aiSummary.pastHistory))
    : (raw.pastHistory ? (Array.isArray(raw.pastHistory) ? raw.pastHistory : Object.values(raw.pastHistory)) : []);

  const medications = raw.aiSummary?.medications
    ? (Array.isArray(raw.aiSummary.medications) ? raw.aiSummary.medications : Object.values(raw.aiSummary.medications))
    : (raw.medications ? (Array.isArray(raw.medications) ? raw.medications : Object.values(raw.medications)) : []);

  const allergies = raw.aiSummary?.allergies
    ? (Array.isArray(raw.aiSummary.allergies) ? raw.aiSummary.allergies : Object.values(raw.aiSummary.allergies))
    : (raw.allergies ? (Array.isArray(raw.allergies) ? raw.allergies : Object.values(raw.allergies)) : []);

  const redFlagsList = raw.aiSummary?.redFlagsList
    ? (Array.isArray(raw.aiSummary.redFlagsList) ? raw.aiSummary.redFlagsList : Object.values(raw.aiSummary.redFlagsList))
    : [];

  const suggestions = raw.aiSummary?.suggestions
    ? (Array.isArray(raw.aiSummary.suggestions) ? raw.aiSummary.suggestions : Object.values(raw.aiSummary.suggestions))
    : [];

  const clinicalNotes = raw.clinicalNotes
    ? (Array.isArray(raw.clinicalNotes) ? raw.clinicalNotes : Object.values(raw.clinicalNotes))
    : (raw.notes ? (Array.isArray(raw.notes) ? raw.notes : Object.values(raw.notes)) : []);

  const surgicalHistory = raw.surgicalHistory
    ? (Array.isArray(raw.surgicalHistory) ? raw.surgicalHistory : Object.values(raw.surgicalHistory))
    : ["No prior major surgeries reported"];

  const familyHistory = raw.familyHistory
    ? (Array.isArray(raw.familyHistory) ? raw.familyHistory : Object.values(raw.familyHistory))
    : (raw.aiSummary?.familyHistory || [{ relation: "Family", condition: "Non-contributory" }]);

  const documentExtractions = raw.documentExtractions || [];
  const triage = raw.triage || evaluateClinicalTriage({
    chiefComplaint: raw.chiefComplaint || raw.aiSummary?.chiefComplaint || "General Symptoms",
    bodyPart: raw.complaintCategory || "chest",
    hpi: raw.hpi || {},
    vitals: raw.vitals || {},
    painLevel: raw.painLevel ?? 4,
    pastHistory,
    chronicConditions: raw.chronicConditions || []
  });

  const structuredSummary = generateStructuredClinicalSummary({
    ...raw,
    id: patientId,
    hpi: raw.hpi || {},
    vitals: raw.vitals || {},
    pastHistory,
    surgicalHistory,
    medications,
    allergies,
    familyHistory,
    documents,
    documentExtractions
  });

  return {
    ...raw,
    id: patientId,
    name: raw.name || "Unknown Patient",
    age: raw.age || null,
    gender: raw.gender || "Not specified",
    abhaNumber: raw.abhaNumber || null,
    abhaAddress: raw.abhaAddress || null,
    mobile: raw.mobile || raw.phone || null,
    language: raw.language || "English",
    medicalStream: raw.medicalStream || "ayush",
    registrationType: raw.registrationType || "Kiosk Walk-in",
    status: "Reviewed", // Auto-approved
    lastUpdated: raw.lastUpdated || "Just now",
    avatarUrl: raw.avatarUrl || raw.photo || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    verified: true, // Auto-approved
    isNewPatient: raw.isNewPatient ?? true,
    consent: raw.consent || {
      accepted: true,
      timestamp: new Date().toISOString(),
      version: "v1.2",
      purpose: "Clinical OPD Consultation & OCR Digitization"
    },
    triage,
    fiveSecondSummary: raw.fiveSecondSummary || structuredSummary.fiveSecondSummary,
    doctor: raw.doctor || {
      name: "Dr. Ramesh Kumar",
      role: "Physician",
      department: "AIIMS Ayurveda OPD",
      avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80"
    },
    stats: raw.stats || {
      chiefComplaint: { title: "Chief Complaint", value: raw.aiSummary?.chiefComplaint || raw.chiefComplaint || "Not recorded", subtitle: "Kiosk intake" },
      kioskSession: { title: "Kiosk Session", value: "May 26, 2025", subtitle: "10:15 AM" },
      consultationType: { title: "Consultation Type", value: raw.department || "General OPD", subtitle: "New Consultation" },
      redFlags: { title: "Red Flags", value: triage.tier, subtitle: triage.alerts.length ? `${triage.alerts.length} Alerts` : "Low Risk" },
      lastUpdated: { title: "Last Updated", value: "May 26, 2025", subtitle: "10:40 AM" }
    },
    aiSummary: {
      chiefComplaint: raw.aiSummary?.chiefComplaint || raw.chiefComplaint || "Not provided",
      hpi: hpi.length ? hpi : structuredSummary.hpi,
      pastHistory,
      surgicalHistory,
      medications,
      allergies,
      redFlagsList: triage.alerts,
      suggestions: structuredSummary.triage?.suggestedAction ? [structuredSummary.triage.suggestedAction] : ["Physician clinical evaluation and diagnosis recommended"],
      systemicReview: raw.aiSummary?.systemicReview || "Self-service kiosk intake completed",
      familyHistory,
      missingInfoChecklist: structuredSummary.missingInfoChecklist,
      dataConfidence: structuredSummary.dataConfidence,
      physicianVerificationNotice: structuredSummary.physicianVerificationNotice
    },
    physicianReviewedSummary: raw.physicianReviewedSummary || null,
    doctorReview: raw.doctorReview || { status: "accepted", verifiedBy: "Dr. Ramesh Kumar (Auto-Approved)", timestamp: "Live" },
    vitals: raw.vitals || {
      bp: { value: "128/84", unit: "mmHg", label: "BP" },
      pulse: { value: "78", unit: "bpm", label: "Pulse" },
      spo2: { value: "98", unit: "%", label: "SpO₂" },
      temperature: { value: "98.4", unit: "°F", label: "Temperature" }
    },
    documents,
    documentExtractions,
    timeline,
    clinicalNotes,
    ayush: raw.ayush || ayushData,
    examination: raw.examination || {},
    lifestyle: raw.lifestyle || {}
  };
}

/**
 * Seeds initial baseline patient data to Firebase Realtime Database if empty
 */
export async function seedInitialDataIfEmpty() {
  try {
    const patientsRef = ref(db, "patients");
    const snapshot = await get(patientsRef);
    if (!snapshot.exists() || !snapshot.val()) {
      console.log("Firebase RTDB /patients is empty. Initializing baseline patients...");
      
      const seedPatients = {
        "MK-2025-05-26-0001": {
          ...initialPatientData,
          ayush: ayushData,
          createdAt: new Date().toISOString()
        },
        "MK-2025-05-26-0002": {
          id: "MK-2025-05-26-0002",
          name: "Priya Sundaram",
          age: 42,
          gender: "Female",
          abhaNumber: "91-XXXX-XXXX-5678",
          abhaAddress: "priya.s@abdm",
          opdId: "MK-2025-05-26-0002",
          isNewPatient: false,
          mobile: "+91 98451 23456",
          language: "Tamil / English",
          registrationType: "Online Appointment",
          status: "In Intake",
          consultationType: "Ayurveda OPD",
          avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
          stats: {
            chiefComplaint: { title: "Chief Complaint", value: "Chronic migraine & cervical stiffness", subtitle: "Since 3 weeks" },
            kioskSession: { title: "Kiosk Session", value: "May 26, 2025", subtitle: "10:30 AM" },
            consultationType: { title: "Consultation Type", value: "Ayurveda OPD", subtitle: "Follow-up" },
            redFlags: { title: "Red Flags", value: "Moderate Risk", subtitle: "1 Alert" },
            lastUpdated: { title: "Last Updated", value: "May 26, 2025", subtitle: "10:35 AM" }
          },
          aiSummary: {
            chiefComplaint: "Chronic migraine and posterior neck stiffness for 3 weeks",
            hpi: ["Unilateral throbbing headache on right side", "Aggravated by bright light and stress", "Associated with nausea"],
            pastHistory: ["No prior hypertension or diabetes"],
            medications: [{ name: "Naproxen 250mg", dosage: "SOS", frequency: "As needed" }],
            allergies: ["Sulfa drugs"],
            redFlagsList: ["Persistent headache with visual aura"],
            suggestions: ["Consider Cervical Spine X-ray", "Ayurvedic Shirodhara referral"],
            systemicReview: "No fever, no weakness in limbs.",
            familyHistory: [{ relation: "Mother", condition: "Migraine" }]
          },
          vitals: {
            bp: { value: "118/78", unit: "mmHg", label: "BP", status: "normal" },
            pulse: { value: "76", unit: "bpm", label: "Pulse", status: "normal" },
            spo2: { value: "99", unit: "%", label: "SpO₂", status: "normal" },
            temperature: { value: "98.4", unit: "°F", label: "Temperature", status: "normal" }
          },
          documents: [
            { id: "doc-p1", name: "Cervical_Spine_Prescription.pdf", type: "pdf", size: "1.1 MB", uploadedAt: "May 26, 2025 10:31 AM", status: "Processed", category: "Prescription" }
          ],
          timeline: [
            { time: "Today 10:30 AM", title: "Kiosk Intake Started", details: "Vitals and headache questionnaire recorded", status: "completed" },
            { time: "Today 10:35 AM", title: "AI Intake Summary Generated", details: "Prakriti assessment captured", status: "active" }
          ]
        },
        "MK-2025-05-26-0003": {
          id: "MK-2025-05-26-0003",
          name: "Rajesh Varma",
          age: 58,
          gender: "Male",
          abhaNumber: "91-XXXX-XXXX-9012",
          abhaAddress: "rajesh.v@abdm",
          opdId: "MK-2025-05-26-0003",
          isNewPatient: false,
          mobile: "+91 97123 45678",
          language: "Hindi",
          registrationType: "Walk-in",
          status: "Reviewed",
          consultationType: "Orthopedics & Ayurveda",
          avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
          stats: {
            chiefComplaint: { title: "Chief Complaint", value: "Bilateral knee joint pain & swelling", subtitle: "Since 6 months" },
            kioskSession: { title: "Kiosk Session", value: "May 26, 2025", subtitle: "10:45 AM" },
            consultationType: { title: "Consultation Type", value: "General OPD", subtitle: "Review" },
            redFlags: { title: "Red Flags", value: "Low Risk", subtitle: "0 Alerts" },
            lastUpdated: { title: "Last Updated", value: "May 26, 2025", subtitle: "10:50 AM" }
          },
          aiSummary: {
            chiefComplaint: "Bilateral knee joint pain on climbing stairs",
            hpi: ["Pain in both knees, worse on cold mornings", "Mild crepitus noted during flexion"],
            pastHistory: ["Type 2 Diabetes Mellitus since 8 years"],
            medications: [{ name: "Metformin 500mg", dosage: "BD", frequency: "Twice daily" }],
            allergies: ["No known allergies"],
            redFlagsList: [],
            suggestions: ["Bilateral Knee X-Ray (AP/Lateral)", "Janu Basti Ayurvedic Therapy"],
            systemicReview: "No systemic fever.",
            familyHistory: [{ relation: "Father", condition: "Osteoarthritis" }]
          },
          vitals: {
            bp: { value: "126/82", unit: "mmHg", label: "BP", status: "normal" },
            pulse: { value: "72", unit: "bpm", label: "Pulse", status: "normal" },
            spo2: { value: "98", unit: "%", label: "SpO₂", status: "normal" },
            temperature: { value: "98.2", unit: "°F", label: "Temperature", status: "normal" }
          },
          documents: [
            { id: "doc-r1", name: "HbA1c_Report_2025.pdf", type: "pdf", size: "850 KB", uploadedAt: "May 26, 2025 10:46 AM", status: "Processed", category: "Lab Report" }
          ],
          timeline: [
            { time: "Today 10:45 AM", title: "Kiosk Intake Completed", details: "Vitals recorded", status: "completed" },
            { time: "Today 10:50 AM", title: "Physician Review Approved", details: "Verified by Dr. Ramesh Kumar", status: "completed" }
          ]
        }
      };

      await set(patientsRef, seedPatients);

      // Also seed alerts
      const alertsRef = ref(db, "alerts");
      await set(alertsRef, notificationsList);

      // Seed kiosk sessions
      const sessionsRef = ref(db, "kiosk_sessions");
      await set(sessionsRef, {
        "KS-01": { id: "KS-01", kioskId: "K-01", patientName: "Priya Sundaram", patientId: "MK-2025-05-26-0002", status: "Active", time: "10:30 AM" },
        "KS-02": { id: "KS-02", kioskId: "K-02", patientName: "Rajesh Varma", patientId: "MK-2025-05-26-0003", status: "Completed", time: "10:45 AM" },
        "KS-03": { id: "KS-03", kioskId: "K-03", patientName: "Arun Kumar", patientId: "MK-2025-05-26-0001", status: "Ready for Physician Review", time: "10:15 AM" }
      });
      
      console.log("Firebase RTDB successfully populated with baseline clinical records!");
    }
  } catch (err) {
    console.error("Error seeding initial Firebase data:", err);
  }
}

/**
 * Real-time subscription to the entire patients collection in Firebase RTDB
 */
export function subscribeToPatients(callback, onError) {
  const patientsRef = ref(db, "patients");
  
  const unsubscribe = onValue(
    patientsRef,
    (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        callback([]);
        return;
      }
      const list = Object.entries(data).map(([key, val]) => normalizePatient(val, key));
      callback(list);
    },
    (error) => {
      console.error("Firebase subscribeToPatients error:", error);
      if (onError) onError(error);
    }
  );

  return () => off(patientsRef);
}

/**
 * Real-time subscription to a single patient by ID
 */
export function subscribeToPatient(patientId, callback, onError) {
  if (!patientId) return () => {};
  const patientRef = ref(db, `patients/${patientId}`);

  const unsubscribe = onValue(
    patientRef,
    (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        callback(null);
        return;
      }
      callback(normalizePatient(data, patientId));
    },
    (error) => {
      console.error(`Firebase subscribeToPatient (${patientId}) error:`, error);
      if (onError) onError(error);
    }
  );

  return () => off(patientRef);
}

/**
 * Real-time subscription to active kiosk sessions
 */
export function subscribeToKioskSessions(callback, onError) {
  const sessionsRef = ref(db, "kiosk_sessions");

  onValue(
    sessionsRef,
    (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        callback([]);
        return;
      }
      const list = Object.values(data);
      callback(list);
    },
    (error) => {
      console.error("Firebase subscribeToKioskSessions error:", error);
      if (onError) onError(error);
    }
  );

  return () => off(sessionsRef);
}

/**
 * Real-time subscription to alerts
 */
export function subscribeToAlerts(callback, onError) {
  const alertsRef = ref(db, "alerts");

  onValue(
    alertsRef,
    (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        callback([]);
        return;
      }
      const list = Array.isArray(data) ? data : Object.values(data);
      callback(list);
    },
    (error) => {
      console.error("Firebase subscribeToAlerts error:", error);
      if (onError) onError(error);
    }
  );

  return () => off(alertsRef);
}

/**
 * Action: Physician edits clinical summary -> writes back to Firebase
 */
export async function updateClinicalSummaryInFirebase(patientId, updatedSummary, doctorInfo = { name: "Dr. Ramesh Kumar" }) {
  if (!patientId) throw new Error("Patient ID required");
  const patientRef = ref(db, `patients/${patientId}`);
  
  const snapshot = await get(patientRef);
  const current = snapshot.val() || {};
  const currentTimeline = current.timeline ? (Array.isArray(current.timeline) ? current.timeline : Object.values(current.timeline)) : [];

  const newTimelineEvent = {
    time: "Today " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    timestamp: new Date().toISOString(),
    title: "Clinical Summary Edited & Updated",
    details: `Modified by ${doctorInfo.name}`,
    status: "completed",
    actor: doctorInfo.name
  };

  await update(patientRef, {
    physicianReviewedSummary: updatedSummary,
    aiSummary: {
      ...current.aiSummary,
      ...updatedSummary
    },
    doctorReview: {
      status: "edited",
      reviewedBy: doctorInfo.name,
      reviewedAt: new Date().toISOString(),
      verifiedSummary: updatedSummary
    },
    lastUpdated: "Just now",
    timeline: [...currentTimeline, newTimelineEvent]
  });
}

/**
 * Action: Physician accepts and signs off clinical summary -> writes back to Firebase
 */
export async function acceptClinicalSummaryInFirebase(patientId, doctorInfo = { name: "Dr. Ramesh Kumar" }, notes = "") {
  if (!patientId) throw new Error("Patient ID required");
  const patientRef = ref(db, `patients/${patientId}`);
  
  const snapshot = await get(patientRef);
  const current = snapshot.val() || {};
  const currentTimeline = current.timeline ? (Array.isArray(current.timeline) ? current.timeline : Object.values(current.timeline)) : [];

  const newTimelineEvent = {
    time: "Today " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    timestamp: new Date().toISOString(),
    title: "Physician Review Approved & Signed",
    details: `Verified & locked to ABHA record by ${doctorInfo.name}`,
    status: "completed",
    actor: doctorInfo.name
  };

  await update(patientRef, {
    status: "Reviewed",
    reviewStatus: "saved",
    doctorReview: {
      status: "accepted",
      reviewedBy: doctorInfo.name,
      reviewedAt: new Date().toISOString(),
      notes
    },
    lastUpdated: "Just now",
    timeline: [...currentTimeline, newTimelineEvent]
  });
}

/**
 * Action: Physician rejects clinical summary -> writes back to Firebase
 */
export async function rejectClinicalSummaryInFirebase(patientId, reason = "Incomplete or discordant patient history", doctorInfo = { name: "Dr. Ramesh Kumar" }) {
  if (!patientId) throw new Error("Patient ID required");
  const patientRef = ref(db, `patients/${patientId}`);
  
  const snapshot = await get(patientRef);
  const current = snapshot.val() || {};
  const currentTimeline = current.timeline ? (Array.isArray(current.timeline) ? current.timeline : Object.values(current.timeline)) : [];

  const newTimelineEvent = {
    time: "Today " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    timestamp: new Date().toISOString(),
    title: "AI Summary Rejected by Physician",
    details: `Reason: ${reason} (Reviewed by ${doctorInfo.name})`,
    status: "completed",
    actor: doctorInfo.name
  };

  await update(patientRef, {
    status: "Rejected / Needs Re-Intake",
    reviewStatus: "rejected",
    doctorReview: {
      status: "rejected",
      reviewedBy: doctorInfo.name,
      reviewedAt: new Date().toISOString(),
      rejectionReason: reason
    },
    lastUpdated: "Just now",
    timeline: [...currentTimeline, newTimelineEvent]
  });
}

/**
 * Action: Update / refresh vitals in Firebase
 */
export async function updatePatientVitalsInFirebase(patientId, newVitals) {
  if (!patientId) return;
  const vitalsRef = ref(db, `patients/${patientId}/vitals`);
  await update(vitalsRef, newVitals);
}

/**
 * Action: Upload a new document to patient record in Firebase
 */
/**
 * Action: Add a physician clinical progress note to patient record in Firebase
 */
export async function addClinicalNoteToFirebase(patientId, noteData) {
  if (!patientId) return;
  const notesRef = ref(db, `patients/${patientId}/clinicalNotes`);
  const newNoteRef = push(notesRef);
  const notePayload = {
    ...noteData,
    id: newNoteRef.key,
    createdAt: new Date().toISOString()
  };
  await set(newNoteRef, notePayload);
  return notePayload;
}

/**
 * Action: Upload a new document to patient record in Firebase
 */
export async function uploadDocumentToFirebase(patientId, docData) {
  if (!patientId) return;
  const docsRef = ref(db, `patients/${patientId}/documents`);
  const newDocRef = push(docsRef);
  await set(newDocRef, {
    ...docData,
    id: newDocRef.key
  });
}

/**
 * Action: Patient Kiosk Intake Submission -> writes new patient / session to Firebase in real-time
 */
export async function submitKioskIntakeToFirebase(kioskIntake) {
  const patientId = kioskIntake.id || `MK-2025-05-26-000${Math.floor(10 + Math.random() * 90)}`;
  const patientRef = ref(db, `patients/${patientId}`);

  const triage = evaluateClinicalTriage({
    chiefComplaint: kioskIntake.chiefComplaint || "General consultation",
    bodyPart: kioskIntake.complaintCategory || "chest",
    hpi: kioskIntake.hpi || {},
    vitals: kioskIntake.vitals || {},
    painLevel: kioskIntake.painLevel ?? 4,
    pastHistory: kioskIntake.pastHistory || [],
    chronicConditions: kioskIntake.chronicConditions || []
  });

  const structuredSummary = generateStructuredClinicalSummary({
    name: kioskIntake.name,
    age: Number(kioskIntake.age) || 38,
    gender: kioskIntake.gender || "Male",
    abhaNumber: kioskIntake.abhaNumber || `91-${Math.floor(1000+Math.random()*9000)}-XXXX-1234`,
    language: kioskIntake.language || "English",
    medicalStream: kioskIntake.medicalStream || "ayush",
    chiefComplaint: kioskIntake.chiefComplaint || "General consultation",
    duration: kioskIntake.duration || "fewDays",
    hpi: kioskIntake.hpi || {},
    vitals: kioskIntake.vitals || {},
    painLevel: kioskIntake.painLevel ?? 4,
    pastHistory: kioskIntake.pastHistory || [],
    surgicalHistory: kioskIntake.surgicalHistory || [],
    medications: kioskIntake.medications || [],
    allergies: kioskIntake.allergies || [],
    familyHistory: kioskIntake.familyHistory || [],
    lifestyle: kioskIntake.lifestyle || {},
    ayush: kioskIntake.ayush || {},
    documents: kioskIntake.documents || [],
    documentExtractions: kioskIntake.documentExtractions || []
  });

  const formattedPatient = {
    id: patientId,
    name: kioskIntake.name || "Walk-in Patient",
    age: Number(kioskIntake.age) || (kioskIntake.ageGroup === "senior" ? 65 : kioskIntake.ageGroup === "youth" ? 21 : kioskIntake.ageGroup === "child" ? 8 : 38),
    gender: kioskIntake.gender ? (kioskIntake.gender.charAt(0).toUpperCase() + kioskIntake.gender.slice(1)) : "Male",
    ageGroup: kioskIntake.ageGroup || "adult",
    duration: kioskIntake.duration || "fewDays",
    chronicConditions: kioskIntake.chronicConditions || ["none"],
    painLevel: kioskIntake.painLevel ?? 4,
    complaintCategory: kioskIntake.complaintCategory || "chest",
    abhaNumber: kioskIntake.abhaNumber || `91-${Math.floor(1000+Math.random()*9000)}-XXXX-1234`,
    abhaAddress: kioskIntake.abhaAddress || `${(kioskIntake.name || "patient").toLowerCase().replace(/\s+/g, ".")}@abdm`,
    opdId: patientId,
    isNewPatient: true,
    mobile: kioskIntake.phone || kioskIntake.mobile || "+91 98765 00000",
    language: kioskIntake.language || "English",
    treatmentSystem: kioskIntake.treatmentSystem || "AYURVEDA",
    careSystem: kioskIntake.treatmentSystem || kioskIntake.careSystem || "AYURVEDA",
    patientNarrative: kioskIntake.patientNarrative || "",
    extractedData: kioskIntake.extractedData || {},
    ayurveda: kioskIntake.ayurveda || null,
    siddha: kioskIntake.siddha || null,
    unani: kioskIntake.unani || null,
    homeopathy: kioskIntake.homeopathy || null,
    yogaNaturopathy: kioskIntake.yogaNaturopathy || null,
    medicalHistory: kioskIntake.medicalHistory || null,
    medicalStream: "ayush",
    registrationType: "Kiosk Walk-in",
    status: "Reviewed", // Auto-approved
    verified: true, // Auto-approved
    consultationType: kioskIntake.department || (kioskIntake.treatmentSystem ? `${kioskIntake.treatmentSystem} OPD` : "AIIMS AYUSH OPD"),
    lastUpdated: "Just now",
    avatarUrl: kioskIntake.photo || (kioskIntake.gender === "female" 
      ? "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80"
      : "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"),
    consent: kioskIntake.consent || {
      accepted: true,
      timestamp: new Date().toISOString(),
      version: "v1.2",
      purpose: "Clinical OPD Consultation & Document Digitization"
    },
    triage,
    fiveSecondSummary: structuredSummary.fiveSecondSummary,
    doctorReview: {
      status: "accepted",
      verifiedBy: "Dr. Ramesh Kumar (Auto-Approved)",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    },
    stats: {
      chiefComplaint: { title: "Chief Complaint", value: kioskIntake.chiefComplaint || "Routine Checkup", subtitle: "Kiosk intake" },
      kioskSession: { title: "Kiosk Session", value: "May 26, 2025", subtitle: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
      consultationType: { title: "Consultation Type", value: kioskIntake.department || (kioskIntake.treatmentSystem ? `${kioskIntake.treatmentSystem} OPD` : "General AYUSH OPD"), subtitle: "New Consultation" },
      redFlags: { 
        title: "Red Flags", 
        value: triage.tier, 
        subtitle: triage.alerts?.length ? `${triage.alerts.length} Alerts` : "Low Risk" 
      },
      lastUpdated: { title: "Last Updated", value: "May 26, 2025", subtitle: "Just now" }
    },
    hpi: kioskIntake.hpi || {},
    pastHistory: kioskIntake.pastHistory || [],
    surgicalHistory: kioskIntake.surgicalHistory || [],
    medications: structuredSummary.medications || [],
    allergies: kioskIntake.allergies || ["No known drug allergies reported"],
    familyHistory: kioskIntake.familyHistory || [{ relation: "Family", condition: "Non-contributory" }],
    lifestyle: kioskIntake.lifestyle || {},
    ayush: kioskIntake.ayush || ayushData,
    aiSummary: {
      chiefComplaint: kioskIntake.chiefComplaint || "General consultation",
      hpi: structuredSummary.hpi,
      pastHistory: structuredSummary.pastHistory,
      surgicalHistory: structuredSummary.surgicalHistory,
      medications: structuredSummary.medications,
      allergies: structuredSummary.allergies,
      redFlagsList: triage.alerts,
      suggestions: [triage.suggestedAction],
      systemicReview: "Self-service kiosk triage completed",
      familyHistory: structuredSummary.familyHistory,
      missingInfoChecklist: structuredSummary.missingInfoChecklist,
      dataConfidence: structuredSummary.dataConfidence,
      physicianVerificationNotice: structuredSummary.physicianVerificationNotice
    },
    vitals: {
      bp: { value: kioskIntake.vitals?.bp || "128/84", unit: "mmHg", label: "BP", status: kioskIntake.vitals?.bp?.startsWith("14") ? "high" : "normal" },
      pulse: { value: kioskIntake.vitals?.pulse || "78", unit: "bpm", label: "Pulse", status: "normal" },
      spo2: { value: kioskIntake.vitals?.spo2 || "98", unit: "%", label: "SpO₂", status: "normal" },
      temperature: { value: kioskIntake.vitals?.temp || kioskIntake.vitals?.temperature || "98.4", unit: "°F", label: "Temperature", status: "normal" }
    },
    documents: kioskIntake.documents || [],
    documentExtractions: kioskIntake.documentExtractions || [],
    clinicalNotes: [],
    timeline: [
      {
        time: "Today " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        timestamp: new Date().toISOString(),
        title: "Kiosk Multimodal Intake Completed",
        details: `Captured via MediKiosk Terminal for ${kioskIntake.name || 'Patient'}`,
        status: "completed",
        actor: "Patient Kiosk"
      },
      {
        time: "Today " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        timestamp: new Date().toISOString(),
        title: `Triage Stratification: ${triage.tier}`,
        details: triage.suggestedAction,
        status: "completed",
        actor: "MediKiosk Triage Engine"
      },
      {
        time: "Today " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        timestamp: new Date().toISOString(),
        title: "5-Second Clinical Summary Generated",
        details: "Structured HPI and medication provenance ready for physician",
        status: "completed",
        actor: "AI Clinical Summarizer"
      }
    ]
  };

  await set(patientRef, formattedPatient);

  // Also add to kiosk_sessions
  const sessionRef = ref(db, `kiosk_sessions/KS-${Date.now().toString().slice(-4)}`);
  await set(sessionRef, {
    id: `KS-${Date.now().toString().slice(-4)}`,
    kioskId: "K-03",
    patientName: kioskIntake.name,
    patientId: patientId,
    status: `Auto-Approved (${triage.tier})`,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  });

  // If red flags exist, append to alerts node
  if (triage.alerts?.length) {
    const alertRef = push(ref(db, "alerts"));
    await set(alertRef, {
      id: Date.now(),
      title: `${triage.tier}: ${kioskIntake.name}`,
      message: `${kioskIntake.name} flagged: ${triage.alerts.slice(0, 2).join("; ")}`,
      time: "Just now",
      unread: true,
      type: "alert"
    });
  }

  return patientId;
}
