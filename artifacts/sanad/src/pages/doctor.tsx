import React, { useState } from "react";
import {
  Search, Shield, Activity, AlertCircle, Syringe, Clock,
  User as UserIcon, Pill, FlaskConical, Building2, X, Stethoscope, CalendarDays
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
} from "@workspace/api-client-react";
import { format } from "date-fns";

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchId.trim()) { setPatientId(searchId.trim()); setActiveTab("overview"); }
  };

  const activeMeds = patient?.medications?.filter(m => m.isActive) ?? [];
  const labResults = patient?.labResults ?? [];
  const criticalLabs = labResults.filter(l => l.status === "critical").length;
  const abnormalLabs = labResults.filter(l => l.status === "abnormal").length;

  return (
    <Layout role="doctor">
      {/* Critical drug interaction alert banner */}
      {criticalLabs > 0 && (
        <AlertBanner variant="destructive">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>
            <strong>Critical Lab Alert:</strong> {criticalLabs} lab result{criticalLabs > 1 ? "s" : ""} require immediate clinical review.
          </span>
          <Badge variant="destructive" className="ml-auto shrink-0">{criticalLabs} critical</Badge>
        </AlertBanner>
      )}

      <div className="flex items-start justify-between mb-6">
        <PageHeader
          title="Physician Dashboard"
          subtitle="Patient clinical records, prescribing, and AI-assisted risk analysis."
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

      {/* Empty state */}
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
          {/* Patient Banner — like screenshot's patient card */}
          <Card>
            <CardBody className="p-0">
              <div className="flex items-stretch divide-x divide-border">
                {/* Identity block */}
                <div className="flex-1 p-5 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                    <UserIcon className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground mb-1">{patient.fullName}</h2>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs bg-secondary px-2.5 py-1 rounded-xl">{patient.nationalId}</span>
                      <span className="text-xs text-muted-foreground">
                        DOB: {format(new Date(patient.dateOfBirth), "dd MMM yyyy")}
                      </span>
                      <span className="text-xs text-muted-foreground">· {patient.gender}</span>
                      {patient.allergies?.length > 0 && (
                        <Badge variant="destructive">{patient.allergies.length} Allergi{patient.allergies.length > 1 ? "es" : "y"}</Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Blood type */}
                <div className="px-6 py-4 flex flex-col items-center justify-center bg-red-50 min-w-[90px]">
                  <DataLabel label="Blood Type">
                    <p className="text-3xl font-bold text-red-600">{patient.bloodType}</p>
                  </DataLabel>
                </div>

                {/* Risk Score */}
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

                {/* Actions */}
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
          <div className="grid grid-cols-4 gap-4">
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
              title="AI Risk Factors"
              value={riskScore?.factors?.length ?? 0}
              sub="Identified contributors"
              icon={Shield}
              iconBg="bg-violet-100"
              iconColor="text-violet-600"
            />
          </div>

          {/* Tabbed Content */}
          <Card>
            <Tabs
              tabs={[
                { id: "overview", label: "Clinical Overview" },
                { id: "medications", label: "Medications", count: activeMeds.length },
                { id: "labs", label: "Lab Results", count: labResults.length },
                { id: "visits", label: "Visit History", count: patient.visits?.length ?? 0 },
                { id: "ai", label: "AI Analysis" },
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
                          {med.startDate ? format(new Date(med.startDate), "dd MMM yyyy") : "—"}
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
                  <span className="text-xs text-muted-foreground ml-auto">{labResults.length} total</span>
                </div>
                <table className="w-full data-table">
                  <thead><tr>
                    <th>Test Name</th><th>Result</th><th>Reference Range</th><th>Date</th><th>Status</th>
                  </tr></thead>
                  <tbody>
                    {labResults.map(lab => (
                      <tr key={lab.id}>
                        <td className="font-bold text-foreground">{lab.testName}</td>
                        <td className="font-mono font-semibold">{lab.result} <span className="text-muted-foreground font-normal">{lab.unit}</span></td>
                        <td className="text-muted-foreground text-xs font-mono">{lab.referenceRange || "—"}</td>
                        <td className="text-muted-foreground font-mono text-xs">{format(new Date(lab.testDate), "dd MMM yyyy")}</td>
                        <td>
                          <div className="flex items-center gap-2">
                            <StatusDot status={lab.status as any} />
                            <Badge variant={lab.status === "normal" ? "success" : lab.status === "abnormal" ? "warning" : "destructive"}>{lab.status}</Badge>
                          </div>
                        </td>
                      </tr>
                    ))}
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
                        <td><Badge variant="outline">{visit.visitType}</Badge></td>
                        <td className="text-muted-foreground max-w-xs truncate">{visit.diagnosis}</td>
                        <td className="text-muted-foreground font-mono text-xs">{format(new Date(visit.visitDate), "dd MMM yyyy")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "ai" && riskScore && (
              <div className="p-5">
                <div className="flex items-start gap-6">
                  {/* Score card — like the big blue AI card in screenshot 346 */}
                  <div className={`rounded-2xl p-6 min-w-[200px] text-center ${
                    riskScore.riskLevel === "critical" ? "bg-red-600 text-white" :
                    riskScore.riskLevel === "high" ? "bg-amber-500 text-white" :
                    "bg-primary text-white"
                  }`}>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/70 mb-3">AI Predictive Analysis</p>
                    <p className="text-6xl font-bold tabular-nums leading-none">{riskScore.riskScore}</p>
                    <p className="text-white/60 text-sm mt-1">/ 100 risk score</p>
                    <div className="mt-4 border border-white/20 rounded-xl px-3 py-1.5 text-xs font-bold uppercase tracking-wide">
                      {riskScore.riskLevel} risk level
                    </div>
                  </div>

                  {/* Factors */}
                  <div className="flex-1">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">
                      {riskScore.factors.length} Risk Factors Identified
                    </p>
                    <div className="space-y-2.5">
                      {riskScore.factors.map((f: any, i: number) => (
                        <div key={i} className="flex items-start gap-3 p-3.5 bg-secondary rounded-2xl">
                          <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${
                            f.impact === "high" ? "bg-red-500" :
                            f.impact === "medium" ? "bg-amber-500" : "bg-primary"
                          }`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-sm font-bold text-foreground">{f.factor}</span>
                              <Badge variant={
                                f.impact === "high" ? "destructive" :
                                f.impact === "medium" ? "warning" : "info"
                              } className="text-[10px] shrink-0">{f.impact} impact</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">{f.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
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
        startDate: new Date().toISOString().split("T")[0],
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
