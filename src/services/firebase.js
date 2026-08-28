import { initializeApp, getApps } from "firebase/app";
import { getDatabase, ref, set, get, onValue, update, push } from "firebase/database";
import { initialPatientData, samplePatientsList, notificationsList } from "../data/mockData";
import { ayushData } from "../data/ayushData";

const firebaseConfig = {
  databaseURL: "https://medikiosk-7cf65-default-rtdb.firebaseio.com",
  projectId: "medikiosk-7cf65",
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getDatabase(app);
export const DB_BASE_URL = "https://medikiosk-7cf65-default-rtdb.firebaseio.com";

// Seed Database if empty
export async function seedInitialDatabase() {
  try {
    const rootRef = ref(db, "patients/MK-2025-05-26-0001");
    const snapshot = await get(rootRef);
    if (!snapshot.exists()) {
      console.log("Seeding Firebase Realtime Database with initial patient and clinical records...");
      await set(ref(db, "patients/MK-2025-05-26-0001"), initialPatientData);
      await set(ref(db, "ayush/MK-2025-05-26-0001"), ayushData);
      await set(ref(db, "patientsList"), samplePatientsList);
      await set(ref(db, "notifications"), notificationsList);
      await set(ref(db, "activePatientId"), "MK-2025-05-26-0001");
      console.log("Firebase RTDB successfully initialized.");
    }
  } catch (error) {
    console.warn("Firebase SDK seed error, attempting REST fallback seed:", error);
    try {
      await fetch(`${DB_BASE_URL}/patients/MK-2025-05-26-0001.json`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(initialPatientData)
      });
      await fetch(`${DB_BASE_URL}/ayush/MK-2025-05-26-0001.json`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ayushData)
      });
      await fetch(`${DB_BASE_URL}/notifications.json`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(notificationsList)
      });
    } catch (e) {
      console.error("REST fallback error:", e);
    }
  }
}

// Real-time listener for current active patient
export function subscribeToPatient(patientId, onDataReceived) {
  const patientRef = ref(db, `patients/${patientId}`);
  const unsubscribe = onValue(
    patientRef,
    (snapshot) => {
      if (snapshot.exists()) {
        onDataReceived(snapshot.val());
      } else {
        // Fallback fetch
        fetch(`${DB_BASE_URL}/patients/${patientId}.json`)
          .then((res) => res.json())
          .then((data) => {
            if (data) onDataReceived(data);
          })
          .catch(console.error);
      }
    },
    (error) => {
      console.warn("Firebase real-time subscription error, polling via REST:", error);
      fetch(`${DB_BASE_URL}/patients/${patientId}.json`)
        .then((res) => res.json())
        .then((data) => {
          if (data) onDataReceived(data);
        })
        .catch(console.error);
    }
  );
  return unsubscribe;
}

// Update patient summary on Firebase
export async function syncSummaryToFirebase(patientId, summary) {
  try {
    await update(ref(db, `patients/${patientId}/aiSummary`), summary);
  } catch (err) {
    console.warn("Firebase SDK update failed, using REST fallback:", err);
    await fetch(`${DB_BASE_URL}/patients/${patientId}/aiSummary.json`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(summary)
    });
  }
}

// Update patient vitals on Firebase
export async function syncVitalsToFirebase(patientId, vitals) {
  try {
    await update(ref(db, `patients/${patientId}/vitals`), vitals);
  } catch (err) {
    await fetch(`${DB_BASE_URL}/patients/${patientId}/vitals.json`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(vitals)
    });
  }
}

// Add document to Firebase
export async function syncDocumentToFirebase(patientId, documents) {
  try {
    await set(ref(db, `patients/${patientId}/documents`), documents);
  } catch (err) {
    await fetch(`${DB_BASE_URL}/patients/${patientId}/documents.json`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(documents)
    });
  }
}

// Lock / Save Consultation Review on Firebase
export async function syncReviewStatusToFirebase(patientId, status, timeline) {
  try {
    await update(ref(db, `patients/${patientId}`), {
      reviewStatus: status,
      timeline: timeline
    });
  } catch (err) {
    await fetch(`${DB_BASE_URL}/patients/${patientId}.json`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reviewStatus: status, timeline: timeline })
    });
  }
}

// Chat Messages Listener & Writer
export function subscribeToChatMessages(callback) {
  const chatRef = ref(db, "chatMessages");
  return onValue(chatRef, (snapshot) => {
    if (snapshot.exists()) {
      const val = snapshot.val();
      const list = Array.isArray(val) ? val : Object.values(val);
      callback(list);
    }
  });
}

export async function pushChatMessageToFirebase(message) {
  try {
    const chatRef = ref(db, "chatMessages");
    await push(chatRef, message);
  } catch (err) {
    await fetch(`${DB_BASE_URL}/chatMessages.json`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message)
    });
  }
}
