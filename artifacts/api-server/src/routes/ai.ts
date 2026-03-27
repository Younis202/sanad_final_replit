import { Router } from "express";
import { db } from "@workspace/db";
import { patientsTable, medicationsTable, labResultsTable, visitsTable } from "@workspace/db/schema";
import { eq, desc } from "drizzle-orm";
import { checkDrugInteractions, calculateRiskScore } from "../lib/ai-engine.js";

const router = Router();

router.post("/check-interaction", async (req, res) => {
  const { patientId, newDrug } = req.body;

  const medications = await db
    .select()
    .from(medicationsTable)
    .where(eq(medicationsTable.patientId, patientId));

  const activeMedNames = medications.filter(m => m.isActive).map(m => m.drugName);
  const warnings = checkDrugInteractions(newDrug, activeMedNames);

  const safe = !warnings.some(w => w.severity === "critical" || w.severity === "high");

  res.json({ safe, warnings });
});

router.get("/risk-score/:patientId", async (req, res) => {
  const patientId = parseInt(req.params["patientId"]!);

  const [patient] = await db
    .select()
    .from(patientsTable)
    .where(eq(patientsTable.id, patientId))
    .limit(1);

  if (!patient) {
    res.status(404).json({ error: "NOT_FOUND", message: "Patient not found" });
    return;
  }

  const [medications, labResults, visits] = await Promise.all([
    db.select().from(medicationsTable).where(eq(medicationsTable.patientId, patientId)),
    db.select().from(labResultsTable).where(eq(labResultsTable.patientId, patientId)).orderBy(desc(labResultsTable.testDate)).limit(10),
    db.select().from(visitsTable).where(eq(visitsTable.patientId, patientId)),
  ]);

  const abnormalLabs = labResults.filter(l => l.status !== "normal").length;
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  const recentVisits = visits.filter(v => new Date(v.visitDate) >= oneYearAgo).length;

  const result = calculateRiskScore({
    dateOfBirth: patient.dateOfBirth,
    chronicConditions: patient.chronicConditions,
    allergies: patient.allergies,
    medicationCount: medications.filter(m => m.isActive).length,
    recentAbnormalLabs: abnormalLabs,
    visitFrequency: recentVisits,
  });

  res.json({
    patientId,
    ...result,
  });
});

export default router;
