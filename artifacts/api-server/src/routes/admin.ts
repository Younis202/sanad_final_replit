import { Router } from "express";
import { db } from "@workspace/db";
import { patientsTable, visitsTable, alertsTable, medicationsTable } from "@workspace/db/schema";
import { count, eq, gte, sql } from "drizzle-orm";

const router = Router();

router.get("/stats", async (req, res) => {
  const today = new Date().toISOString().split("T")[0]!;

  const [
    [totalPatientsRow],
    [todayVisitsRow],
    [activeAlertsRow],
    [drugInteractionsRow],
    allPatients,
  ] = await Promise.all([
    db.select({ count: count() }).from(patientsTable),
    db.select({ count: count() }).from(visitsTable).where(eq(visitsTable.visitDate, today)),
    db.select({ count: count() }).from(alertsTable).where(eq(alertsTable.isRead, false)),
    db.select({ count: count() }).from(alertsTable).where(eq(alertsTable.alertType, "drug-interaction")),
    db.select({ riskScore: patientsTable.riskScore }).from(patientsTable),
  ]);

  const highRiskPatients = allPatients.filter(p => (p.riskScore || 0) >= 40).length;

  res.json({
    totalPatients: Number(totalPatientsRow?.count || 0),
    totalVisitsToday: Number(todayVisitsRow?.count || 0),
    activeAlerts: Number(activeAlertsRow?.count || 0),
    drugInteractionsBlocked: Number(drugInteractionsRow?.count || 0),
    highRiskPatients,
    systemUptime: "99.98%",
    hospitalsConnected: 47,
  });
});

router.get("/population-health", async (req, res) => {
  const allPatients = await db.select().from(patientsTable);

  const conditionCount: Record<string, number> = {};
  const bloodTypeCount: Record<string, number> = {};
  const ageGroupCount: Record<string, number> = {
    "0-17": 0,
    "18-34": 0,
    "35-49": 0,
    "50-64": 0,
    "65+": 0,
  };

  const total = allPatients.length || 1;

  for (const patient of allPatients) {
    for (const cond of patient.chronicConditions || []) {
      conditionCount[cond] = (conditionCount[cond] || 0) + 1;
    }

    const bt = patient.bloodType;
    bloodTypeCount[bt] = (bloodTypeCount[bt] || 0) + 1;

    const age = new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear();
    if (age < 18) ageGroupCount["0-17"] = (ageGroupCount["0-17"] || 0) + 1;
    else if (age < 35) ageGroupCount["18-34"] = (ageGroupCount["18-34"] || 0) + 1;
    else if (age < 50) ageGroupCount["35-49"] = (ageGroupCount["35-49"] || 0) + 1;
    else if (age < 65) ageGroupCount["50-64"] = (ageGroupCount["50-64"] || 0) + 1;
    else ageGroupCount["65+"] = (ageGroupCount["65+"] || 0) + 1;
  }

  const conditionBreakdown = Object.entries(conditionCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(([condition, cnt]) => ({
      condition,
      count: cnt,
      percentage: Math.round((cnt / total) * 100),
    }));

  const bloodTypeDistribution = Object.entries(bloodTypeCount).map(([bloodType, cnt]) => ({
    bloodType,
    count: cnt,
  }));

  const ageDistribution = Object.entries(ageGroupCount).map(([ageGroup, cnt]) => ({
    ageGroup,
    count: cnt,
  }));

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const currentMonth = new Date().getMonth();

  const allVisits = await db.select().from(visitsTable);

  const monthlyVisitTrend = months.map((month, i) => {
    const monthVisits = allVisits.filter(v => {
      const visitMonth = new Date(v.visitDate).getMonth();
      return visitMonth === i;
    });
    return {
      month,
      visits: monthVisits.length,
      emergency: monthVisits.filter(v => v.visitType === "emergency").length,
    };
  });

  res.json({
    conditionBreakdown,
    ageDistribution,
    bloodTypeDistribution,
    monthlyVisitTrend,
  });
});

export default router;
