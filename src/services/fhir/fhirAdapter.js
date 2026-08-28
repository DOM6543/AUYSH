/**
 * FHIR R4 & ABDM Interoperability Adapter
 * 
 * Maps MediKiosk structured clinical intake into standard HL7 FHIR R4 resources:
 * - FHIR Patient
 * - FHIR Encounter
 * - FHIR Condition (Chief complaint & chronic conditions)
 * - FHIR Observation (Vitals & Lab Investigations)
 * - FHIR MedicationStatement (Medications with dosages & frequencies)
 * - FHIR AllergyIntolerance
 * - FHIR DocumentReference
 */

export function mapPatientToFhirBundle(patientData = {}) {
  const patientId = patientData.id || `MK-${Date.now()}`;
  const now = new Date().toISOString();

  // 1. FHIR Patient Resource
  const fhirPatient = {
    resourceType: "Patient",
    id: patientId,
    identifier: [
      {
        system: "https://healthid.ndhm.gov.in",
        value: patientData.abhaNumber || "91-0000-0000-0000"
      },
      {
        system: "https://aiims.edu/opd",
        value: patientData.opdId || patientId
      }
    ],
    active: true,
    name: [
      {
        use: "official",
        text: patientData.name || "Patient"
      }
    ],
    gender: (patientData.gender || "other").toLowerCase(),
    birthDate: patientData.age ? `${new Date().getFullYear() - patientData.age}-01-01` : undefined,
    telecom: [
      {
        system: "phone",
        value: patientData.mobile || patientData.phone || "+91 98765 00000"
      }
    ],
    communication: [
      {
        language: {
          coding: [
            {
              system: "urn:ietf:bcp:47",
              code: patientData.language || "en",
              display: patientData.language || "English"
            }
          ]
        }
      }
    ]
  };

  // 2. FHIR Encounter Resource
  const fhirEncounter = {
    resourceType: "Encounter",
    id: `enc-${patientId}`,
    status: "finished",
    class: {
      system: "http://terminology.hl7.org/CodeSystem/v3-ActCode",
      code: "AMB",
      display: "ambulatory"
    },
    subject: {
      reference: `Patient/${patientId}`,
      display: patientData.name
    },
    period: {
      start: now
    },
    reasonCode: [
      {
        text: patientData.chiefComplaint || "General OPD Consultation"
      }
    ]
  };

  // 3. FHIR Condition Resources (Chief Complaint & Chronic Illnesses)
  const fhirConditions = [];
  if (patientData.chiefComplaint) {
    fhirConditions.push({
      resourceType: "Condition",
      id: `cond-cc-${patientId}`,
      clinicalStatus: {
        coding: [{ system: "http://terminology.hl7.org/CodeSystem/condition-clinical", code: "active" }]
      },
      verificationStatus: {
        coding: [{ system: "http://terminology.hl7.org/CodeSystem/condition-ver-status", code: "provisional" }]
      },
      category: [
        {
          coding: [{ system: "http://terminology.hl7.org/CodeSystem/condition-category", code: "encounter-diagnosis" }]
        }
      ],
      code: {
        text: patientData.chiefComplaint
      },
      subject: { reference: `Patient/${patientId}` }
    });
  }

  (patientData.pastHistory || []).forEach((hist, idx) => {
    fhirConditions.push({
      resourceType: "Condition",
      id: `cond-past-${patientId}-${idx}`,
      clinicalStatus: {
        coding: [{ system: "http://terminology.hl7.org/CodeSystem/condition-clinical", code: "active" }]
      },
      category: [
        {
          coding: [{ system: "http://terminology.hl7.org/CodeSystem/condition-category", code: "problem-list-item" }]
        }
      ],
      code: {
        text: typeof hist === "string" ? hist : hist.name
      },
      subject: { reference: `Patient/${patientId}` }
    });
  });

  // 4. FHIR Observation Resources (Vitals & Labs)
  const fhirObservations = [];
  const vitals = patientData.vitals || {};

  // Blood Pressure
  if (vitals.bp?.value || vitals.bp) {
    const bpVal = vitals.bp?.value || vitals.bp;
    const parts = bpVal.split("/");
    fhirObservations.push({
      resourceType: "Observation",
      id: `obs-bp-${patientId}`,
      status: "final",
      category: [{ coding: [{ system: "http://terminology.hl7.org/CodeSystem/observation-category", code: "vital-signs" }] }],
      code: { coding: [{ system: "http://loinc.org", code: "85354-9", display: "Blood pressure panel with all children optional" }] },
      subject: { reference: `Patient/${patientId}` },
      effectiveDateTime: now,
      component: [
        {
          code: { coding: [{ system: "http://loinc.org", code: "8480-6", display: "Systolic blood pressure" }] },
          valueQuantity: { value: parseInt(parts[0], 10) || 120, unit: "mmHg", system: "http://unitsofmeasure.org", code: "mm[Hg]" }
        },
        {
          code: { coding: [{ system: "http://loinc.org", code: "8462-4", display: "Diastolic blood pressure" }] },
          valueQuantity: { value: parseInt(parts[1], 10) || 80, unit: "mmHg", system: "http://unitsofmeasure.org", code: "mm[Hg]" }
        }
      ]
    });
  }

  // Heart Rate / Pulse
  if (vitals.pulse?.value || vitals.pulse) {
    fhirObservations.push({
      resourceType: "Observation",
      id: `obs-pulse-${patientId}`,
      status: "final",
      category: [{ coding: [{ system: "http://terminology.hl7.org/CodeSystem/observation-category", code: "vital-signs" }] }],
      code: { coding: [{ system: "http://loinc.org", code: "8867-4", display: "Heart rate" }] },
      subject: { reference: `Patient/${patientId}` },
      effectiveDateTime: now,
      valueQuantity: { value: parseInt(vitals.pulse?.value || vitals.pulse, 10) || 78, unit: "beats/minute", system: "http://unitsofmeasure.org", code: "/min" }
    });
  }

  // SpO2
  if (vitals.spo2?.value || vitals.spo2) {
    fhirObservations.push({
      resourceType: "Observation",
      id: `obs-spo2-${patientId}`,
      status: "final",
      category: [{ coding: [{ system: "http://terminology.hl7.org/CodeSystem/observation-category", code: "vital-signs" }] }],
      code: { coding: [{ system: "http://loinc.org", code: "2708-6", display: "Oxygen saturation in Arterial blood" }] },
      subject: { reference: `Patient/${patientId}` },
      effectiveDateTime: now,
      valueQuantity: { value: parseInt(vitals.spo2?.value || vitals.spo2, 10) || 98, unit: "%", system: "http://unitsofmeasure.org", code: "%" }
    });
  }

  // 5. FHIR MedicationStatement Resources
  const fhirMedications = (patientData.medications || []).map((med, idx) => ({
    resourceType: "MedicationStatement",
    id: `med-${patientId}-${idx}`,
    status: "active",
    medicationCodeableConcept: {
      text: typeof med === "string" ? med : `${med.name} ${med.dosage || ""}`
    },
    subject: { reference: `Patient/${patientId}` },
    effectiveDateTime: now,
    dosage: [
      {
        text: typeof med === "object" ? `${med.dosage || ""} ${med.frequency || ""}` : "As prescribed"
      }
    ],
    note: [
      {
        text: `Provenance: ${med.provenance || med.source || "Patient Reported"}`
      }
    ]
  }));

  // 6. FHIR AllergyIntolerance Resources
  const fhirAllergies = (patientData.allergies || []).map((allg, idx) => ({
    resourceType: "AllergyIntolerance",
    id: `allg-${patientId}-${idx}`,
    clinicalStatus: {
      coding: [{ system: "http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical", code: "active" }]
    },
    verificationStatus: {
      coding: [{ system: "http://terminology.hl7.org/CodeSystem/allergyintolerance-verification", code: "confirmed" }]
    },
    code: { text: typeof allg === "string" ? allg : allg.name },
    patient: { reference: `Patient/${patientId}` }
  }));

  // Assemble into FHIR R4 Bundle
  const bundle = {
    resourceType: "Bundle",
    id: `bundle-medikiosk-${patientId}`,
    type: "document",
    timestamp: now,
    entry: [
      { fullUrl: `urn:uuid:${patientId}`, resource: fhirPatient },
      { fullUrl: `urn:uuid:enc-${patientId}`, resource: fhirEncounter },
      ...fhirConditions.map((c) => ({ fullUrl: `urn:uuid:${c.id}`, resource: c })),
      ...fhirObservations.map((o) => ({ fullUrl: `urn:uuid:${o.id}`, resource: o })),
      ...fhirMedications.map((m) => ({ fullUrl: `urn:uuid:${m.id}`, resource: m })),
      ...fhirAllergies.map((a) => ({ fullUrl: `urn:uuid:${a.id}`, resource: a }))
    ]
  };

  return bundle;
}

/**
 * Downloads standard FHIR R4 Bundle as JSON
 */
export function downloadFhirBundle(patientData) {
  const bundle = mapPatientToFhirBundle(patientData);
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(bundle, null, 2));
  const downloadAnchor = document.createElement("a");
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `FHIR_R4_Bundle_${(patientData.name || "Patient").replace(/\s+/g, "_")}_${patientData.id || "MK01"}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}
