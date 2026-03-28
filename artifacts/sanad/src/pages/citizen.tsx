import React, { useState } from "react";
import { Layout } from "@/components/layout";
import {
  Card, CardHeader, CardTitle, CardBody,
  Input, Button, PageHeader, Badge, StatusDot, Tabs
} from "@/components/shared";
import { useGetPatientByNationalId } from "@workspace/api-client-react";
import { Bell, FileText, Activity, Pill, FlaskConical, User, Lock, CalendarDays } from "lucide-react";
import { format } from "date-fns";

export default function CitizenPortal() {
  const [loginId, setLoginId] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState("summary");

  const { data: patient, isLoading } = useGetPatientByNationalId(
    loginId,
    { query: { enabled: isLoggedIn, retry: false } }
  );

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginId.trim()) setIsLoggedIn(true);
  };

  if (!isLoggedIn) {
    return (
      <Layout role="citizen">
        <div className="max-w-md mx-auto mt-12">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto mb-4">
              <Lock className="w-6 h-6 text-amber-600" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Citizen Health Portal</h1>
            <p className="text-sm text-muted-foreground">Secure access to your national health records. Enter your Saudi National ID to continue.</p>
          </div>
          <Card>
            <CardBody className="p-6">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">National ID</label>
                  <Input
                    value={loginId}
                    onChange={e => setLoginId(e.target.value)}
                    placeholder="Enter your 10-digit National ID"
                    className="font-mono text-base h-11"
                    autoFocus
                  />
                  <p className="text-xs text-muted-foreground mt-1.5">Demo IDs: 1000000001 · 1000000004 · 1000000010</p>
                </div>
                <Button type="submit" variant="accent" className="w-full" size="lg">
                  <Lock className="w-4 h-4" /> Secure Login
                </Button>
              </form>
            </CardBody>
          </Card>
          <p className="text-center text-xs text-muted-foreground mt-4">
            Your data is protected under Saudi National Data Policy and HIPAA-compliant standards.
          </p>
        </div>
      </Layout>
    );
  }

  if (isLoading) {
    return (
      <Layout role="citizen">
        <div className="flex items-center gap-3 py-20 justify-center text-muted-foreground">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-accent" />
          <span className="text-sm">Loading your health records...</span>
        </div>
      </Layout>
    );
  }

  if (!patient) {
    return (
      <Layout role="citizen">
        <Card>
          <CardBody className="py-16 text-center">
            <p className="font-semibold text-foreground mb-1">No Records Found</p>
            <p className="text-sm text-muted-foreground mb-4">National ID <span className="font-mono">{loginId}</span> was not found in the national registry.</p>
            <Button variant="outline" size="sm" onClick={() => { setIsLoggedIn(false); setLoginId(""); }}>Try Again</Button>
          </CardBody>
        </Card>
      </Layout>
    );
  }

  const activeMeds = patient.medications?.filter(m => m.isActive) ?? [];
  const labResults = patient.labResults ?? [];
  const abnormal = labResults.filter(l => l.status !== 'normal').length;

  return (
    <Layout role="citizen">
      <PageHeader
        title={`Health Summary — ${patient.fullName}`}
        subtitle="Your consolidated national health record. All data is read-only and securely encrypted."
        action={
          <Button variant="outline" size="sm" onClick={() => { setIsLoggedIn(false); setLoginId(""); }}>
            Sign Out
          </Button>
        }
      />

      {/* Identity Row */}
      <div className="grid grid-cols-12 gap-4 mb-5">
        <Card className="col-span-8">
          <CardBody className="flex items-center gap-4 p-5">
            <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
              <User className="w-6 h-6 text-amber-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-foreground">{patient.fullName}</h2>
              <div className="flex flex-wrap items-center gap-3 mt-1.5 text-sm text-muted-foreground">
                <span className="font-mono bg-secondary px-2 py-0.5 rounded text-xs">{patient.nationalId}</span>
                <span>DOB: {format(new Date(patient.dateOfBirth), 'dd MMM yyyy')}</span>
                <span>·</span>
                <span>{patient.gender}</span>
                <span>·</span>
                <span className="font-bold text-red-600">Blood: {patient.bloodType}</span>
              </div>
            </div>
            {patient.allergies?.length > 0 && (
              <Badge variant="destructive">{patient.allergies.length} Known Allergi{patient.allergies.length > 1 ? 'es' : 'y'}</Badge>
            )}
          </CardBody>
        </Card>
        <Card className="col-span-2 border-amber-200 bg-amber-50/50">
          <CardBody className="flex flex-col items-center justify-center py-5">
            <Pill className="w-5 h-5 text-amber-600 mb-1.5" />
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Active Meds</p>
            <p className="text-2xl font-bold text-foreground mt-0.5">{activeMeds.length}</p>
          </CardBody>
        </Card>
        <Card className="col-span-2 border-sky-200 bg-sky-50/50">
          <CardBody className="flex flex-col items-center justify-center py-5">
            <FlaskConical className="w-5 h-5 text-sky-600 mb-1.5" />
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Lab Results</p>
            <p className="text-2xl font-bold text-foreground mt-0.5">{labResults.length}</p>
            {abnormal > 0 && <Badge variant="warning" className="mt-1 text-[10px]">{abnormal} abnormal</Badge>}
          </CardBody>
        </Card>
      </div>

      {/* Tabbed Content */}
      <Card>
        <Tabs
          tabs={[
            { id: "summary", label: "Health Summary" },
            { id: "medications", label: "Prescriptions", count: activeMeds.length },
            { id: "labs", label: "Lab Results", count: labResults.length },
            { id: "visits", label: "Visit History", count: patient.visits?.length ?? 0 },
          ]}
          active={activeTab}
          onChange={setActiveTab}
        />

        {activeTab === "summary" && (
          <div className="grid grid-cols-2 divide-x divide-border">
            <div className="p-5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                <Activity className="w-3.5 h-3.5" /> Chronic Conditions
              </p>
              {patient.chronicConditions?.length > 0 ? (
                <div className="space-y-2">
                  {patient.chronicConditions.map((c, i) => (
                    <div key={i} className="flex items-center gap-2.5 p-2.5 bg-secondary rounded-md">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                      <span className="text-sm font-medium">{c}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No chronic conditions on record.</p>
              )}
            </div>
            <div className="p-5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                <Bell className="w-3.5 h-3.5 text-destructive" /> Documented Allergies
              </p>
              {patient.allergies?.length > 0 ? (
                <div className="space-y-2">
                  {patient.allergies.map((a, i) => (
                    <div key={i} className="flex items-center gap-2.5 px-3 py-2 bg-destructive/5 border border-destructive/15 rounded-md">
                      <StatusDot status="critical" />
                      <span className="text-sm font-semibold text-destructive">{a}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No known allergies on record.</p>
              )}
            </div>
          </div>
        )}

        {activeTab === "medications" && (
          <table className="w-full data-table">
            <thead>
              <tr>
                <th>Drug Name</th>
                <th>Dosage</th>
                <th>Frequency</th>
                <th>Prescribed By</th>
                <th>Facility</th>
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
                  <td>
                    <Badge variant={med.isActive ? "success" : "outline"}>
                      {med.isActive ? "Active" : "Completed"}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === "labs" && (
          <table className="w-full data-table">
            <thead>
              <tr>
                <th>Test Name</th>
                <th>Result</th>
                <th>Reference Range</th>
                <th>Date</th>
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
        )}

        {activeTab === "visits" && (
          <table className="w-full data-table">
            <thead>
              <tr>
                <th>Hospital</th>
                <th>Department</th>
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
                  <td><Badge variant="outline">{visit.visitType}</Badge></td>
                  <td className="text-muted-foreground max-w-xs truncate">{visit.diagnosis}</td>
                  <td className="text-muted-foreground font-mono text-xs">{format(new Date(visit.visitDate), 'dd MMM yyyy')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </Layout>
  );
}
