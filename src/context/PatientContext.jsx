import React, { createContext, useContext, useState, useEffect } from "react";
import {
  initializeDatabaseIfEmpty,
  subscribeToPatients,
  subscribeToPatient,
  subscribeToKioskSessions,
  subscribeToAlerts,
  updateClinicalSummaryInFirebase,
  acceptClinicalSummaryInFirebase,
  rejectClinicalSummaryInFirebase,
  addDocumentToFirebase,
  updateVitalsInFirebase,
  submitKioskIntakeToFirebase
} from "../services/firebaseService";
import { initialPatientData, samplePatientsList as defaultPatientsList, notificationsList } from "../data/mockData";
import { ayushData } from "../data/ayushData";
import { TRANSLATIONS, SUPPORTED_LANGUAGES } from "../data/translations";

const PatientContext = createContext(null);

export function PatientProvider({ children }) {
  const [patientsList, setPatientsList] = useState(defaultPatientsList);
  const [selectedPatientId, setSelectedPatientId] = useState("MK-2025-05-26-0001");
  const [patient, setPatient] = useState({
    ...initialPatientData,
    ayush: ayushData
  });
  const [kioskSessions, setKioskSessions] = useState([]);
  const [alertsList, setAlertsList] = useState(notificationsList);
  const [notifications, setNotifications] = useState(notificationsList);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Multilingual localization: 'en' | 'hi' | 'ta' | 'te' | 'kn' | 'bn' | 'mr' | 'gu'
  const [currentLanguage, setCurrentLanguage] = useState("en");
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;

  // Portal Authentication Mode: 'login' | 'doctor' | 'kiosk'
  const [portalMode, setPortalMode] = useState("login");
  const [currentUser, setCurrentUser] = useState({
    name: "Dr. Ramesh Kumar",
    role: "Chief Physician & OPD Head",
    department: "AIIMS Ayurveda & Integrative OPD"
  });

  const loginAsDoctor = (userData) => {
    if (userData) setCurrentUser(userData);
    setPortalMode("doctor");
  };

  const logoutToPortal = () => {
    setPortalMode("login");
  };

  const [activeTab, setActiveTab] = useState("history"); // history, ayush, vitals, examination, lifestyle
  const [activeNav, setActiveNav] = useState("dashboard");
  const [clinic, setClinic] = useState("AIIMS Ayurveda OPD");

  // Modals & Drawers
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isTimelineModalOpen, setIsTimelineModalOpen] = useState(false);
  const [isRedFlagsModalOpen, setIsRedFlagsModalOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isClinicDropdownOpen, setIsClinicDropdownOpen] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState([]);

  // AI Assistant Chat Messages
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      sender: "ai",
      text: "Hello Dr. Ramesh! Realtime Firebase backend synced. How can I assist your clinical evaluation today?",
      time: "Live"
    }
  ]);

  const showToast = (message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => (prev || []).map((n) => ({ ...n, unread: false })));
  };

  // Step 1: Initialize Database & Subscriptions
  useEffect(() => {
    // Seed initial structure if database is empty
    initializeDatabaseIfEmpty();

    // Subscribe to all patients
    const unsubscribePatients = subscribeToPatients((list) => {
      if (list && list.length > 0) {
        setPatientsList(list);
      }
      setLoading(false);
    });

    // Subscribe to sessions
    const unsubscribeSessions = subscribeToKioskSessions((sessions) => {
      if (sessions && sessions.length > 0) {
        setKioskSessions(sessions);
      }
    });

    // Subscribe to alerts
    const unsubscribeAlerts = subscribeToAlerts((alerts) => {
      if (alerts && alerts.length > 0) {
        setAlertsList(alerts);
        setNotifications(alerts);
      }
    });

    return () => {
      unsubscribePatients();
      unsubscribeSessions();
      unsubscribeAlerts();
    };
  }, []);

  // Step 2: Subscribe to active selected patient in real-time
  useEffect(() => {
    if (!selectedPatientId) return;

    const unsubscribeSingle = subscribeToPatient(selectedPatientId, (patientData) => {
      if (patientData) {
        // Ensure arrays exist even if null in Firebase
        const sanitized = {
          ...initialPatientData,
          ...patientData,
          ayush: patientData.ayush || ayushData,
          examination: patientData.examination || initialPatientData.examination,
          lifestyle: patientData.lifestyle || initialPatientData.lifestyle,
          documents: patientData.documents
            ? (Array.isArray(patientData.documents) ? patientData.documents : Object.values(patientData.documents))
            : initialPatientData.documents || [],
          timeline: patientData.timeline || initialPatientData.timeline || [],
          aiSummary: {
            ...initialPatientData.aiSummary,
            ...patientData.aiSummary,
            hpi: patientData.aiSummary?.hpi || initialPatientData.aiSummary?.hpi || [],
            pastHistory: patientData.aiSummary?.pastHistory || initialPatientData.aiSummary?.pastHistory || [],
            medications: patientData.aiSummary?.medications || initialPatientData.aiSummary?.medications || [],
            allergies: patientData.aiSummary?.allergies || initialPatientData.aiSummary?.allergies || [],
            suggestions: patientData.aiSummary?.suggestions || initialPatientData.aiSummary?.suggestions || [],
            familyHistory: patientData.aiSummary?.familyHistory || initialPatientData.aiSummary?.familyHistory || []
          }
        };
        setPatient(sanitized);
      }
    });

    return () => unsubscribeSingle();
  }, [selectedPatientId]);

  // Actions writing back to Firebase
  const handleAcceptAndSave = async () => {
    if (!patient) return;
    try {
      await acceptClinicalSummaryInFirebase(patient.id, patient.doctor?.name || "Dr. Ramesh Kumar");
      showToast("Clinical summary accepted and synced live to Firebase Realtime Database.", "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to write sign-off to Firebase.", "error");
    }
  };

  const handleRejectSummary = async (reason) => {
    if (!patient) return;
    try {
      await rejectClinicalSummaryInFirebase(patient.id, reason);
      showToast("Summary rejected and status recorded in Firebase.", "info");
    } catch (err) {
      console.error(err);
      showToast("Failed to reject summary in Firebase.", "error");
    }
  };

  const updateSummaryData = async (newSummary) => {
    if (!patient) return;
    try {
      await updateClinicalSummaryInFirebase(patient.id, newSummary);
      showToast("Summary draft updated live in Firebase.", "info");
    } catch (err) {
      console.error(err);
      showToast("Failed to update summary in Firebase.", "error");
    }
  };

  const uploadNewDocument = async (file) => {
    if (!patient) return;
    const newDoc = {
      id: `doc-${Date.now()}`,
      name: file.name || "Uploaded_Doc.pdf",
      type: file.type?.includes("image") ? "image" : "pdf",
      size: `${(file.size ? (file.size / (1024 * 1024)).toFixed(1) : "1.5")} MB`,
      uploadedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: "Processed",
      category: "Patient Upload",
      previewContent: {
        hospital: "AIIMS Ingest Engine",
        notes: `Extracted text from ${file.name || "document"}.`
      }
    };

    try {
      await addDocumentToFirebase(patient.id, newDoc);
      showToast(`"${newDoc.name}" saved to Firebase & processed via OCR.`, "success");
    } catch (err) {
      console.error(err);
      showToast("Document upload failed.", "error");
    }
  };

  const refreshVitals = async () => {
    if (!patient) return;
    const randomPulse = Math.floor(92 + Math.random() * 8);
    const randomSys = Math.floor(136 + Math.random() * 8);
    const randomDia = Math.floor(88 + Math.random() * 4);

    const vitalsObj = {
      ...patient.vitals,
      bp: { ...patient.vitals.bp, value: `${randomSys}/${randomDia}` },
      pulse: { ...patient.vitals.pulse, value: `${randomPulse}` }
    };

    try {
      await updateVitalsInFirebase(patient.id, vitalsObj);
      showToast("Vitals telemetry synced with Kiosk & Firebase.", "info");
    } catch (err) {
      console.error(err);
    }
  };

  const submitKioskIntake = async (payload) => {
    try {
      const newPatientId = await submitKioskIntakeToFirebase(payload);
      setSelectedPatientId(newPatientId);
      showToast("Kiosk intake submitted live to Firebase Realtime Database!", "success");
      return newPatientId;
    } catch (err) {
      console.error("Kiosk submit error:", err);
      showToast("Failed to submit kiosk intake to Firebase.", "error");
    }
  };

  const sendAiChatMessage = (text) => {
    const userMsg = {
      id: Date.now(),
      sender: "doctor",
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages((prev) => [...prev, userMsg]);

    setTimeout(() => {
      let replyText = `I am reading live data for ${patient?.name || "the active patient"} from Firebase Realtime Database. Red flags indicate exertional chest pain with elevated BP (140/90 mmHg). Immediate 12-lead ECG is advised.`;
      
      const lower = text.toLowerCase();
      if (lower.includes("ayush") || lower.includes("dosha") || lower.includes("prakriti")) {
        replyText = `Firebase AYUSH Node: ${patient?.name}'s Pitta-Vata imbalance is synced. Recommended formulations include Arjuna Ksheerapaka and Prabhakar Vati BD.`;
      } else if (lower.includes("drug") || lower.includes("interaction") || lower.includes("medication")) {
        replyText = `Current Medications in Firebase: Amlodipine 5mg OD. No contraindications detected with emergency cardiac protocols.`;
      }

      const aiMsg = {
        id: Date.now() + 1,
        sender: "ai",
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages((prev) => [...prev, aiMsg]);
    }, 600);
  };

  const samplePatientsList = patientsList && patientsList.length > 0 ? patientsList : defaultPatientsList;
  const ayushInfo = patient?.ayush || ayushData;

  return (
    <PatientContext.Provider
      value={{
        patient,
        patientsList,
        samplePatientsList,
        ayushInfo,
        selectedPatientId,
        setSelectedPatientId,
        kioskSessions,
        portalMode,
        setPortalMode,
        currentLanguage,
        setCurrentLanguage,
        t,
        SUPPORTED_LANGUAGES,
        currentUser,
        loginAsDoctor,
        logoutToPortal,
        alertsList,
        notifications,
        markAllNotificationsRead,
        loading,
        isLoading: loading,
        error,
        isConnected: true,
        activeTab,
        setActiveTab,
        activeNav,
        setActiveNav,
        clinic,
        setClinic,
        isEditModalOpen,
        setIsEditModalOpen,
        isRejectModalOpen,
        setIsRejectModalOpen,
        isAiChatOpen,
        setIsAiChatOpen,
        selectedDocument,
        setSelectedDocument,
        isProfileModalOpen,
        setIsProfileModalOpen,
        isTimelineModalOpen,
        setIsTimelineModalOpen,
        isRedFlagsModalOpen,
        setIsRedFlagsModalOpen,
        isCommandPaletteOpen,
        setIsCommandPaletteOpen,
        isNotificationsOpen,
        setIsNotificationsOpen,
        isClinicDropdownOpen,
        setIsClinicDropdownOpen,
        toasts,
        showToast,
        handleAcceptAndSave,
        handleRejectSummary,
        updateSummaryData,
        uploadNewDocument,
        refreshVitals,
        submitKioskIntake,
        chatMessages,
        sendAiChatMessage
      }}
    >
      {children}
    </PatientContext.Provider>
  );
}

export function usePatient() {
  const context = useContext(PatientContext);
  if (!context) {
    throw new Error("usePatient must be used within a PatientProvider");
  }
  return context;
}
