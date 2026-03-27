import React, { useState } from "react";
import { Search, Shield, Activity, Stethoscope, AlertCircle, Syringe, Clock, User as UserIcon, Pill, Zap } from "lucide-react";
import { Layout } from "@/components/layout";
import { Card, Input, Button, Badge, PageHeader } from "@/components/shared";
import { 
  useGetPatientByNationalId, 
  useGetPatientRiskScore,
  useCheckDrugInteraction,
  usePrescribeMedication 
} from "@workspace/api-client-react";
import { format } from "date-fns";

const DEMO_PATIENTS = [
  { id: "1000000001", name: "Mohammed Al-Qahtani", dot: "bg-amber-500" },
  { id: "1000000003", name: "Khalid Al-Rashidi", dot: "bg-destructive" },
  { id: "1000000005", name: "Abdullah Al-Dosari", dot: "bg-orange-500" },
  { id: "1000000010", name: "Maryam Al-Anzi", dot: "bg-purple-500" },
  { id: "1000000023", name: "Yousef Al-Otaibi", dot: "bg-destructive" },
  { id: "1000000004", name: "Nora Al-Shehri", dot: "bg-green-500" },
];

export default function DoctorDashboard() {
  const [searchId, setSearchId] = useState("");
  const [patientId, setPatientId] = useState<string | null>(null);

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
    if (searchId.trim()) setPatientId(searchId.trim());
  };

  return (
    <Layout role="doctor">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <PageHeader title="Physician Dashboard" />
        <form onSubmit={handleSearch} className="flex w-full md:w-auto gap-2">
          <Input 
            placeholder="Search Patient National ID..." 
            className="w-full md:w-80"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
          />
          <Button type="submit">Search</Button>
        </form>
      </div>

      {/* Demo Quick-Access */}
      {!patient && (
        <div className="mb-6">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
            <Zap className="w-3 h-3" /> Quick Demo Patients
          </p>
          <div className="flex flex-wrap gap-2">
            {DEMO_PATIENTS.map(p => (
              <button
                key={p.id}
                onClick={() => { setSearchId(p.id); setPatientId(p.id); }}
                className="px-4 py-2 rounded-xl border border-border bg-card hover:border-primary/60 hover:bg-primary/5 transition-all text-sm font-mono flex items-center gap-2 group"
              >
                <span className={`w-2 h-2 rounded-full ${p.dot}`}></span>
                <span className="font-bold tracking-wide">{p.id}</span>
                <span className="text-muted-foreground group-hover:text-foreground transition-colors">{p.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {isLoading && <div className="text-center py-20 text-muted-foreground animate-pulse">Loading patient record...</div>}

      {patient && (
        <div className="space-y-6">
          {/* Patient Header Summary */}
          <Card className="p-6 flex flex-col md:flex-row items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center shrink-0">
              <UserIcon className="w-10 h-10 text-primary" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-3xl font-display font-bold text-foreground mb-1">{patient.fullName}</h2>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-muted-foreground">
                <span>DOB: {format(new Date(patient.dateOfBirth), 'MMM dd, yyyy')}</span>
                <span>•</span>
                <span>Gender: {patient.gender}</span>
                <span>•</span>
                <span>ID: <span className="font-mono">{patient.nationalId}</span></span>
              </div>
            </div>
            <div className="flex gap-4 shrink-0">
              <div className="text-center p-3 bg-red-50 rounded-xl min-w-[80px]">
                <div className="text-sm font-medium text-red-600 mb-1">BLOOD</div>
                <div className="text-2xl font-bold text-red-700">{patient.bloodType}</div>
              </div>
              {riskScore && (
                <div className="text-center p-3 bg-secondary rounded-xl min-w-[100px]">
                  <div className="text-sm font-medium text-muted-foreground mb-1">RISK SCORE</div>
                  <div className="text-2xl font-display font-bold text-primary">{riskScore.riskScore}/100</div>
                </div>
              )}
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="space-y-6 lg:col-span-2">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Pill className="w-5 h-5 text-primary" />
                    <h3 className="text-xl font-bold">Active Medications</h3>
                  </div>
                  <PrescribeModal patientId={patient.id} />
                </div>
                <div className="space-y-4">
                  {patient.medications?.map(med => (
                    <div key={med.id} className="flex justify-between items-center p-4 border border-border rounded-xl">
                      <div>
                        <div className="font-bold text-lg">{med.drugName}</div>
                        <div className="text-muted-foreground text-sm">{med.dosage} • {med.frequency}</div>
                      </div>
                      <Badge variant={med.isActive ? "success" : "default"}>
                        {med.isActive ? "Active" : "Completed"}
                      </Badge>
                    </div>
                  ))}
                  {(!patient.medications || patient.medications.length === 0) && (
                    <p className="text-muted-foreground py-4 text-center">No active medications.</p>
                  )}
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Activity className="w-5 h-5 text-primary" />
                  <h3 className="text-xl font-bold">Recent Lab Results</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border text-muted-foreground text-sm">
                        <th className="pb-3 font-medium">Test</th>
                        <th className="pb-3 font-medium">Date</th>
                        <th className="pb-3 font-medium">Result</th>
                        <th className="pb-3 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {patient.labResults?.map(lab => (
                        <tr key={lab.id} className="border-b border-border/50 last:border-0">
                          <td className="py-4 font-medium">{lab.testName}</td>
                          <td className="py-4 text-muted-foreground">{format(new Date(lab.testDate), 'MMM dd, yyyy')}</td>
                          <td className="py-4 font-mono">{lab.result} {lab.unit}</td>
                          <td className="py-4">
                            <Badge variant={lab.status === 'normal' ? 'success' : lab.status === 'abnormal' ? 'warning' : 'destructive'}>
                              {lab.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {riskScore && (
                <Card className="p-6 bg-primary text-primary-foreground border-transparent">
                  <div className="flex items-center gap-2 mb-6">
                    <Shield className="w-5 h-5" />
                    <h3 className="text-xl font-bold">AI Risk Analysis</h3>
                  </div>
                  <div className="space-y-4">
                    {riskScore.factors.map((factor, i) => (
                      <div key={i} className="bg-primary-foreground/10 p-3 rounded-lg">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-semibold">{factor.factor}</span>
                          <span className="text-xs uppercase px-2 py-1 bg-black/20 rounded-full">{factor.impact} IMPACT</span>
                        </div>
                        <p className="text-sm text-primary-foreground/70">{factor.description}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              <Card className="p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Clock className="w-5 h-5 text-primary" />
                  <h3 className="text-xl font-bold">Visit History</h3>
                </div>
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                  {patient.visits?.map(visit => (
                    <div key={visit.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-5 h-5 rounded-full border-4 border-background bg-primary shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10" />
                      <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] p-4 rounded-xl border border-border bg-card shadow-sm">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-foreground">{visit.department}</span>
                          <span className="text-xs text-muted-foreground">{format(new Date(visit.visitDate), 'MMM dd')}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{visit.hospital}</p>
                        <Badge variant="outline">{visit.diagnosis}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
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
    if(!drugName) return;
    await checkMutation.mutateAsync({ data: { patientId, newDrug: drugName } });
  };

  const handlePrescribe = async () => {
    await prescribeMutation.mutateAsync({
      data: {
        patientId,
        drugName,
        dosage,
        frequency,
        prescribedBy: "Dr. Ahmed",
        hospital: "King Fahd Medical City",
        startDate: new Date().toISOString().split('T')[0]
      }
    });
    setIsOpen(false);
    // Ideally invalidate queries here, but we are simulating the optimistic UI complete path
    window.location.reload(); 
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)} size="sm" variant="accent" className="gap-2">
        <Syringe className="w-4 h-4" /> Prescribe
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md p-6 animate-in zoom-in-95">
            <h3 className="text-2xl font-bold mb-4">Prescribe Medication</h3>
            
            <form onSubmit={handleCheck} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Drug Name</label>
                <Input value={drugName} onChange={e => setDrugName(e.target.value)} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Dosage</label>
                  <Input value={dosage} onChange={e => setDosage(e.target.value)} required placeholder="e.g. 50mg" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Frequency</label>
                  <Input value={frequency} onChange={e => setFrequency(e.target.value)} required placeholder="e.g. Once daily" />
                </div>
              </div>

              {!checkMutation.data && (
                <div className="flex justify-end gap-2 mt-6">
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                  <Button type="submit" isLoading={checkMutation.isPending}>Check AI Interactions</Button>
                </div>
              )}
            </form>

            {checkMutation.data && (
              <div className="mt-6 space-y-4 border-t border-border pt-4">
                {checkMutation.data.safe ? (
                  <div className="p-4 bg-success/10 text-success-foreground rounded-xl flex items-center gap-3">
                    <Shield className="w-6 h-6 text-success" />
                    <div>
                      <p className="font-bold text-success">Safe to Prescribe</p>
                      <p className="text-sm">No known adverse interactions detected.</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {checkMutation.data.warnings.map((w, i) => (
                      <div key={i} className="p-4 bg-destructive/10 rounded-xl">
                        <div className="flex items-center gap-2 mb-1">
                          <AlertCircle className="w-5 h-5 text-destructive" />
                          <span className="font-bold text-destructive">Interaction Warning: {w.conflictingDrug}</span>
                        </div>
                        <p className="text-sm text-foreground/80 mb-2">{w.description}</p>
                        <p className="text-sm font-medium text-foreground bg-background p-2 rounded-lg">{w.recommendation}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={() => { setIsOpen(false); checkMutation.reset(); }}>Cancel</Button>
                  <Button 
                    variant={checkMutation.data.safe ? "primary" : "destructive"} 
                    onClick={handlePrescribe}
                    isLoading={prescribeMutation.isPending}
                  >
                    {checkMutation.data.safe ? "Confirm Prescription" : "Prescribe Anyway (Override)"}
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}
    </>
  );
}
