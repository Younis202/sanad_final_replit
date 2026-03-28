import React, { useState } from "react";
import {
  Search, Shield, Activity, AlertCircle, Syringe, Clock,
  User as UserIcon, Pill, FlaskConical, Stethoscope, ChevronRight,
  CalendarDays, Building2, X
} from "lucide-react";
import { Layout } from "@/components/layout";
import {
  Card, CardHeader, CardTitle, CardBody,
  Input, Button, Badge, PageHeader, Tabs, KpiCard, StatusDot, Select
} from "@/components/shared";
import {
  useGetPatientByNationalId,
  useGetPatientRiskScore,
  useCheckDrugInteraction,
  usePrescribeMedication
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
  const criticalLabs = labResults.filter(l => l.status === 'critical').length;
  const abnormalLabs = labResults.filter(l => l.status === 'abnormal').length;

  return (
    <Layout role="doctor">
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
              className="pl-9 w-56"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
            />
          </div>
          <Button type="submit" size="md">Load Patient</Button>
        </form>
      </div>

      {!patientId && !isLoading && (
        <Card>
          <CardBody className="py-16 text-center">
            <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
              <Stethoscope className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-semibold text-foreground mb-1">No Patient Selected</p>
            <p className="text-sm text-muted-foreground">Enter a National ID to load a patient record.</p>
            <p className="text-xs text-muted-foreground mt-3">Demo: 1000000001 · 1000000003 · 1000000005 · 1000000023</p>
          </CardBody>
        </Card>
      )}

      {isLoading && (
        <div className="flex items-center gap-3 py-12 text-muted-foreground justify-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
          <span className="text-sm">Loading patient record...</span>
        </div>
      )}

      {patient && (
        <div className="space-y-5">
          {/* Patient Banner */}
          <Card>
            <CardBody className="p-0">
              <div className="flex items-stretch">
                {/* Identity */}
                <div className="flex-1 p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <UserIcon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">{patient.fullName}</h2>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="text-xs font-mono bg-secondary px-2 py-0.5 rounded">{patient.nationalId}</span>
                      <span className="text-xs text-muted-foreground">
                        DOB: {format(new Date(patient.dateOfBirth), 'dd MMM yyyy')}
                      </span>
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className="text-xs text-muted-foreground">{patient.gender}</span>
                      {patient.allergies?.length > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {patient.allergies.length} Allerg{patient.allergies.length > 1 ? 'ies' : 'y'}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                {/* Blood Type */}
                <div className="border-l border-border px-6 flex flex-col items-center justify-center bg-red-50 min-w-[90px]">
                  <p className="text-xs font-semibold text-red-500 uppercase tracking-wider mb-1">Blood</p>
                  <p className="text-2xl font-bold text-red-700">{patient.bloodType}</p>
                </div>
                {/* Risk Score */}
                {riskScore && (
                  <div className={`border-l border-border px-6 flex flex-col items-center justify-center min-w-[110px] ${
                    riskScore.riskLevel === 'critical' ? 'bg-destructive/5' :
                    riskScore.riskLevel === 'high' ? 'bg-warning/5' : 'bg-secondary'
                  }`}>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Risk Score</p>
                    <p className={`text-2xl font-bold tabular-nums ${
                      riskScore.riskLevel === 'critical' ? 'text-destructive' :
                      riskScore.riskLevel === 'high' ? 'text-warning' : 'text-primary'
                    }`}>{riskScore.riskScore}<span className="text-base font-normal text-muted-foreground">/100</span></p>
                    <Badge variant={
                      riskScore.riskLevel === 'critical' ? 'destructive' :
                      riskScore.riskLevel === 'high' ? 'warning' : 'success'
                    } className="mt-1 text-[10px]">
                      {riskScore.riskLevel?.toUpperCase()}
                    </Badge>
                  </div>
                )}
                {/* Actions */}
                <div className="border-l border-border px-5 flex flex-col justify-center gap-2 min-w-[140px]">
                  <PrescribeModal patientId={patient.id} />
                  <Button variant="outline" size="sm">
                    <CalendarDays className="w-3.5 h-3.5" /> Schedule Visit
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-4">
            <KpiCard
              title="Active Medications"
              value={activeMeds.length}
              sub="Current prescriptions"
              icon={Pill}
              color="text-primary"
            />
            <KpiCard
              title="Lab Results"
              value={labResults.length}
              sub={`${criticalLabs} critical, ${abnormalLabs} abnormal`}
              icon={FlaskConical}
              color={criticalLabs > 0 ? "text-destructive" : "text-primary"}
            />
            <KpiCard
              title="Visit History"
              value={patient.visits?.length ?? 0}
              sub="Total hospital visits"
              icon={Building2}
              color="text-primary"
            />
            <KpiCard
              title="AI Risk Factors"
              value={riskScore?.factors?.length ?? 0}
              sub="Identified risk contributors"
              icon={Shield}
              color="text-primary"
            />
          </div>

          {/* Tabs */}
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
                {/* Conditions */}
                <div className="p-5">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5" /> Chronic Conditions
                  </p>
                  <div className="space-y-2">
                    {patient.chronicConditions?.length > 0 ? patient.chronicConditions.map((c, i) => (
                      <div key={i} className="flex items-center gap-2.5 text-sm py-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                        <span className="font-medium text-foreground">{c}</span>
                      </div>
                    )) : <p className="text-sm text-muted-foreground">None on record.</p>}
                  </div>
                </div>
                {/* Allergies */}
                <div className="p-5">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                    <AlertCircle className="w-3.5 h-3.5 text-destructive" /> Documented Allergies
                  </p>
                  <div className="space-y-2">
                    {patient.allergies?.length > 0 ? patient.allergies.map((a, i) => (
                      <div key={i} className="flex items-center gap-2.5 px-3 py-2 bg-destructive/5 border border-destructive/15 rounded-md">
                        <StatusDot status="critical" />
                        <span className="text-sm font-semibold text-destructive">{a}</span>
                      </div>
                    )) : <p className="text-sm text-muted-foreground">No known allergies.</p>}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "medications" && (
              <div>
                <div className="flex items-center justify-between px-5 py-3 bg-secondary/40 border-b border-border">
                  <p className="text-xs text-muted-foreground font-medium">{activeMeds.length} active prescription{activeMeds.length !== 1 ? 's' : ''}</p>
                  <PrescribeModal patientId={patient.id} />
                </div>
                <table className="w-full data-table">
                  <thead>
                    <tr>
                      <th>Drug Name</th>
                      <th>Dosage</th>
                      <th>Frequency</th>
                      <th>Prescribed By</th>
                      <th>Hospital</th>
                      <th>Start Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patient.medications?.map(med => (
                      <tr key={med.id}>
                        <td className="font-semibold text-foreground">{med.drugName}</td>
                        <td className="font-mono text-sm">{med.dosage}</td>
                        <td className="text-muted-foreground">{med.frequency}</td>
                        <td>{med.prescribedBy}</td>
                        <td className="text-muted-foreground text-xs">{med.hospital}</td>
                        <td className="text-muted-foreground font-mono text-xs">
                          {med.startDate ? format(new Date(med.startDate), 'dd MMM yyyy') : '—'}
                        </td>
                        <td>
                          <Badge variant={med.isActive ? "success" : "outline"}>
                            {med.isActive ? "Active" : "Completed"}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "labs" && (
              <div>
                <div className="flex items-center gap-3 px-5 py-3 bg-secondary/40 border-b border-border">
                  {criticalLabs > 0 && (
                    <Badge variant="destructive">{criticalLabs} Critical</Badge>
                  )}
                  {abnormalLabs > 0 && (
                    <Badge variant="warning">{abnormalLabs} Abnormal</Badge>
                  )}
                  <span className="text-xs text-muted-foreground ml-auto">{labResults.length} total results</span>
                </div>
                <table className="w-full data-table">
                  <thead>
                    <tr>
                      <th>Test Name</th>
                      <th>Result</th>
                      <th>Reference Range</th>
                      <th>Test Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {labResults.map(lab => (
                      <tr key={lab.id}>
                        <td className="font-semibold text-foreground">{lab.testName}</td>
                        <td className="font-mono font-semibold">{lab.result} <span className="text-muted-foreground font-normal">{lab.unit}</span></td>
                        <td className="text-muted-foreground text-xs font-mono">{lab.referenceRange || '—'}</td>
                        <td className="text-muted-foreground font-mono text-xs">{format(new Date(lab.testDate), 'dd MMM yyyy')}</td>
                        <td>
                          <div className="flex items-center gap-2">
                            <StatusDot status={lab.status as any} />
                            <Badge variant={lab.status === 'normal' ? 'success' : lab.status === 'abnormal' ? 'warning' : 'destructive'}>
                              {lab.status}
                            </Badge>
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
                  <p className="text-xs text-muted-foreground font-medium">{patient.visits?.length ?? 0} recorded visits</p>
                </div>
                <table className="w-full data-table">
                  <thead>
                    <tr>
                      <th>Hospital</th>
                      <th>Department</th>
                      <th>Physician</th>
                      <th>Visit Type</th>
                      <th>Diagnosis</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patient.visits?.map(visit => (
                      <tr key={visit.id}>
                        <td className="font-semibold text-foreground">{visit.hospital}</td>
                        <td>{visit.department}</td>
                        <td className="text-muted-foreground">{visit.doctor ? `Dr. ${visit.doctor}` : '—'}</td>
                        <td><Badge variant="outline">{visit.visitType}</Badge></td>
                        <td className="text-muted-foreground max-w-xs truncate">{visit.diagnosis}</td>
                        <td className="text-muted-foreground font-mono text-xs">{format(new Date(visit.visitDate), 'dd MMM yyyy')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "ai" && riskScore && (
              <div className="p-5">
                <div className="flex items-start gap-6">
                  {/* Score Gauge */}
                  <div className={`rounded-lg p-6 text-center min-w-[180px] border ${
                    riskScore.riskLevel === 'critical' ? 'bg-destructive/5 border-destructive/20' :
                    riskScore.riskLevel === 'high' ? 'bg-warning/5 border-warning/20' :
                    'bg-secondary border-border'
                  }`}>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Overall Risk Score</p>
                    <p className={`text-5xl font-bold tabular-nums ${
                      riskScore.riskLevel === 'critical' ? 'text-destructive' :
                      riskScore.riskLevel === 'high' ? 'text-warning' : 'text-primary'
                    }`}>{riskScore.riskScore}</p>
                    <p className="text-muted-foreground text-sm mt-1">out of 100</p>
                    <Badge variant={
                      riskScore.riskLevel === 'critical' ? 'destructive' :
                      riskScore.riskLevel === 'high' ? 'warning' :
                      riskScore.riskLevel === 'medium' ? 'info' : 'success'
                    } className="mt-3">
                      {riskScore.riskLevel?.toUpperCase()} RISK
                    </Badge>
                  </div>

                  {/* Risk Factors */}
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                      Risk Factor Breakdown — {riskScore.factors.length} factors identified
                    </p>
                    <div className="space-y-3">
                      {riskScore.factors.map((factor: any, i: number) => (
                        <div key={i} className="flex items-start gap-3 p-3 bg-secondary rounded-lg border border-border">
                          <div className={`mt-0.5 w-1.5 h-1.5 rounded-full shrink-0 ${
                            factor.impact === 'high' ? 'bg-destructive' :
                            factor.impact === 'medium' ? 'bg-warning' : 'bg-primary'
                          }`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-sm font-semibold text-foreground">{factor.factor}</span>
                              <Badge variant={
                                factor.impact === 'high' ? 'destructive' :
                                factor.impact === 'medium' ? 'warning' : 'default'
                              } className="text-[10px] shrink-0">
                                {factor.impact} impact
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">{factor.description}</p>
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
        startDate: new Date().toISOString().split('T')[0]
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-card rounded-lg border border-border shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div>
                <h3 className="font-bold text-foreground">Prescribe Medication</h3>
                <p className="text-xs text-muted-foreground mt-0.5">AI drug interaction check will be performed.</p>
              </div>
              <button onClick={close} className="p-1.5 hover:bg-secondary rounded-md transition-colors">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <form onSubmit={handleCheck} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Drug Name</label>
                  <Input
                    value={drugName}
                    onChange={e => setDrugName(e.target.value)}
                    placeholder="e.g. Warfarin, Aspirin, Metformin..."
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Dosage</label>
                    <Input value={dosage} onChange={e => setDosage(e.target.value)} required placeholder="e.g. 50mg" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Frequency</label>
                    <Select value={frequency} onChange={e => setFrequency(e.target.value)} required>
                      <option value="">Select...</option>
                      <option value="Once daily">Once daily</option>
                      <option value="Twice daily">Twice daily</option>
                      <option value="Three times daily">Three times daily</option>
                      <option value="Every 8 hours">Every 8 hours</option>
                      <option value="As needed">As needed</option>
                    </Select>
                  </div>
                </div>

                {!checkMutation.data && (
                  <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="outline" onClick={close}>Cancel</Button>
                    <Button type="submit" isLoading={checkMutation.isPending}>
                      <Shield className="w-3.5 h-3.5" /> Run AI Interaction Check
                    </Button>
                  </div>
                )}
              </form>

              {checkMutation.data && (
                <div className="space-y-3 border-t border-border pt-4">
                  {checkMutation.data.safe ? (
                    <div className="flex items-center gap-3 p-3 bg-success/8 border border-success/20 rounded-lg">
                      <Shield className="w-5 h-5 text-success shrink-0" />
                      <div>
                        <p className="font-semibold text-sm text-success">No Interactions Detected</p>
                        <p className="text-xs text-muted-foreground">Safe to prescribe based on current medication profile.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {checkMutation.data.warnings.map((w: any, i: number) => (
                        <div key={i} className="p-3 bg-destructive/5 border border-destructive/20 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <AlertCircle className="w-4 h-4 text-destructive shrink-0" />
                            <span className="text-sm font-bold text-destructive">Interaction: {w.conflictingDrug}</span>
                          </div>
                          <p className="text-xs text-foreground/80 mb-2 ml-6">{w.description}</p>
                          <p className="text-xs font-medium bg-background border border-border rounded p-2 ml-6">{w.recommendation}</p>
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
