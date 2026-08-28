/**
 * Medical Entity Extraction & Document Timeline Service
 * 
 * Analyzes raw OCR text to extract structured clinical entities:
 * - Diagnoses & ICD/Clinical Entities
 * - Prescriptions & Medications (Drug Name, Strength, Dose, Frequency, Route, Duration)
 * - Laboratory Investigations across CBC, LFT, KFT, Thyroid, and Metabolic Panels
 * - Contextual Reference Range Extraction (Report text priority vs Standard Reference)
 * - Abnormality Stratification (ELEVATED / LOW / NORMAL)
 * - Document Dates & Chronological Timeline Synthesis
 */

class MedicalExtractionService {
  /**
   * Extract all structured medical entities from raw document OCR text
   * @param {string} rawText - Output from real OCR engine
   * @param {Object} metadata - File metadata (fileName, type, uploadDate)
   */
  extractMedicalEntities(rawText = "", metadata = {}) {
    if (!rawText || rawText.trim().length < 5) {
      return {
        documentId: metadata.id || `doc-${Date.now()}`,
        documentName: metadata.name || "Medical Document",
        documentDate: metadata.uploadedAt || new Date().toLocaleDateString("en-GB"),
        diagnoses: [],
        medications: [],
        investigations: [],
        abnormalFindings: [],
        rawSummary: "No extractable clinical text detected",
        hasAbnormalities: false
      };
    }

    const documentDate = this.extractDocumentDate(rawText) || metadata.uploadedAt || new Date().toLocaleDateString("en-GB");
    const diagnoses = this.extractDiagnoses(rawText);
    const medications = this.extractMedications(rawText, documentDate);
    const investigations = this.extractInvestigations(rawText);
    const abnormalFindings = investigations.filter((inv) => inv.status === "ELEVATED" || inv.status === "LOW");

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
    const dateMatch = text.match(/\b(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})\b/);
    if (dateMatch) return dateMatch[1];

    const monthMatch = text.match(/\b(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2},?\s+\d{4}\b/i);
    if (monthMatch) return monthMatch[0];

    return null;
  }

  /**
   * Extract clinical diagnoses
   */
  extractDiagnoses(text) {
    const diagnoses = [];
    const lower = text.toLowerCase();

    const diagnosisMap = [
      { keywords: ["essential hypertension", "primary hypertension", "high bp", "htn"], name: "Primary Essential Hypertension", category: "Cardiovascular", code: "I10" },
      { keywords: ["diabetes mellitus", "t2dm", "type 2 diabetes", "hyperglycemia", "niddm"], name: "Type 2 Diabetes Mellitus", category: "Endocrine", code: "E11" },
      { keywords: ["angina pectoris", "coronary artery disease", "ischemic heart", "cad", "acs"], name: "Coronary Artery Disease / Angina Pectoris", category: "Cardiovascular", code: "I25" },
      { keywords: ["dyslipidemia", "hypercholesterolemia", "hyperlipidemia"], name: "Dyslipidemia / Hypercholesterolemia", category: "Metabolic", code: "E78" },
      { keywords: ["bronchial asthma", "asthma", "wheezing", "reactive airway"], name: "Bronchial Asthma", category: "Respiratory", code: "J45" },
      { keywords: ["chronic kidney disease", "ckd", "renal impairment"], name: "Chronic Kidney Disease", category: "Renal", code: "N18" },
      { keywords: ["hypothyroidism", "elevated tsh", "thyroiditis"], name: "Primary Hypothyroidism", category: "Endocrine", code: "E03" },
      { keywords: ["gastroesophageal reflux", "gerd", "peptic ulcer", "acid reflux", "dyspepsia"], name: "Gastroesophageal Reflux Disease (GERD) / Dyspepsia", category: "Gastrointestinal", code: "K21" },
      { keywords: ["osteoarthritis", "degenerative joint disease", "knee pain"], name: "Osteoarthritis", category: "Musculoskeletal", code: "M19" }
    ];

    for (const item of diagnosisMap) {
      if (item.keywords.some((kw) => lower.includes(kw))) {
        diagnoses.push({ name: item.name, category: item.category, code: item.code });
      }
    }

    return diagnoses;
  }

  /**
   * Comprehensive Medication Entity Extraction
   */
  extractMedications(text, documentDate) {
    const medications = [];

    const drugRegistry = [
      { pattern: /amlodipine\s*(\d+\s*mg)?/i, name: "Amlodipine", defaultDose: "5 mg", route: "Oral" },
      { pattern: /telmisartan\s*(\d+\s*mg)?/i, name: "Telmisartan", defaultDose: "40 mg", route: "Oral" },
      { pattern: /losartan\s*(\d+\s*mg)?/i, name: "Losartan", defaultDose: "50 mg", route: "Oral" },
      { pattern: /metoprolol\s*(\d+\s*mg)?/i, name: "Metoprolol", defaultDose: "25 mg", route: "Oral" },
      { pattern: /ramipril\s*(\d+\.?\d*\s*mg)?/i, name: "Ramipril", defaultDose: "2.5 mg", route: "Oral" },
      { pattern: /metformin\s*(\d+\s*mg)?/i, name: "Metformin", defaultDose: "500 mg", route: "Oral" },
      { pattern: /glimepiride\s*(\d+\s*mg)?/i, name: "Glimepiride", defaultDose: "1 mg", route: "Oral" },
      { pattern: /gliclazide\s*(\d+\s*mg)?/i, name: "Gliclazide", defaultDose: "80 mg", route: "Oral" },
      { pattern: /insulin\s*(glargine|regular|aspart)?\s*(\d+\s*units)?/i, name: "Insulin", defaultDose: "10 Units", route: "Subcutaneous" },
      { pattern: /atorvastatin\s*(\d+\s*mg)?/i, name: "Atorvastatin", defaultDose: "20 mg", route: "Oral" },
      { pattern: /rosuvastatin\s*(\d+\s*mg)?/i, name: "Rosuvastatin", defaultDose: "10 mg", route: "Oral" },
      { pattern: /pantoprazole\s*(\d+\s*mg)?/i, name: "Pantoprazole", defaultDose: "40 mg", route: "Oral" },
      { pattern: /omeprazole\s*(\d+\s*mg)?/i, name: "Omeprazole", defaultDose: "20 mg", route: "Oral" },
      { pattern: /aspirin\s*(\d+\s*mg)?|ecosprin\s*(\d+\s*mg)?/i, name: "Aspirin (Ecosprin)", defaultDose: "75 mg", route: "Oral" },
      { pattern: /clopidogrel\s*(\d+\s*mg)?/i, name: "Clopidogrel", defaultDose: "75 mg", route: "Oral" },
      { pattern: /paracetamol\s*(\d+\s*mg)?|crocin\s*(\d+\s*mg)?|dolo\s*(\d+\s*mg)?/i, name: "Paracetamol", defaultDose: "650 mg", route: "Oral" },
      { pattern: /amoxicillin\s*(\d+\s*mg)?|augmentin\s*(\d+\s*mg)?/i, name: "Amoxicillin / Clavulanate", defaultDose: "625 mg", route: "Oral" },
      { pattern: /azithromycin\s*(\d+\s*mg)?/i, name: "Azithromycin", defaultDose: "500 mg", route: "Oral" },
      { pattern: /ciprofloxacin\s*(\d+\s*mg)?/i, name: "Ciprofloxacin", defaultDose: "500 mg", route: "Oral" },
      { pattern: /cetirizine\s*(\d+\s*mg)?/i, name: "Cetirizine", defaultDose: "10 mg", route: "Oral" },
      { pattern: /levothyroxine\s*(\d+\s*mcg)?|thyronorm\s*(\d+\s*mcg)?/i, name: "Levothyroxine", defaultDose: "50 mcg", route: "Oral" },
      { pattern: /arjuna\s*(ksheerapaka)?/i, name: "Arjuna Ksheerapaka", defaultDose: "100 ml", route: "Oral" },
      { pattern: /triphala\s*(guggulu|churna)?/i, name: "Triphala Guggulu", defaultDose: "2 Tabs", route: "Oral" },
      { pattern: /ashwagandha\s*(churna|capsule)?/i, name: "Ashwagandha", defaultDose: "500 mg", route: "Oral" }
    ];

    for (const drug of drugRegistry) {
      const match = text.match(drug.pattern);
      if (match) {
        // Extract dosage if explicitly in text near drug name, else default
        let strength = match[1] || drug.defaultDose;

        // Detect frequency in surrounding text (OD, BD, TDS, QID, HS, Once Daily, Twice Daily)
        let frequency = "OD (Once Daily)";
        if (/twice\s+daily|\bBD\b|\bBID\b|1-0-1/i.test(text)) frequency = "BD (Twice Daily)";
        else if (/thrice\s+daily|\bTDS\b|\bTID\b|1-1-1/i.test(text)) frequency = "TDS (Thrice Daily)";
        else if (/at\s+bedtime|\bHS\b|0-0-1/i.test(text)) frequency = "HS (Bedtime)";
        else if (/before\s+breakfast|empty\s+stomach/i.test(text)) frequency = "OD (Before Breakfast)";

        // Detect duration if present (e.g., "for 5 days", "x 1 month")
        const durationMatch = text.match(/for\s+(\d+\s+(?:days|weeks|months))/i);
        const duration = durationMatch ? durationMatch[1] : "Ongoing";

        medications.push({
          name: drug.name,
          dosage: strength.trim(),
          frequency,
          route: drug.route,
          duration,
          source: `Extracted from Document (${documentDate})`,
          provenance: "DOCUMENT_EXTRACTED",
          status: "Active"
        });
      }
    }

    return medications;
  }

  /**
   * Comprehensive Multi-Panel Laboratory Investigation Extraction
   */
  extractInvestigations(text) {
    const investigations = [];

    // Helper: test pattern with report reference range extraction priority
    const parseLabTest = ({
      regex,
      testName,
      panel,
      units,
      standardRange,
      evaluator
    }) => {
      const match = text.match(regex);
      if (match) {
        const valNum = parseFloat(match[1]);
        if (!isNaN(valNum)) {
          // Look for adjacent report reference range pattern like [70-99] or (70 - 99) or "< 5.7"
          const contextSlice = text.substring(Math.max(0, match.index - 30), Math.min(text.length, match.index + 80));
          const reportRangeMatch = contextSlice.match(/(?:ref(?:erence)?(?:\s+interval)?|range)?[:\s]*([<>]?\s*\d+\.?\d*\s*-\s*\d+\.?\d*|<5\.7|<200|<140)/i);

          const referenceRange = reportRangeMatch ? reportRangeMatch[1] : standardRange;
          const rangeSource = reportRangeMatch ? "Report" : "Standard Reference";

          const evaluation = evaluator(valNum);

          investigations.push({
            testName,
            panel,
            value: `${valNum} ${units}`,
            numericValue: valNum,
            referenceRange,
            rangeSource,
            units,
            status: evaluation.status, // "ELEVATED" | "LOW" | "NORMAL"
            isAbnormal: evaluation.status !== "NORMAL",
            clinicalNote: evaluation.note
          });
        }
      }
    };

    // -------------------------------------------------------------
    // 1. METABOLIC & LIPID PANEL
    // -------------------------------------------------------------
    parseLabTest({
      regex: /hba1c[^\d]*(\d+\.?\d*)/i,
      testName: "Glycated Hemoglobin (HbA1c)",
      panel: "Metabolic",
      units: "%",
      standardRange: "< 5.7% (Normal), 5.7-6.4% (Prediabetes), >= 6.5% (Diabetes)",
      evaluator: (v) => ({
        status: v >= 6.5 ? "ELEVATED" : v < 4.0 ? "LOW" : "NORMAL",
        note: v >= 6.5 ? "Suboptimal glycemic control. Diabetes range." : "Within target."
      })
    });

    parseLabTest({
      regex: /fasting\s+(?:blood\s+)?glucose[^\d]*(\d+\.?\d*)|fbs[^\d]*(\d+\.?\d*)/i,
      testName: "Fasting Blood Glucose",
      panel: "Metabolic",
      units: "mg/dL",
      standardRange: "70 - 99 mg/dL",
      evaluator: (v) => ({
        status: v > 100 ? "ELEVATED" : v < 70 ? "LOW" : "NORMAL",
        note: v > 100 ? "Impaired fasting glucose / Hyperglycemia." : v < 70 ? "Hypoglycemia risk." : "Normal fasting glucose."
      })
    });

    parseLabTest({
      regex: /post\s+prandial\s+(?:blood\s+)?glucose[^\d]*(\d+\.?\d*)|ppbs[^\d]*(\d+\.?\d*)/i,
      testName: "Post Prandial Blood Glucose (PPBS)",
      panel: "Metabolic",
      units: "mg/dL",
      standardRange: "< 140 mg/dL",
      evaluator: (v) => ({
        status: v >= 140 ? "ELEVATED" : "NORMAL",
        note: v >= 140 ? "Postprandial glycemic spike." : "Normal."
      })
    });

    parseLabTest({
      regex: /(?:serum\s+)?(?:total\s+)?cholesterol[^\d]*(\d+\.?\d*)/i,
      testName: "Serum Total Cholesterol",
      panel: "Lipid",
      units: "mg/dL",
      standardRange: "< 200 mg/dL",
      evaluator: (v) => ({
        status: v >= 200 ? "ELEVATED" : "NORMAL",
        note: v >= 200 ? "Hypercholesterolemia. Atherogenic risk." : "Desirable level."
      })
    });

    parseLabTest({
      regex: /triglycerides?[^\d]*(\d+\.?\d*)/i,
      testName: "Serum Triglycerides",
      panel: "Lipid",
      units: "mg/dL",
      standardRange: "< 150 mg/dL",
      evaluator: (v) => ({
        status: v >= 150 ? "ELEVATED" : "NORMAL",
        note: v >= 150 ? "Hypertriglyceridemia." : "Normal."
      })
    });

    parseLabTest({
      regex: /ldl(?:\s+cholesterol)?[^\d]*(\d+\.?\d*)/i,
      testName: "LDL Cholesterol",
      panel: "Lipid",
      units: "mg/dL",
      standardRange: "< 100 mg/dL",
      evaluator: (v) => ({
        status: v >= 100 ? "ELEVATED" : "NORMAL",
        note: v >= 100 ? "Elevated atherogenic lipoprotein." : "Optimal."
      })
    });

    parseLabTest({
      regex: /hdl(?:\s+cholesterol)?[^\d]*(\d+\.?\d*)/i,
      testName: "HDL Cholesterol",
      panel: "Lipid",
      units: "mg/dL",
      standardRange: "> 40 mg/dL (M), > 50 mg/dL (F)",
      evaluator: (v) => ({
        status: v < 40 ? "LOW" : "NORMAL",
        note: v < 40 ? "Low protective HDL cholesterol." : "Cardioprotective level."
      })
    });

    // -------------------------------------------------------------
    // 2. COMPLETE BLOOD COUNT (CBC)
    // -------------------------------------------------------------
    parseLabTest({
      regex: /hemoglobin|hb[^\d]*(\d+\.?\d*)/i,
      testName: "Hemoglobin",
      panel: "CBC",
      units: "g/dL",
      standardRange: "13.0 - 17.0 g/dL (M) / 12.0 - 15.0 g/dL (F)",
      evaluator: (v) => ({
        status: v < 12.0 ? "LOW" : v > 18.0 ? "ELEVATED" : "NORMAL",
        note: v < 12.0 ? "Anemia detected. Correlate with iron studies." : "Normal."
      })
    });

    parseLabTest({
      regex: /(?:total\s+leukocyte\s+count|wbc|tlc)[^\d]*(\d+)/i,
      testName: "Total Leukocyte Count (WBC)",
      panel: "CBC",
      units: "/cumm",
      standardRange: "4,000 - 11,000 /cumm",
      evaluator: (v) => ({
        status: v > 11000 ? "ELEVATED" : v < 4000 ? "LOW" : "NORMAL",
        note: v > 11000 ? "Leukocytosis. Possible infection / inflammation." : v < 4000 ? "Leukopenia." : "Normal count."
      })
    });

    parseLabTest({
      regex: /platelets?[^\d]*(\d+)/i,
      testName: "Platelet Count",
      panel: "CBC",
      units: "lakh/cumm",
      standardRange: "1.5 - 4.5 lakh/cumm (150,000 - 450,000)",
      evaluator: (v) => {
        const valInLakh = v > 1000 ? v / 100000 : v;
        return {
          status: valInLakh < 1.5 ? "LOW" : valInLakh > 4.5 ? "ELEVATED" : "NORMAL",
          note: valInLakh < 1.5 ? "Thrombocytopenia. Bleeding risk monitoring." : "Normal."
        };
      }
    });

    // -------------------------------------------------------------
    // 3. RENAL FUNCTION TEST (KFT)
    // -------------------------------------------------------------
    parseLabTest({
      regex: /(?:serum\s+)?creatinine[^\d]*(\d+\.?\d*)/i,
      testName: "Serum Creatinine",
      panel: "KFT",
      units: "mg/dL",
      standardRange: "0.70 - 1.20 mg/dL",
      evaluator: (v) => ({
        status: v > 1.20 ? "ELEVATED" : v < 0.5 ? "LOW" : "NORMAL",
        note: v > 1.20 ? "Renal function parameter elevated. Assess eGFR." : "Normal renal function."
      })
    });

    parseLabTest({
      regex: /(?:blood\s+)?urea[^\d]*(\d+\.?\d*)/i,
      testName: "Blood Urea",
      panel: "KFT",
      units: "mg/dL",
      standardRange: "15 - 45 mg/dL",
      evaluator: (v) => ({
        status: v > 45 ? "ELEVATED" : "NORMAL",
        note: v > 45 ? "Azotemia / elevated nitrogenous waste." : "Normal."
      })
    });

    parseLabTest({
      regex: /(?:serum\s+)?uric\s+acid[^\d]*(\d+\.?\d*)/i,
      testName: "Serum Uric Acid",
      panel: "KFT",
      units: "mg/dL",
      standardRange: "3.5 - 7.2 mg/dL",
      evaluator: (v) => ({
        status: v > 7.2 ? "ELEVATED" : "NORMAL",
        note: v > 7.2 ? "Hyperuricemia. Risk of gout / nephrolithiasis." : "Normal."
      })
    });

    // -------------------------------------------------------------
    // 4. LIVER FUNCTION TEST (LFT)
    // -------------------------------------------------------------
    parseLabTest({
      regex: /(?:sgot|ast)[^\d]*(\d+\.?\d*)/i,
      testName: "AST / SGOT",
      panel: "LFT",
      units: "U/L",
      standardRange: "5 - 40 U/L",
      evaluator: (v) => ({
        status: v > 40 ? "ELEVATED" : "NORMAL",
        note: v > 40 ? "Hepatic enzyme elevation." : "Normal."
      })
    });

    parseLabTest({
      regex: /(?:sgpt|alt)[^\d]*(\d+\.?\d*)/i,
      testName: "ALT / SGPT",
      panel: "LFT",
      units: "U/L",
      standardRange: "7 - 56 U/L",
      evaluator: (v) => ({
        status: v > 56 ? "ELEVATED" : "NORMAL",
        note: v > 56 ? "Hepatocellular injury marker elevated." : "Normal."
      })
    });

    parseLabTest({
      regex: /(?:total\s+)?bilirubin[^\d]*(\d+\.?\d*)/i,
      testName: "Total Bilirubin",
      panel: "LFT",
      units: "mg/dL",
      standardRange: "0.2 - 1.2 mg/dL",
      evaluator: (v) => ({
        status: v > 1.2 ? "ELEVATED" : "NORMAL",
        note: v > 1.2 ? "Hyperbilirubinemia / Jaundice indicator." : "Normal."
      })
    });

    parseLabTest({
      regex: /(?:alkaline\s+phosphatase|alp)[^\d]*(\d+\.?\d*)/i,
      testName: "Alkaline Phosphatase (ALP)",
      panel: "LFT",
      units: "U/L",
      standardRange: "44 - 147 U/L",
      evaluator: (v) => ({
        status: v > 147 ? "ELEVATED" : "NORMAL",
        note: v > 147 ? "Biliary or bone turnover elevation." : "Normal."
      })
    });

    // -------------------------------------------------------------
    // 5. THYROID PROFILE
    // -------------------------------------------------------------
    parseLabTest({
      regex: /tsh[^\d]*(\d+\.?\d*)/i,
      testName: "Thyroid Stimulating Hormone (TSH)",
      panel: "Thyroid",
      units: "µIU/mL",
      standardRange: "0.35 - 4.94 µIU/mL",
      evaluator: (v) => ({
        status: v > 4.94 ? "ELEVATED" : v < 0.35 ? "LOW" : "NORMAL",
        note: v > 4.94 ? "Elevated TSH. Primary hypothyroidism indicator." : v < 0.35 ? "Suppressed TSH. Hyperthyroidism evaluation." : "Normal."
      })
    });

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
