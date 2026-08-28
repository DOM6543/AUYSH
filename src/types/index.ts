export interface VitalMetric {
  value: string;
  unit: string;
  status: 'normal' | 'high' | 'low' | 'warning';
  label: string;
}

export interface VitalsData {
  bp: VitalMetric;
  pulse: VitalMetric;
  spo2: VitalMetric;
  temperature: VitalMetric;
  respiratoryRate?: VitalMetric;
  weight?: VitalMetric;
  height?: VitalMetric;
  history?: Array<{
    time: string;
    bp: string;
    pulse: number;
    spo2: number;
    temp: number;
  }>;
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration?: string;
}

export interface FamilyHistoryItem {
  relation: string;
  condition: string;
}

export interface AISummary {
  chiefComplaint: string;
  hpi: string[];
  pastHistory: string[];
  medications: Medication[];
  allergies: string[];
  redFlagsList: string[];
  suggestions: string[];
  systemicReview: string;
  familyHistory: FamilyHistoryItem[];
  physicianReviewedSummary?: AISummary;
}

export interface TimelineEvent {
  time: string;
  title: string;
  details: string;
  status: 'completed' | 'active' | 'pending';
}

export interface DocumentItem {
  id: string;
  name: string;
  type: 'pdf' | 'image' | string;
  size: string;
  uploadedAt: string;
  status: 'Processed' | 'Processing' | 'Failed';
  category: string;
  downloadUrl?: string;
  previewContent?: any;
}

export interface AYUSHHistory {
  prakriti: {
    primary: string;
    distribution: Array<{
      dosha: string;
      percentage: number;
      color: string;
      traits: string;
    }>;
  };
  vikriti: {
    state: string;
    severity: string;
    description: string;
  };
  ashtavidhaPariksha: Array<{
    name: string;
    finding: string;
    note: string;
  }>;
  agniState: {
    type: string;
    details: string;
  };
  suggestedFormulations: Array<{
    name: string;
    dose: string;
    purpose: string;
  }>;
  dietLifestyleAdvice: string[];
}

export interface DoctorReview {
  status: 'draft' | 'saved' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  notes?: string;
}

export interface Patient {
  id: string;
  name: string;
  verified: boolean;
  age: number;
  gender: string;
  abhaNumber: string;
  abhaAddress: string;
  opdId: string;
  isNewPatient: boolean;
  mobile: string;
  language: string;
  registrationType: string;
  avatarUrl: string;
  doctor: {
    name: string;
    role: string;
    avatar: string;
    department: string;
  };
  stats: {
    chiefComplaint: { title: string; value: string; subtitle: string; icon: string; color: string };
    kioskSession: { title: string; value: string; subtitle: string; icon: string; color: string };
    consultationType: { title: string; value: string; subtitle: string; icon: string; color: string };
    redFlags: { title: string; value: string; subtitle: string; icon: string; color: string };
    lastUpdated: { title: string; value: string; subtitle: string; icon: string; color: string };
  };
  aiSummary: AISummary;
  vitals: VitalsData;
  timeline: TimelineEvent[];
  documents: DocumentItem[];
  examination?: any;
  lifestyle?: any;
  ayush?: AYUSHHistory;
  doctorReview?: DoctorReview;
}

export interface KioskSession {
  id: string;
  kioskId: string;
  location: string;
  patientId: string;
  patientName: string;
  status: string;
  startedAt: string;
  lastUpdated: string;
  intakeProgress: string;
}

export interface ClinicalAlert {
  id: string | number;
  patientId: string;
  patientName: string;
  title: string;
  message: string;
  time: string;
  unread: boolean;
  type: 'alert' | 'info' | 'system';
}
