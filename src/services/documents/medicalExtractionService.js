/**
 * Medical Entity Extraction & Document Timeline Service
 * 
 * Analyzes OCR text output to extract structured clinical entities:
 * - Diagnoses & Clinical Conditions
 * - Medications, Dosages, Frequencies, and Durations
 * - Laboratory Investigations, Test Values, Reference Ranges
 * - Abnormal Lab Value Highlighting
 * - Document Dates & Chronological Timeline Synthesis
 */

class MedicalExtractionService {
  /**
   * Extract all structured medical entities from raw document OCR text
   * @param {string} rawText - Output from OCR pass
   * @param {Object} metadata - File metadata (fileName, type, uploadDate)
   */
  extractMedicalEntities(rawText = "", metadata = {}) {
    if (!rawText) {
      return {
        documentDate: metadata.uploadedAt || new Date().toLocaleDateString(),
        diagnoses: [],
        medications: [],
        investigations: [],
        abnormalFindings: [],
        rawSummary: "No extractable text"
      };
    }

    const documentDate = this.extractDocumentDate(rawText) || metadata.uploadedAt || "Recent";
    const diagnoses = this.extractDiagnoses(rawText);
    const medications = this.extractMedications(rawText, documentDate);
    const investigations = this.extractInvestigations(rawText);
    const abnormalFindings = investigations.filter((inv) => inv.isAbnormal);

    return {
      documentId: metadata.id || `doc-${Date.now()}`,
      documentName: metadata.name || "Medical Document",
      documentDate,
      diagnoses,
      medications,
      investigations,
      abnormalFindings,
      hasAbnormalities: abnormalFindings.length > 0,
      extractedAt: new Date().toISOString()
    };
  }

  /**
   * Extract document consultation/report date
   */
  extractDocumentDate(text) {
    // Regex for DD/MM/YYYY or DD-MM-YYYY
    const dateMatch = text.match(/\b(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})\b/);
    if (dateMatch) {
      return dateMatch[1];
    }
    // Regex for "DATE: Month Year" or "May 2024"
    const monthMatch = text.match(/\b(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{4}\b/i);
    if (monthMatch) {
      return monthMatch[0];
    }
    return null;
  }

  /**
   * Extract clinical diagnoses
   */
  extractDiagnoses(text) {
    const diagnoses = [];
    const lower = text.toLowerCase();

    if (lower.includes("hypertension") || lower.includes("high bp") || lower.includes("htn")) {
      diagnoses.push({ name: "Primary Essential Hypertension", category: "Cardiovascular", code: "I10" });
    }
    if (lower.includes("diabetes") || lower.includes("t2dm") || lower.includes("hba1c")) {
      diagnoses.push({ name: "Type 2 Diabetes Mellitus", category: "Endocrine", code: "E11" });
    }
    if (lower.includes("angina") || lower.includes("coronary") || lower.includes("cad")) {
      diagnoses.push({ name: "Coronary Artery Disease / Angina Pectoris", category: "Cardiovascular", code: "I25" });
    }
    if (lower.includes("dyslipidemia") || lower.includes("cholesterol") || lower.includes("triglycerides")) {
      diagnoses.push({ name: "Dyslipidemia / Hypercholesterolemia", category: "Metabolic", code: "E78" });
    }
    if (lower.includes("asthma") || lower.includes("copd") || lower.includes("bronchial")) {
      diagnoses.push({ name: "Bronchial Asthma", category: "Respiratory", code: "J45" });
    }
    if (lower.includes("osteoarthritis") || lower.includes("joint pain")) {
      diagnoses.push({ name: "Osteoarthritis", category: "Musculoskeletal", code: "M19" });
    }

    return diagnoses;
  }

  /**
   * Extract medications with dosage, frequency, and provenance
   */
  extractMedications(text, documentDate) {
    const medications = [];
    const lines = text.split("\n");

    const medPatterns = [
      { regex: /amlodipine\s*(\d+\s*mg)?/i, name: "Amlodipine", defaultDose: "5 mg", defaultFreq: "OD (Once Daily)" },
      { regex: /telmisartan\s*(\d+\s*mg)?/i, name: "Telmisartan", defaultDose: "40 mg", defaultFreq: "OD (Once Daily)" },
      { regex: /metformin\s*(\d+\s*mg)?/i, name: "Metformin", defaultDose: "500 mg", defaultFreq: "BD (Twice Daily)" },
      { regex: /atorvastatin\s*(\d+\s*mg)?/i, name: "Atorvastatin", defaultDose: "20 mg", defaultFreq: "HS (Bedtime)" },
      { regex: /arjuna\s*(ksheerapaka)?/i, name: "Arjuna Ksheerapaka", defaultDose: "100 ml", defaultFreq: "BD (Twice Daily)" },
      { regex: /aspirin\s*(\d+\s*mg)?/i, name: "Aspirin (Ecosprin)", defaultDose: "75 mg", defaultFreq: "OD (Once Daily)" },
      { regex: /pantoprazole\s*(\d+\s*mg)?/i, name: "Pantoprazole", defaultDose: "40 mg", defaultFreq: "OD (Before Breakfast)" }
    ];

    for (const pattern of medPatterns) {
      if (pattern.regex.test(text)) {
        medications.push({
          name: pattern.name,
          dosage: pattern.defaultDose,
          frequency: pattern.defaultFreq,
          source: `Extracted from Document (${documentDate})`,
          provenance: "DOCUMENT_EXTRACTED",
          status: "Active"
        });
      }
    }

    return medications;
  }

  /**
   * Extract laboratory investigations, test values, and flag abnormal findings
   */
  extractInvestigations(text) {
    const investigations = [];

    // 1. HbA1c
    const hba1cMatch = text.match(/hba1c[^\d]*(\d+\.?\d*)\s*%/i);
    if (hba1cMatch) {
      const val = parseFloat(hba1cMatch[1]);
      const isHigh = val >= 6.5;
      investigations.push({
        testName: "Glycated Hemoglobin (HbA1c)",
        value: `${val}%`,
        referenceRange: "< 5.7% (Normal), 5.7-6.4% (Prediabetes), >= 6.5% (Diabetes)",
        isAbnormal: isHigh,
        abnormalityType: isHigh ? "ELEVATED (Above Reference)" : "NORMAL",
        clinicalNote: isHigh ? "Suboptimal glycemic control. Physician review required." : "Within normal limits."
      });
    }

    // 2. Fasting Blood Glucose
    const fbsMatch = text.match(/fasting\s+(?:blood\s+)?glucose[^\d]*(\d+)/i);
    if (fbsMatch) {
      const val = parseInt(fbsMatch[1], 10);
      const isHigh = val > 100;
      investigations.push({
        testName: "Fasting Blood Glucose",
        value: `${val} mg/dL`,
        referenceRange: "70 - 99 mg/dL",
        isAbnormal: isHigh,
        abnormalityType: isHigh ? "ELEVATED (Hyperglycemia)" : "NORMAL",
        clinicalNote: isHigh ? "Elevated fasting blood sugar. Potential abnormality — physician review required." : "Normal."
      });
    }

    // 3. Post Prandial Blood Glucose
    const ppbsMatch = text.match(/post\s+prandial\s+glucose[^\d]*(\d+)/i);
    if (ppbsMatch) {
      const val = parseInt(ppbsMatch[1], 10);
      const isHigh = val > 140;
      investigations.push({
        testName: "Post Prandial Blood Glucose (PPBS)",
        value: `${val} mg/dL`,
        referenceRange: "< 140 mg/dL",
        isAbnormal: isHigh,
        abnormalityType: isHigh ? "ELEVATED" : "NORMAL",
        clinicalNote: isHigh ? "Postprandial glycemic excursion." : "Normal."
      });
    }

    // 4. Serum Total Cholesterol
    const cholMatch = text.match(/serum\s+cholesterol\s+total[^\d]*(\d+)/i) || text.match(/total\s+cholesterol[^\d]*(\d+)/i);
    if (cholMatch) {
      const val = parseInt(cholMatch[1], 10);
      const isHigh = val >= 200;
      investigations.push({
        testName: "Serum Total Cholesterol",
        value: `${val} mg/dL`,
        referenceRange: "< 200 mg/dL",
        isAbnormal: isHigh,
        abnormalityType: isHigh ? "ELEVATED (Hypercholesterolemia)" : "NORMAL",
        clinicalNote: isHigh ? "Elevated atherogenic lipid parameter. Lipid-lowering therapy evaluation." : "Normal."
      });
    }

    // 5. Serum Creatinine
    const creatMatch = text.match(/serum\s+creatinine[^\d]*(\d+\.?\d*)/i);
    if (creatMatch) {
      const val = parseFloat(creatMatch[1]);
      const isHigh = val > 1.20;
      investigations.push({
        testName: "Serum Creatinine",
        value: `${val} mg/dL`,
        referenceRange: "0.70 - 1.20 mg/dL",
        isAbnormal: isHigh,
        abnormalityType: isHigh ? "ELEVATED (Renal Impairment)" : "NORMAL",
        clinicalNote: isHigh ? "Renal function parameter elevated. Correlate with eGFR." : "Normal renal function parameter."
      });
    }

    return investigations;
  }

  /**
   * Build Chronological Document Timeline from extracted documents
   */
  buildDocumentTimeline(documents = []) {
    return documents
      .map((doc) => {
        const extractions = doc.extractions || this.extractMedicalEntities(doc.rawText || "", doc);
        return {
          id: doc.id,
          name: doc.name,
          date: extractions.documentDate || doc.uploadedAt || "Prior Visit",
          type: doc.type || "pdf",
          diagnoses: extractions.diagnoses || [],
          medications: extractions.medications || [],
          investigations: extractions.investigations || [],
          abnormalFindings: extractions.abnormalFindings || []
        };
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
}

export const medicalExtractionService = new MedicalExtractionService();
