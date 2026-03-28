import React, { useState } from "react";
import { Layout } from "@/components/layout";
import {
  Card, CardHeader, CardTitle, CardBody,
  Input, Button, PageHeader, Badge, StatusDot, Tabs, DataLabel
} from "@/components/shared";
import { useGetPatientByNationalId } from "@workspace/api-client-react";
import { Bell, FileText, Activity, Pill, FlaskConical, User, Lock, CalendarDays, AlertCircle } from "lucide-react";
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
        <div className="max-w-md mx-auto mt-10">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-3xl bg-amber-100 flex items-center justify-center mx-auto mb-5">
              <Lock className="w-7 h-7 text-amber-600" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Citizen Health Portal</h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Secure access to your national health records. Enter your Saudi National ID to continue.
            </p>
          </div>
          <Card className="rounded-3xl">
            <CardBody className="p-7">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">National ID</label>
                  <Input
                    value={loginId}
                    onChange={e => setLoginId(e.target.value)}
                    placeholder="Enter your 10-digit National ID"
                    className="font-mono text-sm h-11 rounded-2xl"
                    autoFocus
                  />
                  <p className="text-xs text-muted-foreground mt-2">Demo IDs: 1000000001 · 1000000004 · 1000000010</p>
                </div>
                <Button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-white" size="lg">
                  <Lock className="w-4 h-4" /> Secure Login
                </Button>
              </form>
            </CardBody>
          </Card>
          <p className="text-center text-xs text-muted-foreground mt-5 leading-relaxed">
            Your data is protected under Saudi National Data Policy<br />and HIPAA-compliant security standards.
          </p>
        </div>
      </Layout>
    );
  }

  if (isLoading) {
    return (
      <Layout role="citizen">
        <div className="flex items-center gap-3 py-20 justify-center text-muted-foreground">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-amber-500" />
          <span className="text-sm">Loading your health records...</span>
        </div>
      </Layout>
    );
  }

  if (!patient) {
    return (
      <Layout role="citizen">
        <Card className="rounded-3xl">
          <CardBody className="py-16 text-center">
            <AlertCircle className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="font-bold text-foreground mb-1">No Records Found</p>
            <p className="text-sm text-muted-foreground mb-4">National ID <span className="font-mono">{loginId}</span> was not found.</p>
            <Button variant="outline" size="sm" onClick={() => { setIsLoggedIn(false); setLoginId(""); }}>Try Again</Button>
          </CardBody>
        </Card>
      </Layout>
    );
  }

  const activeMeds = patient.medications?.filter(m => m.isActive) ?? [];
  const labResults = patient.labResults ?? [];
  const abnormal = labResults.filter(l => l.status !== "normal").length;

  return (
    <Layout role="citizen">
      <PageHeader
        title={`Health Summary — ${patient.fullName.split(" ")[0]}`}
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
            <div className="w-14 h-14 rounded-3xl bg-amber-100 flex items-center justify-center shrink-0">
              <User className="w-7 h-7 text-amber-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-foreground mb-1.5">{patient.fullName}</h2>
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="font-mono bg-secondary text-xs px-2.5 py-1 rounded-xl">{patient.nationalId}</span>
                <span className="text-xs text-muted-foreground">DOB: {format(new Date(patient.dateOfBirth), "dd MMM yyyy")}</span>
                <span className="text-xs text-muted-foreground">· {patient.gender}</span>
                <span className="text-xs font-bold text-red-600 bg-red-50 px-2.5 py-0.5 rounded-full">Blood: {patient.bloodType}</span>
              </div>
            </div>
            {patient.allergies?.length > 0 && (
              <Badge variant="destructive">{patient.allergies.length} Allerg{patient.allergies.length > 1 ? "ies" : "y"}</Badge>
            )}
          </CardBody>
        </Card>
        <Card className="col-span-2 bg-amber-50 border-amber-100">
          <CardBody className="flex flex-col items-center justify-center py-5">
            <Pill className="w-5 h-5 text-amber-500 mb-2" />
            <DataLabel label="Active Meds">
              <p className="text-2xl font-bold text-foreground text-center">{activeMeds.length}</p>
            </DataLabel>
          </CardBody>
        </Card>
        <Card className="col-span-2 bg-sky-50 border-sky-100">
          <CardBody className="flex flex-col items-center justify-center py-5">
            <FlaskConical className="w-5 h-5 text-sky-500 mb-2" />
            <DataLabel label="Lab Results">
              <p className="text-2xl font-bold text-foreground text-center">{labResults.length}</p>
            </DataLabel>
            {abnormal > 0 && <Badge variant="warning" className="mt-1.5 text-[10px]">{abnormal} abnormal</Badge>}
          </CardBody>
        </Card>
      </div>

      {/* Tabs */}
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
              ) : <p className="text-sm text-muted-foreground">No chronic conditions on record.</p>}
            </div>
            <div className="p-5">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
                <Bell className="w-3.5 h-3.5 text-red-500" /> Documented Allergies
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
          <table className="w-full data-table">
            <thead><tr>
              <th>Drug Name</th><th>Dosage</th><th>Frequency</th><th>Prescribed By</th><th>Facility</th><th>Status</th>
            </tr></thead>
            <tbody>
              {patient.medications?.map(med => (
                <tr key={med.id}>
                  <td className="font-bold text-foreground">{med.drugName}</td>
                  <td className="font-mono text-sm">{med.dosage}</td>
                  <td className="text-muted-foreground">{med.frequency}</td>
                  <td>{med.prescribedBy}</td>
                  <td className="text-muted-foreground text-xs">{med.hospital}</td>
                  <td><Badge variant={med.isActive ? "success" : "outline"}>{med.isActive ? "Active" : "Completed"}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === "labs" && (
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
        )}

        {activeTab === "visits" && (
          <table className="w-full data-table">
            <thead><tr>
              <th>Hospital</th><th>Department</th><th>Visit Type</th><th>Diagnosis</th><th>Date</th>
            </tr></thead>
            <tbody>
              {patient.visits?.map(visit => (
                <tr key={visit.id}>
                  <td className="font-bold text-foreground">{visit.hospital}</td>
                  <td>{visit.department}</td>
                  <td><Badge variant="outline">{visit.visitType}</Badge></td>
                  <td className="text-muted-foreground max-w-xs truncate">{visit.diagnosis}</td>
                  <td className="text-muted-foreground font-mono text-xs">{format(new Date(visit.visitDate), "dd MMM yyyy")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </Layout>
  );
}
