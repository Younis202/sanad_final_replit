import { Router } from "express";
import { db } from "@workspace/db";
import { patientsTable, medicationsTable, alertsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { calculateRiskScore } from "../lib/ai-engine.js";

const router = Router();

router.get("/:nationalId", async (req, res) => {
  const { nationalId } = req.params;

  const patient = await db
    .select()
    .from(patientsTable)
    .where(eq(patientsTable.nationalId, nationalId))
    .limit(1);

  if (!patient.length) {
    res.status(404).json({ error: "NOT_FOUND", message: "Patient not found in system" });
    return;
  }

  const p = patient[0]!;

  const [medications, alerts] = await Promise.all([
    db.select().from(medicationsTable).where(eq(medicationsTable.patientId, p.id)),
    db.select().from(alertsTable).where(eq(alertsTable.patientId, p.id)),
  ]);

  const activeMeds = medications.filter(m => m.isActive);
  const criticalAlerts = alerts
    .filter(a => a.severity === "critical" || a.severity === "high")
    .map(a => a.message);

  const riskData = calculateRiskScore({
    dateOfBirth: p.dateOfBirth,
    chronicConditions: p.chronicConditions,
    allergies: p.allergies,
    medicationCount: activeMeds.length,
    recentAbnormalLabs: 0,
    visitFrequency: 0,
  });

  res.json({
    id: p.id,
    nationalId: p.nationalId,
    fullName: p.fullName,
    bloodType: p.bloodType,
    allergies: p.allergies || [],
    chronicConditions: p.chronicConditions || [],
    currentMedications: activeMeds.map(m => `${m.drugName} ${m.dosage}`),
    emergencyContact: p.emergencyContact || "",
    emergencyPhone: p.emergencyPhone || "",
    riskLevel: riskData.riskLevel,
    criticalAlerts,
  });
});

export default router;
