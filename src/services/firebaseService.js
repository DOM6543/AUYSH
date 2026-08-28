import { db, ref, onValue, set, update, push } from "../firebase";
import { initialPatientData, samplePatientsList, notificationsList } from "../data/mockData";
import { ayushData } from "../data/ayushData";
import { normalizePatient, submitKioskIntakeToFirebase as submitKioskIntakeInternal } from "./firebase/patientService";
import { mapPatientToFhirBundle, downloadFhirBundle } from "./fhir/fhirAdapter";
import { evaluateClinicalTriage } from "./clinical/triageService";

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
          status: "Auto-Approved (HIGH / PRIORITY)",
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
          status: "Auto-Approved (LOW)",
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
          title: "HIGH / PRIORITY: Arun Kumar",
          message: "Arun Kumar (MK-0001) flagged with exertional chest pain and elevated BP (140/90).",
          time: "5 mins ago",
          unread: true,
          type: "alert"
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
    const list = Object.keys(val).map((key) => normalizePatient(val[key], key));
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
    callback(normalizePatient(data, patientId));
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
    lastEditedAt: new Date().toISOString(),
    physicianEdited: true
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

// 11. Patient Kiosk Intake Submission (Delegates to patientService)
export async function submitKioskIntakeToFirebase(kioskPayload) {
  return submitKioskIntakeInternal(kioskPayload);
}

// Export Interoperability Adapters
export { mapPatientToFhirBundle, downloadFhirBundle };
