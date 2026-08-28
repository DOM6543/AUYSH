/**
 * @typedef {Object} VitalSigns
 * @property {string} [bp] - Blood Pressure e.g. "140/90"
 * @property {number|string} [pulse] - Heart rate bpm e.g. 98
 * @property {number|string} [spo2] - Oxygen Saturation % e.g. 98
 * @property {number|string} [temperature] - Temp °F e.g. 98.6
 * @property {number|string} [respiratoryRate] - Breaths per minute e.g. 18
 * @property {number|string} [weight] - Weight in kg
 * @property {number|string} [height] - Height in cm
 * @property {string} [capturedAt] - Timestamp of vitals recording
 */

/**
 * @typedef {Object} Document
 * @property {string} id - Document unique ID
 * @property {string} name - File name e.g. "Prescription_26052025.pdf"
 * @property {string} type - "pdf" | "image" | "dicom" | "other"
 * @property {string} [size] - File size e.g. "1.2 MB"
 * @property {string} uploadedAt - Date string e.g. "May 26, 2025 10:20 AM"
 * @property {string} status - "Processed" | "Processing" | "Pending" | "Error"
 * @property {string} [category] - "Prescription" | "Lab Report" | "Discharge Summary" | "Imaging"
 * @property {string} [url] - Download or preview URL
 * @property {Object} [previewContent] - Structured OCR data
 */

/**
 * @typedef {Object} TimelineEvent
 * @property {string} id - Event ID
 * @property {string} time - Formatted time e.g. "Today 10:15 AM"
 * @property {string} timestamp - ISO timestamp
 * @property {string} title - Short event title
 * @property {string} details - Detailed description
 * @property {string} status - "completed" | "active" | "pending"
 * @property {string} [actor] - "Patient" | "Kiosk AI" | "Doctor"
 */

/**
 * @typedef {Object} AYUSHHistory
 * @property {Object} [prakriti] - Tridosha Constitution { primary, distribution }
 * @property {Object} [vikriti] - Current Dosha Imbalance { state, description, severity }
 * @property {Array<Object>} [ashtavidhaPariksha] - 8-fold examination { name, finding, note }
 * @property {Object} [agniState] - Digestive fire status { type, details }
 * @property {Array<Object>} [suggestedFormulations] - Suggested Ayurvedic formulations
 * @property {Array<string>} [dietLifestyleAdvice] - Ahara-Vihara guidelines
 * @property {string} [sara] - Tissue excellence
 * @property {string} [samhanana] - Body compactness
 * @property {string} [pramana] - Body proportions
 * @property {string} [satmya] - Adaptability
 * @property {string} [sattva] - Mental constitution
 * @property {string} [aharaShakti] - Digestive capacity
 * @property {string} [vyayamaShakti] - Physical endurance
 * @property {string} [vaya] - Age category
 */

/**
 * @typedef {Object} ClinicalSummary
 * @property {string} chiefComplaint - Chief Complaint string
 * @property {Array<string>} [hpi] - History of Present Illness bullets
 * @property {Array<string>} [pastMedicalHistory] - Past medical history
 * @property {Array<string>} [pastSurgicalHistory] - Past surgical history
 * @property {Array<Object|string>} [medications] - Current drugs
 * @property {Array<string>} [allergies] - Allergy history
 * @property {string} [systemicReview] - Review of Systems (ROS)
 * @property {Array<Object>} [familyHistory] - Family medical conditions
 * @property {Array<string>} [redFlagsList] - High risk clinical alerts
 * @property {Array<string>} [suggestions] - AI suggested tests / actions (Not diagnosis)
 * @property {string} [personalHistory] - Sleep, diet, bowel habits
 */

/**
 * @typedef {Object} DoctorReview
 * @property {string} status - "draft" | "accepted" | "edited" | "rejected"
 * @property {string} [reviewedBy] - Doctor name e.g. "Dr. Ramesh Kumar"
 * @property {string} [reviewedAt] - ISO timestamp
 * @property {string} [rejectionReason] - Reason if rejected
 * @property {ClinicalSummary} [verifiedSummary] - Physician verified summary
 * @property {string} [notes] - Additional clinical notes
 */

/**
 * @typedef {Object} Patient
 * @property {string} id - Patient OPD ID e.g. "MK-2025-05-26-0001"
 * @property {string} name - Patient Full Name
 * @property {number} [age] - Age in years
 * @property {string} [gender] - Gender
 * @property {string} [abhaNumber] - ABHA 14-digit ID
 * @property {string} [abhaAddress] - ABHA handle e.g. "arun.kumar@abdm"
 * @property {string} [mobile] - Contact phone
 * @property {string} [language] - Preferred language
 * @property {string} [registrationType] - "Walk-in" | "Online Appointment"
 * @property {string} [consultationType] - "General OPD" | "Cardiology" | "Ayurveda OPD"
 * @property {string} [status] - "Ready for Review" | "In Consultation" | "Reviewed" | "Rejected"
 * @property {string} [lastUpdated] - Time string
 * @property {ClinicalSummary} [aiSummary] - Draft AI generated clinical history
 * @property {DoctorReview} [doctorReview] - Physician review record
 * @property {VitalSigns} [vitals] - Kiosk recorded vitals
 * @property {Array<Document>} [documents] - Attached clinical documents
 * @property {Array<TimelineEvent>} [timeline] - Chronological session events
 * @property {AYUSHHistory} [ayush] - Dedicated AYUSH history if present
 */
export {};
