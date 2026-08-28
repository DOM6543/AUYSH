/**
 * Clinical Triage & Red-Flag Risk Stratification Service
 * 
 * Deterministic, rule-based clinical scoring engine.
 * Categorizes patient risk into:
 * - HIGH / PRIORITY (Requires immediate emergency/clinician attention)
 * - MODERATE (Priority OPD queue / abnormal telemetry)
 * - LOW (Standard OPD consultation)
 */

export function evaluateClinicalTriage({
  chiefComplaint = "",
  bodyPart = "chest",
  hpi = {},
  vitals = {},
  painLevel = 0,
  pastHistory = [],
  chronicConditions = []
}) {
  const alerts = [];
  const redFlags = [];

  // Parse Vitals
  let systolic = 120;
  let diastolic = 80;
  if (vitals.bp?.value) {
    const parts = vitals.bp.value.split("/");
    systolic = parseInt(parts[0], 10) || 120;
    diastolic = parseInt(parts[1], 10) || 80;
  } else if (typeof vitals.bp === "string") {
    const parts = vitals.bp.split("/");
    systolic = parseInt(parts[0], 10) || 120;
    diastolic = parseInt(parts[1], 10) || 80;
  }

  const pulse = parseInt(vitals.pulse?.value || vitals.pulse, 10) || 78;
  const spo2 = parseInt(vitals.spo2?.value || vitals.spo2, 10) || 98;
  const temp = parseFloat(vitals.temperature?.value || vitals.temp || vitals.temperature) || 98.4;

  // -------------------------------------------------------------
  // CRITICAL HIGH-RISK RULES (Tier: HIGH / PRIORITY)
  // -------------------------------------------------------------

  // Rule 1: Cardiac / Ischemic Signs
  const hasRadiation = hpi.radiation === "left_arm_jaw" || hpi.radiation === "back_blades";
  const hasDiaphoresis = hpi.associatedSymptoms?.includes("cold_sweats") || hpi.associated?.includes("cold_sweats");
  const hasBreathlessness = hpi.associatedSymptoms?.includes("breathlessness") || hpi.associated?.includes("breathlessness");
  const isChestCrushing = hpi.character === "heaviness" || bodyPart === "chest";

  if (isChestCrushing && (hasRadiation || hasDiaphoresis || (hasBreathlessness && systolic >= 140))) {
    alerts.push("Suspected Acute Coronary Syndrome (ACS) / Ischemic chest pain pattern with radiation or diaphoresis");
    redFlags.push("Exertional / Radiating Chest Pain");
  }

  // Rule 2: Hypertensive Crisis or Severe Hypotension
  if (systolic >= 180 || diastolic >= 110) {
    alerts.push(`Critical Hypertensive Crisis: Blood Pressure ${systolic}/${diastolic} mmHg`);
    redFlags.push(`Severe Hypertension (${systolic}/${diastolic} mmHg)`);
  } else if (systolic < 90 && systolic > 0) {
    alerts.push(`Severe Hypotension: Blood Pressure ${systolic}/${diastolic} mmHg (Risk of Shock)`);
    redFlags.push("Hypotension / Shock Risk");
  }

  // Rule 3: Hypoxemia (SpO2 < 92%)
  if (spo2 < 92 && spo2 > 50) {
    alerts.push(`Critical Hypoxemia: SpO2 ${spo2}% on room air`);
    redFlags.push(`Desaturation / Low SpO2 (${spo2}%)`);
  }

  // Rule 4: Tachycardia / Bradycardia Extremes
  if (pulse > 130) {
    alerts.push(`Marked Tachycardia: Heart Rate ${pulse} bpm`);
    redFlags.push(`Tachycardia (${pulse} bpm)`);
  } else if (pulse < 45 && pulse > 0) {
    alerts.push(`Severe Bradycardia: Heart Rate ${pulse} bpm`);
    redFlags.push(`Bradycardia (${pulse} bpm)`);
  }

  // Rule 5: Acute Neurological Deficit / Stroke Protocol
  const hasNeuroFocal = hpi.associatedSymptoms?.includes("focal_weakness") || hpi.associatedSymptoms?.includes("speech_difficulty") || hpi.character === "thunderclap";
  if (hasNeuroFocal) {
    alerts.push("Acute Neurological Deficit / Possible Stroke pattern reported");
    redFlags.push("Sudden Weakness / Speech Impairment / Thunderclap Headache");
  }

  // Rule 6: Acute Abdomen (Peritonitis / Appendicitis Shift)
  const hasAbdominalPeritoneal = hpi.radiation === "lower_right" || hpi.associatedSymptoms?.includes("blood_stool");
  if (hasAbdominalPeritoneal) {
    alerts.push("Acute surgical abdomen signs (Lower right quadrant pain / GI bleed)");
    redFlags.push("Acute Abdomen / GI Bleed Indicator");
  }

  // Rule 7: High Grade Hyperpyrexia
  if (temp >= 103.0) {
    alerts.push(`Severe Hyperpyrexia: Body Temperature ${temp}°F`);
    redFlags.push(`High Fever (${temp}°F)`);
  }

  // -------------------------------------------------------------
  // MODERATE-RISK RULES (Tier: MODERATE)
  // -------------------------------------------------------------
  const moderateAlerts = [];

  if (systolic >= 140 && systolic < 180) {
    moderateAlerts.push(`Elevated Blood Pressure: ${systolic}/${diastolic} mmHg (Stage 1-2 Hypertension)`);
  }
  if (spo2 >= 92 && spo2 < 95) {
    moderateAlerts.push(`Mild Hypoxemia: SpO2 ${spo2}%`);
  }
  if (pulse >= 100 && pulse <= 130) {
    moderateAlerts.push(`Elevated Pulse: ${pulse} bpm`);
  }
  if (temp >= 100.4 && temp < 103.0) {
    moderateAlerts.push(`Febrile state: Body Temperature ${temp}°F`);
  }
  if (painLevel >= 8) {
    moderateAlerts.push(`Severe Pain Score: ${painLevel}/10 reported`);
  }

  // -------------------------------------------------------------
  // STRATIFICATION SYNTHESIS
  // -------------------------------------------------------------
  let tier = "LOW";
  let suggestedAction = "Standard OPD Queue — Routine Physician Consultation";
  let color = "emerald";

  if (alerts.length > 0) {
    tier = "HIGH / PRIORITY";
    suggestedAction = "Immediate Triage Assessment — Expedited Physician Evaluation & 12-Lead ECG / Stabilization Protocol";
    color = "red";
  } else if (moderateAlerts.length > 0) {
    tier = "MODERATE";
    suggestedAction = "Priority OPD Queue — Physician review recommended for elevated clinical parameters";
    color = "amber";
  }

  return {
    tier,
    color,
    alerts: alerts.length > 0 ? alerts : moderateAlerts,
    redFlagsList: redFlags,
    suggestedAction,
    evaluatedAt: new Date().toISOString(),
    parametersEvaluated: {
      bp: `${systolic}/${diastolic} mmHg`,
      pulse: `${pulse} bpm`,
      spo2: `${spo2}%`,
      temp: `${temp} °F`,
      pain: `${painLevel}/10`
    }
  };
}
