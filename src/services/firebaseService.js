import { db, ref, onValue, set, update, push } from "../firebase";
import { initialPatientData, samplePatientsList, notificationsList } from "../data/mockData";
import { ayushData } from "../data/ayushData";

// Seed Database if empty
export function initializeDatabaseIfEmpty() {
  const rootRef = ref(db, "/");
  onValue(rootRef, (snapshot) => {
    const data = snapshot.val();
    if (!data || !data.patients || Object.keys(data.patients).length === 0) {
      console.log("MediKiosk: Seeding initial data to Firebase Realtime Database...");
      
      const seedPatients = {
        "MK-2025-05-26-0001": {
          ...initialPatientData,
          status: "Reviewed",
          verified: true,
          ayush: ayushData,
          doctorReview: {
            status: "accepted",
            reviewedBy: "Dr. Ramesh Kumar",
            reviewedAt: new Date().toISOString(),
            notes: "Auto-approved clinician baseline verification"
          }
        }
      };

      const seedSessions = {
        "K-03-MK-0001": {
          id: "K-03-MK-0001",
          kioskId: "K-03",
          location: "Ayurveda OPD Wing",
          patientId: "MK-2025-05-26-0001",
          patientName: "Arun Kumar",
          status: "Auto-Approved (Ready)",
          startedAt: "10:15 AM",
          lastUpdated: "10:40 AM",
          intakeProgress: "Completed (100%)"
        },
        "K-01-MK-0002": {
          id: "K-01-MK-0002",
          kioskId: "K-01",
          location: "Main Hospital Lobby",
          patientId: "MK-2025-05-26-0002",
          patientName: "Priya Sundaram",
          status: "Auto-Approved (Ready)",
          startedAt: "10:30 AM",
          lastUpdated: "10:35 AM",
          intakeProgress: "100% Complete"
        }
      };

      const seedAlerts = {
        "alert-1": {
          id: "alert-1",
          patientId: "MK-2025-05-26-0001",
          patientName: "Arun Kumar",
          title: "High Risk Patient Flagged",
          message: "Arun Kumar (MK-0001) flagged with exertional chest pain and elevated BP (140/90).",
          time: "5 mins ago",
          unread: true,
          type: "alert"
        },
        "alert-2": {
          id: "alert-2",
          patientId: "MK-2025-05-26-0001",
          patientName: "Arun Kumar",
          title: "Document Ingestion Completed",
          message: "3 documents processed via OCR for OPD session MK-0001.",
          time: "12 mins ago",
          unread: true,
          type: "info"
        }
      };

      update(ref(db), {
        patients: seedPatients,
        sessions: seedSessions,
        alerts: seedAlerts,
        appointments: samplePatientsList,
        lastInitialized: new Date().toISOString()
      }).catch((err) => console.error("Firebase Seed Error:", err));
    }
  }, { onlyOnce: true });
}

// 1. Subscribe to Patients List
export function subscribeToPatients(callback) {
  const patientsRef = ref(db, "patients");
  return onValue(patientsRef, (snapshot) => {
    const val = snapshot.val();
    if (!val) {
      callback([]);
      return;
    }
    const list = Object.keys(val).map((key) => ({
      id: key,
      ...val[key],
      status: "Reviewed",
      verified: true
    }));
    callback(list);
  }, (error) => {
    console.error("Firebase Patients Subscription Error:", error);
  });
}

// 2. Subscribe to Single Patient Details
export function subscribeToPatient(patientId, callback) {
  const patientRef = ref(db, `patients/${patientId}`);
  return onValue(patientRef, (snapshot) => {
    const data = snapshot.val();
    if (!data) {
      callback(null);
      return;
    }
    // Parse clinical notes & documents safely
    const clinicalNotes = data.clinicalNotes
      ? (Array.isArray(data.clinicalNotes) ? data.clinicalNotes : Object.values(data.clinicalNotes))
      : (data.notes ? (Array.isArray(data.notes) ? data.notes : Object.values(data.notes)) : []);

    const documents = data.documents
      ? (Array.isArray(data.documents) ? data.documents : Object.values(data.documents))
      : [];

    callback({
      ...data,
      id: patientId,
      status: "Reviewed",
      verified: true,
      clinicalNotes,
      documents
    });
  }, (error) => {
    console.error(`Firebase Patient ${patientId} Subscription Error:`, error);
  });
}

// 3. Subscribe to Kiosk Sessions
export function subscribeToKioskSessions(callback) {
  const sessionsRef = ref(db, "sessions");
  return onValue(sessionsRef, (snapshot) => {
    const val = snapshot.val();
    if (!val) {
      callback([]);
      return;
    }
    const list = Object.keys(val).map((key) => ({
      id: key,
      ...val[key]
    }));
    callback(list);
  });
}

// 4. Subscribe to Alerts
export function subscribeToAlerts(callback) {
  const alertsRef = ref(db, "alerts");
  return onValue(alertsRef, (snapshot) => {
    const val = snapshot.val();
    if (!val) {
      callback([]);
      return;
    }
    const list = Object.keys(val).map((key) => ({
      id: key,
      ...val[key]
    }));
    callback(list);
  });
}

// 5. Physician Action: Add Clinical Progress Note & Remarks
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

// 6. Physician Action: Edit AI Clinical Summary
export async function updateClinicalSummaryInFirebase(patientId, newSummary) {
  const summaryRef = ref(db, `patients/${patientId}/aiSummary`);
  return update(summaryRef, {
    ...newSummary,
    lastEditedAt: new Date().toISOString()
  });
}

// 7. Physician Action: Accept & Save Summary
export async function acceptClinicalSummaryInFirebase(patientId, doctorName = "Dr. Ramesh Kumar") {
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const patientRef = ref(db, `patients/${patientId}`);
  
  return update(patientRef, {
    "doctorReview/status": "accepted",
    "doctorReview/reviewedBy": doctorName,
    "doctorReview/reviewedAt": now.toISOString(),
    status: "Reviewed",
    verified: true,
    "timeline/3": {
      time: `Today ${timeStr}`,
      title: "Physician Review Approved",
      details: `Verified & signed by ${doctorName}`,
      status: "completed"
    }
  });
}

// 8. Physician Action: Reject Summary
export async function rejectClinicalSummaryInFirebase(patientId, reason = "Incomplete intake data") {
  const patientRef = ref(db, `patients/${patientId}`);
  return update(patientRef, {
    "doctorReview/status": "rejected",
    "doctorReview/rejectionReason": reason,
    "doctorReview/reviewedAt": new Date().toISOString()
  });
}

// 9. Add Uploaded Document to Firebase
export async function addDocumentToFirebase(patientId, docItem) {
  const docsRef = ref(db, `patients/${patientId}/documents`);
  return push(docsRef, docItem);
}

// 10. Sync Telemetry / Vitals to Firebase
export async function updateVitalsInFirebase(patientId, vitalsObj) {
  const vitalsRef = ref(db, `patients/${patientId}/vitals`);
  return update(vitalsRef, vitalsObj);
}

// 11. Patient Kiosk Intake Submission (Kiosk -> Firebase -> Doctor Dashboard)
export async function submitKioskIntakeToFirebase(kioskPayload) {
  const patientId = kioskPayload.id || `MK-2025-${Date.now().toString().slice(-4)}`;
  const patientRef = ref(db, `patients/${patientId}`);
  const sessionRef = ref(db, `sessions/K-03-${patientId}`);

  const fullPatientObject = {
    id: patientId,
    name: kioskPayload.name || "Walk-in Patient",
    verified: true,
    status: "Reviewed", // Auto-approved
    age: Number(kioskPayload.age) || (kioskPayload.ageGroup === "senior" ? 65 : kioskPayload.ageGroup === "youth" ? 21 : kioskPayload.ageGroup === "child" ? 8 : 38),
    gender: kioskPayload.gender || "Male",
    ageGroup: kioskPayload.ageGroup || "adult",
    duration: kioskPayload.duration || "fewDays",
    chronicConditions: kioskPayload.chronicConditions || ["none"],
    painLevel: kioskPayload.painLevel ?? 4,
    complaintCategory: kioskPayload.complaintCategory || "chest",
    abhaNumber: kioskPayload.abhaNumber || `91-${Math.floor(1000+Math.random()*9000)}-XXXX-1234`,
    abhaAddress: kioskPayload.abhaAddress || `${(kioskPayload.name || "patient").toLowerCase().replace(/\s+/g, ".")}@abdm`,
    opdId: patientId,
    isNewPatient: true,
    mobile: kioskPayload.phone || kioskPayload.mobile || "+91 98765 00000",
    language: kioskPayload.language || "English",
    registrationType: "Kiosk Self Intake",
    avatarUrl: kioskPayload.photo || (kioskPayload.gender === "Female" || kioskPayload.gender === "female"
      ? "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80"
      : "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"),
    doctor: {
      name: "Dr. Ramesh Kumar",
      role: "Physician",
      avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80",
      department: "AIIMS OPD"
    },
    doctorReview: {
      status: "accepted",
      reviewedBy: "Dr. Ramesh Kumar (Auto-Approved)",
      reviewedAt: new Date().toISOString()
    },
    stats: {
      chiefComplaint: { title: "Chief Complaint", value: kioskPayload.chiefComplaint || "General Symptoms", subtitle: "Just recorded", icon: "Activity", color: "purple" },
      kioskSession: { title: "Kiosk Session", value: new Date().toLocaleDateString(), subtitle: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), icon: "Calendar", color: "blue" },
      consultationType: { title: "Consultation Type", value: "General OPD", subtitle: "Kiosk Intake", icon: "Briefcase", color: "cyan" },
      redFlags: { title: "Red Flags", value: kioskPayload.redFlags?.length ? "High Risk" : "Low Risk", subtitle: `${kioskPayload.redFlags?.length || 0} Alerts`, icon: "Flag", color: kioskPayload.redFlags?.length ? "red" : "emerald" },
      lastUpdated: { title: "Last Updated", value: new Date().toLocaleDateString(), subtitle: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), icon: "Clock", color: "indigo" }
    },
    aiSummary: {
      chiefComplaint: kioskPayload.chiefComplaint || "General malaise",
      hpi: kioskPayload.hpi || [
        `Chief Complaint: ${kioskPayload.chiefComplaint || 'Self-reported symptoms'}`,
        `Duration: ${kioskPayload.duration || '2-3 days'}`,
        `Pain Score: ${kioskPayload.painLevel ?? 4}/10 (FACES assessment)`
      ],
      pastHistory: kioskPayload.pastHistory || (kioskPayload.chronicConditions ? kioskPayload.chronicConditions.map(c => `Pre-existing condition: ${c}`) : ["No major history reported"]),
      medications: kioskPayload.medications || [],
      allergies: kioskPayload.allergies || ["No known drug allergies reported"],
      redFlagsList: kioskPayload.redFlags || [],
      suggestions: ["Physician clinical evaluation and diagnosis recommended", "Vitals monitoring"],
      systemicReview: "Self-service kiosk triage completed without acute distress",
      familyHistory: [{ relation: "Family", condition: "Non-contributory" }]
    },
    vitals: kioskPayload.vitals || {
      bp: { value: "128/84", unit: "mmHg", status: "normal", label: "BP" },
      pulse: { value: "78", unit: "bpm", status: "normal", label: "Pulse" },
      spo2: { value: "98", unit: "%", status: "normal", label: "SpO₂" },
      temperature: { value: "98.4", unit: "°F", status: "normal", label: "Temperature" }
    },
    timeline: [
      { time: "Just now", title: "Kiosk Intake Completed", details: `Intake recorded for ${kioskPayload.name || 'Patient'}`, status: "completed" },
      { time: "Just now", title: "Auto-Approved by Doctor System", details: "All clinical data immediately unlocked for physician view", status: "completed" }
    ],
    documents: [],
    clinicalNotes: []
  };

  await set(patientRef, fullPatientObject);
  await set(sessionRef, {
    id: `K-03-${patientId}`,
    kioskId: "K-03",
    location: "Kiosk Touch Station",
    patientId: patientId,
    patientName: kioskPayload.name || "Walk-in Patient",
    status: "Auto-Approved (Ready)",
    startedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    intakeProgress: "Completed (100%)"
  });

  return patientId;
}
