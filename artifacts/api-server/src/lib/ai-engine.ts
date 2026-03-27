export type InteractionSeverity = "low" | "moderate" | "high" | "critical";

interface InteractionWarning {
  severity: InteractionSeverity;
  conflictingDrug: string;
  description: string;
  recommendation: string;
}

const INTERACTION_DATABASE: Record<string, Array<{
  drug: string;
  severity: InteractionSeverity;
  description: string;
  recommendation: string;
}>> = {
  warfarin: [
    { drug: "aspirin", severity: "high", description: "Increased bleeding risk when combined with anticoagulants.", recommendation: "Avoid combination or monitor INR closely." },
    { drug: "ibuprofen", severity: "high", description: "NSAIDs increase anticoagulant effect and GI bleeding risk.", recommendation: "Use paracetamol instead. If NSAID necessary, monitor INR." },
    { drug: "naproxen", severity: "high", description: "NSAIDs increase anticoagulant effect and GI bleeding risk.", recommendation: "Use paracetamol instead." },
    { drug: "amiodarone", severity: "critical", description: "Amiodarone significantly potentiates warfarin — can cause life-threatening bleeding.", recommendation: "Reduce warfarin dose by 30-50%. Monitor INR every 3-5 days." },
    { drug: "clarithromycin", severity: "high", description: "Antibiotic inhibits warfarin metabolism, increasing INR.", recommendation: "Monitor INR closely. Adjust warfarin dose as needed." },
    { drug: "ciprofloxacin", severity: "moderate", description: "May enhance anticoagulant effect of warfarin.", recommendation: "Monitor INR every few days during antibiotic course." },
    { drug: "metronidazole", severity: "high", description: "Significantly enhances anticoagulant effect of warfarin.", recommendation: "Reduce warfarin dose. Monitor INR closely." },
  ],
  aspirin: [
    { drug: "warfarin", severity: "high", description: "Combined use substantially increases bleeding risk.", recommendation: "Avoid unless benefit clearly outweighs risk. Monitor closely." },
    { drug: "clopidogrel", severity: "moderate", description: "Dual antiplatelet therapy increases bleeding risk.", recommendation: "Only combine if clearly indicated (e.g., ACS). Monitor for bleeding." },
    { drug: "ibuprofen", severity: "moderate", description: "Ibuprofen may block cardioprotective effect of low-dose aspirin.", recommendation: "Take aspirin at least 2 hours before ibuprofen." },
    { drug: "methotrexate", severity: "critical", description: "Aspirin reduces renal clearance of methotrexate, causing toxicity.", recommendation: "Avoid combination. Use alternative analgesics." },
    { drug: "heparin", severity: "high", description: "Additive anticoagulation and antiplatelet effects increase hemorrhage risk.", recommendation: "Avoid unless post-cardiac stenting. Monitor bleeding parameters." },
  ],
  metformin: [
    { drug: "contrast media", severity: "critical", description: "Iodinated contrast can cause acute kidney injury and metformin-associated lactic acidosis.", recommendation: "Hold metformin 48h before and after contrast procedures." },
    { drug: "alcohol", severity: "moderate", description: "Alcohol increases risk of lactic acidosis with metformin.", recommendation: "Advise patient to avoid heavy alcohol consumption." },
    { drug: "cimetidine", severity: "moderate", description: "Cimetidine reduces renal tubular secretion of metformin, increasing levels.", recommendation: "Monitor blood glucose. Consider dose adjustment." },
  ],
  lisinopril: [
    { drug: "potassium", severity: "moderate", description: "ACE inhibitors increase potassium retention; additive with potassium supplements.", recommendation: "Monitor serum potassium. Avoid high-potassium diet." },
    { drug: "spironolactone", severity: "high", description: "Combined use may cause dangerous hyperkalemia.", recommendation: "Monitor potassium closely. Consider dose reduction." },
    { drug: "nsaids", severity: "moderate", description: "NSAIDs reduce antihypertensive effect and risk of acute kidney injury.", recommendation: "Avoid NSAIDs if possible. Monitor blood pressure and renal function." },
    { drug: "ibuprofen", severity: "moderate", description: "NSAIDs reduce antihypertensive effect and risk of acute kidney injury.", recommendation: "Avoid NSAIDs if possible. Monitor blood pressure and renal function." },
    { drug: "aliskiren", severity: "critical", description: "Dual renin-angiotensin blockade causes hypotension, hyperkalemia, renal impairment.", recommendation: "Combination contraindicated in patients with diabetes or renal impairment." },
  ],
  simvastatin: [
    { drug: "amiodarone", severity: "high", description: "Amiodarone inhibits metabolism of simvastatin, increasing myopathy risk.", recommendation: "Limit simvastatin to 20mg/day or switch to pravastatin." },
    { drug: "clarithromycin", severity: "critical", description: "Strong CYP3A4 inhibitor markedly increases simvastatin levels — risk of rhabdomyolysis.", recommendation: "Temporarily hold simvastatin during clarithromycin course." },
    { drug: "diltiazem", severity: "high", description: "Diltiazem inhibits CYP3A4 metabolism of simvastatin.", recommendation: "Limit simvastatin to 10mg/day. Consider alternative statin." },
    { drug: "amlodipine", severity: "moderate", description: "Slightly increases simvastatin exposure. Risk of myopathy.", recommendation: "Limit simvastatin to 20mg/day." },
  ],
  amiodarone: [
    { drug: "warfarin", severity: "critical", description: "Significantly potentiates warfarin anticoagulation. Life-threatening bleeding risk.", recommendation: "Reduce warfarin dose by 30-50%. Monitor INR every 3-5 days." },
    { drug: "simvastatin", severity: "high", description: "Amiodarone inhibits statin metabolism, increasing myopathy risk.", recommendation: "Limit simvastatin to 20mg/day or switch to pravastatin." },
    { drug: "digoxin", severity: "high", description: "Amiodarone increases digoxin levels by ~70%, risking toxicity.", recommendation: "Reduce digoxin dose by 50%. Monitor digoxin levels." },
    { drug: "metoprolol", severity: "high", description: "Additive negative chronotropic and dromotropic effects. Risk of bradycardia/heart block.", recommendation: "Monitor heart rate and ECG closely." },
  ],
  metoprolol: [
    { drug: "verapamil", severity: "critical", description: "Combined AV node blockade can cause severe bradycardia and complete heart block.", recommendation: "Avoid combination. If necessary, monitor ECG continuously." },
    { drug: "diltiazem", severity: "high", description: "Additive AV node suppression. Risk of bradycardia and heart block.", recommendation: "Monitor heart rate and ECG. Use lowest effective doses." },
    { drug: "clonidine", severity: "high", description: "Rebound hypertension on clonidine withdrawal is worsened by beta-blocker.", recommendation: "Withdraw beta-blocker several days before stopping clonidine." },
    { drug: "amiodarone", severity: "high", description: "Additive bradycardia and conduction block.", recommendation: "Monitor ECG and heart rate closely." },
  ],
  clopidogrel: [
    { drug: "omeprazole", severity: "moderate", description: "Omeprazole inhibits CYP2C19, reducing clopidogrel to active metabolite conversion.", recommendation: "Use pantoprazole instead if PPI needed." },
    { drug: "aspirin", severity: "moderate", description: "Dual antiplatelet therapy increases bleeding risk.", recommendation: "Only combine if clearly indicated. Monitor for bleeding signs." },
    { drug: "warfarin", severity: "high", description: "Triple therapy (warfarin + dual antiplatelet) markedly increases bleeding risk.", recommendation: "Minimize duration of triple therapy. Use GI protection." },
  ],
  ssri: [
    { drug: "tramadol", severity: "critical", description: "Risk of serotonin syndrome: hyperthermia, agitation, seizures.", recommendation: "Avoid combination. Use alternative analgesic." },
    { drug: "maoi", severity: "critical", description: "Life-threatening serotonin syndrome.", recommendation: "Contraindicated. Allow 14-day washout between agents." },
    { drug: "triptans", severity: "high", description: "Risk of serotonin syndrome.", recommendation: "Use with caution; monitor for serotonin toxicity signs." },
  ],
  fluoxetine: [
    { drug: "tramadol", severity: "critical", description: "Risk of serotonin syndrome and seizures.", recommendation: "Avoid combination. Use alternative analgesic." },
    { drug: "maoi", severity: "critical", description: "Life-threatening serotonin syndrome — requires 5-week washout after stopping fluoxetine.", recommendation: "Contraindicated. Observe washout period." },
    { drug: "codeine", severity: "moderate", description: "Fluoxetine inhibits CYP2D6, reducing conversion of codeine to morphine — loss of efficacy.", recommendation: "Consider alternative analgesic." },
  ],
  ciprofloxacin: [
    { drug: "warfarin", severity: "moderate", description: "May enhance anticoagulant effect of warfarin.", recommendation: "Monitor INR during antibiotic course." },
    { drug: "tizanidine", severity: "critical", description: "Ciprofloxacin dramatically increases tizanidine levels — severe hypotension, sedation.", recommendation: "Contraindicated combination." },
    { drug: "theophylline", severity: "high", description: "Ciprofloxacin inhibits theophylline metabolism — risk of toxicity (seizures, arrhythmias).", recommendation: "Reduce theophylline dose by 50%. Monitor theophylline levels." },
    { drug: "antacids", severity: "moderate", description: "Antacids reduce ciprofloxacin absorption.", recommendation: "Take ciprofloxacin 2 hours before or 6 hours after antacids." },
  ],
};

function normalizeDrug(drug: string): string {
  return drug.toLowerCase().trim().replace(/[^a-z0-9]/g, "");
}

export function checkDrugInteractions(
  newDrug: string,
  existingMedications: string[]
): InteractionWarning[] {
  const normalizedNew = normalizeDrug(newDrug);
  const warnings: InteractionWarning[] = [];

  for (const existingDrug of existingMedications) {
    const normalizedExisting = normalizeDrug(existingDrug);

    const interactions = INTERACTION_DATABASE[normalizedNew] || [];
    for (const interaction of interactions) {
      if (normalizeDrug(interaction.drug) === normalizedExisting) {
        warnings.push({
          severity: interaction.severity,
          conflictingDrug: existingDrug,
          description: interaction.description,
          recommendation: interaction.recommendation,
        });
      }
    }

    const reverseInteractions = INTERACTION_DATABASE[normalizedExisting] || [];
    for (const interaction of reverseInteractions) {
      if (normalizeDrug(interaction.drug) === normalizedNew) {
        const alreadyAdded = warnings.some(w => normalizeDrug(w.conflictingDrug) === normalizedExisting);
        if (!alreadyAdded) {
          warnings.push({
            severity: interaction.severity,
            conflictingDrug: existingDrug,
            description: interaction.description,
            recommendation: interaction.recommendation,
          });
        }
      }
    }
  }

  return warnings;
}

interface RiskFactor {
  factor: string;
  impact: "low" | "moderate" | "high";
  description: string;
}

interface RiskScoreResult {
  riskScore: number;
  riskLevel: "low" | "medium" | "high" | "critical";
  factors: RiskFactor[];
  recommendations: string[];
}

export function calculateRiskScore(patient: {
  dateOfBirth: string;
  chronicConditions: string[] | null;
  allergies: string[] | null;
  medicationCount: number;
  recentAbnormalLabs: number;
  visitFrequency: number;
}): RiskScoreResult {
  let score = 0;
  const factors: RiskFactor[] = [];
  const recommendations: string[] = [];

  const birthYear = new Date(patient.dateOfBirth).getFullYear();
  const age = new Date().getFullYear() - birthYear;

  if (age >= 75) {
    score += 25;
    factors.push({ factor: "Advanced Age", impact: "high", description: `Patient is ${age} years old. Elderly patients have higher complication risk.` });
    recommendations.push("Geriatric assessment recommended. Review all medications for appropriateness.");
  } else if (age >= 60) {
    score += 15;
    factors.push({ factor: "Senior Age", impact: "moderate", description: `Patient is ${age} years old.` });
    recommendations.push("Regular preventive screenings recommended.");
  } else if (age >= 45) {
    score += 5;
    factors.push({ factor: "Middle Age", impact: "low", description: `Patient is ${age} years old.` });
  }

  const conditions = patient.chronicConditions || [];
  const highRiskConditions = ["heart failure", "coronary artery disease", "chronic kidney disease", "ckd", "cirrhosis", "copd", "cancer", "diabetes mellitus"];
  const moderateRiskConditions = ["hypertension", "diabetes", "hypothyroidism", "hyperthyroidism", "asthma", "atrial fibrillation", "stroke", "depression"];

  for (const cond of conditions) {
    const lower = cond.toLowerCase();
    if (highRiskConditions.some(h => lower.includes(h))) {
      score += 20;
      factors.push({ factor: `Chronic Condition: ${cond}`, impact: "high", description: `${cond} significantly increases medical risk.` });
      recommendations.push(`Regular specialist follow-up for ${cond} management.`);
    } else if (moderateRiskConditions.some(m => lower.includes(m))) {
      score += 10;
      factors.push({ factor: `Chronic Condition: ${cond}`, impact: "moderate", description: `${cond} requires ongoing management.` });
    }
  }

  if (patient.medicationCount >= 5) {
    score += 20;
    factors.push({ factor: "Polypharmacy", impact: "high", description: `Patient is on ${patient.medicationCount} medications. High risk of drug interactions.` });
    recommendations.push("Medication reconciliation review recommended. Consider deprescribing.");
  } else if (patient.medicationCount >= 3) {
    score += 10;
    factors.push({ factor: "Multiple Medications", impact: "moderate", description: `Patient is on ${patient.medicationCount} medications.` });
    recommendations.push("Review medication list for potential interactions at each visit.");
  }

  if ((patient.allergies?.length ?? 0) >= 3) {
    score += 10;
    factors.push({ factor: "Multiple Allergies", impact: "moderate", description: `Patient has ${patient.allergies?.length} documented allergies.` });
    recommendations.push("Allergy alert prominently displayed. Verify before prescribing any new medication.");
  }

  if (patient.recentAbnormalLabs >= 3) {
    score += 20;
    factors.push({ factor: "Multiple Abnormal Lab Results", impact: "high", description: `${patient.recentAbnormalLabs} recent abnormal lab results indicating active pathology.` });
    recommendations.push("Urgent specialist review of abnormal lab results.");
  } else if (patient.recentAbnormalLabs >= 1) {
    score += 10;
    factors.push({ factor: "Abnormal Lab Results", impact: "moderate", description: `${patient.recentAbnormalLabs} recent abnormal lab results.` });
    recommendations.push("Follow up on abnormal lab results.");
  }

  if (patient.visitFrequency >= 6) {
    score += 15;
    factors.push({ factor: "Frequent Hospitalizations", impact: "high", description: `Patient had ${patient.visitFrequency} hospital visits in the past year.` });
    recommendations.push("Care coordinator assessment recommended to prevent further hospitalizations.");
  }

  score = Math.min(score, 100);

  let riskLevel: "low" | "medium" | "high" | "critical";
  if (score < 20) riskLevel = "low";
  else if (score < 40) riskLevel = "medium";
  else if (score < 70) riskLevel = "high";
  else riskLevel = "critical";

  if (recommendations.length === 0) {
    recommendations.push("Continue routine health monitoring and preventive care.");
  }

  return { riskScore: score, riskLevel, factors, recommendations };
}
