import { Router } from "express";
import { db } from "@workspace/db";
import { patientsTable, visitsTable, alertsTable, medicationsTable } from "@workspace/db/schema";
import { count, eq, gte, sql } from "drizzle-orm";

const router = Router();

const SAUDI_REGIONS = [
  { region: "Riyadh", hospitals: 78, coverage: "97%" },
  { region: "Makkah", hospitals: 64, coverage: "95%" },
  { region: "Eastern Province", hospitals: 52, coverage: "93%" },
  { region: "Madinah", hospitals: 38, coverage: "91%" },
  { region: "Qassim", hospitals: 29, coverage: "88%" },
  { region: "Asir", hospitals: 31, coverage: "86%" },
  { region: "Tabuk", hospitals: 18, coverage: "84%" },
  { region: "Hail", hospitals: 14, coverage: "82%" },
  { region: "Northern Borders", hospitals: 11, coverage: "79%" },
  { region: "Jazan", hospitals: 22, coverage: "85%" },
  { region: "Najran", hospitals: 12, coverage: "78%" },
  { region: "Al Bahah", hospitals: 9, coverage: "76%" },
  { region: "Al Jouf", hospitals: 10, coverage: "77%" },
];

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
    db.select({ id: patientsTable.id, riskScore: patientsTable.riskScore }).from(patientsTable),
  ]);

  const highRiskPatients = allPatients.filter(p => (p.riskScore || 0) >= 40).length;

  const riskDistribution = [
    { level: "Low", count: allPatients.filter(p => (p.riskScore || 0) < 20).length, color: "#22c55e" },
    { level: "Medium", count: allPatients.filter(p => (p.riskScore || 0) >= 20 && (p.riskScore || 0) < 40).length, color: "#f59e0b" },
    { level: "High", count: allPatients.filter(p => (p.riskScore || 0) >= 40 && (p.riskScore || 0) < 70).length, color: "#f97316" },
    { level: "Critical", count: allPatients.filter(p => (p.riskScore || 0) >= 70).length, color: "#ef4444" },
  ];

  const totalForRegions = allPatients.length;
  const regionWeights = [0.28, 0.22, 0.15, 0.09, 0.06, 0.05, 0.04, 0.03, 0.02, 0.03, 0.01, 0.01, 0.01];

  const regionalStats = SAUDI_REGIONS.map((r, i) => {
    const patientShare = Math.round(totalForRegions * (regionWeights[i] ?? 0.01));
    const highRiskShare = Math.round(highRiskPatients * (regionWeights[i] ?? 0.01));
    return {
      region: r.region,
      patients: patientShare,
      hospitals: r.hospitals,
      highRisk: highRiskShare,
      coverage: r.coverage,
    };
  });

  res.json({
    totalPatients: Number(totalPatientsRow?.count || 0),
    totalVisitsToday: Number(todayVisitsRow?.count || 0),
    activeAlerts: Number(activeAlertsRow?.count || 0),
    drugInteractionsBlocked: Number(drugInteractionsRow?.count || 0),
    highRiskPatients,
    systemUptime: "99.98%",
    hospitalsConnected: 47,
    riskDistribution,
    regionalStats,
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
