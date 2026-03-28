import React, { useState } from "react";
import {
  Search, Shield, Activity, AlertCircle, Syringe, Clock,
  User as UserIcon, Pill, FlaskConical, Building2, X, Stethoscope, CalendarDays,
  TrendingUp, TrendingDown, Minus, Brain, Bell, BellOff, CheckCheck,
  TriangleAlert, Zap, ArrowUpRight, ArrowDownRight
} from "lucide-react";
import { Layout } from "@/components/layout";
import {
  Card, CardHeader, CardTitle, CardBody,
  Input, Button, Badge, PageHeader, Tabs, KpiCard, StatusDot, Select, DataLabel, AlertBanner
} from "@/components/shared";
import {
  useGetPatientByNationalId,
  useGetPatientRiskScore,
  useCheckDrugInteraction,
  usePrescribeMedication,
  useListAlerts,
  useMarkAlertRead,
  useGetPatientPredictions,
} from "@workspace/api-client-react";
import { format, isValid } from "date-fns";

type PredictionWarning = {
  type: string;
  severity: "low" | "moderate" | "high" | "critical";
  title: string;
  description: string;
  recommendation: string;
  confidence: "low" | "moderate" | "high";
};

const predictionSeverityStyle: Record<string, { bg: string; border: string; icon: string; badge: string }> = {
  critical: { bg: "bg-red-50", border: "border-red-200", icon: "text-red-600", badge: "destructive" },
  high: { bg: "bg-amber-50", border: "border-amber-200", icon: "text-amber-600", badge: "warning" },
  moderate: { bg: "bg-sky-50", border: "border-sky-200", icon: "text-sky-600", badge: "info" },
  low: { bg: "bg-secondary", border: "border-border", icon: "text-muted-foreground", badge: "outline" },
};

function safeDate(dateStr: string) {
  const d = new Date(dateStr);
  return isValid(d) ? d : new Date();
}

type TimelineEvent = {
  id: number;
  type: "visit" | "lab" | "medication" | "alert";
  date: Date;
  title: string;
  subtitle: string;
  status?: string;
  badge?: string;
  badgeVariant?: "success" | "warning" | "destructive" | "outline" | "info";
};

export default function DoctorDashboard() {
  const [searchId, setSearchId] = useState("");
  const [patientId, setPatientId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  const { data: patient, isLoading } = useGetPatientByNationalId(
    patientId || "",
    { query: { enabled: !!patientId, retry: false } }
  );

  const { data: riskScore } = useGetPatientRiskScore(
    patient?.id || 0,
    { query: { enabled: !!patient?.id } }
  );

  const { data: predictionsData } = useGetPatientPredictions(
    patient?.id || 0,
    { query: { enabled: !!patient?.id } }
  );

  const { data: alertsData, refetch: refetchAlerts } = useListAlerts(
    { patientId: patient?.id || 0 },
    { query: { enabled: !!patient?.id } }
  );

  const markReadMutation = useMarkAlertRead();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchId.trim()) { setPatientId(searchId.trim()); setActiveTab("overview"); }
  };

  const activeMeds = patient?.medications?.filter(m => m.isActive) ?? [];
  const labResults = patient?.labResults ?? [];
  const criticalLabs = labResults.filter(l => l.status === "critical").length;
  const abnormalLabs = labResults.filter(l => l.status === "abnormal").length;

  const alerts = alertsData?.alerts ?? [];
  const unreadAlerts = alerts.filter(a => !a.isRead).length;

  const predictions: PredictionWarning[] = (predictionsData as any)?.predictions ?? [];
  const criticalPredictions = predictions.filter(p => p.severity === "critical" || p.severity === "high").length;

  const handleMarkRead = async (alertId: number) => {
    await markReadMutation.mutateAsync({ id: alertId });
    refetchAlerts();
  };

  const timeline: TimelineEvent[] = [
    ...(patient?.visits?.map(v => ({
      id: v.id,
      type: "visit" as const,
      date: safeDate(v.visitDate),
      title: `${v.visitType.charAt(0).toUpperCase() + v.visitType.slice(1)} Visit — ${v.hospital}`,
      subtitle: v.diagnosis ?? "",
      badge: v.visitType,
      badgeVariant: v.visitType === "emergency" ? "destructive" : v.visitType === "inpatient" ? "warning" : "outline",
    })) ?? []),
    ...(patient?.labResults?.map(l => ({
      id: l.id,
      type: "lab" as const,
      date: safeDate(l.testDate),
      title: l.testName,
      subtitle: `${l.result} ${l.unit ?? ""} · ${l.hospital}`,
      status: l.status,
      badge: l.status,
      badgeVariant: l.status === "normal" ? "success" : l.status === "abnormal" ? "warning" : "destructive",
    })) ?? []),
    ...(patient?.medications?.map(m => ({
      id: m.id,
      type: "medication" as const,
      date: safeDate(m.startDate ?? new Date().toISOString()),
      title: `Prescribed: ${m.drugName} ${m.dosage ?? ""}`,
      subtitle: `By ${m.prescribedBy} · ${m.hospital}`,
      badge: m.isActive ? "active" : "completed",
      badgeVariant: m.isActive ? "success" : "outline",
    })) ?? []),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  const timelineIconMap = {
    visit: { icon: Building2, bg: "bg-sky-100", color: "text-sky-600" },
    lab: { icon: FlaskConical, bg: "bg-violet-100", color: "text-violet-600" },
    medication: { icon: Pill, bg: "bg-emerald-100", color: "text-emerald-600" },
    alert: { icon: AlertCircle, bg: "bg-red-100", color: "text-red-600" },
  };

  const labsByName: Record<string, typeof labResults> = {};
  for (const lab of [...labResults].sort((a, b) => new Date(b.testDate).getTime() - new Date(a.testDate).getTime())) {
    const k = lab.testName;
    if (!labsByName[k]) labsByName[k] = [];
    labsByName[k].push(lab);
  }

  const getTrend = (labGroup: typeof labResults) => {
    if (labGroup.length < 2) return "stable";
    const vals = labGroup.slice(0, 3).map(l => parseFloat(l.result)).filter(v => !isNaN(v));
    if (vals.length < 2) return "stable";
    const diff = vals[0]! - vals[vals.length - 1]!;
    const pct = Math.abs(diff / (vals[vals.length - 1]! || 1)) * 100;
    if (pct < 5) return "stable";
    return diff > 0 ? "rising" : "falling";
  };

  return (
    <Layout role="doctor">
      {criticalLabs > 0 && (
        <AlertBanner variant="destructive">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>
            <strong>Critical Lab Alert:</strong> {criticalLabs} lab result{criticalLabs > 1 ? "s" : ""} require immediate clinical review.
          </span>
          <Badge variant="destructive" className="ml-auto shrink-0">{criticalLabs} critical</Badge>
        </AlertBanner>
      )}
      {criticalPredictions > 0 && (
        <AlertBanner variant="warning">
          <Brain className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>AI Warning:</strong> {criticalPredictions} high-priority clinical prediction{criticalPredictions > 1 ? "s" : ""} require attention.
          </span>
          <Badge variant="warning" className="ml-auto shrink-0">{criticalPredictions} flagged</Badge>
        </AlertBanner>
      )}

      <div className="flex items-start justify-between mb-6">
        <PageHeader
          title="Physician Dashboard"
          subtitle="Patient clinical records, prescribing, AI-assisted risk analysis, and predictive alerts."
        />
        <form onSubmit={handleSearch} className="flex items-center gap-2 shrink-0 ml-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="National ID..."
              className="pl-9 w-52"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
            />
          </div>
          <Button type="submit" size="md">Load Patient</Button>
        </form>
      </div>

      {!patientId && !isLoading && (
        <Card>
          <CardBody className="py-20 text-center">
            <div className="w-16 h-16 rounded-3xl bg-secondary flex items-center justify-center mx-auto mb-4">
              <Stethoscope className="w-7 h-7 text-muted-foreground" />
            </div>
            <p className="font-bold text-foreground mb-1">No Patient Selected</p>
            <p className="text-sm text-muted-foreground mb-2">Enter a National ID above to load a patient record.</p>
            <p className="text-xs text-muted-foreground font-mono bg-secondary inline-block px-3 py-1.5 rounded-xl">
              Demo: 1000000001 · 1000000003 · 1000000005 · 1000000023
            </p>
          </CardBody>
        </Card>
      )}

      {isLoading && (
        <div className="flex items-center gap-3 py-16 text-muted-foreground justify-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
          <span className="text-sm">Loading patient record...</span>
        </div>
      )}

      {patient && (
        <div className="space-y-5">
          {/* Patient Banner */}
          <Card>
            <CardBody className="p-0">
              <div className="flex items-stretch divide-x divide-border">
                <div className="flex-1 p-5 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                    <UserIcon className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground mb-1">{patient.fullName}</h2>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs bg-secondary px-2.5 py-1 rounded-xl">{patient.nationalId}</span>
                      <span className="text-xs text-muted-foreground">
                        DOB: {format(safeDate(patient.dateOfBirth), "dd MMM yyyy")}
                      </span>
                      <span className="text-xs text-muted-foreground">· {patient.gender}</span>
                      {patient.allergies?.length > 0 && (
                        <Badge variant="destructive">{patient.allergies.length} Allergi{patient.allergies.length > 1 ? "es" : "y"}</Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4 flex flex-col items-center justify-center bg-red-50 min-w-[90px]">
                  <DataLabel label="Blood Type">
                    <p className="text-3xl font-bold text-red-600">{patient.bloodType}</p>
                  </DataLabel>
                </div>

                {riskScore && (
                  <div className={`px-6 py-4 flex flex-col items-center justify-center min-w-[120px] ${
                    riskScore.riskLevel === "critical" ? "bg-red-50" :
                    riskScore.riskLevel === "high" ? "bg-amber-50" : "bg-secondary/40"
                  }`}>
                    <DataLabel label="AI Risk Score">
                      <p className={`text-3xl font-bold tabular-nums ${
                        riskScore.riskLevel === "critical" ? "text-red-600" :
                        riskScore.riskLevel === "high" ? "text-amber-600" : "text-primary"
                      }`}>{riskScore.riskScore}<span className="text-base font-normal text-muted-foreground">/100</span></p>
                    </DataLabel>
                    <Badge variant={
                      riskScore.riskLevel === "critical" ? "destructive" :
                      riskScore.riskLevel === "high" ? "warning" : "success"
                    } className="mt-2 text-[10px]">
                      {riskScore.riskLevel?.toUpperCase()}
                    </Badge>
                  </div>
                )}

                <div className="px-5 py-4 flex flex-col justify-center gap-2 min-w-[160px]">
                  <PrescribeModal patientId={patient.id} />
                  <Button variant="outline" size="sm">
                    <CalendarDays className="w-3.5 h-3.5" /> Schedule Visit
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* KPI Row */}
          <div className="grid grid-cols-5 gap-4">
            <KpiCard
              title="Active Medications"
              value={activeMeds.length}
              sub="Current prescriptions"
              icon={Pill}
              iconBg="bg-primary/10"
              iconColor="text-primary"
            />
            <KpiCard
              title="Lab Results"
              value={labResults.length}
              sub={`${criticalLabs} critical · ${abnormalLabs} abnormal`}
              icon={FlaskConical}
              iconBg={criticalLabs > 0 ? "bg-red-100" : "bg-sky-100"}
              iconColor={criticalLabs > 0 ? "text-red-600" : "text-sky-600"}
            />
            <KpiCard
              title="Visit History"
              value={patient.visits?.length ?? 0}
              sub="Total hospital visits"
              icon={Building2}
              iconBg="bg-emerald-100"
              iconColor="text-emerald-600"
            />
            <KpiCard
              title="AI Predictions"
              value={predictions.length}
              sub={`${criticalPredictions} high priority`}
              icon={Brain}
              iconBg={criticalPredictions > 0 ? "bg-amber-100" : "bg-violet-100"}
              iconColor={criticalPredictions > 0 ? "text-amber-600" : "text-violet-600"}
            />
            <KpiCard
              title="Active Alerts"
              value={unreadAlerts}
              sub={`${alerts.length} total alerts`}
              icon={Bell}
              iconBg={unreadAlerts > 0 ? "bg-red-100" : "bg-secondary"}
              iconColor={unreadAlerts > 0 ? "text-red-600" : "text-muted-foreground"}
            />
          </div>

          {/* Tabbed Content */}
          <Card>
            <Tabs
              tabs={[
                { id: "overview", label: "Clinical Overview" },
                { id: "timeline", label: "Timeline" },
                { id: "medications", label: "Medications", count: activeMeds.length },
                { id: "labs", label: "Lab Results", count: labResults.length },
                { id: "visits", label: "Visits", count: patient.visits?.length ?? 0 },
                { id: "predictions", label: "AI Predictions", count: predictions.length },
                { id: "alerts", label: "Alerts", count: unreadAlerts || undefined },
                { id: "ai", label: "Risk Analysis" },
              ]}
              active={activeTab}
              onChange={setActiveTab}
            />

            {activeTab === "overview" && (
              <div className="grid grid-cols-2 divide-x divide-border">
                <div className="p-5">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5" /> Chronic Conditions
                  </p>
                  {patient.chronicConditions?.length > 0 ? (
                    <div className="space-y-2">
                      {patient.chronicConditions.map((c, i) => (
                        <div key={i} className="flex items-center gap-2.5 px-3.5 py-2.5 bg-secondary rounded-2xl">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                          <span className="text-sm font-semibold">{c}</span>
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-sm text-muted-foreground">None on record.</p>}
                </div>
                <div className="p-5">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
                    <AlertCircle className="w-3.5 h-3.5 text-red-500" /> Documented Allergies
                  </p>
                  {patient.allergies?.length > 0 ? (
                    <div className="space-y-2">
                      {patient.allergies.map((a, i) => (
                        <div key={i} className="flex items-center gap-2.5 px-3.5 py-2.5 bg-red-50 border border-red-100 rounded-2xl">
                          <StatusDot status="critical" />
                          <span className="text-sm font-bold text-red-700">{a}</span>
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-sm text-muted-foreground">No known allergies.</p>}
                </div>
              </div>
            )}

            {activeTab === "timeline" && (
              <div className="p-5">
                <div className="flex items-center gap-3 mb-5">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Unified Clinical Timeline</p>
                  <div className="flex items-center gap-2 ml-auto">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><div className="w-2 h-2 rounded-full bg-sky-500" /> Visit</div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><div className="w-2 h-2 rounded-full bg-violet-500" /> Lab</div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Medication</div>
                  </div>
                </div>
                <div className="relative">
                  <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />
                  <div className="space-y-4">
                    {timeline.slice(0, 30).map((event, idx) => {
                      const cfg = timelineIconMap[event.type];
                      const Icon = cfg.icon;
                      return (
                        <div key={`${event.type}-${event.id}-${idx}`} className="flex gap-4 relative pl-14">
                          <div className={`absolute left-2 top-1.5 w-6 h-6 rounded-full ${cfg.bg} flex items-center justify-center border-2 border-background z-10`}>
                            <Icon className={`w-3 h-3 ${cfg.color}`} />
                          </div>
                          <div className="flex-1 min-w-0 pb-4 border-b border-border last:border-0">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm text-foreground truncate">{event.title}</p>
                                <p className="text-xs text-muted-foreground mt-0.5 truncate">{event.subtitle}</p>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                {event.badge && (
                                  <Badge variant={event.badgeVariant ?? "outline"} className="text-[10px]">{event.badge}</Badge>
                                )}
                                <span className="text-[10px] text-muted-foreground font-mono whitespace-nowrap">
                                  {format(event.date, "dd MMM yyyy")}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {timeline.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-8">No timeline data available.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "medications" && (
              <div>
                <div className="flex items-center justify-between px-5 py-3 bg-secondary/40 border-b border-border">
                  <p className="text-xs font-semibold text-muted-foreground">{activeMeds.length} active prescription{activeMeds.length !== 1 ? "s" : ""}</p>
                  <PrescribeModal patientId={patient.id} />
                </div>
                <table className="w-full data-table">
                  <thead><tr>
                    <th>Drug Name</th><th>Dosage</th><th>Frequency</th>
                    <th>Prescribed By</th><th>Hospital</th><th>Start Date</th><th>Status</th>
                  </tr></thead>
                  <tbody>
                    {patient.medications?.map(med => (
                      <tr key={med.id}>
                        <td className="font-bold text-foreground">{med.drugName}</td>
                        <td className="font-mono text-sm">{med.dosage}</td>
                        <td className="text-muted-foreground">{med.frequency}</td>
                        <td>{med.prescribedBy}</td>
                        <td className="text-muted-foreground text-xs">{med.hospital}</td>
                        <td className="text-muted-foreground font-mono text-xs">
                          {med.startDate ? format(safeDate(med.startDate), "dd MMM yyyy") : "—"}
                        </td>
                        <td><Badge variant={med.isActive ? "success" : "outline"}>{med.isActive ? "Active" : "Completed"}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "labs" && (
              <div>
                <div className="flex items-center gap-3 px-5 py-3 bg-secondary/40 border-b border-border">
                  {criticalLabs > 0 && <Badge variant="destructive">{criticalLabs} Critical</Badge>}
                  {abnormalLabs > 0 && <Badge variant="warning">{abnormalLabs} Abnormal</Badge>}
                  <span className="text-xs text-muted-foreground ml-auto">{labResults.length} total · Trend = last 3 results</span>
                </div>
                <table className="w-full data-table">
                  <thead><tr>
                    <th>Test Name</th><th>Latest Result</th><th>Trend</th><th>Reference Range</th><th>Date</th><th>Status</th>
                  </tr></thead>
                  <tbody>
                    {Object.entries(labsByName).map(([testName, group]) => {
                      const latest = group[0]!;
                      const trend = getTrend(group);
                      return (
                        <tr key={latest.id}>
                          <td className="font-bold text-foreground">{testName}</td>
                          <td className="font-mono font-semibold">{latest.result} <span className="text-muted-foreground font-normal">{latest.unit}</span></td>
                          <td>
                            {trend === "rising" ? (
                              <div className="flex items-center gap-1 text-amber-600">
                                <TrendingUp className="w-3.5 h-3.5" />
                                <span className="text-xs font-semibold">Rising</span>
                                {group.length > 1 && <ArrowUpRight className="w-3 h-3" />}
                              </div>
                            ) : trend === "falling" ? (
                              <div className="flex items-center gap-1 text-sky-600">
                                <TrendingDown className="w-3.5 h-3.5" />
                                <span className="text-xs font-semibold">Falling</span>
                                {group.length > 1 && <ArrowDownRight className="w-3 h-3" />}
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Minus className="w-3.5 h-3.5" />
                                <span className="text-xs">Stable</span>
                              </div>
                            )}
                          </td>
                          <td className="text-muted-foreground text-xs font-mono">{latest.referenceRange || "—"}</td>
                          <td className="text-muted-foreground font-mono text-xs">{format(safeDate(latest.testDate), "dd MMM yyyy")}</td>
                          <td>
                            <div className="flex items-center gap-2">
                              <StatusDot status={latest.status as any} />
                              <Badge variant={latest.status === "normal" ? "success" : latest.status === "abnormal" ? "warning" : "destructive"}>{latest.status}</Badge>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "visits" && (
              <div>
                <div className="px-5 py-3 bg-secondary/40 border-b border-border">
                  <p className="text-xs font-semibold text-muted-foreground">{patient.visits?.length ?? 0} recorded visits</p>
                </div>
                <table className="w-full data-table">
                  <thead><tr>
                    <th>Hospital</th><th>Department</th><th>Physician</th><th>Visit Type</th><th>Diagnosis</th><th>Date</th>
                  </tr></thead>
                  <tbody>
                    {patient.visits?.map(visit => (
                      <tr key={visit.id}>
                        <td className="font-bold text-foreground">{visit.hospital}</td>
                        <td>{visit.department}</td>
                        <td className="text-muted-foreground">{visit.doctor ? `Dr. ${visit.doctor}` : "—"}</td>
                        <td><Badge variant={visit.visitType === "emergency" ? "destructive" : visit.visitType === "inpatient" ? "warning" : "outline"}>{visit.visitType}</Badge></td>
                        <td className="text-muted-foreground max-w-xs truncate">{visit.diagnosis}</td>
                        <td className="text-muted-foreground font-mono text-xs">{format(safeDate(visit.visitDate), "dd MMM yyyy")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "predictions" && (
              <div className="p-5">
                <div className="flex items-center gap-3 mb-5">
                  <Brain className="w-4 h-4 text-violet-600" />
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">AI Clinical Predictions</p>
                  <Badge variant="outline" className="ml-auto">{predictions.length} total</Badge>
                </div>
                {predictions.length === 0 ? (
                  <div className="py-12 text-center">
                    <Brain className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                    <p className="font-bold text-foreground mb-1">No Predictions Generated</p>
                    <p className="text-sm text-muted-foreground">Insufficient clinical data for predictive analysis.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {predictions.map((p, i) => {
                      const style = predictionSeverityStyle[p.severity] ?? predictionSeverityStyle.low;
                      return (
                        <div key={i} className={`p-4 ${style.bg} border ${style.border} rounded-2xl`}>
                          <div className="flex items-start gap-3">
                            <div className={`w-8 h-8 rounded-xl bg-white flex items-center justify-center shrink-0`}>
                              {p.severity === "critical" || p.severity === "high" ? (
                                <TriangleAlert className={`w-4 h-4 ${style.icon}`} />
                              ) : (
                                <Zap className={`w-4 h-4 ${style.icon}`} />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant={style.badge as any} className="text-[10px]">{p.severity}</Badge>
                                <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide">{p.type.replace("_", " ")}</span>
                                <span className="ml-auto text-[10px] text-muted-foreground">Confidence: {p.confidence}</span>
                              </div>
                              <p className="font-bold text-sm text-foreground">{p.title}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">{p.description}</p>
                              <div className="mt-2 p-2.5 bg-white/60 border border-white rounded-xl">
                                <p className="text-xs font-semibold text-foreground">Recommendation: {p.recommendation}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {activeTab === "alerts" && (
              <div>
                <div className="flex items-center justify-between px-5 py-3 bg-secondary/40 border-b border-border">
                  <div className="flex items-center gap-2">
                    {unreadAlerts > 0 && <Badge variant="destructive">{unreadAlerts} unread</Badge>}
                    <span className="text-xs text-muted-foreground">{alerts.length} total alerts</span>
                  </div>
                  {unreadAlerts > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        for (const a of alerts.filter(al => !al.isRead)) {
                          await markReadMutation.mutateAsync({ id: a.id });
                        }
                        refetchAlerts();
                      }}
                    >
                      <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                    </Button>
                  )}
                </div>
                {alerts.length === 0 ? (
                  <div className="py-12 text-center">
                    <BellOff className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                    <p className="font-bold text-foreground mb-1">No Alerts</p>
                    <p className="text-sm text-muted-foreground">No clinical alerts for this patient.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {alerts.map(alert => (
                      <div key={alert.id} className={`flex items-start gap-4 px-5 py-4 transition-colors ${alert.isRead ? "opacity-60" : "bg-amber-50/30"}`}>
                        <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
                          alert.severity === "critical" ? "bg-red-600" :
                          alert.severity === "high" ? "bg-amber-500" :
                          alert.severity === "moderate" ? "bg-sky-500" : "bg-secondary"
                        }`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <Badge variant={
                              alert.severity === "critical" ? "destructive" :
                              alert.severity === "high" ? "warning" :
                              alert.severity === "moderate" ? "info" : "outline"
                            } className="text-[10px]">{alert.severity}</Badge>
                            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">{alert.alertType}</span>
                          </div>
                          <p className="font-bold text-sm text-foreground">{alert.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{alert.message}</p>
                          <p className="text-[10px] text-muted-foreground mt-1 font-mono">
                            {format(safeDate(alert.createdAt), "dd MMM yyyy HH:mm")}
                          </p>
                        </div>
                        {!alert.isRead && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMarkRead(alert.id)}
                            className="shrink-0 text-xs"
                          >
                            <CheckCheck className="w-3.5 h-3.5" /> Read
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "ai" && riskScore && (
              <div className="p-5">
                <div className="flex items-start gap-6">
                  <div className={`rounded-2xl p-6 min-w-[200px] text-center ${
                    riskScore.riskLevel === "critical" ? "bg-red-600 text-white" :
                    riskScore.riskLevel === "high" ? "bg-amber-500 text-white" :
                    "bg-primary text-white"
                  }`}>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/70 mb-3">AI Risk Score</p>
                    <p className="text-6xl font-bold tabular-nums leading-none">{riskScore.riskScore}</p>
                    <p className="text-white/60 text-sm mt-1">/ 100 risk score</p>
                    <div className="mt-4 border border-white/20 rounded-xl px-3 py-1.5 text-xs font-bold uppercase tracking-wide">
                      {riskScore.riskLevel} risk level
                    </div>
                  </div>

                  <div className="flex-1 space-y-4">
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">
                        {riskScore.factors.length} Risk Factors Identified
                      </p>
                      <div className="space-y-2.5">
                        {riskScore.factors.map((f: any, i: number) => (
                          <div key={i} className="flex items-start gap-3 p-3.5 bg-secondary rounded-2xl">
                            <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${
                              f.impact === "high" ? "bg-red-500" :
                              f.impact === "moderate" ? "bg-amber-500" : "bg-primary"
                            }`} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-sm font-bold text-foreground">{f.factor}</span>
                                <Badge variant={
                                  f.impact === "high" ? "destructive" :
                                  f.impact === "moderate" ? "warning" : "info"
                                } className="text-[10px] shrink-0">{f.impact} impact</Badge>
                              </div>
                              <p className="text-xs text-muted-foreground mt-0.5">{f.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {riskScore.recommendations && riskScore.recommendations.length > 0 && (
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Clinical Recommendations</p>
                        <div className="space-y-2">
                          {riskScore.recommendations.map((rec: string, i: number) => (
                            <div key={i} className="flex items-start gap-2.5 p-3 bg-primary/5 border border-primary/10 rounded-xl">
                              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                              <p className="text-xs text-foreground">{rec}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}
    </Layout>
  );
}

function PrescribeModal({ patientId }: { patientId: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const [drugName, setDrugName] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("");

  const checkMutation = useCheckDrugInteraction();
  const prescribeMutation = usePrescribeMedication();

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!drugName) return;
    await checkMutation.mutateAsync({ data: { patientId, newDrug: drugName } });
  };

  const handlePrescribe = async () => {
    await prescribeMutation.mutateAsync({
      data: {
        patientId, drugName, dosage, frequency,
        prescribedBy: "Dr. Ahmed Al-Rashidi",
        hospital: "King Fahd Medical City",
        startDate: new Date().toISOString().split("T")[0]!,
      }
    });
    setIsOpen(false);
    setDrugName(""); setDosage(""); setFrequency("");
    checkMutation.reset();
    window.location.reload();
  };

  const close = () => { setIsOpen(false); checkMutation.reset(); };

  return (
    <>
      <Button onClick={() => setIsOpen(true)} size="sm" variant="primary" className="w-full">
        <Syringe className="w-3.5 h-3.5" /> Prescribe Medication
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className="bg-card rounded-3xl border border-border shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-border">
              <div>
                <h3 className="font-bold text-foreground text-base">Prescribe Medication</h3>
                <p className="text-xs text-muted-foreground mt-0.5">AI drug interaction check will be performed before confirming.</p>
              </div>
              <button onClick={close} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center hover:bg-border transition-colors">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <form onSubmit={handleCheck} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Drug Name</label>
                  <Input
                    value={drugName}
                    onChange={e => setDrugName(e.target.value)}
                    placeholder="e.g. Warfarin, Aspirin, Metformin..."
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Dosage</label>
                    <Input value={dosage} onChange={e => setDosage(e.target.value)} required placeholder="e.g. 50mg" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Frequency</label>
                    <Select value={frequency} onChange={e => setFrequency(e.target.value)} required>
                      <option value="">Select...</option>
                      <option>Once daily</option>
                      <option>Twice daily</option>
                      <option>Three times daily</option>
                      <option>Every 8 hours</option>
                      <option>As needed</option>
                    </Select>
                  </div>
                </div>
                {!checkMutation.data && (
                  <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="outline" onClick={close}>Cancel</Button>
                    <Button type="submit" isLoading={checkMutation.isPending}>
                      <Shield className="w-3.5 h-3.5" /> Run AI Check
                    </Button>
                  </div>
                )}
              </form>

              {checkMutation.data && (
                <div className="space-y-3 border-t border-border pt-4">
                  {checkMutation.data.safe ? (
                    <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
                      <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                        <Shield className="w-4.5 h-4.5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-bold text-emerald-700 text-sm">No Interactions Detected</p>
                        <p className="text-xs text-muted-foreground">Safe to prescribe based on current medication profile.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {checkMutation.data.warnings.map((w: any, i: number) => (
                        <div key={i} className="p-4 bg-red-50 border border-red-200 rounded-2xl">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertCircle className="w-4 h-4 text-red-600" />
                            <span className="text-sm font-bold text-red-700">Interaction: {w.conflictingDrug}</span>
                            <Badge variant={w.severity === "critical" ? "destructive" : "warning"} className="ml-auto text-[10px]">{w.severity}</Badge>
                          </div>
                          <p className="text-xs text-foreground/80 mb-2 ml-6">{w.description}</p>
                          <p className="text-xs font-semibold bg-white border border-red-100 rounded-xl p-2 ml-6">{w.recommendation}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex justify-end gap-2 pt-1">
                    <Button variant="outline" size="sm" onClick={close}>Cancel</Button>
                    <Button
                      variant={checkMutation.data.safe ? "primary" : "destructive"}
                      size="sm"
                      onClick={handlePrescribe}
                      isLoading={prescribeMutation.isPending}
                    >
                      {checkMutation.data.safe ? "Confirm & Prescribe" : "Override & Prescribe"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
